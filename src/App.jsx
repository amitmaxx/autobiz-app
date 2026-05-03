import { useState, useRef, useEffect } from "react";

const FREE_MODELS = [
  "openrouter/auto"
];

async function callAI(apiKey, prompt, system = "") {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://autobiz.app",
      "X-Title": "AutoBiz AI Factory"
    },
    body: JSON.stringify({
      model: FREE_MODELS[0],
      messages: [
        { role: "system", content: system || "You are AutoBiz AI Factory." },
        { role: "user", content: prompt }
      ]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "API Error: " + res.status);
  return data.choices[0].message.content;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default function App() {
  const [apiKey, setApiKey]     = useState("");
  const [niche, setNiche]       = useState("Business Ideas");
  const [language, setLanguage] = useState("Hindi");
  const [running, setRunning]   = useState(false);
  const [logs, setLogs]         = useState([]);
  const [result, setResult]     = useState(null);
  const [tab, setTab]           = useState("idea");
  const [showKey, setShowKey]   = useState(false);
  const [copied, setCopied]     = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg, type = "info") =>
    setLogs(l => [...l, { msg, type, t: new Date().toLocaleTimeString() }]);

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const runPipeline = async () => {
    if (!apiKey.trim()) { alert("Pehle OpenRouter API Key daalo!"); return; }
    if (running) return;
    setRunning(true);
    setResult(null);
    setLogs([]);

    try {
      // ── IDEA ──────────────────────────────────────────────
      addLog("⚡ Business idea generate ho raha hai...", "info");
      const ideaRaw = await callAI(apiKey,
        `Generate ONE business idea for: "${niche}". Return ONLY JSON no markdown no extra text:
{"title":"Name","tagline":"Pitch","problem":"Problem","solution":"Solution","market_size":"1000 crore","revenue_model":"Revenue","scores":{"market":9,"demand":8,"scale":9,"profit":8,"competition":7},"total":41,"verdict":"APPROVED"}`,
        "Return only valid JSON. No markdown. No explanation."
      );
      let idea;
      try { idea = JSON.parse(ideaRaw.replace(/```json|```/g, "").trim()); }
      catch { idea = { title: "Smart Kisan Platform", tagline: "Farmer to buyer direct connection", market_size: "₹5000 crore", revenue_model: "Commission + Subscription", scores:{market:9,demand:8,scale:9,profit:8,competition:7}, total:41, verdict:"APPROVED", problem:"Farmers get low prices", solution:"Direct digital marketplace" }; }
      if (idea.verdict !== "APPROVED") throw new Error("Idea rejected score " + idea.total + "/50. Dobara try karo.");
      addLog("✅ Idea approved: " + idea.title + " [" + idea.total + "/50]", "success");
      await sleep(300);

      // ── LONG SCRIPT ───────────────────────────────────────
      addLog("📝 Long video script likh raha hai...", "info");
      const longScript = await callAI(apiKey,
        `Write 8-10 minute YouTube script in ${language} for: "${idea.title}". Sections: HOOK, PROBLEM, SOLUTION, REVENUE MODEL, CTA for ebook Rs 1000. Add [B-ROLL] cues. Storytelling tone.`,
        "You are top Indian YouTube scriptwriter. Write in " + language + "."
      );
      addLog("✅ Long script ready — " + longScript.split(" ").length + " words", "success");
      await sleep(300);

      // ── SHORTS SCRIPT ─────────────────────────────────────
      addLog("📱 Shorts script likh raha hai...", "info");
      const shortScript = await callAI(apiKey,
        `Write 30 second YouTube Shorts script in ${language} for: "${idea.title}". HOOK (2s), PROBLEM (5s), TEASE SOLUTION (10s), CTA (5s). Fast pacing.`,
        "You are top Indian YouTube scriptwriter."
      );
      addLog("✅ Shorts script ready", "success");
      await sleep(300);

      // ── SEO ───────────────────────────────────────────────
      addLog("🔍 SEO metadata generate ho raha hai...", "info");
      const seoRaw = await callAI(apiKey,
        `YouTube SEO for: "${idea.title}". Return ONLY valid JSON no markdown:
{"title":"High CTR title","description":"Full desc with Rs 1000 ebook CTA","tags":["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10"],"thumbnail_text":"5 WORD BOLD TEXT","hashtags":["#businessideas","#startup","#india"]}`,
        "Return only valid JSON. No markdown."
      );
      let seo;
      try { seo = JSON.parse(seoRaw.replace(/```json|```/g, "").trim()); }
      catch { seo = { title: idea.title + " — Full Blueprint", thumbnail_text: "CRORE BUSINESS IDEA", tags:["business","startup","india","hindi","money"], hashtags:["#businessideas","#startup"] }; }
      addLog("✅ SEO ready: " + seo.title, "success");
      await sleep(300);

      // ── EBOOK ─────────────────────────────────────────────
      addLog("📚 10-chapter ebook likh raha hai...", "info");
      const ebook = await callAI(apiKey,
        `Write professional business ebook in ${language} about: "${idea.title}". Include 10 chapters with real numbers and actionable steps. End with: "AI DISCLOSURE: This is AI-assisted content for educational purposes only."`,
        "You are professional Indian business ebook author. Write in " + language + "."
      );
      addLog("✅ Ebook ready — " + ebook.split(" ").length + " words", "success");

      setResult({ idea, longScript, shortScript, seo, ebook });
      addLog("🏁 PIPELINE COMPLETE! Sab ready hai. 🎉", "success");
      setTab("idea");

    } catch (err) {
      addLog("❌ Error: " + err.message, "error");
    }
    setRunning(false);
  };

  const logColor = t => t === "success" ? "#00D46A" : t === "error" ? "#FF3860" : t === "warn" ? "#F0C030" : "#8888AA";

  const TABS = [
    { k: "idea", icon: "⚡", label: "Idea" },
    { k: "longscript", icon: "🎬", label: "Script" },
    { k: "short", icon: "📱", label: "Shorts" },
    { k: "seo", icon: "🔍", label: "SEO" },
    { k: "ebook", icon: "📚", label: "Ebook" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#08080F", color: "#E0E0F0", fontFamily: "'Segoe UI', sans-serif", paddingBottom: 40 }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px #FF4D0066} 50%{box-shadow:0 0 40px #FF4D00AA} }
        input, textarea, select { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2A2A40; border-radius: 4px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg, #0F0F1C, #1A0A05)", borderBottom: "1px solid #2A1A10", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #FF4D00, #F0C030)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏭</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>AutoBiz <span style={{ color: "#FF4D00" }}>AI</span> Factory</div>
          <div style={{ fontSize: 11, color: "#555577" }}>Idea → Script → Ebook → SEO</div>
        </div>
        {running && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, border: "2px solid #FF4D0033", borderTop: "2px solid #FF4D00", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#FF4D00", fontSize: 12, fontWeight: 700 }}>RUNNING</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── SETUP CARD ── */}
        <div style={{ background: "#0F0F1C", border: "1px solid #1E1E35", borderRadius: 16, padding: 20, marginBottom: 16 }}>

          {/* API Key */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "#555577", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>
              🔑 OpenRouter API Key
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={showKey ? "text" : "password"}
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{ flex: 1, background: "#080810", border: "1px solid #1E1E35", borderRadius: 8, padding: "11px 14px", color: "#E0E0F0", fontSize: 14 }}
              />
              <button onClick={() => setShowKey(s => !s)} style={{ background: "#1E1E35", border: "none", borderRadius: 8, padding: "0 14px", color: "#888", cursor: "pointer", fontSize: 16 }}>
                {showKey ? "🙈" : "👁️"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#333355", marginTop: 4 }}>
              openrouter.ai/settings/keys → Create Key (Free)
            </div>
          </div>

          {/* Niche + Language */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#555577", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>Niche</label>
              <input
                type="text"
                placeholder="Business Ideas..."
                value={niche}
                onChange={e => setNiche(e.target.value)}
                style={{ width: "100%", background: "#080810", border: "1px solid #1E1E35", borderRadius: 8, padding: "11px 14px", color: "#E0E0F0", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#555577", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{ width: "100%", background: "#080810", border: "1px solid #1E1E35", borderRadius: 8, padding: "11px 14px", color: "#E0E0F0", fontSize: 14 }}
              >
                {["Hindi", "English", "Hinglish", "Tamil", "Telugu", "Marathi"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* RUN BUTTON */}
          <button
            onClick={runPipeline}
            disabled={running}
            style={{
              width: "100%",
              padding: "15px",
              background: running ? "#1A1A2A" : "linear-gradient(135deg, #FF4D00, #F0C030)",
              border: "none",
              borderRadius: 12,
              color: running ? "#444466" : "#000",
              fontWeight: 900,
              fontSize: 17,
              cursor: running ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              animation: running ? "none" : "glow 2s ease-in-out infinite",
              letterSpacing: "0.5px"
            }}
          >
            {running ? (
              <><div style={{ width: 20, height: 20, border: "2px solid #33334455", borderTop: "2px solid #444466", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Pipeline chal rahi hai...</>
            ) : (
              <>▶ RUN PIPELINE</>
            )}
          </button>
        </div>

        {/* ── LIVE LOGS ── */}
        <div style={{ background: "#0F0F1C", border: "1px solid #1E1E35", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#444466", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            🖥️ LIVE LOG
            {running && <span style={{ color: "#00D46A", fontSize: 11 }}>● LIVE</span>}
          </div>
          <div ref={logRef} style={{ background: "#080810", borderRadius: 8, padding: 12, height: 140, overflowY: "auto", fontFamily: "monospace", fontSize: 12 }}>
            {logs.length === 0
              ? <div style={{ color: "#222244" }}>Pipeline chalao — yahan live updates dikhenge...</div>
              : logs.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 3, color: logColor(l.type) }}>
                  <span style={{ color: "#222244", flexShrink: 0 }}>{l.t}</span>
                  <span>{l.msg}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div style={{ background: "#0F0F1C", border: "1px solid #00D46A33", borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: "#00D46A" }}>✅ Pipeline Complete!</div>

            {/* Tab Bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#080810", padding: 4, borderRadius: 12, overflowX: "auto" }}>
              {TABS.map(({ k, icon, label }) => (
                <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "8px 6px", background: tab === k ? "#FF4D00" : "transparent", border: "none", borderRadius: 8, color: tab === k ? "#000" : "#555577", fontWeight: tab === k ? 800 : 400, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", minWidth: 60 }}>
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* ── IDEA TAB ── */}
            {tab === "idea" && (
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{result.idea.title}</div>
                <div style={{ color: "#555577", fontSize: 13, marginBottom: 16 }}>{result.idea.tagline}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[
                    ["💰 Market Size", result.idea.market_size, "#F0C030"],
                    ["📈 Revenue", result.idea.revenue_model, "#00D46A"],
                    ["⭐ Score", (result.idea.total || "41") + "/50", "#FF4D00"],
                    ["✅ Verdict", result.idea.verdict, "#00D46A"],
                  ].map(([k, v, c]) => (
                    <div key={k} style={{ background: "#080810", borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: "#444466", marginBottom: 4 }}>{k}</div>
                      <div style={{ fontWeight: 700, color: c, fontSize: 13 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.7 }}>
                  <div style={{ marginBottom: 8 }}><span style={{ color: "#FF4D00", fontWeight: 700 }}>Problem: </span><span style={{ color: "#AAAAC0" }}>{result.idea.problem}</span></div>
                  <div><span style={{ color: "#00D46A", fontWeight: 700 }}>Solution: </span><span style={{ color: "#AAAAC0" }}>{result.idea.solution}</span></div>
                </div>
              </div>
            )}

            {/* ── LONG SCRIPT TAB ── */}
            {tab === "longscript" && (
              <div>
                <button onClick={() => copyText(result.longScript, "script")} style={{ marginBottom: 10, background: copied === "script" ? "#00D46A22" : "#1E1E35", border: "none", color: copied === "script" ? "#00D46A" : "#888", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                  {copied === "script" ? "✓ Copied!" : "📋 Copy Script"}
                </button>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 380, overflowY: "auto", color: "#AAAAC0" }}>
                  {result.longScript}
                </div>
              </div>
            )}

            {/* ── SHORTS TAB ── */}
            {tab === "short" && (
              <div>
                <button onClick={() => copyText(result.shortScript, "short")} style={{ marginBottom: 10, background: copied === "short" ? "#00D46A22" : "#1E1E35", border: "none", color: copied === "short" ? "#00D46A" : "#888", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                  {copied === "short" ? "✓ Copied!" : "📋 Copy Script"}
                </button>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 380, overflowY: "auto", color: "#AAAAC0" }}>
                  {result.shortScript}
                </div>
              </div>
            )}

            {/* ── SEO TAB ── */}
            {tab === "seo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#444466", marginBottom: 4 }}>📌 TITLE</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{result.seo.title}</div>
                  <button onClick={() => copyText(result.seo.title, "title")} style={{ marginTop: 8, background: "transparent", border: "1px solid #1E1E35", color: copied === "title" ? "#00D46A" : "#555577", padding: "4px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                    {copied === "title" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#444466", marginBottom: 6 }}>🖼️ THUMBNAIL TEXT</div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: "#F0C030" }}>{result.seo.thumbnail_text}</div>
                </div>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#444466", marginBottom: 8 }}>🏷️ TAGS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.seo.tags?.map((t, i) => <span key={i} style={{ background: "#0A1628", color: "#00A8FF", border: "1px solid #00A8FF33", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#444466", marginBottom: 4 }}>📝 DESCRIPTION</div>
                  <div style={{ fontSize: 13, color: "#AAAAC0", lineHeight: 1.7, marginBottom: 8 }}>{result.seo.description}</div>
                  <button onClick={() => copyText(result.seo.description, "desc")} style={{ background: "transparent", border: "1px solid #1E1E35", color: copied === "desc" ? "#00D46A" : "#555577", padding: "4px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                    {copied === "desc" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {/* ── EBOOK TAB ── */}
            {tab === "ebook" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ background: "#F0C03022", color: "#F0C030", border: "1px solid #F0C03044", padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800 }}>₹1,000</span>
                  <button onClick={() => copyText(result.ebook, "ebook")} style={{ background: copied === "ebook" ? "#00D46A22" : "#1E1E35", border: "none", color: copied === "ebook" ? "#00D46A" : "#888", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                    {copied === "ebook" ? "✓ Copied!" : "📋 Copy Ebook"}
                  </button>
                </div>
                <div style={{ background: "#080810", borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 380, overflowY: "auto", color: "#AAAAC0" }}>
                  {result.ebook}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
