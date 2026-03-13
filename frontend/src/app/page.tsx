"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, Sparkles, Volume2, VolumeX, ChevronLeft, ChevronRight, Star } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

type Page = {
  page: number;
  text: string;
  image: string;
  audio: string;
};

type State = "idle" | "loading" | "reading" | "done";

const INTEREST_OPTIONS = ["🦕 Dinosaurs", "🚀 Space", "🐠 Ocean", "🧙 Magic", "🦁 Animals", "🏎️ Cars", "🌸 Flowers", "🤖 Robots"];
const ACCESS_OPTIONS   = ["Dyslexia-friendly", "Visual impairment", "None"];

export default function Home() {
  const [state, setState]       = useState<State>("idle");
  const [pages, setPages]       = useState<Page[]>([]);
  const [title, setTitle]       = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [muted, setMuted]       = useState(false);
  const [loadingPage, setLoadingPage] = useState(0);

  // Form state
  const [childName, setChildName]   = useState("");
  const [age, setAge]               = useState(6);
  const [interests, setInterests]   = useState<string[]>([]);
  const [language, setLanguage]     = useState("en");
  const [access, setAccess]         = useState<string[]>([]);
  const [numPages, setNumPages]     = useState(5);

  // Speak current page — use backend audio (gTTS) if available, else Web Speech
  const speakText = (text: string, audioB64?: string) => {
    if (audioB64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioB64}`);
      audio.play().catch(e => console.error("Audio play error:", e));
      return;
    }
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === "es" ? "es-ES" : language === "hi" ? "hi-IN" : "en-US";
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const toggleAccess = (a: string) =>
    setAccess(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const startStory = async () => {
    if (!childName.trim() || interests.length === 0) return;
    setState("loading");
    setPages([]);
    setTitle("");
    setCurrentPage(0);
    setLoadingPage(0);

    const body = {
      child_name:    childName.trim(),
      age,
      interests:     interests.map(i => i.replace(/^\S+\s/, "")),
      language,
      accessibility: access.filter(a => a !== "None").map(a => a.toLowerCase().replace(/ /g, "_")),
      num_pages:     numPages,
    };

    try {
      const res = await fetch(`${BACKEND}/api/story/stream`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.body) throw new Error("No stream");
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "title") {
              setTitle(event.text);
            } else if (event.type === "page") {
              setLoadingPage(event.page);
              setPages(prev => [...prev, event as Page]);
              if (event.page === 1) setState("reading");
            } else if (event.type === "done") {
              setState("done");
            } else if (event.type === "error") {
              console.error(event.message);
              setState("idle");
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      setState("idle");
    }
  };

  const prev = () => setCurrentPage(p => Math.max(0, p - 1));
  const next = () => setCurrentPage(p => Math.min(pages.length - 1, p + 1));

  // ── FORM VIEW ─────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "var(--cream)" }}>
        <div className="float mb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "var(--warm)" }}>
            <BookOpen size={40} color="white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-2 text-center" style={{ fontFamily: "var(--font-lora)" }}>
          <span className="shimmer-text">StoryMind</span>
        </h1>
        <p className="text-lg mb-10 text-center" style={{ color: "#6B5B7B", maxWidth: 420 }}>
          Magical AI storybooks — personalized, illustrated, and narrated just for your child ✨
        </p>

        <div className="w-full max-w-lg space-y-6">
          {/* Child name */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: "var(--ink)" }}>Child's name</label>
            <input
              value={childName}
              onChange={e => setChildName(e.target.value)}
              placeholder="e.g. Aarav"
              className="w-full px-4 py-3 rounded-2xl border-2 outline-none text-lg font-semibold transition-all"
              style={{ borderColor: "var(--lavender)", background: "white", color: "var(--ink)", fontFamily: "var(--font-nunito)" }}
              onFocus={e => (e.target.style.borderColor = "var(--warm)")}
              onBlur={e  => (e.target.style.borderColor = "var(--lavender)")}
            />
          </div>

          {/* Age + pages */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Age: {age} yrs</label>
              <input type="range" min={3} max={12} value={age} onChange={e => setAge(+e.target.value)}
                className="w-full accent-orange-400" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Pages: {numPages}</label>
              <input type="range" min={3} max={8} value={numPages} onChange={e => setNumPages(+e.target.value)}
                className="w-full accent-purple-400" />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block font-semibold mb-2">Interests (pick some!)</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(i => (
                <button key={i} onClick={() => toggleInterest(i)}
                  className="px-3 py-2 rounded-2xl text-sm font-semibold border-2 transition-all"
                  style={{
                    background:   interests.includes(i) ? "var(--warm)" : "white",
                    borderColor:  interests.includes(i) ? "var(--warm)" : "var(--lavender)",
                    color:        interests.includes(i) ? "white" : "var(--ink)",
                  }}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block font-semibold mb-2">Language</label>
            <div className="flex gap-3">
              {[["en","🇬🇧 English"],["hi","🇮🇳 Hindi"],["es","🇪🇸 Spanish"]].map(([code, label]) => (
                <button key={code} onClick={() => setLanguage(code)}
                  className="flex-1 py-2 rounded-2xl border-2 font-semibold text-sm transition-all"
                  style={{
                    background:  language === code ? "var(--sky)" : "white",
                    borderColor: language === code ? "var(--sky)" : "var(--lavender)",
                    color:       language === code ? "white" : "var(--ink)",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <label className="block font-semibold mb-2">Accessibility</label>
            <div className="flex gap-3">
              {ACCESS_OPTIONS.map(a => (
                <button key={a} onClick={() => toggleAccess(a)}
                  className="flex-1 py-2 rounded-2xl border-2 font-semibold text-sm transition-all"
                  style={{
                    background:  access.includes(a) ? "var(--mint)" : "white",
                    borderColor: access.includes(a) ? "var(--mint)" : "var(--lavender)",
                    color:       access.includes(a) ? "#1a4a38" : "var(--ink)",
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={startStory}
            disabled={!childName.trim() || interests.length === 0}
            className="w-full py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all disabled:opacity-40"
            style={{ background: "var(--warm)", color: "white", boxShadow: "0 4px 0 #e07a2a" }}>
            <Sparkles size={24} /> Create My Story!
          </button>
        </div>
      </main>
    );
  }

  // ── LOADING VIEW ──────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="float">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: "var(--lavender)" }}>
            <Star size={48} color="white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-lora)" }}>
          Writing {childName}'s story...
        </h2>
        <p className="shimmer-text text-lg font-semibold">Generating illustrations & narration ✨</p>
        <div className="flex gap-2 mt-4">
          {Array.from({ length: numPages }).map((_, i) => (
            <div key={i} className="dot" style={{
              background: i < loadingPage ? "var(--mint)" : i === loadingPage ? "var(--warm)" : undefined,
              borderColor: i < loadingPage ? "var(--mint)" : i === loadingPage ? "var(--warm)" : undefined,
            }}/>
          ))}
        </div>
      </main>
    );
  }

  // ── READING VIEW ──────────────────────────────────────────────────────────
  const page = pages[currentPage];

  return (
    <main className="min-h-screen flex flex-col items-center py-8 px-4" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <button onClick={() => { setState("idle"); setPages([]); }}
          className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-xl"
          style={{ background: "var(--soft)", color: "var(--ink)" }}>
          <ChevronLeft size={16} /> New Story
        </button>

        <h1 className="text-xl font-bold text-center flex-1 px-2" style={{ fontFamily: "var(--font-lora)", color: "var(--ink)" }}>
          {title}
        </h1>

        <button onClick={() => {
            const p = pages[currentPage];
            if (p) speakText(p.text, p.audio || undefined);
          }}
          className="p-2 rounded-xl" style={{ background: "var(--soft)" }}>
          <Volume2 size={20} />
        </button>
      </div>

      {/* Page dots */}
      <div className="flex gap-2 mb-6">
        {pages.map((_, i) => (
          <div key={i} onClick={() => setCurrentPage(i)}
            className={`dot ${i === currentPage ? "active" : i < currentPage ? "done" : ""}`} />
        ))}
        {state !== "done" && Array.from({ length: numPages - pages.length }).map((_, i) => (
          <div key={`load-${i}`} className="dot opacity-30" />
        ))}
      </div>

      {/* Book page */}
      {page && (
        <div className="book-page w-full max-w-2xl page-enter p-8" key={currentPage}>
          {/* Page number */}
          <div className="text-xs font-bold mb-6 ml-6" style={{ color: "var(--lavender)" }}>
            Page {page.page}
          </div>

          {/* Illustration */}
          {page.image && (
            <div className="rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: "4/3", background: "var(--soft)" }}>
              <img
                src={`data:image/svg+xml;base64,${page.image}`}
                alt={`Page ${page.page} illustration`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Story text */}
          <p className="text-2xl leading-relaxed text-center px-4"
            style={{ fontFamily: "var(--font-lora)", color: "var(--ink)", letterSpacing: "0.01em" }}>
            {page.text}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-6 mt-8">
        <button onClick={prev} disabled={currentPage === 0}
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all disabled:opacity-30"
          style={{ background: "var(--lavender)", color: "white", boxShadow: "0 3px 0 #a090d0" }}>
          <ChevronLeft size={28} />
        </button>

        <span className="text-sm font-bold" style={{ color: "#6B5B7B" }}>
          {currentPage + 1} / {pages.length}
        </span>

        <button onClick={next} disabled={currentPage >= pages.length - 1}
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all disabled:opacity-30"
          style={{ background: "var(--warm)", color: "white", boxShadow: "0 3px 0 #e07a2a" }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {state === "done" && currentPage === pages.length - 1 && (
        <div className="mt-8 text-center">
          <p className="text-2xl font-bold shimmer-text mb-2">The End! 🌟</p>
          <button onClick={() => setState("idle")}
            className="px-6 py-3 rounded-2xl font-bold"
            style={{ background: "var(--warm)", color: "white" }}>
            Create Another Story
          </button>
        </div>
      )}
    </main>
  );
}
