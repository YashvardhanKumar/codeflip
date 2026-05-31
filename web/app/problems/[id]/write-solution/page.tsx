"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Problem, Tag, User, Solution } from "@/lib/models";
import { apiFetch, apiFetcher } from "@/lib/utils";
import useSWR from "swr";
import { useAuth } from "@/components/auth-provider";
import Header from "@/components/header";
import Editor from "@monaco-editor/react";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeMathjax from "rehype-mathjax";
import CodeBlock from "@/components/code-block";
import { toast } from "sonner";
import { 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Code as CodeIcon,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { 
  LuHeading1, 
  LuBold, 
  LuItalic, 
  LuList, 
  LuListOrdered, 
  LuMinus, 
  LuFileCode, 
  LuCode, 
  LuImage, 
  LuLink, 
  LuQuote,
  LuSigma 
} from "react-icons/lu";
import PageTransition from "@/components/page-transition";

export default function WriteSolutionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: problem, isLoading: problemLoading } = useSWR<Problem>(`problems/${id}/`, apiFetcher);
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isEditorial, setIsEditorial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOnly, setIsPreviewOnly] = useState(false);
  const [isEditorOnly, setIsEditorOnly] = useState(false);
  const editorRef = useRef<any>(null);

  const DEFAULT_TEMPLATE = `# Intuition
<!-- Describe your first thoughts on how to solve this problem. -->

# Approach
<!-- Describe your approach to solving the problem. -->

# Complexity
- Time complexity:
<!-- Add your time complexity here, e.g. $$O(n)$$ -->

- Space complexity:
<!-- Add your space complexity here, e.g. $$O(n)$$ -->

# Code
`;

  // Check if user has accepted solution
  const { data: userSolutions } = useSWR<any>(
    user ? `solutions/?problem_id=${id}&status=Accepted` : null,
    apiFetcher
  );

  useEffect(() => {
    async function autofillCode() {
      if (userSolutions && body === "") {
        const results = Array.isArray(userSolutions) ? userSolutions : userSolutions?.results || [];
        const acceptedSummary = results.find((s: any) => s.status === 'Accepted' || s.status_display === 'Accepted');
        
        let initialBody = DEFAULT_TEMPLATE;
        if (acceptedSummary) {
          try {
            // Fetch full detail to get the code
            const response = await apiFetch(`solutions/${acceptedSummary.id}/`);
            if (response.ok) {
              const accepted = await response.json();
              const langMap: Record<string, string> = {
                'CPP': 'cpp',
                'PYTHON': 'python',
                'JAVA': 'java',
                'JAVASCRIPT': 'javascript',
                'TYPESCRIPT': 'typescript'
              };
              const lang = langMap[accepted.language] || accepted.language?.toLowerCase() || "";
              initialBody += `\`\`\`${lang} []\n${accepted.code}\n\`\`\``;
            }
          } catch (err) {
            console.error("Failed to fetch accepted code:", err);
          }
        }
        setBody(initialBody);
      }
    }
    autofillCode();
  }, [userSolutions, body]);

  const hasAcceptedSolution = useMemo(() => {
    if (!user) return false;
    if (user.is_staff) return true;
    const results = Array.isArray(userSolutions) ? userSolutions : userSolutions?.results || [];
    return results.length > 0;
  }, [user, userSolutions]);

  if (authLoading || problemLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-dark">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (!hasAcceptedSolution && !user.is_staff && userSolutions !== undefined) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background-dark p-6 text-center space-y-4">
        <X size={64} className="text-red-500 opacity-50" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-400 max-w-md">
          You must have at least one <strong>Accepted</strong> submission for this problem to write a solution.
        </p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please provide both a title and solution content.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch("discussions/", {
        method: "POST",
        body: JSON.stringify({
          problem: parseInt(id as string),
          title,
          body,
          tag_ids: selectedTags,
          is_editorial: isEditorial
        })
      });

      if (response.ok) {
        toast.success("Solution posted successfully!");
        router.push(`/problems/${id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to post solution");
      }
    } catch (err) {
      toast.error("An error occurred while posting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!model || !selection) return;

    const selectedText = model.getValueInRange(selection);
    const replacement = prefix + selectedText + suffix;

    editor.executeEdits("markdown-editor", [
      {
        range: selection,
        text: replacement,
        forceMoveMarkers: true,
      }
    ]);

    editor.focus();
  };

  return (
    <PageTransition>
      <div className="h-screen flex flex-col bg-background-dark overflow-hidden">
        <Header variant="problem" />
        
        {/* Toolbar & Metadata */}
        <div className="bg-surface-dark border-b border-surface-border p-3 space-y-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-400 hover:text-white gap-2">
              <ChevronLeft size={16} />
              Back to Problem
            </Button>
            <div className="h-4 w-px bg-surface-border" />
            <Input 
              placeholder="Solution Title (e.g., Simple O(N) Approach using Hash Map)" 
              className="flex-1 bg-transparent border-none text-lg font-bold text-white focus-visible:ring-0 placeholder:text-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button 
              className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-6"
              onClick={handlePost}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Post Solution
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
          Broadway
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0">Tags:</span>
                {problem?.tags?.map(tag => (
                  <Badge 
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "secondary"}
                    className={`cursor-pointer h-6 px-2 text-[10px] whitespace-nowrap ${selectedTags.includes(tag.id) ? 'bg-primary' : 'bg-surface-border text-gray-400'}`}
                    onClick={() => {
                      setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(tid => tid !== tag.id) : [...prev, tag.id]);
                    }}
                  >
                    {tag.tags}
                  </Badge>
                ))}
             </div>
             {user?.is_staff && (
               <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                 <input 
                   type="checkbox" 
                   id="is-editorial" 
                   checked={isEditorial} 
                   onChange={(e) => setIsEditorial(e.target.checked)}
                   className="accent-yellow-500 h-3 w-3"
                 />
                 <label htmlFor="is-editorial" className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider cursor-pointer">Mark as Editorial</label>
               </div>
             )}
          </div>
        </div>

        {/* Split Screen Editor */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Editor Side */}
          {!isPreviewOnly && (
            <ResizablePanel defaultSize={50} minSize={20} className="flex flex-col">
              <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {/* User Provided Toolbar */}
                <div className="flex h-10 items-center gap-2 shrink-0 px-4 border-b border-surface-border bg-surface-dark/50 overflow-x-auto">
                  <button onClick={() => insertMarkdown("# ", "")} title="Heading" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuHeading1 size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("**", "**")} title="Bold" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuBold size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("*", "*")} title="Italic" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuItalic size={18} />
                  </button>
                  <div className="h-3 border-l border-surface-border mx-1"></div>
                  <button onClick={() => insertMarkdown("- ", "")} title="Bullet List" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuList size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("1. ", "")} title="Numbered List" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuListOrdered size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("---\n", "")} title="Separator" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuMinus size={18} />
                  </button>
                  <div className="h-3 border-l border-surface-border mx-1"></div>
                  <button onClick={() => insertMarkdown("```\n", "\n```")} title="Code Block" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuFileCode size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("`", "`")} title="Inline Code" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuCode size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("![Image Description](", ")")} title="Image" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuImage size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("[Link Title](", ")")} title="Link" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuLink size={18} />
                  </button>
                  <button onClick={() => insertMarkdown("> ", "")} title="Blockquote" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuQuote size={18} />
                  </button>
                  <div className="h-3 border-l border-surface-border mx-1"></div>
                  <button onClick={() => insertMarkdown("$", "$")} title="Math (LaTeX)" className="rounded font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-6 w-6 justify-center p-0">
                    <LuSigma size={18} />
                  </button>
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-7 w-7 ${isEditorOnly ? 'text-primary bg-primary/10' : 'text-gray-500'}`}
                      onClick={() => { setIsEditorOnly(!isEditorOnly); setIsPreviewOnly(false); }}
                    >
                      <Minimize2 size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-7 w-7 ${isPreviewOnly ? 'text-primary bg-primary/10' : 'text-gray-500'}`}
                      onClick={() => { setIsPreviewOnly(!isPreviewOnly); setIsEditorOnly(false); }}
                    >
                      <Eye size={14} />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 bg-[#1e1e1e] py-4">
                  <Editor
                    height="100%"
                    language="markdown"
                    value={body}
                    theme="vs-dark"
                    onChange={(value) => setBody(value ?? "")}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "off",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      wordWrap: "on",
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>
          )}

          {!isEditorOnly && !isPreviewOnly && <ResizableHandle withHandle className="bg-surface-border" />}

          {/* Preview Side */}
          {!isEditorOnly && (
            <ResizablePanel defaultSize={50} minSize={20} className="flex flex-col">
              <div className="flex-1 bg-background-dark p-6 overflow-y-auto">
                <div className="max-w-none prose prose-invert prose-sm">
                  {body ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeRaw, rehypeMathjax]}
                      components={{
                        pre: ({ children }) => <>{children}</>,
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <CodeBlock
                              code={String(children).replace(/\n$/, "")}
                              language={match[1]}
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {body}
                    </ReactMarkdown>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-2 opacity-50">
                      <Eye size={48} />
                      <p className="text-sm font-bold uppercase tracking-widest">Preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </PageTransition>
  );
}
