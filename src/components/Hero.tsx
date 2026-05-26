import { motion } from "motion/react";
import { ArrowUpRight, ShieldCheck, Compass } from "lucide-react";

interface HeroProps {
  onBookClick: () => void;
  onExploreClick: () => void;
  theme: "dark" | "light";
}

export default function Hero({ onBookClick, onExploreClick, theme }: HeroProps) {
  const isDark = theme === "dark";

  return (
    <section className={`relative overflow-hidden pt-12 pb-12 md:pt-16 md:pb-16 border-b px-4 ${
      isDark ? "border-neutral-800 bg-black text-white" : "border-neutral-200 bg-white text-black"
    }`}>
      {/* Absolute minimalist shadow accents */}
      <div className={`absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none ${
        isDark ? "bg-white/[0.01]" : "bg-black/[0.01]"
      }`} />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-10 text-center"
        >
          {/* Main Content */}
          <div className="space-y-6 flex flex-col items-center">
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
                className={`inline-flex items-center gap-2 border px-2.5 py-1 rounded-full font-mono text-[9px] tracking-[0.22em] pl-[0.22em] backdrop-blur-sm ${
                  isDark 
                    ? "border-neutral-800 text-neutral-300 bg-neutral-900/30" 
                    : "border-neutral-200 text-neutral-700 bg-neutral-100/30"
                }`}
              >
                <div className="relative flex h-1.5 w-1.5">
                  <motion.span
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className={`absolute inline-flex h-full w-full rounded-full ${isDark ? "bg-white" : "bg-black"}`}
                  />
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? "bg-white" : "bg-black"}`} />
                </div>
                <span className="uppercase select-none">
                  Atelier Lumière
                </span>
              </motion.div>
            </div>
            
            <h2 className="flex flex-col gap-1 md:gap-2 leading-none select-none py-6 items-center text-center">
              <span className={`font-bebas text-7xl sm:text-9xl md:text-[10rem] tracking-[0.1em] pl-[0.1em] transition-all ${
                isDark 
                  ? "text-neutral-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                  : "text-neutral-900 drop-shadow-[0_0_15px_rgba(0,0,0,0.02)]"
              }`}>
                DAGI
              </span>
              <span className={`font-bebas text-8xl sm:text-[10rem] md:text-[12rem] tracking-[0.1em] pl-[0.1em] transition-all mt-[-10px] md:mt-[-20px] ${
                isDark 
                  ? "text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]" 
                  : "text-black drop-shadow-[0_0_40px_rgba(0,0,0,0.3)]"
              }`}>
                TATTOO
              </span>
              <div className="flex items-center gap-4 mt-2 w-full justify-center">
                <span className={`h-[1px] w-8 md:w-16 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></span>
                <span className={`font-mono text-[9px] md:text-[11px] tracking-[0.55em] pl-[0.55em] uppercase font-bold ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}>
                  ATELIER
                </span>
                <span className={`h-[1px] w-8 md:w-16 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></span>
              </div>
            </h2>
            
            {/* One-line Motto */}
            <p className={`font-mono text-xs md:text-sm tracking-wider uppercase leading-relaxed max-w-xl mx-auto text-center ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}>
              Custom skin architecture, meticulously hand-crafted to conform to your body's canvas.
            </p>
          </div>

          {/* Action buttons centered */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mx-auto pt-4 mt-4">
            <button
              onClick={onBookClick}
              className={`w-full sm:w-auto px-8 py-3.5 text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase rounded-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                isDark 
                  ? "bg-white text-black hover:bg-neutral-200" 
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              <span className="pl-[0.2em]">Book Session</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
            
            <button
              onClick={onExploreClick}
              className={`w-full sm:w-auto px-8 py-3.5 bg-transparent border text-[11px] font-mono tracking-[0.2em] uppercase rounded-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                isDark 
                  ? "border-neutral-800 hover:border-neutral-400 text-neutral-300 hover:text-white hover:bg-white/5" 
                  : "border-neutral-200 hover:border-neutral-400 text-neutral-600 hover:text-black hover:bg-black/5"
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`} />
              <span className="pl-[0.2em]">Explore Portfolios</span>
            </button>
          </div>
        </motion.div>

        {/* Minimal Bottom Anchor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className={`flex flex-wrap items-center justify-between gap-6 mt-16 pt-6 border-t text-[9px] font-mono tracking-[0.2em] ${
            isDark ? "border-neutral-800 text-neutral-550" : "border-neutral-200 text-neutral-500"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? "text-neutral-400" : "text-neutral-600"}`} /> HOSPITAL-GRADE STERILITY
          </span>
          <span>LIMITED REGISTRATION WINDOW</span>
          <span className={`font-mono uppercase font-semibold ${isDark ? "text-white" : "text-black"}`}>ESTABLISHED 2024</span>
        </motion.div>
      </div>
    </section>
  );
}
