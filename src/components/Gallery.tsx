import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PORTFOLIO_ITEMS } from "../data/portfolio";
import { TattooImage } from "../types";
import { Maximize2, X, Sparkles, Filter } from "lucide-react";

interface GalleryProps {
  onSelectStyle?: (styleName: string, itemId: string) => void;
  theme?: "dark" | "light";
}

export default function Gallery({ onSelectStyle, theme = "dark" }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedImage, setSelectedImage] = useState<TattooImage | null>(null);

  const isDark = theme === "dark";
  const categories = ["All", "Fine-Line", "Realism", "Geometric", "Japanese"];

  const filteredItems = selectedCategory === "All"
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <section 
      id="gallery-section" 
      className="py-24 md:py-32 px-6 sm:px-8 lg:px-12 border-b border-white/8"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-[#C79A5D] mb-6 font-semibold">
            Signature Tattoo Portfolio
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--text-main)] mb-6">
            Master Ink Gallery
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C79A5D] to-transparent mx-auto" />
        </motion.div>

        {/* Filter Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B8B8B8] hidden sm:flex">
            <Filter className="w-4 h-4" /> Filter By:
          </div>
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 text-xs uppercase tracking-widest rounded transition-all duration-300 font-semibold border ${
                  active
                    ? "bg-[#C79A5D] text-[#181818] border-[#C79A5D] shadow-lg"
                    : "bg-transparent text-[#B8B8B8] border-white/20 hover:border-[#C79A5D] hover:text-[#C79A5D]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </motion.div>

        {/* Grid Display */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={item.id}
                className="gallery-preview-card group min-h-[260px]"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="gallery-preview-image"
                  referrerPolicy="no-referrer"
                />

                <div className="gallery-preview-shade" />

                <div className="gallery-preview-content pointer-events-none">
                  <span className="gallery-preview-tag">
                    {item.category}
                  </span>
                  
                  <h3 className="gallery-preview-title">
                    {item.title}
                  </h3>
                  
                  <p className="gallery-preview-action">
                    {item.placement}
                  </p>
                </div>

                <motion.div 
                  className="absolute top-4 right-4 z-10 bg-[#C79A5D] p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75"
                  whileHover={{ scale: 1.1 }}
                >
                  <Maximize2 className="w-4 h-4 text-[#181818]" />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 font-mono text-sm max-w-xs mx-auto border border-dashed border-white/20 rounded-lg p-10 bg-white/5">
            <p className="text-[#B8B8B8]">No custom inks on display for this collection yet. Check again soon.</p>
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#252525] border border-white/10 max-w-4xl w-full rounded-lg flex flex-col lg:flex-row overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 p-2 rounded-lg bg-[#C79A5D] text-[#181818] z-10 transition-colors cursor-pointer hover:bg-[#d4a965]"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Left Side: Image */}
                <div className="lg:w-1/2 aspect-[3/4] max-h-[70vh] bg-black overflow-hidden rounded-l-lg">
                  <motion.img
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    layoutId={`image-${selectedImage.id}`}
                  />
                </div>

                {/* Right Side: Details */}
                <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
                  <div className="mb-6">
                    <span className="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest font-mono bg-[#C79A5D] text-[#181818]">
                      {selectedImage.category}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-black tracking-tight text-[#F5F2EC] mb-6 leading-tight">
                    {selectedImage.title}
                  </h3>
                  
                  <div className="font-mono text-xs mb-8 flex flex-col gap-3 uppercase tracking-wide text-[#B8B8B8]">
                    <div><span className="text-[#C79A5D] font-semibold">Artist:</span> Dagi Master Inks</div>
                    <div><span className="text-[#C79A5D] font-semibold">Placement:</span> {selectedImage.placement}</div>
                    <div><span className="text-[#C79A5D] font-semibold">Format:</span> Custom Vector Design</div>
                  </div>
                  
                  <p className="text-sm leading-relaxed mb-10 font-sans border-t border-white/10 pt-8 text-[#B8B8B8]">
                    {selectedImage.description}
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => {
                      if (onSelectStyle) {
                        onSelectStyle(selectedImage.title, selectedImage.id);
                      } else {
                        const element = document.getElementById("booking-section");
                        if (element) element.scrollIntoView({ behavior: "smooth" });
                      }
                      setSelectedImage(null);
                    }}
                    className="w-full py-3.5 font-bold text-sm tracking-widest uppercase transition-all rounded-lg duration-300 bg-[#C79A5D] hover:bg-[#d4a965] text-[#181818] shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Select & Book This Style
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
