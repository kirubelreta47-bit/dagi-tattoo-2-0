import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Phone, Mail, User, Ruler, CircleHelp, CheckCircle, Upload, Palette, Check, Sparkles, Image as ImageIcon } from "lucide-react";

interface BookingFormProps {
  onSuccess: () => void;
  initialGallerySelection?: { styleName: string; itemId: string } | null;
  onClearGallerySelection?: () => void;
  onBrowseGallery?: () => void;
  theme?: "dark" | "light";
}

export default function BookingForm({ 
  onSuccess, 
  initialGallerySelection, 
  onClearGallerySelection,
  onBrowseGallery,
  theme = "dark"
}: BookingFormProps) {
  const isDark = theme === "dark";
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
    skinTone: "#e6c29b", // Warm Sandy
    uploadedImage: "" // Base64 representation of uploaded image file
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

  const placements = ["Forearm", "Upper Arm / Sleeve", "Chest Panel", "Back Panel", "Thigh / Leg", "Rib Cage", "Custom"];
  const sizes = [
    { label: "Small (under 2\")", value: "Small" },
    { label: "Medium (2\" – 5\")", value: "Medium" },
    { label: "Large (5\" +)", value: "Large" }
  ];

  const timeSlots = ["11:00 AM", "01:00 PM", "03:00 PM", "05:30 PM", "08:00 PM"];

  const skinTones = [
    { name: "Porcelain Light", code: "#f9ebdf" },
    { name: "Soft Almond", code: "#f3d1b7" },
    { name: "Warm Amber", code: "#e6c29b" },
    { name: "Golden Chestnut", code: "#cfa170" },
    { name: "Deep Walnut", code: "#9f7344" },
    { name: "Sable Espresso", code: "#5d3e21" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectPlacement = (p: string) => {
    setFormData({ ...formData, placement: p });
  };

  const selectSize = (s: string) => {
    setFormData({ ...formData, size: s });
  };

  const selectTime = (t: string) => {
    setFormData({ ...formData, timeSlot: t });
  };

  const selectStyleType = (type: "gallery" | "own_art" | "own_art_opinion") => {
    setFormData(prev => ({ ...prev, styleSelectionType: type }));
  };

  const selectPriorTattoo = (hasPrior: boolean) => {
    setFormData(prev => ({ ...prev, hasPriorTattoo: hasPrior }));
  };

  const selectSkinTone = (toneHex: string) => {
    setFormData(prev => ({ ...prev, skinTone: toneHex }));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Attachment image exceeds 5MB limit. Please provide a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, uploadedImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Minimal client-side validation
    if (!formData.clientName || !formData.clientPhone || !formData.date) {
      setErrorMsg("Please complete all vital fields marked with golden identifiers.");
      setLoading(false);
      return;
    }

    // Force style title if it is default empty
    const submissionBody = {
      ...formData,
      tatStyle: formData.tatStyle || "Bespoke Custom Layout"
    };

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionBody)
      });

      if (!response.ok) {
        throw new Error("Unable to transmit scheduling invitation.");
      }

      const data = await response.json();
      setSuccessData(data);
      onSuccess(); // Trigger parent sync
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking-section" className={`py-16 md:py-24 border-b px-4 relative transition-colors duration-300 ${
      isDark ? "bg-black text-white border-neutral-800" : "bg-white text-black border-neutral-100"
    }`}>
      
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!successData ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <div className={`inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase mb-3 font-bold ${
                  isDark ? "text-neutral-305" : "text-black"
                }`}>
                  <Calendar className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`} /> Consultation Booking
                </div>
                <h2 className={`font-serif text-2xl md:text-3xl font-bold tracking-wide uppercase ${
                  isDark ? "text-white" : "text-black"
                }`}>
                  Secure Your Session
                </h2>
                <p className={`text-xs font-mono max-w-sm mx-auto mt-2 tracking-wide uppercase ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}>
                  Fill in your custom details. Dagi will review your project concept personally.
                </p>
              </div>

              {/* Booking Container */}
              <form onSubmit={handleSubmit} className={`border shadow-sm p-6 md:p-10 rounded space-y-8 relative z-10 transition-colors duration-300 ${
                isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-black"
              }`}>
                
                {/* Personal Information Group */}
                <div className="space-y-4">
                  <h3 className="font-serif text-sm text-neutral-900 tracking-widest uppercase pb-2 border-b border-neutral-200 font-semibold flex items-center gap-2">
                    <span className="text-neutral-400">01.</span> Contact Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-black" /> Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        required
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="e.g. Hermela Tesfaye"
                        className="w-full bg-neutral-50 border border-neutral-200 hover:border-neutral-400 focus:border-black py-2.5 px-3 text-sm text-black rounded outline-none transition-all duration-300"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-550" /> Email <span className="text-neutral-450 font-normal lowercase">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                        placeholder="hermela@gmail.com"
                        className="w-full bg-neutral-50 border border-neutral-200 hover:border-neutral-400 focus:border-black py-2.5 px-3 text-sm text-black rounded outline-none transition-all duration-300"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-black" /> Phone Contact <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="clientPhone"
                        required
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder="+251 9--"
                        className="w-full bg-neutral-50 border border-neutral-200 hover:border-neutral-400 focus:border-black py-2.5 px-3 text-sm text-black rounded outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Tattoo Concept Specifications */}
                <div className="space-y-6">
                  <h3 className="font-serif text-sm text-neutral-900 tracking-widest uppercase pb-2 border-b border-neutral-200 font-semibold flex items-center gap-2">
                    <span className="text-neutral-400">02.</span> Creative Concept
                  </h3>

                  {/* Style Preference choice selection buttons */}
                  <div className="space-y-3">
                    <label className="text-[10px] text-neutral-550 uppercase font-mono tracking-wider">
                      Specify Design Originality & Style Source
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => selectStyleType("gallery")}
                        className={`p-4 rounded border text-left transition-all duration-300 cursor-pointer ${
                          formData.styleSelectionType === "gallery"
                            ? "bg-black border-black text-white"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                        }`}
                      >
                        <div className="font-serif text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Dagi's Gallery</span>
                          {formData.styleSelectionType === "gallery" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <p className="text-[10px] mt-1.5 text-neutral-500 font-sans leading-relaxed">
                          Choose or book directly from Dagi's masterpiece portfolio gallery.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectStyleType("own_art")}
                        className={`p-4 rounded border text-left transition-all duration-300 cursor-pointer ${
                          formData.styleSelectionType === "own_art"
                            ? "bg-black border-black text-white"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                        }`}
                      >
                        <div className="font-serif text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>I Have My Own Art</span>
                          {formData.styleSelectionType === "own_art" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <p className="text-[10px] mt-1.5 text-neutral-500 font-sans leading-relaxed">
                          You ready a pre-drawn custom design concept to be inked cleanly.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectStyleType("own_art_opinion")}
                        className={`p-4 rounded border text-left transition-all duration-300 cursor-pointer ${
                          formData.styleSelectionType === "own_art_opinion"
                            ? "bg-black border-black text-white"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                        }`}
                      >
                        <div className="font-serif text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Curation Support</span>
                          {formData.styleSelectionType === "own_art_opinion" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <p className="text-[10px] mt-1.5 text-neutral-500 font-sans leading-relaxed">
                          You have design but wish for Dagi's expert opinion on ink profiling.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Contextual UI depending on choice */}
                  <div className="bg-neutral-50 border border-neutral-200 p-5 rounded space-y-4">
                    
                    {formData.styleSelectionType === "gallery" ? (
                      <div className="space-y-3">
                        <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider block">
                          Selected Masterpiece Reference
                        </label>
                        {formData.selectedGalleryItemId ? (
                          <div className="flex items-center justify-between bg-white border border-neutral-200 p-3.5 rounded text-black">
                            <div>
                              <div className="text-xs text-black font-serif font-bold uppercase tracking-wide">
                                {formData.tatStyle}
                              </div>
                              <div className="text-[10px] text-neutral-550 font-mono uppercase mt-0.5">
                                Gallery reference ID: {formData.selectedGalleryItemId}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (onClearGallerySelection) onClearGallerySelection();
                                setFormData(prev => ({ 
                                  ...prev, 
                                  selectedGalleryItemId: "", 
                                  tatStyle: "Celestial & Geometric" 
                                }));
                              }}
                              className="text-[10px] font-mono uppercase tracking-wider text-neutral-800 hover:text-black hover:underline cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-white border border-neutral-200 rounded text-center space-y-3">
                            <p className="text-xs text-neutral-600 font-sans">
                              Browse through Dagi's masterpiece collection to pick a design style!
                            </p>
                            <button
                              type="button"
                              onClick={onBrowseGallery}
                              className="px-5 py-2 border border-neutral-300 hover:border-black hover:bg-neutral-50 text-black text-[10px] font-mono tracking-widest uppercase rounded transition-colors cursor-pointer bg-white"
                            >
                              Browse Master Gallery
                            </button>
                          </div>
                        )}
                        
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider">
                            Preferred Style Architecture
                          </label>
                          <select
                            name="tatStyle"
                            value={formData.tatStyle}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-neutral-200 text-black focus:border-black py-2.5 px-3 text-sm rounded outline-none"
                          >
                            {styles.map((style, i) => (
                              <option key={i} value={style} className="bg-white text-black">
                                {style}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      /* Own Artwork / Curation upload interface - shown for both 'own_art' AND 'own_art_opinion' */
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-neutral-650 uppercase font-mono tracking-wider block">
                            Preferred Style Title or Category name
                          </label>
                          <input
                            type="text"
                            name="tatStyle"
                            required
                            value={formData.tatStyle}
                            onChange={handleInputChange}
                            placeholder="e.g. Custom Gothic Script & Rose"
                            className="w-full bg-white border border-neutral-200 text-black focus:border-black py-2.5 px-3 text-sm rounded outline-none"
                          />
                        </div>

                        {/* Programmatic image attachment section */}
                        <div className="p-5 bg-white border border-dashed border-neutral-200 rounded space-y-3 text-black">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-neutral-700 uppercase font-mono tracking-wider flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5 text-black" /> Upload Custom Design File
                            </label>
                            
                            {formData.uploadedImage ? (
                              <span className="text-[9px] text-neutral-800 font-mono uppercase bg-neutral-105 px-2 py-0.5 rounded border border-neutral-200">
                                Attached
                              </span>
                            ) : (
                              <span className="text-[9px] text-neutral-500 font-mono uppercase bg-neutral-55 px-2 py-0.5 rounded border border-neutral-200">
                                Optional
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              {/* Dedicated file element input */}
                              <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden" 
                              />
                              <button 
                                type="button" 
                                onClick={triggerFileSelect}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all"
                              >
                                Select Design Image
                              </button>
                              <p className="text-[9px] text-neutral-400 mt-1.5 font-mono">Accepts PNG, JPG, WebP (Max 5MB)</p>
                            </div>
                            
                            {formData.uploadedImage ? (
                              <div className="relative w-14 h-14 rounded border border-neutral-200 overflow-hidden bg-black flex-shrink-0 flex items-center justify-center">
                                <img src={formData.uploadedImage} className="w-full h-full object-cover" />
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, uploadedImage: "" }))}
                                  className="absolute top-0 right-0 bg-black/90 text-white hover:text-red-400 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono border border-neutral-800"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded border border-neutral-200 bg-neutral-100 flex items-center justify-center text-neutral-400 flex-shrink-0">
                                <ImageIcon className="w-5 h-5 text-neutral-450" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sizing scale and placing parameters within modular subgrid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                      {/* Scale selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-black" /> Desired Size Scale
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {sizes.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => selectSize(s.value)}
                              className={`py-2 px-1 text-[10px] uppercase font-mono tracking-wider border rounded transition-all duration-300 cursor-pointer ${
                                formData.size === s.value
                                  ? "bg-black border-black text-white font-semibold"
                                  : "bg-white border-neutral-200 hover:border-black text-neutral-600"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Skin placing dropdown */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider block">
                          Body Placement Area
                        </label>
                        <select
                          name="placement"
                          value={formData.placement}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-neutral-200 text-black focus:border-black py-2.5 px-3 text-xs rounded outline-none"
                        >
                          {placements.map((p, i) => (
                            <option key={i} value={p} className="bg-white text-black">
                              {p}
                              </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Prior experience and conditional skin color tones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 border border-neutral-200 p-5 rounded">
                    {/* Prior Tattoo Experience Toggle */}
                    <div className="space-y-2 text-black">
                      <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider block">
                        Have you had a tattoo before?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => selectPriorTattoo(true)}
                          className={`py-2 px-1 text-[10px] uppercase font-mono tracking-wider border rounded transition-all duration-300 cursor-pointer ${
                            formData.hasPriorTattoo
                              ? "bg-black border-black text-white font-semibold"
                              : "bg-white border-neutral-200 hover:border-black text-neutral-600"
                          }`}
                        >
                          Yes, experienced
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPriorTattoo(false)}
                          className={`py-2 px-1 text-[10px] uppercase font-mono tracking-wider border rounded transition-all duration-300 cursor-pointer ${
                            !formData.hasPriorTattoo
                              ? "bg-black border-black text-white font-semibold"
                              : "bg-white border-neutral-200 hover:border-black text-neutral-600"
                          }`}
                        >
                          No, first time
                        </button>
                      </div>
                    </div>

                    {/* Conditional Skin Tone Selection widget if hasPriorTattoo is false */}
                    {!formData.hasPriorTattoo ? (
                      <div className="space-y-2">
                        <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider flex items-center gap-1.5 ">
                          <Palette className="w-3.5 h-3.5 text-black" /> Select Skin Tone Profile
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {skinTones.map((tone) => (
                            <button
                              key={tone.code}
                              type="button"
                              onClick={() => selectSkinTone(tone.code)}
                              style={{ backgroundColor: tone.code }}
                              className="w-7 h-7 rounded-full border border-neutral-300 focus:outline-none relative transition-transform hover:scale-110 cursor-pointer flex items-center justify-center shadow-sm active:scale-95"
                              title={tone.name}
                            >
                              {formData.skinTone === tone.code && (
                                <Check className="w-3.5 h-3.5 text-black drop-shadow bg-white/75 rounded-full p-0.5" />
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wide mt-1">
                          Profile: <span className="text-black font-semibold">{skinTones.find(t => t.code === formData.skinTone)?.name || "Warm Amber"}</span> (helps optimized ink contrast profiles)
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center p-3.5 bg-white border border-neutral-200 rounded">
                        <div className="text-[10px] text-neutral-600 font-sans leading-relaxed">
                          <span className="text-black font-serif font-semibold italic">Experienced ink portfolio.</span> Shading contrasts and needle counts will be matched against your existing tattoos' pigment profiles.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Creative Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <CircleHelp className="w-3.5 h-3.5 text-black" /> Describe Your Project Vision & Story
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Share elements you want included, meaningful references, or links to references..."
                      className="w-full bg-white border border-neutral-200 hover:border-neutral-400 focus:border-black py-2.5 px-3 text-sm text-black rounded outline-none resize-none transition-colors duration-300"
                    />
                  </div>
                </div>

                {/* Date and Time Group */}
                <div className="space-y-6">
                  <h3 className="font-serif text-sm text-neutral-900 tracking-widest uppercase pb-2 border-b border-neutral-200 font-semibold flex items-center gap-2">
                    <span className="text-neutral-400">03.</span> Schedule Selection
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider">
                        Preferred appointment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-neutral-200 focus:border-black py-2.5 px-3 text-sm text-black rounded outline-none cursor-pointer"
                      />
                    </div>

                    {/* Time slots */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider">
                        Available Consultation Hour
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {timeSlots.map((ts) => (
                          <button
                            key={ts}
                            type="button"
                            onClick={() => selectTime(ts)}
                            className={`py-2 text-[9px] font-mono border rounded transition-all duration-300 cursor-pointer ${
                              formData.timeSlot === ts
                                ? "bg-black text-white font-extrabold border-black"
                                : "bg-white border-neutral-200 hover:border-black text-neutral-600"
                            }`}
                          >
                            {ts}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-300 rounded text-xs font-mono">
                    {errorMsg}
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    id="submit-booking-btn"
                    className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs tracking-[0.2em] uppercase rounded-sm transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Transmit Invitation Request"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            // Custom Victory Outcome screen
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-neutral-200 p-8 md:p-12 rounded text-center relative text-black shadow-sm"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full border border-neutral-200 shadow-md">
                <CheckCircle className="w-10 h-10 text-black" />
              </div>

              <div className="mt-6 mb-10">
                <div className="font-serif text-2xl text-black uppercase tracking-wide">
                  Invitation Transmitted
                </div>
                <h3 className="text-neutral-500 font-mono text-xs uppercase tracking-widest mt-2">
                  Session Code: {successData.id}
                </h3>
                <div className="w-10 h-[1px] bg-neutral-200 mx-auto my-4" />
                <p className="text-neutral-600 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-black font-semibold">{successData.clientName}</span>. Your tattoo request has been logged in
                  Dagi's secure calendar pipeline. {successData.clientEmail ? (
                    <span>An email briefing and call will reach you shortly at <span className="text-black font-semibold">{successData.clientEmail}</span>.</span>
                  ) : (
                    <span>A consultation call other briefing will reach you shortly at <span className="text-black font-semibold">{successData.clientPhone}</span>.</span>
                  )}
                </p>
              </div>

              {/* Receipt card summary details */}
              <div className="bg-neutral-50 border border-neutral-200 p-5 rounded max-w-sm mx-auto text-left space-y-3 font-mono text-[11px] mb-8 shadow-inner text-black">
                <div className="text-center text-[10px] text-black font-bold border-b border-neutral-200 pb-2 uppercase tracking-widest">
                  Consultation Slip Receipt
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Style Choice:</span>
                  <span className="text-black font-bold">{successData.tatStyle}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Skin Placement:</span>
                  <span className="text-black">{successData.placement}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Scale size:</span>
                  <span className="text-black">{successData.size}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Session Date:</span>
                  <span className="text-black">{successData.date}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Reserved Hour:</span>
                  <span className="text-black font-bold">{successData.timeSlot}</span>
                </div>
              </div>

              {/* Preparation guidelines */}
              <div className="text-left max-w-lg mx-auto bg-neutral-50 p-5 rounded border border-neutral-200 space-y-3 text-xs mb-8 text-black">
                <h4 className="font-serif text-black font-semibold tracking-wider text-xs uppercase">
                  Session preparation guidelines:
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-neutral-600 text-[11px] leading-relaxed">
                  <li>Please remain fully hydrated for at least 24 hours prior.</li>
                  <li>Avoid drinking alcohol or blood thinners 24 hours before your ink session.</li>
                  <li>Dagi recommends eating a solid meal 1-2 hours before the scheduled slots.</li>
                  <li>Wear loose-fitting, comfortable garments that grant easy access to the skin placement area.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSuccessData(null)}
                  className="px-6 py-3 bg-white hover:bg-[#fafafa] text-black border border-neutral-200 text-xs font-semibold tracking-widest uppercase rounded cursor-pointer"
                >
                  Book Another Concept
                </button>
                <button
                  onClick={() => {
                    setSuccessData(null);
                    if (onBrowseGallery) onBrowseGallery();
                  }}
                  className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs tracking-widest uppercase rounded cursor-pointer transition-all duration-300"
                >
                  Return To Catalog
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
