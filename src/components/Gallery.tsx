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
      className={`py-16 md:py-24 border-b px-4 transition-colors duration-300 ${
        isDark ? "bg-black text-white border-neutral-800" : "bg-white text-black border-neutral-100"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase mb-3 font-bold ${
            isDark ? "text-neutral-300" : "text-black"
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${isDark ? "text-white" : "text-black"}`} />
            Live Catalog
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wide uppercase">
            Signature Shading Portfolio
          </h2>
          <div className={`w-12 h-[1px] mx-auto mt-4 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10">
          <div className={`flex items-center gap-2 pr-2 text-xs font-mono uppercase tracking-wider hidden sm:flex ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}>
            <Filter className={`w-3 h-3 ${isDark ? "text-white" : "text-black"}`} /> Filter By:
          </div>
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-xs uppercase tracking-widest rounded transition-all duration-300 font-mono cursor-pointer border ${
                  active
                    ? isDark
                      ? "bg-white text-black font-extrabold border-white"
                      : "bg-black text-white font-extrabold border-black"
                    : isDark
                      ? "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800"
                      : "bg-neutral-50 text-neutral-600 hover:text-black hover:bg-neutral-100 border-neutral-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Grid Display */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                className={`group relative border rounded overflow-hidden aspect-[3/4] cursor-pointer transition-colors ${
                  isDark 
                    ? "bg-neutral-950 border-neutral-800 hover:border-white" 
                    : "bg-white border-neutral-200 hover:border-black"
                }`}
                onClick={() => setSelectedImage(item)}
              >
                {/* Ink image */}
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />

                {/* Cyber Hover Grid Accent Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5" />

                {/* Content over image on hover */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-white text-black text-[7px] sm:text-[9px] font-bold uppercase tracking-wider font-mono mb-1.5 sm:mb-2">
                    {item.category}
                  </span>
                  
                  <h3 className="font-serif text-xs sm:text-base text-white font-medium tracking-wide leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-[8px] sm:text-[10px] text-neutral-300 font-mono mt-1 uppercase">
                    {item.placement}
                  </p>
                </div>

                {/* Expand Indicator Icon */}
                <div className="absolute top-4 right-4 bg-white/95 p-2 border border-neutral-200 text-black rounded opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                  <Maximize2 className="w-3.5 h-3.5 text-black" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className={`text-center py-16 font-mono text-sm max-w-xs mx-auto border border-dashed rounded p-8 ${
            isDark ? "text-neutral-400 border-neutral-800" : "text-neutral-500 border-neutral-200"
          }`}>
            No custom inks on display for this collection yet. Check again soon.
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
              <div 
                className={`border max-w-3xl w-full rounded flex flex-col md:flex-row overflow-hidden relative transition-colors duration-300 ${
                  isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-black"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className={`absolute top-4 right-4 p-2 rounded border z-10 transition-colors cursor-pointer ${
                    isDark 
                      ? "bg-neutral-800/90 text-neutral-200 border-neutral-700 hover:border-white" 
                      : "bg-white/90 text-neutral-800 border-neutral-200 hover:border-black"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left Side: Image */}
                <div className="md:w-1/2 aspect-[3/4] max-h-[70vh] bg-black">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Right Side: Details description */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest font-mono border ${
                      isDark 
                        ? "bg-neutral-800 text-neutral-200 border-neutral-700" 
                        : "bg-neutral-100 text-neutral-800 border-neutral-200"
                    }`}>
                      {selectedImage.category} Collection
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-xl md:text-2xl font-bold tracking-wide leading-tight mb-2 uppercase">
                    {selectedImage.title}
                  </h3>
                  
                  <div className={`font-mono text-xs mb-4 flex flex-col gap-1 uppercase tracking-wide ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}>
                    <div><span className={isDark ? "text-neutral-500" : "text-neutral-400"}>Artist:</span> Dagi Master Inks</div>
                    <div><span className={isDark ? "text-neutral-500" : "text-neutral-400"}>Placement:</span> {selectedImage.placement}</div>
                    <div><span className={isDark ? "text-neutral-500" : "text-neutral-400"}>Format:</span> Circular Needle Vector Custom</div>
                  </div>
                  
                  <p className={`text-xs md:text-sm leading-relaxed mb-6 font-sans border-t pt-4 ${
                    isDark ? "text-neutral-300 border-neutral-800" : "text-neutral-600 border-neutral-100"
                  }`}>
                    {selectedImage.description}
                  </p>
                  
                  <button
                    onClick={() => {
                      if (onSelectStyle) {
                        onSelectStyle(selectedImage.title, selectedImage.id);
                      } else {
                        const element = document.getElementById("booking-section");
                        if (element) element.scrollIntoView({ behavior: "smooth" });
                      }
                      setSelectedImage(null);
                    }}
                    className={`w-full py-3 font-extrabold text-xs tracking-widest uppercase transition-colors rounded-sm cursor-pointer duration-300 ${
                      isDark 
                        ? "bg-white hover:bg-neutral-200 text-black" 
                        : "bg-black hover:bg-neutral-850 text-white"
                    }`}
                  >
                    Select & Book This Style
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
