import { motion } from "motion/react";
import { CalendarDays, Images } from "lucide-react";

interface HeroProps {
  onBookClick: () => void;
  onExploreClick: () => void;
  theme?: "dark" | "light";
}

export default function Hero({ onBookClick, onExploreClick }: HeroProps) {
  return (
    <section className="relative w-full min-h-[calc(100svh-60px)] overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&fm=jpg&q=80&w=2400')`,
          backgroundPosition: "center 45%",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.58)_47%,rgba(0,0,0,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.38)_72%,var(--color-bg)_100%)]" />

      <div className="relative z-10 min-h-[calc(100svh-60px)] max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-[680px]"
        >
          <p className="text-[11px] sm:text-xs font-mono tracking-[0.28em] text-[#C79A5D] uppercase mb-5 font-semibold">
            Premium custom tattoo atelier
          </p>

          <h1 className="hero-heading text-[#F5F2EC] mb-8 max-w-[10ch]">
            Dagi Tattoo
          </h1>

          <p className="text-[#E4DDD2] mb-10 max-w-xl">
            Custom skin art in Addis Ababa, shaped around your body, your story, and a calm studio experience.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={onBookClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C79A5D] text-[#181818] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-md transition-all duration-300 hover:bg-[#d4a965]"
            >
              <CalendarDays className="w-4 h-4" />
              Book Appointment
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={onExploreClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#F5F2EC]/70 bg-black/20 text-[#F5F2EC] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-md transition-all duration-300 hover:border-[#C79A5D] hover:text-[#C79A5D]"
            >
              <Images className="w-4 h-4" />
              View Portfolio
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-5 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-3"
      >
        <div className="w-0.5 h-12 bg-gradient-to-b from-[#F5F2EC] to-transparent opacity-50" />
        <div className="text-xs font-mono tracking-[0.2em] text-[#B8B8B8] uppercase">Scroll</div>
      </motion.div>
    </section>
  );
}
