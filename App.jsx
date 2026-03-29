import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const APP_VERSION = "1.0.0";
const SAVED_KEY   = "vt_saved_v3";
const ONBOARD_KEY = "vt_onboarded";
const MAX_SAVED   = 60;
const AD_EVERY_N  = 3;

const CATEGORIES = [
  { id:"reply",    icon:"↩",  label:"Smart Reply",        color:"#0ea5e9", desc:"Paste any message — get the perfect reply" },
  { id:"love",     icon:"♥",  label:"Love & Romance",      color:"#f43f5e", desc:"Flirty, sweet & heartfelt texts" },
  { id:"chat",     icon:"✦",  label:"Chat & Texts",        color:"#8b5cf6", desc:"Everyday messages & conversations" },
  { id:"business", icon:"▣",  label:"Business & Captions", color:"#10b981", desc:"LinkedIn, email, social media" },
  { id:"funny",    icon:"◉",  label:"Funny & Banter",      color:"#f59e0b", desc:"Jokes, comebacks & viral content" },
  { id:"apology",  icon:"◌",  label:"Apologies",           color:"#6366f1", desc:"Say sorry the right way" },
];

const STYLES      = ["Short","Long","Casual","Professional","Emotional","Funny","Bold","Savage"];
const REPLY_TONES = ["Friendly","Flirty","Savage","Funny","Professional","Apologetic","Excited","Unbothered"];

const LANGUAGES = [
  { id:"standard",           label:"🌍 Standard English",          region:"Global" },
  { id:"ghanaian",           label:"🇬🇭 Ghanaian Pidgin",           region:"Africa" },
  { id:"nigerian",           label:"🇳🇬 Nigerian Pidgin",           region:"Africa" },
  { id:"naija_slang",        label:"🇳🇬 Naija Street Slang",        region:"Africa" },
  { id:"south_african",      label:"🇿🇦 South African Slang",       region:"Africa" },
  { id:"kenyan",             label:"🇰🇪 Kenyan Sheng",              region:"Africa" },
  { id:"zimbabwean",         label:"🇿🇼 Zimbabwean Slang",          region:"Africa" },
  { id:"tanzanian",          label:"🇹🇿 Tanzanian Swahili Mix",     region:"Africa" },
  { id:"ugandan",            label:"🇺🇬 Ugandan Slang",             region:"Africa" },
  { id:"cameroonian",        label:"🇨🇲 Cameroonian Pidgin",        region:"Africa" },
  { id:"sierra_leone",       label:"🇸🇱 Sierra Leonean Krio",       region:"Africa" },
  { id:"liberian",           label:"🇱🇷 Liberian English",          region:"Africa" },
  { id:"gambian",            label:"🇬🇲 Gambian Slang",             region:"Africa" },
  { id:"ethiopian",          label:"🇪🇹 Ethiopian English Mix",     region:"Africa" },
  { id:"rwandan",            label:"🇷🇼 Rwandan English Mix",       region:"Africa" },
  { id:"jamaican",           label:"🇯🇲 Jamaican Patois",           region:"Caribbean" },
  { id:"trinidadian",        label:"🇹🇹 Trinidadian Slang",         region:"Caribbean" },
  { id:"barbadian",          label:"🇧🇧 Bajan (Barbadian)",         region:"Caribbean" },
  { id:"guyanese",           label:"🇬🇾 Guyanese Creole",           region:"Caribbean" },
  { id:"haitian",            label:"🇭🇹 Haitian Creole Mix",        region:"Caribbean" },
  { id:"caribbean_general",  label:"🌊 Caribbean General",          region:"Caribbean" },
  { id:"us_casual",          label:"🇺🇸 US Casual / Gen Z",         region:"Americas" },
  { id:"us_aave",            label:"🇺🇸 AAVE / Black Slang",        region:"Americas" },
  { id:"us_southern",        label:"🇺🇸 US Southern Charm",         region:"Americas" },
  { id:"latino_english",     label:"🌮 Latino English / Spanglish", region:"Americas" },
  { id:"canadian",           label:"🇨🇦 Canadian Slang",            region:"Americas" },
  { id:"brazilian_english",  label:"🇧🇷 Brazilian English Mix",     region:"Americas" },
  { id:"uk",                 label:"🇬🇧 UK Slang (General)",        region:"Europe" },
  { id:"uk_roadman",         label:"🇬🇧 UK Roadman / MLE",          region:"Europe" },
  { id:"scottish",           label:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish Slang",           region:"Europe" },
  { id:"irish",              label:"🇮🇪 Irish Slang",               region:"Europe" },
  { id:"australian",         label:"🇦🇺 Australian Slang",          region:"Oceania" },
  { id:"new_zealand",        label:"🇳🇿 New Zealand Slang",         region:"Oceania" },
  { id:"indian_english",     label:"🇮🇳 Indian English",            region:"Asia" },
  { id:"singaporean",        label:"🇸🇬 Singlish (Singapore)",      region:"Asia" },
  { id:"philippine",         label:"🇵🇭 Filipino English Mix",      region:"Asia" },
  { id:"malaysian",          label:"🇲🇾 Malaysian English",         region:"Asia" },
  { id:"pakistani",          label:"🇵🇰 Pakistani English Mix",     region:"Asia" },
  { id:"arab_english",       label:"🌙 Arab English Mix",           region:"Middle East" },
  { id:"french_english",     label:"🇫🇷 Franglais Mix",             region:"Multilingual" },
  { id:"spanish_english",    label:"🇪🇸 Spanglish",                 region:"Multilingual" },
  { id:"portuguese_english", label:"🇵🇹 Portuñol Mix",              region:"Multilingual" },
];

const REGIONS = ["All", ...new Set(LANGUAGES.map(l => l.region))];

const TRENDING = [
  "Birthday message for best friend",
  "Apologise to my partner after an argument",
  "Instagram caption for a sunset photo",
  "Good morning text to make someone smile",
  "LinkedIn post about a new achievement",
  "Funny excuse to cancel plans",
  "Hype text before a big interview",
  "Check in on a friend who went quiet",
];

// ─── STORAGE HELPERS (safe, never throws) ────────────────────────────────────

const storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* silent */ }
  },
};

// ─── NETWORK HELPER ──────────────────────────────────────────────────────────

const FRIENDLY_ERRORS = {
  401: "API key issue. Please contact support.",
  429: "Too many requests — please wait a moment and try again.",
  500: "The AI service is temporarily unavailable. Try again shortly.",
  503: "Service is down for maintenance. Please try again later.",
};

async function callAI(messages, signal) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: "You are VibeText AI. Generate the requested message text only. Be concise, human, and culturally authentic. Never add labels, preamble, explanations, or quotation marks around the output.",
      messages,
    }),
  });

  if (!response.ok) {
    const friendly = FRIENDLY_ERRORS[response.status] || `Request failed (${response.status}). Please try again.`;
    throw new Error(friendly);
  }

  const data = await response.json();

  if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  return data.content.map(b => (b.type === "text" ? b.text : "")).join("").trim();
}

// ─── CUSTOM HOOKS ─────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState("");
  const timer = useRef(null);
  const show = useCallback((m) => {
    clearTimeout(timer.current);
    setMsg(m);
    timer.current = setTimeout(() => setMsg(""), 2400);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [msg, show];
}

function useAdGate(everyN = AD_EVERY_N) {
  const [show, setShow]           = useState(false);
  const [countdown, setCountdown] = useState(3);
  const count  = useRef(0);
  const timer  = useRef(null);

  const trigger = useCallback(() => {
    count.current += 1;
    if (count.current % everyN !== 0) return;
    setShow(true);
    setCountdown(3);
    let c = 3;
    timer.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) { clearInterval(timer.current); setShow(false); }
    }, 1000);
  }, [everyN]);

  useEffect(() => () => clearInterval(timer.current), []);
  return { show, countdown, trigger };
}

// ─── SMALL UI COMPONENTS ──────────────────────────────────────────────────────

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div role="status" aria-live="polite" style={{
      position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
      background:"#0f172a", color:"#f8fafc", padding:"10px 22px",
      borderRadius:100, fontSize:13, fontWeight:600, zIndex:9999,
      boxShadow:"0 8px 32px rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.08)",
      whiteSpace:"nowrap", letterSpacing:0.2, animation:"toastIn .2s ease",
      pointerEvents:"none",
    }}>{msg}</div>
  );
}

function AdModal({ countdown }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Advertisement" style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)",
    }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"40px 32px", textAlign:"center", maxWidth:300, width:"90%", boxShadow:"0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>⚡</div>
        <div style={{ fontSize:11, letterSpacing:2, color:"#10b981", marginBottom:6, fontWeight:700, textTransform:"uppercase", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Sponsored</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#0f172a", marginBottom:8, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Upgrade to Pro</div>
        <div style={{ fontSize:14, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>Remove ads, unlimited generations & all 42 cultural styles — from $4.99/mo.</div>
        <div style={{ background:"#f1f5f9", borderRadius:100, padding:"10px 24px", fontSize:14, color:"#64748b", fontWeight:600, display:"inline-block" }}>Closes in {countdown}s</div>
      </div>
    </div>
  );
}

function Shimmer({ lines = 4 }) {
  return (
    <div style={{ padding:"6px 0" }} aria-label="Loading…">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height:14, borderRadius:8,
          background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize:"400% 100%", animation:"shimmer 1.2s ease infinite",
          marginBottom:10, width: i === lines - 1 ? "60%" : "100%",
        }} />
      ))}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:1.8, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
      {children}
    </div>
  );
}

function Hint({ children }) {
  return <div style={{ fontSize:11, color:"#94a3b8", marginTop:5, fontWeight:500 }}>{children}</div>;
}

function Chip({ children, active, color, onClick }) {
  const c = color || "#0f172a";
  return (
    <button onClick={onClick} style={{
      cursor:"pointer", border:`1.5px solid ${active ? c : "#e2e8f0"}`,
      borderRadius:100, padding:"7px 14px", fontSize:12, fontWeight:600,
      background: active ? c : "#fff", color: active ? "#fff" : "#64748b",
      fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all .12s",
    }}>{children}</button>
  );
}

function ActionBtn({ children, onClick, color, bg, border, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg || "#fff", border:`1.5px solid ${border || "#e2e8f0"}`,
      borderRadius:13, padding:"13px", color: color || "#0f172a",
      fontSize:14, fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all .15s",
      opacity: disabled ? 0.5 : 1, width:"100%",
    }}>{children}</button>
  );
}

const taStyle = (extra = {}) => ({
  width:"100%", background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12,
  padding:"12px 14px", color:"#0f172a", fontSize:14.5, resize:"none",
  fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1.65, outline:"none",
  transition:"border-color .15s", ...extra,
});

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  body { overscroll-behavior-y: contain; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes toastIn  { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .card-press { transition:transform .15s, box-shadow .15s; }
  .card-press:active { transform:scale(0.98); }
  .card-press:hover  { box-shadow:0 8px 28px rgba(0,0,0,0.10); }
  button:focus-visible { outline:2px solid #0ea5e9; outline-offset:2px; }
  textarea:focus, input:focus { border-color:#0f172a !important; }
`;

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function OnboardingScreen({ onDone }) {
  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", textAlign:"center" }}>
      <style>{CSS}</style>
      <div style={{ width:72, height:72, borderRadius:20, background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:28, boxShadow:"0 12px 40px rgba(15,23,42,0.18)" }}>✦</div>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:"#0ea5e9", textTransform:"uppercase", marginBottom:10 }}>Welcome to</div>
      <h1 style={{ fontSize:34, fontWeight:800, color:"#0f172a", marginBottom:12, lineHeight:1.1 }}>VibeText AI</h1>
      <p style={{ fontSize:16, color:"#64748b", lineHeight:1.65, marginBottom:40, maxWidth:300 }}>Generate perfect texts, captions & smart replies in 42 cultural styles — instantly.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:14, width:"100%", maxWidth:320, marginBottom:36 }}>
        {[
          ["↩", "Smart Reply",  "Paste any message → get the perfect reply"],
          ["✦", "42 Cultures",  "Ghanaian Pidgin to UK Roadman & beyond"],
          ["⚡", "AI-Powered",  "Results in under 2 seconds"],
        ].map(([ic, t, d]) => (
          <div key={t} style={{ display:"flex", alignItems:"center", gap:14, background:"#f8fafc", borderRadius:14, padding:"14px 16px", textAlign:"left" }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"#0f172a", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{ic}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{t}</div>
              <div style={{ fontSize:12, color:"#94a3b8" }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onDone} style={{ width:"100%", maxWidth:320, padding:"17px", borderRadius:14, background:"#0f172a", color:"#fff", fontSize:16, fontWeight:700, border:"none", cursor:"pointer", letterSpacing:0.3, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        Get Started →
      </button>
      <div style={{ fontSize:11, color:"#cbd5e1", marginTop:14 }}>By continuing you agree to our Terms & Privacy Policy</div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [onboarded, setOnboarded] = useState(() => !!storage.get(ONBOARD_KEY));

  // Navigation
  const [screen,   setScreen]   = useState("home");
  const [category, setCategory] = useState(null);

  // Input state
  const [prompt,    setPrompt]    = useState("");
  const [replyMsg,  setReplyMsg]  = useState("");
  const [replyCtx,  setReplyCtx]  = useState("");
  const [style,     setStyle]     = useState("Casual");
  const [replyTone, setReplyTone] = useState("Friendly");
  const [lang,      setLang]      = useState("standard");
  const [region,    setRegion]    = useState("Global");
  const [langSearch,setLangSearch]= useState("");

  // Output state
  const [result,  setResult]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [copied,  setCopied]  = useState(false);

  // Saved messages
  const [saved, setSaved] = useState(() => storage.get(SAVED_KEY, []));

  // Abort ref for cancelling in-flight requests
  const abortRef = useRef(null);

  const [toastMsg, showToast] = useToast();
  const ad = useAdGate(AD_EVERY_N);

  // Cleanup on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  const isReply = category === "reply";
  const cat     = CATEGORIES.find(c => c.id === category) ?? null;
  const langObj = LANGUAGES.find(l => l.id === lang) ?? LANGUAGES[0];

  const filteredLangs = LANGUAGES.filter(l =>
    langSearch
      ? l.label.toLowerCase().includes(langSearch.toLowerCase())
      : (region === "All" || l.region === region)
  );

  const canGenerate = isReply
    ? replyMsg.trim().length > 3
    : prompt.trim().length > 3 && category !== null;

  // ── Prompt builder ──────────────────────────────────────────────────────────

  function buildMessages(extra = []) {
    const langNote = lang !== "standard"
      ? `Write authentically in ${langObj.label} style — use real expressions, slang, and rhythm from that culture. Make it feel genuinely local, not translated.`
      : "Write in clean, natural Standard English.";

    const userContent = isReply
      ? `Message received: "${replyMsg.trim()}"${replyCtx.trim() ? `\nContext: ${replyCtx.trim()}` : ""}\n\nWrite a ${replyTone} text reply. ${langNote} Sound like a real person — natural, human. Max 3 sentences. Reply text only.`
      : `Generate a ${style} ${cat?.label ?? "text"} message: "${prompt.trim()}". ${langNote} Max 200 words. Message text only.`;

    return [{ role:"user", content: userContent }, ...extra];
  }

  // ── Generate ────────────────────────────────────────────────────────────────

  async function generate() {
    if (!canGenerate || loading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setResult("");
    ad.trigger();

    try {
      const text = await callAI(buildMessages(), controller.signal);
      if (!text) throw new Error("The AI returned an empty response. Please try again.");
      setResult(text);
      setScreen("result");
    } catch (err) {
      if (err.name === "AbortError") return; // user navigated away — silent
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Regenerate ──────────────────────────────────────────────────────────────

  async function regenerate() {
    if (!result || loading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const messages = buildMessages([
        { role:"assistant", content: result },
        { role:"user",      content: "Give me a completely different version. Same requirements, fresh take." },
      ]);
      const text = await callAI(messages, controller.signal);
      if (!text) throw new Error("Empty response — please try again.");
      setResult(text);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Regeneration failed. Please try again.");
      showToast("Regeneration failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function copyText() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      showToast("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showToast("Copy failed — please copy manually");
    });
  }

  function shareText() {
    if (!result) return;
    if (navigator.share) {
      navigator.share({ text: result, title: "VibeText AI" }).catch(() => {
        // User cancelled share — no error needed
      });
    } else {
      copyText();
    }
  }

  function saveText() {
    if (!result) return;
    const item = {
      id:       Date.now(),
      text:     result,
      category: category ?? "chat",
      style:    isReply ? replyTone : style,
      prompt:   isReply ? replyMsg  : prompt,
      lang,
      date:     new Date().toLocaleDateString(),
    };
    const updated = [item, ...saved].slice(0, MAX_SAVED);
    setSaved(updated);
    const ok = storage.set(SAVED_KEY, updated);
    showToast(ok ? "Saved ★" : "Saved (storage full — oldest removed)");
  }

  function deleteSaved(id) {
    const updated = saved.filter(s => s.id !== id);
    setSaved(updated);
    storage.set(SAVED_KEY, updated);
    showToast("Removed");
  }

  function completeOnboarding() {
    storage.set(ONBOARD_KEY, true);
    setOnboarded(true);
  }

  function navigateTo(screen, overrideCategory = null) {
    abortRef.current?.abort();
    setLoading(false);
    setError("");
    if (overrideCategory !== null) setCategory(overrideCategory);
    setScreen(screen);
  }

  // ── Onboarding gate ─────────────────────────────────────────────────────────

  if (!onboarded) {
    return <OnboardingScreen onDone={completeOnboarding} />;
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const navActive = (id) => {
    if (id === "reply") return screen === "input" && category === "reply";
    if (id === "write") return screen === "input" && category !== "reply";
    return screen === id;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif", color:"#0f172a", position:"relative", overflowX:"hidden" }}>
      <style>{CSS}</style>
      <Toast msg={toastMsg} />
      {ad.show && <AdModal countdown={ad.countdown} />}

      <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", position:"relative", background:"#f8fafc", boxShadow:"0 0 0 1px rgba(0,0,0,0.04)" }}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header style={{ padding:"14px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f8fafc" }}>
          <button onClick={() => navigateTo("home")} style={{ background:"none", border:"none", padding:0, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }} aria-label="Home">
            <div style={{ width:34, height:34, borderRadius:10, background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15 }}>✦</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#0f172a", letterSpacing:-0.3 }}>VibeText AI</div>
              <div style={{ fontSize:9, fontWeight:700, color:"#0ea5e9", letterSpacing:2, textTransform:"uppercase", marginTop:-1 }}>Text Generator</div>
            </div>
          </button>
          <button
            onClick={() => navigateTo("saved")}
            aria-label={`Saved messages (${saved.length})`}
            style={{ background: screen==="saved" ? "#0f172a" : "#fff", border:"1px solid", borderColor: screen==="saved" ? "#0f172a" : "#e2e8f0", borderRadius:100, padding:"7px 14px", color: screen==="saved" ? "#fff" : "#64748b", fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all .15s" }}>
            ★ {saved.length}
          </button>
        </header>

        {/* ════════════ HOME ════════════════════════════════════════════════ */}
        {screen === "home" && (
          <main style={{ padding:"20px 20px 100px", animation:"fadeUp .35s ease" }}>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:26, fontWeight:800, lineHeight:1.2, color:"#0f172a", marginBottom:6 }}>
                What are you writing<br /><span style={{ color:"#0ea5e9" }}>today?</span>
              </h1>
              <p style={{ fontSize:14, color:"#94a3b8", fontWeight:500 }}>AI-powered texts in 42 cultural styles.</p>
            </div>

            {/* Smart Reply Hero */}
            <button className="card-press" onClick={() => { setCategory("reply"); setScreen("input"); }}
              style={{ width:"100%", background:"#0f172a", borderRadius:20, padding:"20px", textAlign:"left", cursor:"pointer", marginBottom:12, border:"none", position:"relative", overflow:"hidden" }}
              aria-label="Smart Reply — paste any message and get the perfect reply">
              <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(14,165,233,0.15)", pointerEvents:"none" }} />
              <div style={{ position:"absolute", bottom:-20, right:20, width:80, height:80, borderRadius:"50%", background:"rgba(14,165,233,0.08)", pointerEvents:"none" }} />
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, position:"relative" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(14,165,233,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#38bdf8", fontSize:17 }}>↩</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, color:"#fff" }}>Smart Reply</div>
                  <div style={{ fontSize:10, color:"#0ea5e9", fontWeight:700, letterSpacing:1.5 }}>MOST POPULAR</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6, marginBottom:12, position:"relative" }}>Paste any message you received and get a perfect, culturally-aware reply in seconds.</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#0ea5e9", borderRadius:100, padding:"8px 16px", fontSize:13, fontWeight:700, color:"#fff", position:"relative" }}>Reply Now →</div>
            </button>

            {/* Category Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
              {CATEGORIES.filter(c => c.id !== "reply").map((c, i) => (
                <button key={c.id} className="card-press"
                  onClick={() => { setCategory(c.id); setScreen("input"); }}
                  aria-label={c.label}
                  style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:"16px 14px", textAlign:"left", cursor:"pointer", animation:`fadeUp .3s ease ${i*.05}s both` }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${c.color}15`, display:"flex", alignItems:"center", justifyContent:"center", color:c.color, fontSize:18, marginBottom:10 }}>{c.icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:3 }}>{c.label}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.4 }}>{c.desc}</div>
                </button>
              ))}
            </div>

            {/* Trending */}
            <div style={{ background:"#fff", borderRadius:18, padding:"18px", border:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0f172a", letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>🔥 Trending Today</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {TRENDING.map((t, i) => (
                  <button key={i}
                    onClick={() => { setCategory("chat"); setPrompt(t); setScreen("input"); }}
                    style={{ background:"#f8fafc", border:"none", borderRadius:10, padding:"10px 12px", textAlign:"left", cursor:"pointer", fontSize:13, color:"#334155", fontWeight:500, fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"background .12s" }}
                    onMouseOver={e => e.currentTarget.style.background="#f1f5f9"}
                    onMouseOut={e  => e.currentTarget.style.background="#f8fafc"}>
                    {t} →
                  </button>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ════════════ INPUT ═══════════════════════════════════════════════ */}
        {screen === "input" && (
          <main style={{ padding:"16px 20px 110px", animation:"fadeUp .3s ease" }}>
            <button onClick={() => navigateTo("home")} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:13, marginBottom:16, padding:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>← Back</button>

            {cat && (
              <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:20, padding:"14px 16px", background:"#fff", borderRadius:14, border:"1px solid #e2e8f0" }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${cat.color}15`, display:"flex", alignItems:"center", justifyContent:"center", color:cat.color, fontSize:18, flexShrink:0 }}>{cat.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#0f172a" }}>{cat.label}</div>
                  <div style={{ fontSize:12, color:"#94a3b8" }}>{cat.desc}</div>
                </div>
              </div>
            )}

            {isReply ? (
              <>
                <Section label="Paste the message you received *">
                  <textarea
                    value={replyMsg}
                    onChange={e => setReplyMsg(e.target.value)}
                    placeholder='"Hey, I think we need to talk about what happened…"'
                    maxLength={1000}
                    style={taStyle({ minHeight:90 })}
                    aria-label="Message to reply to"
                  />
                  <Hint>💡 Paste the exact message for the most accurate reply</Hint>
                </Section>

                <Section label="Context (optional)">
                  <textarea
                    value={replyCtx}
                    onChange={e => setReplyCtx(e.target.value)}
                    placeholder="e.g. This is my ex. We broke up 2 weeks ago. I want to seem unbothered."
                    maxLength={400}
                    style={taStyle({ minHeight:60 })}
                    aria-label="Optional context"
                  />
                </Section>

                <Section label="Reply Tone">
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:7 }}>
                    {REPLY_TONES.map(t => (
                      <Chip key={t} active={replyTone === t} color={cat?.color} onClick={() => setReplyTone(t)}>{t}</Chip>
                    ))}
                  </div>
                </Section>
              </>
            ) : (
              <>
                <Section label="Your Prompt">
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe your message (e.g. birthday text for my best friend who loves football)"
                    maxLength={600}
                    style={taStyle({ minHeight:90 })}
                    aria-label="Prompt"
                  />
                  <Hint>💡 Be specific — the more detail, the better the result</Hint>
                </Section>

                <Section label="Style">
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {STYLES.map(s => (
                      <Chip key={s} active={style === s} color={cat?.color} onClick={() => setStyle(s)}>{s}</Chip>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* Language Picker */}
            <Section label={`🌍 Language / Cultural Style — ${LANGUAGES.length} styles`}>
              <input
                value={langSearch}
                onChange={e => { setLangSearch(e.target.value); if (e.target.value) setRegion("All"); }}
                placeholder="Search any language or culture…"
                maxLength={60}
                aria-label="Search languages"
                style={{ width:"100%", background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"9px 13px", color:"#0f172a", fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:8, outline:"none", transition:"border-color .15s" }}
              />
              {!langSearch && (
                <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:6, marginBottom:8, scrollbarWidth:"none" }} role="group" aria-label="Filter by region">
                  {REGIONS.map(r => (
                    <button key={r} onClick={() => setRegion(r)}
                      style={{ flexShrink:0, border:"1.5px solid", borderColor: region===r ? "#0f172a" : "#e2e8f0", borderRadius:100, padding:"5px 12px", background: region===r ? "#0f172a" : "#fff", color: region===r ? "#fff" : "#64748b", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", whiteSpace:"nowrap" }}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:180, overflowY:"auto" }} role="listbox" aria-label="Language options">
                {filteredLangs.length > 0 ? filteredLangs.map(l => (
                  <button key={l.id} role="option" aria-selected={lang === l.id} onClick={() => setLang(l.id)}
                    style={{ width:"100%", background: lang===l.id ? "#0f172a" : "#fff", border:`1.5px solid ${lang===l.id ? "#0f172a" : "#e2e8f0"}`, borderRadius:10, padding:"10px 13px", textAlign:"left", cursor:"pointer", color: lang===l.id ? "#fff" : "#475569", fontSize:13, fontWeight: lang===l.id ? 600 : 400, fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .12s" }}>
                    <span>{l.label}</span>
                    {lang === l.id && <span aria-hidden="true" style={{ fontSize:12 }}>✓</span>}
                  </button>
                )) : (
                  <div style={{ textAlign:"center", color:"#94a3b8", padding:16, fontSize:13 }}>No results found</div>
                )}
              </div>
            </Section>

            {error && (
              <div role="alert" style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#e11d48", marginBottom:14, fontWeight:500 }}>
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading || !canGenerate}
              aria-busy={loading}
              style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background:(loading||!canGenerate) ? "#e2e8f0" : isReply ? "#0ea5e9" : "#0f172a", color:(loading||!canGenerate) ? "#94a3b8" : "#fff", fontSize:16, fontWeight:700, cursor:(loading||!canGenerate) ? "not-allowed" : "pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all .2s", letterSpacing:0.2, boxShadow:(!loading&&canGenerate) ? "0 4px 20px rgba(15,23,42,0.2)" : "none" }}>
              {loading
                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span aria-hidden="true" style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />
                    {isReply ? "Crafting reply…" : "Generating…"}
                  </span>
                : isReply ? "Get My Reply →" : "Generate →"
              }
            </button>
          </main>
        )}

        {/* ════════════ RESULT ══════════════════════════════════════════════ */}
        {screen === "result" && (
          <main style={{ padding:"16px 20px 100px", animation:"fadeUp .3s ease" }}>
            <button onClick={() => navigateTo("input")} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:13, marginBottom:16, padding:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>← Refine</button>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:20, fontWeight:800, color:"#0f172a", marginBottom:3 }}>{isReply ? "Your Reply" : "Your Text"}</div>
              <div style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>{cat?.icon} {cat?.label} · {isReply ? replyTone : style} · {langObj?.label}</div>
            </div>

            {isReply && replyMsg && (
              <div style={{ background:"#f1f5f9", borderRadius:12, padding:"12px 14px", marginBottom:12, fontSize:13, color:"#64748b", lineHeight:1.6, borderLeft:"3px solid #e2e8f0" }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#94a3b8", textTransform:"uppercase", marginBottom:4 }}>They said</div>
                <em>"{replyMsg.slice(0, 140)}{replyMsg.length > 140 ? "…" : ""}"</em>
              </div>
            )}

            <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:20, padding:"22px 20px", marginBottom:16, boxShadow:"0 2px 16px rgba(0,0,0,0.05)" }} aria-live="polite">
              {loading ? <Shimmer lines={isReply ? 3 : 5} /> : (
                <p style={{ fontSize:16, lineHeight:1.85, color:"#1e293b", whiteSpace:"pre-wrap", margin:0 }}>{result}</p>
              )}
            </div>

            {error && (
              <div role="alert" style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#e11d48", marginBottom:14, fontWeight:500 }}>
                {error}
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:9 }}>
              <ActionBtn onClick={copyText}    color={copied?"#10b981":"#0f172a"} bg={copied?"#f0fdf4":"#fff"} border={copied?"#bbf7d0":"#e2e8f0"}>{copied ? "✓ Copied" : "Copy"}</ActionBtn>
              <ActionBtn onClick={saveText}    color="#f59e0b" bg="#fffbeb" border="#fde68a">★ Save</ActionBtn>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:16 }}>
              <ActionBtn onClick={shareText}   color="#0ea5e9" bg="#f0f9ff" border="#bae6fd">Share</ActionBtn>
              <ActionBtn onClick={regenerate}  color="#8b5cf6" bg="#faf5ff" border="#ddd6fe" disabled={loading}>{loading ? "…" : "↺ Redo"}</ActionBtn>
            </div>

            {/* Pro Banner */}
            <div style={{ background:"#0f172a", borderRadius:16, padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"rgba(14,165,233,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⚡</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#fff", marginBottom:1 }}>Upgrade to Pro</div>
                <div style={{ fontSize:11, color:"#64748b" }}>Unlimited · No ads · All 42 styles</div>
              </div>
              <button style={{ background:"#0ea5e9", border:"none", borderRadius:100, padding:"8px 16px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", whiteSpace:"nowrap" }}>
                $4.99/mo
              </button>
            </div>
          </main>
        )}

        {/* ════════════ SAVED ═══════════════════════════════════════════════ */}
        {screen === "saved" && (
          <main style={{ padding:"16px 20px 100px", animation:"fadeUp .3s ease" }}>
            <button onClick={() => navigateTo("home")} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:13, marginBottom:16, padding:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>← Home</button>
            <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:3 }}>Saved ★</div>
            <div style={{ fontSize:13, color:"#94a3b8", fontWeight:500, marginBottom:20 }}>{saved.length} message{saved.length !== 1 ? "s" : ""} saved</div>

            {saved.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }} aria-label="No saved messages">
                <div style={{ fontSize:48, marginBottom:12 }} aria-hidden="true">📭</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#0f172a", marginBottom:4 }}>Nothing saved yet</div>
                <div style={{ fontSize:13, color:"#94a3b8" }}>Generate texts and save your favourites here</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {saved.map(s => {
                  const c = CATEGORIES.find(x => x.id === s.category);
                  return (
                    <article key={s.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:"15px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span aria-hidden="true" style={{ fontSize:14 }}>{c?.icon}</span>
                        <span style={{ fontSize:11, color:"#94a3b8", fontWeight:500 }}>{c?.label} · {s.style} · {s.date}</span>
                        <button
                          onClick={() => deleteSaved(s.id)}
                          aria-label="Delete saved message"
                          style={{ marginLeft:"auto", background:"none", border:"none", color:"#cbd5e1", cursor:"pointer", fontSize:18, padding:2, lineHeight:1 }}>×</button>
                      </div>
                      <p style={{ fontSize:14, lineHeight:1.7, color:"#334155", marginBottom:10 }}>
                        {s.text.slice(0, 200)}{s.text.length > 200 ? "…" : ""}
                      </p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(s.text).then(() => showToast("Copied")).catch(() => showToast("Copy failed")); }}
                        style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 13px", color:"#475569", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                        Copy
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        )}

        {/* ── BOTTOM NAV ─────────────────────────────────────────────────── */}
        <nav aria-label="Main navigation" style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"rgba(255,255,255,0.97)", borderTop:"1px solid #e2e8f0", backdropFilter:"blur(20px)", padding:"10px 20px 20px", display:"flex", justifyContent:"space-around", zIndex:100 }}>
          {[
            { id:"home",  icon:"⊞", label:"Home" },
            { id:"reply", icon:"↩", label:"Reply" },
            { id:"write", icon:"✎", label:"Write" },
            { id:"saved", icon:"★", label:"Saved" },
          ].map(n => (
            <button key={n.id}
              aria-label={n.label}
              aria-current={navActive(n.id) ? "page" : undefined}
              onClick={() => {
                if (n.id === "reply") { setCategory("reply"); navigateTo("input"); }
                else if (n.id === "write") { if (category && category !== "reply") navigateTo("input"); else navigateTo("home"); }
                else navigateTo(n.id);
              }}
              style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color: navActive(n.id) ? "#0f172a" : "#94a3b8", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"color .15s", position:"relative" }}>
              {n.id === "reply" && (
                <div aria-hidden="true" style={{ position:"absolute", top:-1, right:0, width:6, height:6, borderRadius:"50%", background:"#0ea5e9" }} />
              )}
              <span style={{ fontSize:19, lineHeight:1 }} aria-hidden="true">{n.icon}</span>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:0.6, textTransform:"uppercase" }}>{n.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
