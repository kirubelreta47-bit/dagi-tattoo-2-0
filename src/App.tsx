import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import {
  MapPin, Phone, Mail, Sparkles, ChevronDown,
  Instagram, ArrowRight, ShieldCheck, Pencil, Clock,
  Sun, Moon
} from "lucide-react";

const homeGalleryItems = [
  {
    id: "tat-1",
    src: "/src/assets/images/celestial_geometric_tattoo_1779697256322.png",
    title: "Celestial Constellation Alignment",
    category: "Geometric",
    styleName: "Celestial & Geometric"
  },
  {
    id: "tat-2",
    src: "/src/assets/images/floral_ornamental_tattoo_1779697274753.png",
    title: "Decadent Ornamental Rose Scroll",
    category: "Fine-Line",
    styleName: "Fine-Line Florals"
  },
  {
    id: "tat-3",
    src: "/src/assets/images/lion_geometric_tattoo_1779697294632.png",
    title: "Sovereign Crowned Lion Portrait",
    category: "Realism",
    styleName: "Neo-Traditional Realism"
  },
  {
    id: "tat-4",
    src: "/src/assets/images/wave_cherry_blossom_tattoo_1779697314659.png",
    title: "Japanese Brushstroke Wave & Sakura",
    category: "Japanese",
    styleName: "Japanese Wave & Sakura"
  },
  {
    id: "tat-5",
    src: "/src/assets/images/gothic_skull_tattoo_1779785081844.png",
    title: "Gothic Skull & Rose",
    category: "Custom",
    styleName: "Custom Script & Tiny Typography"
  },
  {
    id: "tat-6",
    src: "/src/assets/images/swallow_bird_tattoo_1779785104583.png",
    title: "Minimalist Flying Swallow",
    category: "Fine-Line",
    styleName: "Custom Script & Tiny Typography"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"atelier" | "gallery" | "booking" | "admin">("atelier");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [initialGallerySelection, setInitialGallerySelection] = useState<{ styleName: string; itemId: string } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";

  const goTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectStyle = (styleName: string, itemId: string) => {
    setInitialGallerySelection({ styleName, itemId });
    goTo("booking");
  };

  const faqs = [
    {
      q: "Does Dagi provide custom draft designs beforehand?",
      a: "Absolutely. Every design is hand-crafted from scratch for your body and your concept. No stencil is ever reused — each piece is a couture original."
    },
    {
      q: "What sterilization protocols do you follow?",
      a: "Hospital-grade disinfection throughout. All needles are single-use blister cartridges opened in front of you. Grip equipment is autoclave sterilized between every session."
    },
    {
      q: "How do I prepare for my session?",
      a: "Sleep well the night before, stay hydrated, and avoid alcohol for 24 hours. Eat a solid carb-heavy meal 1–2 hours before your appointment to maintain stable blood sugar."
    },
    {
      q: "How is pricing determined?",
      a: "Each piece is quoted individually based on size, placement, and complexity. Book a consultation and Dagi will provide a transparent fixed-price estimate before anything is confirmed."
    }
  ];

  const pillars = [
    { icon: <Pencil size={18} style={{ color: isDark ? "#ffffff" : "#000000" }} />, title: "Custom Only", body: "Every design originates from your body and your concept. No flash. No stencil reuse. No exceptions." },
    { icon: <ShieldCheck size={18} style={{ color: isDark ? "#ffffff" : "#000000" }} />, title: "Clinical Sterility", body: "Single-use needles opened in front of you. Autoclave-sterilized grips. Hospital-grade protocols on every session." },
    { icon: <Clock size={18} style={{ color: isDark ? "#ffffff" : "#000000" }} />, title: "Considered Pacing", body: "Sessions are never rushed. The work dictates the time — not a clock. Quality is the only deadline." },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: isDark ? "#000000" : "#ffffff", 
      color: isDark ? "#f5f5f5" : "#121212", 
      fontFamily: "'DM Sans', sans-serif",
      transition: "background-color 0.3s ease, color 0.3s ease"
    }}>

      {/* ─── Ambient background ─── */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: isDark ? `
          radial-gradient(ellipse 55% 45% at 10% 15%, rgba(255,255,255,0.01) 0%, transparent 65%),
          radial-gradient(ellipse 45% 55% at 90% 85%, rgba(255,255,255,0.01) 0%, transparent 65%)
        ` : `
          radial-gradient(ellipse 55% 45% at 10% 15%, rgba(0,0,0,0.01) 0%, transparent 65%),
          radial-gradient(ellipse 45% 55% at 90% 85%, rgba(0,0,0,0.01) 0%, transparent 65%)
        `
      }} />

      {/* ─── HEADER ─── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: isDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(18px)",
        borderBottom: isDark ? "1px solid #1a1a1a" : "1px solid #e5e5e5",
        transition: "background-color 0.3s, border-bottom 0.3s"
      }}>
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-2 sm:gap-4">

          {/* Wordmark */}
          <button onClick={() => goTo("atelier")} className="bg-transparent border-none cursor-pointer flex items-center p-0 hover:opacity-90 transition-opacity">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center border ${isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white"}`}>
              <img 
                src="/src/assets/images/RabOM.jpg" 
                alt="Dagi Tattoo Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Nav */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center gap-1">
              {(["atelier", "gallery", "booking", "admin"] as const).map(tab => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => goTo(tab)}
                    className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-full cursor-pointer transition-all duration-200 text-[8.5px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase flex items-center gap-1 shrink-0 ${
                      active 
                        ? isDark
                          ? "bg-white text-black font-semibold"
                          : "bg-black text-white font-semibold"
                        : isDark
                          ? "text-neutral-450 hover:text-white border border-transparent"
                          : "text-neutral-600 hover:text-black border border-transparent"
                    }`}
                  >
                    {tab === "admin" && <Sparkles size={9} style={{ color: active ? (isDark ? "#000" : "#fff") : (isDark ? "#fff" : "#000") }} />}
                    {tab === "booking" ? "Book" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </nav>

            {/* Dark & Light Theme Options inside Nav bar */}
            <div className={`flex items-center gap-0.5 border rounded-full p-0.5 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-100 border-neutral-200"
            }`}>
              <button
                onClick={() => setTheme("light")}
                className={`p-1 rounded-full cursor-pointer transition-colors ${
                  !isDark 
                    ? "bg-black text-white" 
                    : "text-neutral-500 hover:text-white"
                }`}
                title="Light Theme"
              >
                <Sun size={11} />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1 rounded-full cursor-pointer transition-colors ${
                  isDark 
                    ? "bg-white text-black" 
                    : "text-neutral-500 hover:text-black"
                }`}
                title="Dark Theme"
              >
                <Moon size={11} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ══ ATELIER ══ */}
          {activeTab === "atelier" && (
            <motion.div key="atelier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>

              {/* 1 ─ HERO */}
              <Hero
                onBookClick={() => goTo("booking")}
                onExploreClick={() => goTo("gallery")}
                theme={theme}
              />

              {/* 2 ─ MARQUEE STRIP */}
              <div style={{ 
                overflow: "hidden", 
                borderTop: isDark ? "1px solid #222" : "1px solid #e5e5e5", 
                borderBottom: isDark ? "1px solid #222" : "1px solid #e5e5e5", 
                background: isDark ? "#090909" : "#ffffff", 
                padding: "12px 0",
                transition: "background 0.3s, border 0.3s"
              }}>
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
                  style={{ display: "flex", gap: 0, whiteSpace: "nowrap", width: "max-content" }}
                >
                  {Array.from({ length: 2 }).map((_, ri) => (
                    <span key={ri} style={{ display: "inline-flex", alignItems: "center" }}>
                      {["Fine Line", "Blackwork", "Illustrative", "Dotwork", "Custom Only", "Addis Ababa", "Est. 2018", "By Appointment"].map((item, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 24, padding: "0 28px" }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}>✦</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>{item}</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* 3 ─ GALLARY LOOKBOOK (Replaces Specialization style list) */}
              <section style={{ 
                padding: "56px 24px", 
                background: isDark ? "#000000" : "#ffffff",
                transition: "background 0.3s"
              }}>
                <div style={{ maxWidth: 1080, margin: "0 auto" }}>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 36, height: 1, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                      <span style={{ 
                        fontFamily: "'DM Mono', monospace", 
                        fontSize: 10, 
                        letterSpacing: "0.35em", 
                        textTransform: "uppercase", 
                        color: isDark ? "#ffffff" : "#000000",
                        fontWeight: "bold"
                      }}>
                        Master Ink Gallery
                      </span>
                    </div>
                    <button onClick={() => goTo("gallery")} style={{
                      background: "none", border: "none", cursor: "pointer", 
                      color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)",
                      fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em",
                      textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
                      transition: "color 0.2s"
                    }}>
                      Open live catalog <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* 2 rows and 3 columns grid arrangement (more compact image size, 2 columns on mobile) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 max-w-[840px] mx-auto">
                    {homeGalleryItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        whileHover={{ scale: 1.012 }}
                        onClick={() => handleSelectStyle(item.styleName, item.id)}
                        className={`group relative overflow-hidden aspect-[3/4] cursor-pointer rounded border transition-colors duration-300 ${
                          isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white"
                        }`}
                      >
                        {/* Custom ink tattoo image with required attributes */}
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {/* Shimmer gradient layout overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6" />
                        
                        {/* Info tags available on hover */}
                        <div className="absolute inset-x-0 bottom-0 p-3 md:p-6 transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-white text-black text-[7px] md:text-[8px] font-bold uppercase tracking-wider font-mono mb-1 md:mb-1.5">
                            {item.category}
                          </span>
                          <h3 className="font-serif text-xs md:text-base text-white tracking-wide font-bold leading-tight">
                            {item.title}
                          </h3>
                          <span className="text-[7px] md:text-[9px] font-mono text-neutral-300 uppercase block mt-1 md:mt-1.5">
                            Select & Book This Style
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4 ─ STATEMENT QUOTE */}
              <section style={{ 
                padding: "88px 24px", 
                background: isDark ? "#050505" : "#fcfcfc", 
                borderTop: isDark ? "1px solid #1a1a1a" : "1px solid #e5e5e5", 
                borderBottom: isDark ? "1px solid #1a1a1a" : "1px solid #e5e5e5",
                transition: "background 0.3s, border 0.3s"
              }}>
                <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
                  <div style={{ width: 1, height: 40, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", margin: "0 auto 40px" }} />
                  <p style={{
                    fontFamily: "Georgia, serif", fontStyle: "italic",
                    fontSize: "clamp(17px, 2.5vw, 22px)",
                    color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)", lineHeight: 1.8, letterSpacing: "0.01em"
                  }}>
                    "Every tattoo exists as a permanent sculpture woven with the skin. The obligation is to ensure it conforms gracefully to your natural anatomy — executed with extreme surgical precision."
                  </p>
                  <div style={{ width: 1, height: 40, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", margin: "40px auto 0" }} />
                  <p style={{ 
                    fontFamily: "'DM Mono', monospace", 
                    fontSize: 9, 
                    letterSpacing: "0.3em", 
                    color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", 
                    textTransform: "uppercase", 
                    marginTop: 28 
                  }}>
                    — Dagi, Lead Needle Artisan
                  </p>
                </div>
              </section>

              {/* 5 ─ THREE PILLARS */}
              <section style={{ 
                padding: "88px 24px", 
                background: isDark ? "#000000" : "#ffffff",
                transition: "background 0.3s"
              }}>
                <div style={{ maxWidth: 1080, margin: "0 auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
                    <div style={{ width: 36, height: 1, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: isDark ? "white" : "black" }}>The Standard</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    {pillars.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        style={{ 
                          padding: "40px 36px", 
                          background: isDark ? "#0a0a0a" : "#ffffff",
                          transition: "background 0.3s"
                        }}
                      >
                        <div style={{ marginBottom: 20 }}>{p.icon}</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 17, color: isDark ? "#ffffff" : "#000000", marginBottom: 14, letterSpacing: "0.01em" }}>{p.title}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)", lineHeight: 1.75 }}>{p.body}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 6 ─ CTA BAND */}
              <section style={{
                padding: "80px 24px",
                background: isDark ? "#050505" : "#fbfbfb",
                borderTop: isDark ? "1px solid #1a1a1a" : "1px solid #e5e5e5",
                borderBottom: isDark ? "1px solid #1a1a1a" : "1px solid #e5e5e5",
                textAlign: "center",
                transition: "background 0.3s, border 0.3s"
              }}>
                <div style={{ maxWidth: 560, margin: "0 auto" }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.35em", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", textTransform: "uppercase", marginBottom: 20 }}>
                    By appointment only · Addis Ababa
                  </p>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px, 4vw, 38px)", color: isDark ? "#fff" : "#000", fontWeight: 400, lineHeight: 1.25, marginBottom: 36, letterSpacing: "0.01em" }}>
                    Ready to begin<br />your piece?
                  </h2>
                  <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={() => goTo("booking")}
                      style={{
                        padding: "13px 36px",
                        background: isDark ? "#ffffff" : "#000000", border: "none",
                        color: isDark ? "#000000" : "#ffffff", fontFamily: "'DM Mono', monospace",
                        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                        cursor: "pointer", borderRadius: 2, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 8, transition: "opacity 0.2s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      Book session <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => goTo("gallery")}
                      style={{
                        padding: "13px 36px",
                        background: "transparent", border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)",
                        color: isDark ? "#ffffff" : "#000000", fontFamily: "'DM Mono', monospace",
                        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                        cursor: "pointer", borderRadius: 2, transition: "border-color 0.2s, color 0.2s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)")}
                    >
                      Explore gallery
                    </button>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {/* ══ GALLERY ══ */}
          {activeTab === "gallery" && (
            <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Gallery onSelectStyle={handleSelectStyle} theme={theme} />
            </motion.div>
          )}

          {/* ══ BOOKING ══ */}
          {activeTab === "booking" && (
            <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ paddingTop: 24 }}>
              <BookingForm
                onSuccess={() => setRefreshTrigger(p => p + 1)}
                initialGallerySelection={initialGallerySelection}
                onClearGallerySelection={() => setInitialGallerySelection(null)}
                onBrowseGallery={() => goTo("gallery")}
                theme={theme}
              />

              {/* FAQ Section at bottom of Booking view */}
              <section style={{ 
                padding: "48px 24px 88px", 
                background: isDark ? "#000000" : "#ffffff",
                transition: "background 0.3s"
              }}>
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
                    <div style={{ width: 36, height: 1, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: isDark ? "white" : "black" }}>FAQ</span>
                  </div>

                  {faqs.map((faq, idx) => (
                    <div key={idx} style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", ...(idx === faqs.length - 1 && { borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }) }}>
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        style={{
                          width: "100%", padding: "20px 0",
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                          fontFamily: "Georgia, serif", fontSize: 15,
                          color: expandedFaq === idx ? (isDark ? "#ffffff" : "#000000") : (isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)"),
                          textAlign: "left", transition: "color 0.2s"
                        }}
                      >
                        {faq.q}
                        <ChevronDown size={15} style={{ color: isDark ? "#ffffff" : "#000000", flexShrink: 0, transform: expandedFaq === idx ? "rotate(180deg)" : "none", transition: "transform 0.25s" }} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedFaq === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{ overflow: "hidden" }}
                          >
                            <p style={{ paddingBottom: 22, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)", lineHeight: 1.8 }}>
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ══ ADMIN ══ */}
          {activeTab === "admin" && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <AdminDashboard refreshTrigger={refreshTrigger} theme={theme} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ─── FOOTER ─── */}
      <footer style={{ 
        background: isDark ? "#050505" : "#fafafa", 
        borderTop: isDark ? "1px solid #1a1a1a" : "1px solid #e5e5e5", 
        padding: "56px 24px 36px", 
        position: "relative", 
        zIndex: 1,
        transition: "background 0.3s, border-top 0.3s"
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* Contact row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 40 }}>
            {[
              { icon: <MapPin size={13} style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }} />, text: "Bole Medhanialem Road, Addis Ababa" },
              { icon: <Phone size={13} style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }} />, text: "+251 911 234567" },
              { icon: <Mail size={13} style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }} />, text: "bookings@dagitattoo.com" },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "20px 24px", 
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", 
                borderRadius: 2,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 9, textAlign: "center",
                background: isDark ? "transparent" : "#ffffff",
                transition: "background 0.3s, border 0.3s"
              }}>
                {item.icon}
                <span style={{ 
                  fontFamily: "'DM Mono', monospace", 
                  fontSize: 10, 
                  color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.6)", 
                  letterSpacing: "0.07em" 
                }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            alignItems: "center", 
            justifyContent: "space-between", 
            gap: 12, 
            paddingTop: 24, 
            borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            transition: "border-top 0.3s"
          }}>
            <a href="https://instagram.com/dagitattoo" target="_blank" rel="noopener noreferrer"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 7, 
                color: isDark ? "#ffffff" : "#000000", 
                textDecoration: "none", 
                fontFamily: "'DM Mono', monospace", 
                fontSize: 10, 
                letterSpacing: "0.12em" 
              }}
            >
              <Instagram size={13} style={{ color: isDark ? "#ffffff" : "#000000" }} /> @dagitattoo
            </a>
            <span style={{ 
              fontFamily: "'DM Mono', monospace", 
              fontSize: 9, 
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)", 
              letterSpacing: "0.12em", 
              textTransform: "uppercase" 
            }}>
              © 2026 Dagi Tattoo · Addis Ababa · All rights reserved
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
