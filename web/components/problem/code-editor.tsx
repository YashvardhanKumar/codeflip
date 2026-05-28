"use client";

import EditorToolbar from "./editor-toolbar";
import TestPanel from "./test-panel";
import Editor from "@monaco-editor/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Language, LanguageCodes, Problem, User } from "@/lib/models";
import { useEffect, useState, useRef } from "react";
import apiClient from "@/lib/utils";
import { ImperativePanelHandle } from "react-resizable-panels";
import { toast } from "sonner";
import { mutate } from "swr";
import { BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { Button } from "../ui/button";

interface Props {
  problem: Problem;
  user: User | null;
}

export default function CodeEditor({ problem, user }: Props) {
  const [language, setLanguage] = useState<Language>(user?.default_lang ?? Language.CPP);
  const [code, setCode] = useState<string | null>(null);
  const [runData, setRunData] = useState<any[] | null>(null);
  const [submitData, setSubmitData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [isTestPanelCollapsed, setIsTestPanelCollapsed] = useState(false);
  
  const testPanelRef = useRef<ImperativePanelHandle>(null);

  const availableLanguages = problem.codeblocks?.map((cb) => cb.language) ?? [];

  // Update default language in backend whenever it changes
  useEffect(() => {
    if (user && language !== user.default_lang) {
      apiClient.patch("/auth/users/update_language/", { default_lang: language })
        .catch(err => console.error("Failed to update default language", err));
    }
  }, [language, user]);

  useEffect(() => {
    if (!problem.id) return;
    
    const storageKey = `code-racer-${problem.id}-${language}`;
    const savedCode = localStorage.getItem(storageKey);

    if (savedCode !== null) {
      setCode(savedCode);
    } else {
      const defaultCode =
        problem.codeblocks?.find((e) => e.language === language)?.block ?? "";
      setCode(defaultCode);
    }
  }, [problem.id, language, problem.codeblocks]);

  useEffect(() => {
    if (code === null || !problem.id) return;
    const storageKey = `code-racer-${problem.id}-${language}`;
    localStorage.setItem(storageKey, code);
  }, [code, problem.id, language]);

  const handleReset = () => {
    const storageKey = `code-racer-${problem.id}-${language}`;
    localStorage.removeItem(storageKey);
    const defaultCode =
      problem.codeblocks?.find((e) => e.language === language)?.block ?? "";
    setCode(defaultCode);
  };

  const toggleTestPanel = () => {
    const panel = testPanelRef.current;
    if (panel) {
      if (isTestPanelCollapsed) {
        panel.expand(40);
      } else {
        panel.collapse();
      }
    }
  };

  const runCode = async () => {
    setIsLoading(true);
    setActiveTab("result");
    setError(null);
    
    const relevantTestcases = problem.testcases
      .filter((e) => e.display_testcase == true)
      .sort((a, b) => a.id - b.id);
    
    const initialRunData = relevantTestcases.map(() => ({ status: { id: 1, description: "Running" } }));
    setRunData(initialRunData);
    setActiveCase(0);

    if (isTestPanelCollapsed) {
      testPanelRef.current?.expand();
    }

    try {
      const response = await fetch(`${BASE_URL}/engine/submit-stream/?mode=run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problem.id,
          source_code: code, // Send raw code, backend will wrap it
          language: language,
          language_id: LanguageCodes[language],
        })
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader not available");

      const decoder = new TextDecoder();
      let currentResults = [...initialRunData];
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const payload = JSON.parse(line);
            if (payload.status === "case_result") {
              const res = payload.data;
              currentResults[res.index] = res;
              setRunData([...currentResults]);
            } else if (payload.status === "complete") {
              setIsLoading(false);
              if (payload.compile_output) {
                 setError(payload.compile_output);
              }
            } else if (payload.status === "error") {
              setError(payload.message);
              setIsLoading(false);
            }
          } catch (e) {
            console.error("JSON parse error on line:", line, e);
          }
        }
      }
    } catch (err: any) {
      console.error("Error running code:", err);
      setError(err.message || "Failed to run code");
      setIsLoading(false);
    }
  };

  const submitCode = async () => {
    const token = localStorage.getItem("token");
    if (!user || !token) {
      toast.error("Please sign in to submit code");
      return;
    }

    setIsLoading(true);
    setActiveTab("submission");
    setError(null);
    
    const allTestcases = [...problem.testcases].sort((a, b) => a.id - b.id);
    const initialSubmitData = allTestcases.map(() => ({ status: { id: 1, description: "Queued" } }));
    setSubmitData(initialSubmitData);
    setActiveCase(0);

    if (isTestPanelCollapsed) {
      testPanelRef.current?.expand();
    }

    try {
      const response = await fetch(`${BASE_URL}/engine/submit-stream/?mode=submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify({
          problem_id: problem.id,
          source_code: code, // Send raw code, backend will wrap it
          language: language,
          language_id: LanguageCodes[language],
        })
      });

      if (response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader not available");

      const decoder = new TextDecoder();
      let currentResults = [...initialSubmitData];
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const payload = JSON.parse(line);
            if (payload.status === "case_result") {
              const res = payload.data;
              currentResults[res.index] = res;
              setSubmitData([...currentResults]);
            } else if (payload.status === "complete") {
              if (payload.total_status === "Accepted") {
                toast.success("All test cases passed!");
              } else if (payload.compile_output) {
                setError(payload.compile_output);
                toast.error("Compilation Error");
              } else {
                toast.error(`Solution failed: ${payload.total_status}`);
              }
              setIsLoading(false);
              mutate(`${BASE_URL}/api/solutions/?problem_id=${problem.id}`);
            } else if (payload.status === "error") {
              setError(payload.message);
              setIsLoading(false);
            }
          } catch (e) {
            console.error("JSON parse error on line:", line, e);
          }
        }
      }
    } catch (err: any) {
      console.error("Error streaming submission:", err);
      setError(err.message || "Failed to process submission stream");
      setIsLoading(false);
    }
  };

  return (
    <ResizablePanel defaultSize={50} minSize={20} className="h-full flex flex-col">
      <div className="h-full flex flex-col bg-[#1e1e1e] relative overflow-hidden">
        <ResizablePanelGroup
          direction="vertical"
          className="flex-1"
        >
          <ResizablePanel defaultSize={60} minSize={15} className="flex flex-col">
            <div className="h-full flex flex-col">
              <EditorToolbar 
                onReset={handleReset} 
                language={language} 
                setLanguage={setLanguage}
                availableLanguages={availableLanguages}
              />
              <div className="flex-1 min-h-0">
                {code !== null && (
                  <Editor
                    height="100%"
                    language={language.toLowerCase()}
                    value={code}
                    theme="vs-dark"
                    onChange={(value) => setCode(value ?? "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                    }}
                  />
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className={isTestPanelCollapsed ? "opacity-0 pointer-events-none" : ""} />
          <ResizablePanel 
            defaultSize={40} 
            minSize={0} 
            collapsible={true} 
            ref={testPanelRef}
            onCollapse={() => setIsTestPanelCollapsed(true)}
            onExpand={() => setIsTestPanelCollapsed(false)}
            className="flex flex-col"
          >
            <div className="h-full">
              <TestPanel
                problem={problem}
                user={user}
                language={language}
                runData={runData}
                submitData={submitData}
                isLoading={isLoading}
                error={error}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeCase={activeCase}
                setActiveCase={setActiveCase}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <div className="p-2 flex justify-between items-center bg-surface-dark border-t border-surface-border shrink-0">
          <button 
            onClick={toggleTestPanel}
            className={`text-xs px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
              isTestPanelCollapsed 
                ? "text-white bg-surface-border hover:bg-muted" 
                : "text-gray-400 hover:text-white hover:bg-surface-border"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isTestPanelCollapsed ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            </span>
            Console
          </button>
          <div className="flex gap-2">
            {user ? (
              <>
                <button 
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-sm font-bold transition-all active:scale-95 disabled:opacity-50" 
                  onClick={() => runCode()}
                  disabled={isLoading}
                >
                  Run
                </button>
                <button 
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => submitCode()}
                >
                  Submit
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-surface-border text-xs h-8"
                  >
                    Sign In to Run
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90 text-white text-xs h-8"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResizablePanel>
  );
}
