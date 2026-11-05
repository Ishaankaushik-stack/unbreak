"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  async function copy() {
    await navigator.clipboard.writeText(preRef.current?.innerText ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ position: "relative", margin: "12px 0" }}>
      <button
        onClick={copy}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "4px 10px",
          fontSize: 12,
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        ref={preRef}
        style={{
          background: "#1e1e1e",
          color: "#eee",
          padding: 12,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {children}
      </pre>
    </div>
  );
}

export default function Home() {
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function diagnose() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error, code }),
      });
      if (!res.body) throw new Error("No response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value));
      }
    } catch {
      setResult("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const box = {
    width: "100%",
    marginBottom: 12,
    padding: 10,
    fontFamily: "monospace",
    fontSize: 13,
    borderRadius: 8,
    border: "1px solid #888",
  } as const;

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>Unbreak</h1>
      <p style={{ marginBottom: 8 }}>
        Paste your broken code or error log. Get it fixed.
      </p>
      <p style={{ marginBottom: 16, fontSize: 13, opacity: 0.7 }}>
        Do not paste passwords or API keys.
      </p>

      <textarea
        placeholder="Paste the error log or your question here..."
        value={error}
        onChange={(e) => setError(e.target.value)}
        rows={8}
        style={box}
      />
      <textarea
        placeholder="Paste your code / Dockerfile / config (optional)..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={8}
        style={box}
      />
      <button
        onClick={diagnose}
        disabled={loading || !error.trim()}
        style={{ padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}
      >
        {loading ? "Fixing..." : "Unbreak it"}
      </button>

      <div className="answer" style={{ marginTop: 24, lineHeight: 1.6 }}>
        <ReactMarkdown
          components={{
            pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          }}
        >
          {result}
        </ReactMarkdown>
      </div>
    </main>
  );
}