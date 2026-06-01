"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({
  code,
  language = "text",
  filename,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  // Map common language names to Prism-supported ones
  const langMap: Record<string, string> = {
    cpp: "cpp",
    "c++": "cpp",
    py: "python",
    python: "python",
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    typescript: "typescript",
    java: "java",
    c: "c",
    cs: "csharp",
    csharp: "csharp",
    go: "go",
    rs: "rust",
    rust: "rust",
    md: "markdown",
    markdown: "markdown",
  };

  const displayLanguage = language.toLowerCase();
  const prismLanguage = langMap[displayLanguage] || displayLanguage;

  return (
    <div className="my-4 rounded-xl border border-surface-border overflow-hidden bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-dark border-b border-surface-border">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {displayLanguage === "cpp" ? "C++" : displayLanguage}
        </span>
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-md hover:bg-white/20 text-gray-400 hover:text-white transition-all active:scale-95"
          title="Copy code"
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="relative group custom-code-block">
        <SyntaxHighlighter
          language={prismLanguage}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            fontSize: "13px",
            lineHeight: "1.6",
            backgroundColor: "transparent",
            border: "none",
          }}
          PreTag={({ children, ...props }: any) => (
            <pre
              {...props}
              className="!m-0 !p-6 !bg-transparent !border-none !rounded-none !shadow-none font-mono text-[13px] leading-relaxed overflow-x-auto"
            >
              {children}
            </pre>
          )}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
            },
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
