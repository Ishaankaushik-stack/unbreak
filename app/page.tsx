"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

const EXAMPLES = [
  {
    label: "Missing module",
    error: "Error: Cannot find module 'express'\n    at Function.Module._resolveFilename",
    code: "",
  },
  {
    label: "Docker build error",
    error:
      "npm ERR! engine Unsupported engine\nnpm ERR! notsup Required: {\"node\":\">=20\"}\nnpm ERR! notsup Actual: {\"node\":\"16.20.0\"}",
    code: "FROM node:16\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]",
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
        <a
          className="nav-link"
          href="https://github.com/Ishaankaushik-stack"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>

      <main className="container">
        <section className="hero">
          <span className="badge">AI debugging assistant</span>
          <h1>
            Paste the error. <span className="gradient">Get the fix.</span>
          </h1>
          <p className="subtitle">
            Drop in a broken error log or code. Unbreak explains the root cause
            and gives you the complete corrected code.
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
            Error log or question
          </label>
          <textarea
            id="error"
            className="input"
            placeholder="Paste the error log or your question here..."
            value={error}
            onChange={(e) => setError(e.target.value)}
            rows={7}
          />

          <label className="field-label" htmlFor="code">
            Code, Dockerfile or config <span className="optional">(optional)</span>
          </label>
          <textarea
            id="code"
            className="input"
            placeholder="Paste your code here..."
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
              {loading ? "Fixing..." : "Unbreak it"}
            </button>
            <span className="warning">Do not paste passwords or API keys.</span>
          </div>
        </section>

        {(result || loading) && (
          <section className="card result">
            <h2 className="result-title">Result</h2>
            {loading && !result && <p className="muted">Analyzing your code...</p>}
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
            <h3>Root cause</h3>
            <p>Plain-English explanation of why it broke.</p>
          </div>
          <div className="feature">
            <h3>Full fixed code</h3>
            <p>The complete corrected file, not just a snippet.</p>
          </div>
          <div className="feature">
            <h3>What changed</h3>
            <p>A short list of every change and the reason.</p>
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
          mistakes, so test the fix before using it.
        </p>
      </footer>
    </div>
  );
}