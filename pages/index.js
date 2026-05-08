// pages/index.js — The webpage your users will see

import { useState } from "react";

const TASKS = [
  "SWOT Analysis",
  "Financial Analysis",
  "Competitor Analysis",
  "PESTLE Analysis",
  "Porter's 5 Forces",
  "Market Trends",
  "Executive Summary",
  "Risk Assessment",
  "Growth Opportunities",
  "Digital Strategy",
];

export default function Home() {
  const [company, setCompany]   = useState("");
  const [task, setTask]         = useState(TASKS[0]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState("");
  const [error, setError]       = useState("");
  const [history, setHistory]   = useState([]);
  const [copied, setCopied]     = useState(false);

  async function runAnalysis() {
    if (!company.trim()) { setError("Please enter a company name."); return; }
    setLoading(true); setResult(""); setError("");

    try {
      const res  = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: company.trim(), task }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data.result);
        setHistory(prev => [
          { company: company.trim(), task, result: data.result, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9),
        ]);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadTxt() {
    const blob = new Blob(
      [`${company} — ${task}\n${"=".repeat(60)}\n\n${result}`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href = url;
    a.download = `${company.replace(/ /g,"_")}_${task.replace(/ /g,"_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f1117;color:#e8e8e8;min-height:100vh}

        .header{background:#161b2e;border-bottom:1px solid #2a2f45;padding:14px 24px;display:flex;align-items:center;gap:12px}
        .logo{width:36px;height:36px;background:linear-gradient(135deg,#4f8ef7,#7c3aed);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
        .header-title{font-size:16px;font-weight:600;color:#fff}
        .header-sub{font-size:11px;color:#666;margin-top:1px}

        .layout{display:flex;height:calc(100vh - 65px)}

        /* LEFT */
        .left{width:320px;flex-shrink:0;background:#161b2e;border-right:1px solid #2a2f45;padding:22px 18px;display:flex;flex-direction:column;gap:18px;overflow-y:auto}
        .label{font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
        .inp{width:100%;background:#0f1117;border:1px solid #2a2f45;border-radius:8px;color:#e8e8e8;font-size:14px;padding:10px 12px;outline:none;transition:border-color .15s}
        .inp:focus{border-color:#4f8ef7}
        .inp::placeholder{color:#555}
        select.inp{cursor:pointer}
        select.inp option{background:#1e2435}

        .run-btn{width:100%;padding:12px;background:linear-gradient(135deg,#4f8ef7,#7c3aed);border:none;border-radius:9px;color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .15s,transform .1s;display:flex;align-items:center;justify-content:center;gap:8px}
        .run-btn:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}
        .run-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

        .hist-title{font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}
        .hist-item{background:#0f1117;border:1px solid #2a2f45;border-radius:8px;padding:9px 12px;cursor:pointer;transition:border-color .15s;margin-bottom:6px}
        .hist-item:hover{border-color:#4f8ef7}
        .hist-co{font-size:13px;font-weight:600;color:#e8e8e8}
        .hist-task{font-size:11px;color:#888;margin-top:2px}
        .hist-time{font-size:10px;color:#555;margin-top:2px}

        /* RIGHT */
        .right{flex:1;display:flex;flex-direction:column;overflow:hidden}
        .toolbar{background:#161b2e;border-bottom:1px solid #2a2f45;padding:10px 20px;display:flex;align-items:center;gap:8px;min-height:46px}
        .toolbar-label{font-size:13px;color:#888;flex:1}
        .toolbar-label strong{color:#e8e8e8}
        .tbtn{background:#0f1117;border:1px solid #2a2f45;border-radius:6px;color:#aaa;font-size:12px;padding:5px 12px;cursor:pointer;transition:all .15s}
        .tbtn:hover{border-color:#4f8ef7;color:#e8e8e8}
        .tbtn.copied{border-color:#22c55e;color:#22c55e}

        .body{flex:1;overflow-y:auto;padding:28px 32px}

        .empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#555}
        .empty-icon{font-size:44px;opacity:.35}
        .empty-text{font-size:14px}

        .spin-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;height:100%}
        .spinner{width:38px;height:38px;border:3px solid #2a2f45;border-top-color:#4f8ef7;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin-text{font-size:13px;color:#888}

        .err{background:#2d1515;border:1px solid #7f2020;border-radius:8px;padding:14px 18px;color:#f87171;font-size:14px;margin-bottom:16px}

        .res-header{margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #2a2f45}
        .res-co{font-size:21px;font-weight:700;color:#fff}
        .res-task{font-size:13px;color:#4f8ef7;margin-top:4px}
        .res-text{font-size:14px;line-height:1.9;color:#d1d5db;white-space:pre-wrap}

        @media(max-width:620px){
          .layout{flex-direction:column;height:auto}
          .left{width:100%;border-right:none;border-bottom:1px solid #2a2f45}
          .body{padding:20px 16px}
        }
      `}</style>

      <div className="header">
        <div className="logo">🧠</div>
        <div>
          <div className="header-title">AI Business Analyst</div>
          <div className="header-sub">Company AI Gateway</div>
        </div>
      </div>

      <div className="layout">

        {/* LEFT PANEL */}
        <div className="left">

          <div>
            <div className="label">Company Name</div>
            <input
              className="inp"
              type="text"
              placeholder="e.g. Infosys, TCS, Wipro"
              value={company}
              onChange={e => setCompany(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && runAnalysis()}
            />
          </div>

          <div>
            <div className="label">Analysis Type</div>
            <select className="inp" value={task} onChange={e => setTask(e.target.value)}>
              {TASKS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button className="run-btn" onClick={runAnalysis} disabled={loading}>
            {loading ? (
              <>
                <span style={{width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite"}}/>
                Analysing...
              </>
            ) : "▶  Run Analysis"}
          </button>

          {history.length > 0 && (
            <div>
              <div className="hist-title">Recent</div>
              {history.map((h,i) => (
                <div key={i} className="hist-item" onClick={() => { setCompany(h.company); setTask(h.task); setResult(h.result); setError(""); }}>
                  <div className="hist-co">{h.company}</div>
                  <div className="hist-task">{h.task}</div>
                  <div className="hist-time">{h.time}</div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT PANEL */}
        <div className="right">

          <div className="toolbar">
            {result ? (
              <>
                <div className="toolbar-label"><strong>{company}</strong> — {task}</div>
                <button className={`tbtn${copied ? " copied" : ""}`} onClick={copyResult}>{copied ? "✓ Copied" : "📋 Copy"}</button>
                <button className="tbtn" onClick={downloadTxt}>⬇ Download</button>
              </>
            ) : (
              <div className="toolbar-label">Output will appear here</div>
            )}
          </div>

          <div className="body">
            {error && <div className="err">⚠ {error}</div>}

            {loading && (
              <div className="spin-wrap">
                <div className="spinner"/>
                <div className="spin-text">Analysing {company}…</div>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="empty">
                <div className="empty-icon">📊</div>
                <div className="empty-text">Enter a company, pick an analysis type, click Run</div>
              </div>
            )}

            {!loading && result && (
              <>
                <div className="res-header">
                  <div className="res-co">{company}</div>
                  <div className="res-task">{task}</div>
                </div>
                <div className="res-text">{result}</div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
