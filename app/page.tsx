"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

const EXAMPLES = [
  {
    label: "Explain simply",
    error: "Explain how the stock market works in simple words.",
    code: "",
  },
  {
    label: "Write an email",
    error: "Write a short, polite leave application email to my manager for 2 days.",
    code: "",
  },
  {
    label: "Missing module",
    error: "Error: Cannot find module 'express'\n    at Function.Module._resolveFilename",
    code: "",
  },
  {
    label: "JavaScript bug",
    error: "TypeError: Cannot read properties of undefined (reading 'map')",
    code: "function List({ items }) {\n  return items.map((i) => <li>{i}</li>);\n}",
  },
];

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  async function copy() {
    await navigator.clipboard.writeText(preRef.current?.innerText ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-wrap">
      <button className="copy-btn" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <pre ref={preRef}>{children}</pre>
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

  return (
    <div className="page">
      <header className="nav">
        <div className="logo">
          <span className="logo-mark">U</span>
          <span className="logo-text">Unbreak</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <a
            className="nav-link"
            href="https://github.com/Ishaankaushik-stack"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="nav-link"
            href="https://www.linkedin.com/in/ishan-kaushik-4a1b25407/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <span className="badge">AI assistant</span>
          <h1>
            Ask anything. <span className="gradient">Get answers.</span>
          </h1>
          <p className="subtitle">
            Ask any question on any topic, or paste broken code. Unbreak gives
            you a clear answer, and the complete fixed code when you paste an
            error.
          </p>
        </section>

        <section className="card">
          <div className="examples">
            <span className="examples-label">Try an example:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                className="chip"
                onClick={() => {
                  setError(ex.error);
                  setCode(ex.code);
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="error">
            Your question, error or log
          </label>
          <textarea
            id="error"
            className="input"
            placeholder="Ask a question or paste an error here..."
            value={error}
            onChange={(e) => setError(e.target.value)}
            rows={7}
          />

          <label className="field-label" htmlFor="code">
            Code or extra details <span className="optional">(optional)</span>
          </label>
          <textarea
            id="code"
            className="input"
            placeholder="Paste your code or any extra details here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={7}
          />

          <div className="actions">
            <button
              className="primary"
              onClick={diagnose}
              disabled={loading || !error.trim()}
            >
              {loading ? "Thinking..." : "Ask Unbreak"}
            </button>
            <span className="warning">Do not paste passwords or API keys.</span>
          </div>
        </section>

        {(result || loading) && (
          <section className="card result">
            <h2 className="result-title">Result</h2>
            {loading && !result && (
              <p className="muted">Working on your answer...</p>
            )}
            <div className="answer">
              <ReactMarkdown
                components={{
                  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </section>
        )}

        <section className="features">
          <div className="feature">
            <h3>Any topic</h3>
            <p>Study, work, writing, health, money and everyday questions.</p>
          </div>
          <div className="feature">
            <h3>Fixes your code</h3>
            <p>Paste an error and get the root cause and the complete fix.</p>
          </div>
          <div className="feature">
            <h3>Clear answers</h3>
            <p>Short, simple explanations with steps and examples.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Made by <strong>Ishaan Kaushik</strong>
        </p>
        <div className="contact">
          <a
            href="https://www.linkedin.com/in/ishan-kaushik-4a1b25407/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a href="tel:+918595141164">+91 85951 41164</a>
          <a
            href="https://wa.me/918595141164"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
        <p className="muted small">
          Your input is sent to an AI service to generate the answer. AI can make
          mistakes, so test the fix or check important answers before using them.
        </p>
      </footer>
    </div>
  );
}