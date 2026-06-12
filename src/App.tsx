import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import { supabase } from "./lib/supabase";
import {
  MapPin, Phone, Mail, Sparkles, ChevronDown,
  Instagram, ArrowRight, ShieldCheck, Pencil, Clock,
  Sun, Moon
} from "lucide-react";

const { VITE_LOCAL_ADMIN_EMAIL, VITE_LOCAL_ADMIN_PASSWORD, VITE_LOCAL_ADMIN_TOKEN } = (import.meta as any).env ?? {};
const LOCAL_ADMIN_EMAIL = VITE_LOCAL_ADMIN_EMAIL || "";
const LOCAL_ADMIN_PASSWORD = VITE_LOCAL_ADMIN_PASSWORD || "";
const LOCAL_ADMIN_TOKEN = VITE_LOCAL_ADMIN_TOKEN || "";

const homeGalleryItems = [
  {
    id: "tat-1",
    src: "/image/tattoo_1_virgin_mary.png",
    title: "Virgin Mary Devotional Tattoo",
    category: "Religious",
    styleName: "Sacred Realism"
  },
  {
    id: "tat-2",
    src: "/image/tattoo_2_lion_sleeve.png",
    title: "Lion Sleeve Masterpiece",
    category: "Realism",
    styleName: "Heroic Sleeve"
  },
  {
    id: "tat-3",
    src: "/image/tattoo_3_madonna.png",
    title: "Madonna Portrait Ink",
    category: "Sacred",
    styleName: "Iconic Portrait"
  },
  {
    id: "tat-4",
    src: "/image/tattoo_4_brother.png",
    title: "Brotherhood Memorial Tattoo",
    category: "Memorial",
    styleName: "Memory & Honor"
  },
  {
    id: "tat-5",
    src: "/image/1ES6t.jpg",
    title: "Bold Linework Composition",
    category: "Blackwork",
    styleName: "Graphic Contrast"
  },
  {
    id: "tat-6",
    src: "/image/CQSZ6.jpg",
    title: "Modern Fine-Line Detail",
    category: "Fine-Line",
    styleName: "Minimalist Geometry"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"atelier" | "gallery" | "booking">("atelier");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [initialGallerySelection, setInitialGallerySelection] = useState<{ styleName: string; itemId: string } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const isDark = theme === "dark";

  const goTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsAdminMode(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tab}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAuthLoading(true);

    try {
      if (adminEmail === LOCAL_ADMIN_EMAIL && adminPassword === LOCAL_ADMIN_PASSWORD) {
        const authSession = { access_token: LOCAL_ADMIN_TOKEN };
        setSession(authSession);
        setIsAdminAuthenticated(true);
        setIsAdminMode(true);
        setAdminError("");
        setAdminEmail("");
        setAdminPassword("");
        setRefreshTrigger((p) => p + 1);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) {
        setAdminError(error.message);
        return;
      }

      const authSession = data.session;
      if (!authSession) {
        setAdminError("Unable to sign in. Please verify credentials.");
        return;
      }

      setSession(authSession);
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
      setAdminError("");
      setAdminEmail("");
      setAdminPassword("");
      setRefreshTrigger((p) => p + 1);
    } catch (error: any) {
      setAdminError(error?.message || "Unable to authenticate. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Logout request failed", error);
    }

    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    setSession(null);
    setAdminEmail("");
    setAdminPassword("");
    setAdminError("");
    goTo("atelier");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsAdminAuthenticated(Boolean(data.session));

      if (data.session?.access_token) {
        const response = await fetch("/api/admin/check", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });
        if (!response.ok) {
          setIsAdminAuthenticated(false);
          setSession(null);
        }
      }
    };

    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin')) {
      setIsAdminMode(true);
    }

    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'gallery' || hash === 'booking' || hash === 'atelier') {
      setActiveTab(hash as typeof activeTab);
    }

    initializeAuth();
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAdminAuthenticated(Boolean(session));
    });

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


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
    { icon: <Pencil size={18} style={{ color: "#F5F5F5" }} />, title: "Custom Only", body: "Every design originates from your body and your concept. No flash. No stencil reuse. No exceptions." },
    { icon: <ShieldCheck size={18} style={{ color: "#F5F5F5" }} />, title: "Clinical Sterility", body: "Single-use needles opened in front of you. Autoclave-sterilized grips. Hospital-grade protocols on every session." },
    { icon: <Clock size={18} style={{ color: "#F5F5F5" }} />, title: "Considered Pacing", body: "Sessions are never rushed. The work dictates the time — not a clock. Quality is the only deadline." },
  ];

  return (
    <div data-theme={theme} style={{ 
      minHeight: "100vh", 
      background: "var(--color-bg)", 
      color: "var(--text-main)", 
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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "nav-solid" : "nav-transparent"}`}>
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
              {(["atelier", "gallery", "booking"] as const).map(tab => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => goTo(tab)}
                    className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-full cursor-pointer transition-all duration-200 text-[8.5px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase flex items-center gap-1 shrink-0 ${
                      active 
                          ? "bg-gold text-black font-semibold"
                          : "text-muted hover:text-primary border border-transparent"
                    }`}
                  >
                    {tab === "booking" ? "Book" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </nav>

            {/* Admin Portal Button */}
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-full cursor-pointer transition-all duration-200 text-[8.5px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase flex items-center gap-1 shrink-0 ${                
                isAdminMode || isAdminAuthenticated
                  ? "bg-gold text-black font-semibold"
                  : "text-muted hover:text-primary border border-transparent"
              }`}
              title="Admin Portal"
            >
              <Sparkles size={9} style={{ color: (isAdminMode || isAdminAuthenticated) ? "var(--text-main)" : "#F5F5F5" }} />
            </button>

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

              {/* 2 ─ ABOUT SECTION */}
              <section className="section-surface py-24 md:py-32 border-b border-white/8">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                  <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] items-start">
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <p className="text-xs uppercase tracking-[0.35em] text-[#B8B8B8] mb-6">About The Studio</p>
                      <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#F5F2EC] mb-6 leading-tight">
                        A private atelier for refined skin art.
                      </h2>
                      <p className="text-base leading-relaxed text-[#B8B8B8] max-w-xl">
                        Dagi Tattoo is a high-end skin art studio in Addis Ababa that blends quiet luxury with exacting craft. Every appointment is curated, every design is fully bespoke, and every session is treated like a gallery-level composition.
                      </p>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {[
                        { label: "Experience", text: "An intimate studio environment, meticulous hygiene standards, and a slow, considered approach to each tattoo." },
                        { label: "Philosophy", text: "We design tattoos that feel like a second skin, honoring your story with refined contrast, elegant composition, and premium execution." }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          className="card-panel p-8 card-hover-bronze"
                        >
                          <div className="text-xs uppercase tracking-[0.3em] text-[#C79A5D] mb-4 font-semibold">{item.label}</div>
                          <p className="text-[#B8B8B8] leading-relaxed text-sm">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 2 ─ MARQUEE STRIP */}
              <div style={{ 
                overflow: "hidden", 
                borderTop: "1px solid rgba(248,250,252,0.08)", 
                borderBottom: "1px solid rgba(248,250,252,0.08)", 
                background: "var(--color-bg)", 
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
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(245,245,245,0.2)" }}>✦</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(245,245,245,0.7)" }}>{item}</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* 3 - GALLERY LOOKBOOK */}
              <section className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-12 bg-[var(--color-bg)]">
                <div className="max-w-6xl mx-auto">

                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8 sm:mb-12">
                    <div>
                      <p className="text-[10px] font-mono tracking-[0.32em] uppercase text-[#C79A5D] font-semibold mb-3">
                        Master Ink Gallery
                      </p>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-main)] leading-tight">
                        Recent custom pieces
                      </h2>
                    </div>
                    <button onClick={() => goTo("gallery")} className="inline-flex items-center gap-2 self-start sm:self-auto text-[10px] font-mono tracking-[0.18em] uppercase text-[var(--text-muted)] hover:text-[#C79A5D] transition-colors">
                      Open full catalog <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                    {homeGalleryItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        whileHover={{ scale: 1.012 }}
                        onClick={() => handleSelectStyle(item.styleName, item.id)}
                        className="gallery-preview-card group"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          className="gallery-preview-image"
                          referrerPolicy="no-referrer"
                        />
                        <div className="gallery-preview-shade" />
                        <div className="gallery-preview-content">
                          <span className="gallery-preview-tag">
                            {item.category}
                          </span>
                          <h3 className="gallery-preview-title">
                            {item.title}
                          </h3>
                          <span className="gallery-preview-action">
                            Select and book this style
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="section-surface py-24 md:py-32 border-t border-white/8">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                  >
                    <p className="text-xs uppercase tracking-[0.35em] text-[#C79A5D] mb-6 font-semibold">Contact</p>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#F5F2EC]">
                      Get in touch.
                    </h2>
                  </motion.div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      { title: "Location", body: "Bole Medhanialem Road, Addis Ababa" },
                      { title: "Bookings", body: "+251 911 234567" },
                      { title: "Email", body: "bookings@dagitattoo.com" }
                    ].map((item, idx) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="card-panel p-8 card-hover-bronze text-center"
                      >
                        <h3 className="text-xs uppercase tracking-[0.3em] text-[#C79A5D] mb-4 font-semibold">{item.title}</h3>
                        <p className="text-[#B8B8B8] leading-relaxed text-sm">{item.body}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5 ─ THREE PILLARS */}
              <section style={{
                padding: "88px 24px",
                background: "var(--color-bg)",
                transition: "background 0.3s"
              }}>
                <div style={{ maxWidth: 1080, margin: "0 auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
                    <div style={{ width: 36, height: 1, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--text-main)" }}>The Standard</span>
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
                          background: isDark ? "#061739" : "#f7f3ef",
                          transition: "background 0.3s"
                        }}
                      >
                        <div style={{ marginBottom: 20 }}>{p.icon}</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 17, color: isDark ? "#ffffff" : "#000000", marginBottom: 14, letterSpacing: "0.01em" }}>{p.title}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,245,245,0.65)", lineHeight: 1.75 }}>{p.body}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 6 ─ CTA BAND */}
              <section style={{
                padding: "80px 24px",
                background: "var(--color-bg)",
                borderTop: "1px solid rgba(248,250,252,0.08)",
                borderBottom: "1px solid rgba(248,250,252,0.08)",
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
                        background: "var(--color-gold)", border: "none",
                        color: "var(--text-main)", fontFamily: "'DM Mono', monospace",
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
                onSuccess={() => {
                  setRefreshTrigger(p => p + 1);
                  if (typeof window !== "undefined") {
                    window.history.replaceState(null, "", "#booking");
                  }
                  goTo("booking");
                }}
                initialGallerySelection={initialGallerySelection}
                onClearGallerySelection={() => setInitialGallerySelection(null)}
                onBrowseGallery={() => goTo("gallery")}
                theme={theme}
              />

              {/* FAQ Section at bottom of Booking view */}
              <section style={{ 
                padding: "48px 24px 88px", 
                background: "var(--color-bg)",
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

          {/* ══ ADMIN PORTAL ══ */}
          {isAdminMode && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {!isAdminAuthenticated ? (
                /* Admin Login Form */
                <div style={{
                  minHeight: "calc(100vh - 120px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 24px",
                  background: "var(--color-bg)",
                  transition: "background 0.3s"
                }}>
                  <div style={{
                    width: "100%",
                    maxWidth: 400,
                    padding: "48px 32px",
                    border: "1px solid rgba(248,250,252,0.12)",
                    borderRadius: 8,
                    background: "rgba(248,250,252,0.04)",
                    backdropFilter: "blur(10px)",
                    transition: "background 0.3s, border 0.3s"
                  }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                      <Sparkles size={32} style={{ color: isDark ? "#ffffff" : "#000000" }} />
                    </div>
                    <h2 style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 24,
                      fontWeight: 400,
                      textAlign: "center",
                      marginBottom: 8,
                      color: isDark ? "#ffffff" : "#000000"
                    }}>
                      Admin Portal
                    </h2>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      textAlign: "center",
                      color: "rgba(245,245,245,0.65)",
                      marginBottom: 32,
                      letterSpacing: "0.5px"
                    }}>
                      Enter your authentication key
                    </p>
                    <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div className="space-y-4">
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@example.com"
                          required
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)",
                            borderRadius: 4,
                            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                            color: isDark ? "#ffffff" : "#000000",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            transition: "border-color 0.2s, background 0.2s",
                            outline: "none",
                            boxSizing: "border-box"
                          }}
                        />
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Secure password"
                          required
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)",
                            borderRadius: 4,
                            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                            color: isDark ? "#ffffff" : "#000000",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            transition: "border-color 0.2s, background 0.2s",
                            outline: "none",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>
                      {adminError && (
                        <div style={{
                          padding: "10px 12px",
                          borderRadius: 4,
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 11,
                          textAlign: "center"
                        }}>
                          {adminError}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={authLoading}
                        style={{
                          padding: "12px 16px",
                          background: "var(--color-gold)",
                          color: "var(--text-main)",
                          border: "none",
                          borderRadius: 4,
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          opacity: authLoading ? 0.7 : 1,
                          transition: "opacity 0.2s"
                        }}
                        onMouseEnter={(e) => { if (!authLoading) e.currentTarget.style.opacity = "0.85" }}
                        onMouseLeave={(e) => { if (!authLoading) e.currentTarget.style.opacity = "1" }}
                      >
                        {authLoading ? "Signing in..." : "Authenticate"}
                      </button>
                    </form>
                    <button
                      onClick={() => setIsAdminMode(false)}
                      style={{
                        width: "100%",
                        marginTop: 12,
                        padding: "12px 16px",
                        background: "transparent",
                        color: "rgba(248,250,252,0.65)",
                        border: "1px solid rgba(248,250,252,0.12)",
                        borderRadius: 4,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";
                        e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
                        e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Admin Dashboard */
                <div style={{ paddingTop: 24 }}>
                  <AdminDashboard
                    refreshTrigger={refreshTrigger}
                    theme={theme}
                    isAuthenticated={true}
                    accessToken={session?.access_token}
                    onLogout={handleAdminLogout}
                  />
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-black/80 border-t border-white/8 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-1"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 mb-6">
                <img 
                  src="/src/assets/images/RabOM.jpg" 
                  alt="Dagi Tattoo"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[#B8B8B8] text-sm leading-relaxed">
                Premium custom tattoo atelier in Addis Ababa. Every piece is a bespoke masterpiece.
              </p>
            </motion.div>

            {/* Contact links */}
            {[
              { icon: <MapPin size={16} />, text: "Bole Medhanialem Road, Addis Ababa" },
              { icon: <Phone size={16} />, text: "+251 911 234567" },
              { icon: <Mail size={16} />, text: "bookings@dagitattoo.com" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (idx + 1) * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="text-[#C79A5D] flex-shrink-0 mt-1">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[#B8B8B8] text-sm">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/8 my-8" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <a 
              href="https://instagram.com/dagitattoo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#F5F2EC] hover:text-[#C79A5D] transition-colors text-sm font-medium"
            >
              <Instagram size={16} /> @dagitattoo
            </a>
            <p className="text-[#B8B8B8] text-xs tracking-wider uppercase">
              © 2026 Dagi Tattoo · Addis Ababa · All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
