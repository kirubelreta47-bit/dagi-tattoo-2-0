import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Check, Sparkles, Image as ImageIcon } from "lucide-react";

interface BookingFormProps {
  onSuccess?: () => void;
  initialGallerySelection?: { styleName: string; itemId: string } | null;
  onClearGallerySelection?: () => void;
  onBrowseGallery?: () => void;
}

export default function BookingForm({ 
  onSuccess, 
  initialGallerySelection, 
  onClearGallerySelection,
  onBrowseGallery
}: BookingFormProps) {
  const isDark = true;
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    styleSelectionType: "gallery" as "gallery" | "own_art" | "own_art_opinion",
    selectedGalleryItemId: "",
    tatStyle: "Celestial & Geometric",
    placement: "Forearm",
    size: "Medium",
    description: "",
    date: "",
    timeSlot: "11:00 AM",
    hasPriorTattoo: true,
    skinTone: "#e6c29b",
    uploadedImage: "" 
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectionId = initialGallerySelection?.itemId || "";
  useEffect(() => {
    if (selectionId && initialGallerySelection) {
      setFormData(prev => ({
        ...prev,
        styleSelectionType: "gallery",
        selectedGalleryItemId: initialGallerySelection.itemId,
        tatStyle: initialGallerySelection.styleName
      }));
    }
  }, [selectionId]);

  const styles = [
    "Celestial & Geometric",
    "Fine-Line Florals",
    "Neo-Traditional Realism",
    "Japanese Wave & Sakura",
    "Custom Script & Tiny Typography"
  ];

  const placements = ["Forearm", "Upper Arm", "Chest", "Back", "Thigh", "Rib Cage", "Custom"];
  const sizes = ["Small", "Medium", "Large"];

  const timeSlots = ["11:00 AM", "01:00 PM", "03:00 PM", "05:30 PM", "08:00 PM"];

  const skinTones = [
    { name: "Light", code: "#f9ebdf" },
    { name: "Soft", code: "#f3d1b7" },
    { name: "Medium", code: "#e6c29b" },
    { name: "Tan", code: "#cfa170" },
    { name: "Deep", code: "#9f7344" },
    { name: "Dark", code: "#5d3e21" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!formData.clientName || !formData.clientPhone || !formData.date) {
      setErrorMsg("Required: Name, Phone, and Date.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Could not send booking request.");
      const data = await response.json();
      setSuccessData({ ...formData, ...data });
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking-section" className="py-12 md:py-20 px-5 relative transition-colors duration-300 bg-[var(--color-bg)] text-[var(--text-main)]">
      
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!successData ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start"
            >
              {/* Left Column: Form Content */}
              <div className="space-y-12">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-bebas mb-4 tracking-wider uppercase">Secure Your Session</h2>
                  <p className="text-[var(--text-muted)] max-w-lg leading-relaxed text-sm lg:text-base">
                    Dagi's studio operates strictly by appointment. Share your vision below, and we will contact you to finalize the concept and pricing.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* Phase 1: Identity */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-[1px] bg-[var(--color-accent)] opacity-50" />
                      <h3 className="text-xs uppercase font-mono tracking-[0.3em] text-[var(--color-accent)] font-semibold">01. Identity</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Full Name *</label>
                        <input
                          type="text"
                          name="clientName"
                          required
                          value={formData.clientName}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-[var(--border-muted)] py-3 focus:border-[var(--color-accent)] outline-none transition-colors text-sm"
                          placeholder="HERMELA TESFAYE"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Phone *</label>
                        <input
                          type="tel"
                          name="clientPhone"
                          required
                          value={formData.clientPhone}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-[var(--border-muted)] py-3 focus:border-[var(--color-accent)] outline-none transition-colors text-sm"
                          placeholder="+251 9--"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Email Address (Optional)</label>
                      <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-[var(--border-muted)] py-3 focus:border-[var(--color-accent)] outline-none transition-colors text-sm"
                        placeholder="HERMELA@EXAMPLE.COM"
                      />
                    </div>
                  </div>

                  {/* Phase 2: Design Concept */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-[1px] bg-[var(--color-accent)] opacity-50" />
                      <h3 className="text-xs uppercase font-mono tracking-[0.3em] text-[var(--color-accent)] font-semibold">02. Design Concept</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      {[ 
                        { id: "gallery", label: "Gallery Style", sub: "Choose from portfolio" },
                        { id: "own_art", label: "Custom Idea", sub: "Your own concept" },
                        { id: "own_art_opinion", label: "Curation", sub: "Expert guidance" }
                      ].map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, styleSelectionType: option.id as any }))}
                          className={`p-6 text-left border transition-all duration-300 ${
                            formData.styleSelectionType === option.id 
                              ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-black" 
                              : "border-[var(--border-muted)] hover:border-[var(--text-muted)]"
                          }`}
                        >
                          <div className="font-bebas text-lg leading-tight uppercase tracking-wider">{option.label}</div>
                          <div className={`text-[10px] mt-1 uppercase tracking-tight ${formData.styleSelectionType === option.id ? "text-black/70" : "text-[var(--text-muted)]"}`}>{option.sub}</div>
                        </button>
                      ))}
                    </div>

                    {formData.styleSelectionType === "gallery" ? (
                      <div className="space-y-4 p-6 bg-[var(--color-surface)] border border-[var(--border-muted)]">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold block">Select Style Architecture</label>
                        <select 
                          name="tatStyle" 
                          value={formData.tatStyle} 
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-[var(--border-muted)] py-2 focus:border-[var(--color-accent)] outline-none text-sm text-[var(--text-main)]"
                        >
                          {styles.map(s => <option key={s} value={s} className="bg-[var(--color-bg)]">{s}</option>)}
                        </select>
                        {formData.selectedGalleryItemId && (
                          <div className="flex items-center justify-between pt-2">
                             <span className="text-[10px] text-[var(--color-accent)] uppercase font-mono">Ref: {formData.selectedGalleryItemId}</span>
                             <button type="button" onClick={onClearGallerySelection} className="text-[10px] uppercase underline opacity-60 hover:opacity-100">Remove</button>
                          </div>
                        )}
                        {!formData.selectedGalleryItemId && (
                          <button type="button" onClick={onBrowseGallery} className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-2">
                            <ImageIcon size={14} /> Open Master Portfolio
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 p-6 bg-[var(--color-surface)] border border-[var(--border-muted)]">
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold block">Your Style Concept</label>
                          <input
                            type="text"
                            name="tatStyle"
                            value={formData.tatStyle}
                            onChange={handleInputChange}
                            placeholder="WHAT IS YOUR STYLE CONCEPT?"
                            className="w-full bg-transparent border-b border-[var(--border-muted)] py-3 focus:border-[var(--color-accent)] outline-none text-sm uppercase tracking-wide"
                          />
                          <p className="text-[10px] text-[var(--text-muted)] opacity-70 uppercase tracking-wide">
                            ✦ You can attach a reference image or sketch below in the <em>Logistics</em> section.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phase 3: Details */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-[1px] bg-[var(--color-accent)] opacity-50" />
                      <h3 className="text-xs uppercase font-mono tracking-[0.3em] text-[var(--color-accent)] font-semibold">03. Body & Size</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Placement Area</label>
                        <div className="flex flex-wrap gap-2">
                          {placements.map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, placement: p }))}
                              className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                                formData.placement === p 
                                  ? "bg-[var(--text-main)] text-[var(--color-bg)] border-[var(--text-main)]" 
                                  : "border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--text-main)]"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Approximate Scale</label>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, size: s }))}
                              className={`px-6 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                                formData.size === s 
                                  ? "bg-[var(--text-main)] text-[var(--color-bg)] border-[var(--text-main)]" 
                                  : "border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--text-main)]"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 4: Logistics */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-[1px] bg-[var(--color-accent)] opacity-50" />
                      <h3 className="text-xs uppercase font-mono tracking-[0.3em] text-[var(--color-accent)] font-semibold">04. Logistics</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Preferred Date *</label>
                        <input
                          type="date"
                          name="date"
                          required
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-[var(--border-muted)] py-3 focus:border-[var(--color-accent)] outline-none transition-colors text-sm uppercase font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Consultation Slot</label>
                         <select 
                           name="timeSlot" 
                           value={formData.timeSlot} 
                           onChange={handleInputChange}
                           className="w-full bg-transparent border-b border-[var(--border-muted)] py-3 focus:border-[var(--color-accent)] outline-none text-sm text-[var(--text-main)]"
                         >
                           {timeSlots.map(t => <option key={t} value={t} className="bg-[var(--color-bg)]">{t}</option>)}
                         </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Project Vision & Story</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={1}
                        placeholder="TELL US THE STORY BEHIND THIS PIECE..."
                        className="w-full bg-transparent border-b border-[var(--border-muted)] py-3 focus:border-[var(--color-accent)] outline-none transition-all text-sm uppercase tracking-wide resize-none"
                        onInput={(e) => {
                          e.currentTarget.style.height = 'auto';
                          e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                      />
                    </div>

                    {/* ── Tattoo Idea Reference Upload (always visible) ── */}
                    <div className="space-y-4 pt-4">
                      <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold flex items-center gap-2">
                        <Upload size={12} className="text-[var(--color-accent)]" />
                        Tattoo Idea Reference Image (Optional)
                      </label>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormData(p => ({ ...p, uploadedImage: reader.result as string }));
                            reader.readAsDataURL(file);
                          }
                        }}
                      />

                      {!formData.uploadedImage ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border border-dashed border-[var(--border-muted)] hover:border-[var(--color-accent)] py-10 flex flex-col items-center gap-3 transition-all group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full border border-[var(--border-muted)] group-hover:border-[var(--color-accent)] flex items-center justify-center transition-all">
                            <Upload size={18} className="text-[var(--text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                          </div>
                          <div className="text-center">
                            <div className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">Upload a photo or sketch</div>
                            <div className="text-[10px] text-[var(--text-muted)] opacity-60 mt-1">JPG, PNG, WEBP — max 10mb</div>
                          </div>
                        </button>
                      ) : (
                        <div className="relative border border-[var(--color-accent)] p-1 inline-block w-full">
                          <img
                            src={formData.uploadedImage}
                            alt="Tattoo reference"
                            className="w-full max-h-64 object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 bg-[var(--color-bg)]/90 backdrop-blur text-[10px] uppercase tracking-wider border border-[var(--border-muted)] hover:border-[var(--color-accent)] transition-all"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, uploadedImage: "" }))}
                              className="px-3 py-1.5 bg-red-900/80 backdrop-blur text-[10px] uppercase tracking-wider border border-red-500/50 text-red-300 hover:bg-red-900 transition-all"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[var(--color-accent)] text-black text-[9px] uppercase tracking-widest font-bold">
                            Reference Uploaded
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-[10px] uppercase tracking-wider">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-[var(--color-accent)] text-black font-bebas text-xl tracking-widest uppercase transition-all hover:bg-[#d4a965] disabled:opacity-50"
                  >
                    {loading ? "Transmitting..." : "Send Booking Invitation"}
                  </button>
                </form>
              </div>

              {/* Right Column: Visual Summary / Info Box */}
              <div className="hidden lg:block space-y-8 sticky top-24">
                <div className="p-8 border border-[var(--border-muted)] bg-[var(--color-surface)] space-y-8">
                  <div className="font-bebas text-2xl tracking-wider uppercase border-b border-[var(--border-muted)] pb-4">Process Standards</div>
                  
                  <div className="space-y-6">
                    {[
                      { title: "Clinical Hygiene", body: "Hospital-grade sterilization. Single-use needles. Fully protected environment." },
                      { title: "Custom Only", body: "Dagi never reuses stencils. Every design is a unique sculpture for your skin." },
                      { title: "Consultation Driven", body: "Every tattoo begins with a conversation to ensure alignment with anatomy." }
                    ].map(item => (
                      <div key={item.title} className="space-y-2">
                        <div className="text-[11px] text-[var(--color-accent)] uppercase tracking-widest font-bold">{item.title}</div>
                        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[var(--border-muted)]">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                      <Sparkles size={12} className="text-[var(--color-accent)]" /> 
                      Appointment only studio
                    </div>
                  </div>
                </div>

                <div className="p-8 border border-[var(--border-muted)] space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Studio Guidelines</div>
                  <ul className="space-y-3 text-[12px] text-[var(--text-main)] list-none p-0">
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent)]">✦</span>
                      <span>No alcohol 24hrs prior.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent)]">✦</span>
                      <span>Hydrate thoroughly.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent)]">✦</span>
                      <span>Eat a carb-heavy meal before session.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto py-12 md:py-20 text-center space-y-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[var(--color-accent)] text-[var(--color-accent)] mb-4">
                <Check size={40} />
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-bebas tracking-wider uppercase">Submission Received</h2>
                <p className="text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                  Your project concept has been transmitted to Dagi's atelier. We review every request individually and will contact you via phone or email to schedule your consultation.
                </p>
              </div>
              
              <div className="p-8 border border-[var(--border-muted)] bg-[var(--color-surface)] inline-block text-left min-w-[320px] space-y-4">
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-muted)] pb-2 mb-4">Reference Ticket</div>
                <div className="flex justify-between text-sm uppercase tracking-wide">
                  <span className="text-[var(--text-muted)]">Client</span>
                  <span>{successData.clientName}</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-wide">
                  <span className="text-[var(--text-muted)]">Style</span>
                  <span>{successData.tatStyle}</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-wide">
                   <span className="text-[var(--text-muted)]">Date</span>
                   <span className="font-mono">{successData.date}</span>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setSuccessData(null)}
                  className="px-12 py-4 border border-[var(--border-muted)] hover:border-[var(--text-main)] text-xs uppercase tracking-widest transition-all"
                >
                  Return to Atelier
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
