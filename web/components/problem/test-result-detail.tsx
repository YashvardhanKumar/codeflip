import { TestcaseList } from "@/lib/models";

interface TestResultDetailProps {
  result?: {
    stdout?: string | null;
    expected_output?: string;
    stderr?: string | null;
    compile_output?: string | null;
  } | null;
  testcase?: TestcaseList;
}

export default function TestResultDetail({ result, testcase }: TestResultDetailProps) {
  return (
    <div className="space-y-3 w-full max-w-2xl shrink-0">
      <div className="space-y-3 font-mono text-xs">
        <p className="text-gray-400 mb-1">Input</p>
        {testcase?.input ? (
          testcase.input
            .replaceAll("\r\n", "\n")
            .split("\n")
            .map((line, i) => {
              const [key, value] = line.split("=", 2);
              return (
                <div
                  key={i}
                  className="bg-surface-border p-2 rounded text-white border border-gray-700"
                >
                  <p className="text-gray-400 mb-1">{key} = </p>
                  <div>{value}</div>
                </div>
              );
            })
        ) : (
          <div className="bg-surface-border p-2 rounded text-gray-500 border border-gray-700 italic">
            No input data
          </div>
        )}
      </div>

      <div className="space-y-3 font-mono text-xs">
        <p className="text-gray-400 mb-1">Output</p>
        <div className="bg-surface-border p-2 rounded text-white border border-gray-700">
          <code className="whitespace-pre-wrap">
            {result?.stdout || "(no output)"}
          </code>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <p className="text-gray-400 mb-1">Expected Output</p>
        <div className="bg-surface-border p-2 rounded text-white border border-gray-700">
          <code className="whitespace-pre-wrap">
            {result?.expected_output}
          </code>
        </div>
      </div>

      {result?.stderr && (
        <div className="space-y-3 font-mono text-xs">
          <p className="text-red-400 mb-1">Standard Error</p>
          <div className="bg-surface-border p-2 rounded text-red-400 border border-red-900/50">
            <pre className="whitespace-pre-wrap">
              {result.stderr}
            </pre>
          </div>
        </div>
      )}

      {result?.compile_output && (
        <div className="space-y-3 font-mono text-xs">
          <p className="text-red-400 mb-1">Compile Output</p>
          <div className="bg-surface-border p-2 rounded text-red-400 border border-red-900/50">
            <pre className="whitespace-pre-wrap">
              {result.compile_output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
