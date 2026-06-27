import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Check, Sparkles, Image as ImageIcon, Download, Camera } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
            <SuccessTicket data={successData} onReset={() => setSuccessData(null)} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── PREMIUM REFERENCE TICKET ───────────────────────────────────────────────
interface SuccessTicketProps {
  data: any;
  onReset: () => void;
}

function SuccessTicket({ data, onReset }: SuccessTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [screenshotting, setScreenshotting] = useState(false);

  const ticketId = data.id
    ? data.id.slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase();

  const rows = [
    { label: "Client", value: data.clientName },
    { label: "Phone", value: data.clientPhone },
    ...(data.clientEmail ? [{ label: "Email", value: data.clientEmail }] : []),
    { label: "Style", value: data.tatStyle },
    { label: "Concept", value: data.styleSelectionType === "gallery" ? "Gallery Selection" : data.styleSelectionType === "own_art" ? "Custom Idea" : "Expert Curation" },
    { label: "Placement", value: data.placement },
    { label: "Size", value: data.size },
    { label: "Session Date", value: data.date },
    { label: "Time Slot", value: data.timeSlot },
    ...(data.description ? [{ label: "Vision", value: data.description }] : []),
    { label: "Prior Tattoo", value: data.hasPriorTattoo ? "Yes" : "No" },
  ];

  const captureTicket = async () => {
    if (!ticketRef.current) return null;
    return await html2canvas(ticketRef.current, {
      backgroundColor: "#0a0a0a",
      scale: 2,
      useCORS: true,
      logging: false,
    });
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const canvas = await captureTicket();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`dagi-tattoo-booking-${ticketId}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const handleScreenshot = async () => {
    setScreenshotting(true);
    try {
      const canvas = await captureTicket();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `dagi-tattoo-booking-${ticketId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setScreenshotting(false);
    }
  };

  return (
    <motion.div
      key="success-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto py-12 md:py-20 space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[var(--color-accent)] text-[var(--color-accent)] mb-2"
        >
          <Check size={28} />
        </motion.div>
        <h2 className="text-4xl font-bebas tracking-widest uppercase text-[var(--text-main)]">
          Booking Confirmed
        </h2>
        <p className="text-[12px] font-mono tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Your session request has been received
        </p>
      </div>

      {/* ── THE TICKET ── */}
      <div ref={ticketRef} style={{ background: "#0a0a0a", padding: "0" }}>
        <div style={{
          border: "1px solid rgba(199,154,93,0.35)",
          background: "linear-gradient(160deg, #111010 0%, #0d0c0c 100%)",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Top accent bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #C79A5D, #8B6534, #C79A5D)" }} />

          {/* Ticket header */}
          <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid rgba(199,154,93,0.15)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.15em", color: "#F5F2EC" }}>
                DAGI TATTOO
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.35em", color: "#C79A5D", textTransform: "uppercase", marginTop: 4 }}>
                Atelier · Addis Ababa
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(245,242,236,0.35)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Ref
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#C79A5D", letterSpacing: "0.12em", marginTop: 2 }}>
                #{ticketId}
              </div>
            </div>
          </div>

          {/* Ticket body — detail rows */}
          <div style={{ padding: "24px 32px" }}>
            {rows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(245,242,236,0.35)",
                  flexShrink: 0,
                  paddingTop: 1,
                }}>
                  {row.label}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "#F5F2EC",
                  textAlign: "right",
                  wordBreak: "break-word",
                  maxWidth: "60%",
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Skin tone swatch row */}
          {data.skinTone && (
            <div style={{ padding: "0 32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(245,242,236,0.35)" }}>
                Skin Tone
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: data.skinTone, border: "1px solid rgba(255,255,255,0.15)" }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#F5F2EC", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {data.skinTone}
                </span>
              </div>
            </div>
          )}

          {/* Status badge + issued date */}
          <div style={{
            padding: "16px 32px 20px",
            borderTop: "1px solid rgba(199,154,93,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C79A5D", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.25em", color: "#C79A5D", textTransform: "uppercase" }}>
                Pending Review
              </span>
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(245,242,236,0.25)", letterSpacing: "0.15em" }}>
              {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </span>
          </div>

          {/* Bottom decorative strip */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(199,154,93,0.3), transparent)" }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 24px",
            background: "var(--color-accent)",
            border: "none",
            color: "#000",
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: downloading ? "wait" : "pointer",
            opacity: downloading ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => { if (!downloading) e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={e => { if (!downloading) e.currentTarget.style.opacity = "1"; }}
        >
          <Download size={13} />
          {downloading ? "Generating..." : "Download PDF"}
        </button>

        <button
          onClick={handleScreenshot}
          disabled={screenshotting}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 24px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(245,242,236,0.75)",
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: screenshotting ? "wait" : "pointer",
            opacity: screenshotting ? 0.7 : 1,
            transition: "opacity 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => { if (!screenshotting) e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
          onMouseLeave={e => { if (!screenshotting) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
        >
          <Camera size={13} />
          {screenshotting ? "Capturing..." : "Save as Image"}
        </button>
      </div>

      {/* Return link */}
      <div className="text-center pt-2">
        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(245,242,236,0.3)",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 4,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(245,242,236,0.6)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(245,242,236,0.3)"}
        >
          ← Return to Atelier
        </button>
      </div>
    </motion.div>
  );
}

