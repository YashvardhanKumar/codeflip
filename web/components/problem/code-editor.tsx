// components/problem/CodeEditor.tsx
"use client";

import EditorToolbar from "./editor-toolbar";
import TestPanel from "./test-panel";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Language, LanguageCodes, Problem, RunCodePayload, User } from "@/lib/models";
import { useEffect, useState, useRef } from "react";
import apiClient from "@/lib/utils";
import { AxiosResponse } from "axios";
import { ImperativePanelHandle } from "react-resizable-panels";

interface Props {
  problem: Problem;
  user: User;
}

export default function CodeEditor({ problem, user }: Props) {
  const [language, setLanguage] = useState<Language>(user.default_lang ?? Language.CPP);
  const [code, setCode] = useState<string | null>(null);
  const [runData, setRunData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [isTestPanelCollapsed, setIsTestPanelCollapsed] = useState(false);
  
  const testPanelRef = useRef<ImperativePanelHandle>(null);

  const availableLanguages = problem.codeblocks.map((cb) => cb.language);

  useEffect(() => {
    const storageKey = `code-racer-${problem.id}-${language}`;
    const savedCode = localStorage.getItem(storageKey);

    if (savedCode !== null) {
      setCode(savedCode);
    } else {
      const defaultCode =
        problem.codeblocks.find((e) => e.language === language)?.block ?? "";
      setCode(defaultCode);
    }
  }, [problem.id, language, problem.codeblocks]);

  useEffect(() => {
    if (code === null) return;
    const storageKey = `code-racer-${problem.id}-${language}`;
    localStorage.setItem(storageKey, code);
  }, [code, problem.id, language]);

  const handleReset = () => {
    const storageKey = `code-racer-${problem.id}-${language}`;
    localStorage.removeItem(storageKey);
    const defaultCode =
      problem.codeblocks.find((e) => e.language === language)?.block ?? "";
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
    setRunData(null);
    
    // Auto-expand panel if it was collapsed
    if (isTestPanelCollapsed) {
      testPanelRef.current?.expand();
    }

    try {
      const codeblock = problem.codeblocks.find(
        (e) => e.language === language
      );

      if (!codeblock) {
        throw new Error(`No codeblock found for language: ${language}`);
      }

      const fullCode =
        codeblock.imports +
        "\n\n" +
        (code ?? codeblock.block) +
        "\n\n" +
        codeblock.runner_code;
      
      const response = await apiClient.post<
        any,
        AxiosResponse<any, any, {}>,
        RunCodePayload
      >("/engine/run/", {
        problem_id: problem.id,
        source_code: fullCode ?? "",
        language_id: LanguageCodes[language],
        number_of_runs: 1,
        enable_per_process_and_thread_time_limit: true,
        enable_per_process_and_thread_memory_limit: true,
        enable_network: true,
      });

      if (Array.isArray(response.data)) {
        setRunData(response.data);
        // Find the first erroneous testcase
        const firstErrorIndex = response.data.findIndex((res: any) => res.status?.id !== 3);
        if (firstErrorIndex !== -1) {
          setActiveCase(firstErrorIndex);
        } else {
          setActiveCase(0);
        }
      } else if (response.data?.status?.id >= 6) {
        setError(response.data.compile_output || response.data.status.description);
      } else {
        setRunData([response.data]);
        if (response.data?.status?.id !== 3) {
          setActiveCase(0);
        }
      }
    } catch (err: any) {
      console.error("Error running code:", err);
      setError(err.response?.data?.error || err.message || "Failed to run code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResizablePanel defaultSize={50} minSize={20}>
      <div className="h-full flex flex-col bg-editor-bg relative min-w-100 overflow-y-hidden">
        <ResizablePanelGroup
          direction="vertical"
          className="flex-1"
        >
          <ResizablePanel defaultSize={60} minSize={15}>
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
          >
            <div className="h-full">
              <TestPanel
                problem={problem}
                user={user}
                language={language}
                runData={runData}
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

        {/* Run/Submit Footer */}
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
            <button 
              className="btn-primary" 
              onClick={() => runCode()}
              disabled={isLoading}
            >
              Run
            </button>
            <button 
              className="btn-secondary"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </ResizablePanel>
  );
}
