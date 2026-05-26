import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Appointment, AppointmentStatus } from "../types";
import { 
  Lock, Unlock, ShieldAlert, Sparkles, Filter, 
  Trash2, Mail, Phone, Calendar, ClipboardList, 
  CheckCircle, Clock, Ban, Save, Search, RefreshCw, Image as ImageIcon
} from "lucide-react";

interface AdminDashboardProps {
  refreshTrigger: number;
  theme?: "dark" | "light";
}

export default function AdminDashboard({ refreshTrigger, theme = "dark" }: AdminDashboardProps) {
  const isDark = theme === "dark";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [schedules, setSchedules] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [activeReferenceImage, setActiveReferenceImage] = useState<string | null>(null);

  const MASTER_PASSCODE = "dagi2026";

  // Load backend schedules
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/schedules");
      if (response.ok) {
        const data = await response.json();
        // Sort newest first
        data.sort((a: Appointment, b: Appointment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSchedules(data);
        
        // Populate local editing state for notes
        const initialNotes: { [id: string]: string } = {};
        data.forEach((app: Appointment) => {
          initialNotes[app.id] = app.notes || "";
        });
        setEditingNotes(initialNotes);
      }
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchedules();
    }
  }, [isAuthenticated, refreshTrigger]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === MASTER_PASSCODE) {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Decryption authorization key error. Access Denied.");
      setPasscode("");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // Redraw updated status in-place
        setSchedules(schedules.map(item => item.id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) {
      console.error("Failed to update schedule status", err);
    }
  };

  const handleNotesSave = async (id: string) => {
    setSavingNotesId(id);
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editingNotes[id] })
      });
      if (response.ok) {
        // Redraw updated notes in-place
        setSchedules(schedules.map(item => item.id === id ? { ...item, notes: editingNotes[id] } : item));
      }
    } catch (err) {
      console.error("Failed to save session notes", err);
    } finally {
      setSavingNotesId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this booking record? This represents a irreversible catalog removal.")) return;
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setSchedules(schedules.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete booking", err);
    }
  };

  // Metrics computing
  const pendingCount = schedules.filter(s => s.status === "pending").length;
  const approvedCount = schedules.filter(s => s.status === "approved").length;
  const completedCount = schedules.filter(s => s.status === "completed").length;

  // Filtered schedules computation
  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = 
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tatStyle.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && s.status === statusFilter.toLowerCase();
  });

  return (
    <section id="admin-section" className={`py-16 md:py-24 px-4 relative border-b transition-colors duration-300 ${
      isDark ? "bg-black text-white border-neutral-800" : "bg-white text-black border-neutral-100"
    }`}>
      {/* Visual background ambient glow highlights */}
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-neutral-100/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-neutral-100/5 blur-[120px] pointer-events-none animate-pulse" />
      
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* SECURE PASSCODE DIAL OVERLAY SCREEN */}
          {!isAuthenticated ? (
            <motion.div
              key="auth-gate"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase mb-3 font-bold ${
                  isDark ? "text-neutral-300" : "text-black"
                }`}>
                  <ShieldAlert className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`} /> SYSTEM CRYPT SECURE VAULT
                </div>
                <h2 className={`font-serif text-2xl font-black uppercase tracking-wider ${
                  isDark ? "text-white" : "text-black"
                }`}>
                  Dagi Artist Vault
                </h2>
                <p className={`text-[10px] font-mono tracking-wider uppercase mt-1 ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}>
                  Private database authorization required.
                </p>
              </div>

              {/* Padlock form */}
              <form onSubmit={handleAuthSubmit} className={`rounded p-6 md:p-8 shadow-sm text-center space-y-6 border transition-colors duration-300 ${
                isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-black"
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                  isDark ? "bg-neutral-900 border-neutral-850" : "bg-neutral-50 border-neutral-200"
                }`}>
                  <Lock className={`w-5 h-5 ${isDark ? "text-white" : "text-black"}`} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-550 uppercase font-mono tracking-widest block">
                    Enter Decryption Passkey
                  </label>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-center tracking-[0.4em] bg-white border border-neutral-200 focus:border-black focus:ring-0 outline-none pb-2 pt-3 text-lg text-black rounded font-serif shadow-inner"
                  />
                  <span className="block text-[10px] text-neutral-600 font-mono tracking-wide pt-1.5 bg-neutral-50 py-2 border border-neutral-200 rounded px-2">
                    Hint: Use master passcode <strong className="font-sans font-extrabold underline text-black">dagi2026</strong> to decrypt.
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded text-[11px] font-mono text-center leading-relaxed">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  id="decrypt-vault-btn"
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs tracking-widest uppercase transition-colors rounded-sm cursor-pointer flex items-center justify-center gap-1.5 duration-300"
                >
                  <Unlock className="w-3.5 h-3.5" /> Decrypt Studio Vault
                </button>
              </form>
            </motion.div>
          ) : (
            
            /* DECRYPTED CRYPT DASHBOARD */
            <motion.div
              key="admin-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header portal */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-black font-mono tracking-widest uppercase mb-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-black" /> DECRYPTED SYSTEM CORE
                  </div>
                  <h1 className="font-serif text-3xl font-extrabold text-black uppercase tracking-wider">
                    Dagi's <span className="text-black">Calendar Vault</span>
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={fetchSchedules}
                    disabled={loading}
                    className="p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-black text-neutral-600 hover:text-black rounded transition-colors duration-300 flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-black" : ""}`} />
                    <span>Synchronize</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAuthenticated(false);
                      setPasscode("");
                    }}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-105 text-red-650 border border-red-200 hover:border-red-400 rounded text-xs uppercase tracking-wider font-mono cursor-pointer"
                  >
                    Lock Vault
                  </button>
                </div>
              </div>

              {/* Metrics Grid Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-black">
                
                {/* Total */}
                <div className="bg-white border border-neutral-200 p-5 rounded relative overflow-hidden flex flex-col justify-between shadow-sm">
                  <div className="absolute right-4 top-4 bg-neutral-50 p-2 rounded border border-neutral-200">
                    <ClipboardList className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[10px] text-neutral-550 font-mono tracking-widest uppercase">Total requests</span>
                  <span className="text-3xl font-serif text-black font-extrabold mt-3">{schedules.length}</span>
                </div>

                {/* Pending */}
                <div className="bg-white border border-neutral-200 p-5 rounded relative overflow-hidden flex flex-col justify-between shadow-sm">
                  <div className="absolute right-4 top-4 bg-neutral-50 p-2 rounded border border-neutral-200">
                    <Clock className="w-4 h-4 text-neutral-550" />
                  </div>
                  <span className="text-[10px] text-neutral-550 font-mono tracking-widest uppercase">Pending review</span>
                  <span className="text-3xl font-serif text-black font-extrabold mt-3">{pendingCount}</span>
                </div>

                {/* Approved */}
                <div className="bg-white border border-neutral-200 p-5 rounded relative overflow-hidden flex flex-col justify-between shadow-sm">
                  <div className="absolute right-4 top-4 bg-emerald-50 p-2 rounded border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-neutral-550 font-mono tracking-widest uppercase">Approved Slots</span>
                  <span className="text-3xl font-serif text-emerald-600 font-extrabold mt-3">{approvedCount}</span>
                </div>

                {/* Completed */}
                <div className="bg-white border border-neutral-200 p-5 rounded relative overflow-hidden flex flex-col justify-between shadow-sm">
                  <div className="absolute right-4 top-4 bg-neutral-50 p-2 rounded border border-neutral-200">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[10px] text-neutral-550 font-mono tracking-widest uppercase">Finished Inks</span>
                  <span className="text-3xl font-serif text-black font-extrabold mt-3">{completedCount}</span>
                </div>

              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 bg-neutral-50 border border-neutral-200 rounded text-black">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search client, key terms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-neutral-200 focus:border-black pl-9 pr-4 py-2 text-xs text-black rounded outline-none font-sans"
                  />
                </div>

                {/* Status Toggle filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider hidden md:inline mr-2 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-black" /> filter:
                  </span>
                  {["All", "Pending", "Approved", "Completed", "Declined"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        statusFilter === filter
                          ? "bg-black text-white font-semibold"
                          : "bg-transparent text-neutral-500 hover:text-black hover:bg-neutral-100 border border-transparent"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

              </div>

              {/* Bookings Display Container */}
              <div className="space-y-4 text-black">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((app) => (
                    <div 
                      key={app.id} 
                      className={`p-5 md:p-6 bg-white border rounded shadow-sm transition-all divide-y md:divide-y-0 md:divide-x divide-neutral-200 grid grid-cols-1 md:grid-cols-12 gap-5 ${
                        app.status === "completed" 
                          ? "border-amber-300 bg-amber-50/20" 
                          : app.status === "approved" 
                            ? "border-emerald-300 bg-emerald-50/20" 
                            : app.status === "declined" 
                              ? "border-red-350 bg-red-50/20"
                              : "border-neutral-200"
                      }`}
                    >
                      
                      {/* Col 1: Lead Details */}
                      <div className="md:col-span-4 space-y-3 pb-4 md:pb-0 text-black">
                        <div className="flex items-start md:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-serif text-base text-black font-bold leading-tight uppercase">
                              {app.clientName}
                            </h3>
                            <span className="text-[9px] font-mono text-neutral-500 uppercase">
                              Registered: {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Badge */}
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest font-mono ${
                            app.status === "pending" 
                              ? "bg-neutral-100 text-neutral-800 border border-neutral-200"
                              : app.status === "approved"
                                ? "bg-emerald-100 text-emerald-805 border border-emerald-200"
                                : app.status === "completed"
                                  ? "bg-amber-100 text-amber-805 border border-amber-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Contacts */}
                        <div className="text-[11px] font-mono text-neutral-600 space-y-1.5">
                          <a href={`mailto:${app.clientEmail}`} className="flex items-center gap-2 hover:text-black transition-colors">
                            <Mail className="w-3.5 h-3.5 text-black shrink-0" />
                            <span className="truncate">{app.clientEmail || "(Skipped)"}</span>
                          </a>
                          <a href={`tel:${app.clientPhone}`} className="flex items-center gap-2 hover:text-black transition-colors">
                            <Phone className="w-3.5 h-3.5 text-black shrink-0" />
                            <span>{app.clientPhone}</span>
                          </a>
                        </div>
                      </div>

                      {/* Col 2: Specs Specification */}
                      <div className="md:col-span-5 md:px-6 py-4 md:py-0 space-y-3">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 font-mono text-[10px] text-black">
                          <div>
                            <span className="text-neutral-500 uppercase block">Style Choice:</span>
                            <span className="text-black font-extrabold">{app.tatStyle}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 uppercase block">Skin Area:</span>
                            <span className="text-neutral-800">{app.placement}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 uppercase block">Size Scale:</span>
                            <span className="text-neutral-800">{app.size}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 uppercase block">Calendar Slot:</span>
                            <span className="text-neutral-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-black" /> {app.date} – {app.timeSlot}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-2.5 space-y-2 font-mono text-[10px] text-black">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500 uppercase">Design Source:</span>
                            <span className="text-black font-semibold">
                              {app.styleSelectionType === "gallery" 
                                ? "Master Gallery" 
                                : app.styleSelectionType === "own_art_opinion" 
                                  ? "Professional Opinion Match" 
                                  : "Own Custom Sketch"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500 uppercase font-mono">Tattoo Experience:</span>
                            <span className="text-neutral-800">
                              {app.hasPriorTattoo ? "Experienced Slot" : "First-Time Ink"}
                            </span>
                          </div>

                          {!app.hasPriorTattoo && app.skinTone && (
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-500 uppercase">Skin Tone Mapping:</span>
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="w-3.5 h-3.5 rounded-full border border-neutral-300" 
                                  style={{ backgroundColor: app.skinTone }} 
                                  title={`Hex: ${app.skinTone}`}
                                />
                                <span className="text-[9px] text-neutral-800 uppercase">Profile Saved</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Reference upload file preview wrapper if exists */}
                        {app.uploadedImage && (
                          <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={app.uploadedImage} 
                                className="w-8 h-8 rounded object-cover border border-neutral-305 flex-shrink-0 cursor-pointer hover:opacity-85"
                                onClick={() => setActiveReferenceImage(app.uploadedImage || null)}
                                referrerPolicy="no-referrer"
                              />
                              <div className="font-mono text-[9px] text-black">
                                <span className="text-black font-semibold block">Uploaded Design</span>
                                <span className="text-neutral-505 uppercase">Interactive file attachment</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveReferenceImage(app.uploadedImage || null)}
                              className="px-2.5 py-1 text-[9px] font-mono uppercase bg-neutral-100 text-black hover:bg-black hover:text-white rounded transition-all cursor-pointer"
                            >
                              Expand Zoom
                            </button>
                          </div>
                        )}

                        {/* Custom story text */}
                        {app.description && (
                          <div className="p-3 bg-neutral-50 rounded border border-neutral-100 text-[11px] text-neutral-700 font-sans leading-relaxed">
                            <span className="font-bold text-[9px] font-mono text-black uppercase block mb-1">Project Concept:</span>
                            "{app.description}"
                          </div>
                        )}
                      </div>

                      {/* Col 3: Quick Action managers */}
                      <div className="md:col-span-3 md:pl-6 pt-4 md:pt-0 flex flex-col justify-between gap-4">
                        
                        {/* Interactive Status managers keys */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase block">Manage Appointment status</span>
                          <div className="grid grid-cols-3 gap-1">
                            {/* Approve */}
                            <button
                              onClick={() => handleStatusUpdate(app.id, "approved")}
                              title="Approve Session Slot"
                              disabled={app.status === "approved" || app.status === "completed"}
                              className="py-1 px-1 text-[9px] font-mono font-semibold uppercase tracking-wide rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex flex-col items-center gap-0.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approve</span>
                            </button>

                            {/* Completed */}
                            <button
                              onClick={() => handleStatusUpdate(app.id, "completed")}
                              title="Set Session Completed"
                              disabled={app.status === "completed"}
                              className="py-1 px-1 text-[9px] font-mono font-semibold uppercase tracking-wide rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex flex-col items-center gap-0.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Finish</span>
                            </button>

                            {/* Decline */}
                            <button
                              onClick={() => handleStatusUpdate(app.id, "declined")}
                              title="Decline Request"
                              disabled={app.status === "completed" || app.status === "declined"}
                              className="py-1 px-1 text-[9px] font-mono font-semibold uppercase tracking-wide rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 flex flex-col items-center gap-0.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>

                        {/* Admin Session private Notes */}
                        <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                          <span className="text-[9px] font-mono text-neutral-500 uppercase block">Private Session Notes</span>
                          <div className="relative">
                            <textarea
                              value={editingNotes[app.id] ?? ""}
                              onChange={(e) => setEditingNotes({ ...editingNotes, [app.id]: e.target.value })}
                              placeholder="e.g. stencil length, needle counts..."
                              rows={2}
                              className="w-full bg-white border border-neutral-200 hover:border-black text-[10px] text-black p-1.5 focus:ring-0 rounded outline-none resize-none font-mono"
                            />
                            
                            {/* Save button inline */}
                            <button
                              onClick={() => handleNotesSave(app.id)}
                              disabled={savingNotesId === app.id}
                              className="absolute right-1.5 bottom-1.5 bg-black text-white hover:bg-neutral-800 p-1 rounded transition-colors cursor-pointer"
                              title="Save Note File"
                            >
                              {savingNotesId === app.id ? (
                                <span className="inline-block w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Discard trash */}
                        <div className="text-right">
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-[9px] font-mono text-red-650 hover:text-red-800 uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete Slip Card
                          </button>
                        </div>

                      </div>

                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-neutral-50 border border-dashed border-neutral-200 rounded p-6">
                    <ClipboardList className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
                      Zero matching records unlocked in current query.
                    </p>
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Uploaded custom stencil image lightbox zoomed view */}
      <AnimatePresence>
        {activeReferenceImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveReferenceImage(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl max-h-[85vh] overflow-hidden bg-white border border-neutral-205 rounded p-2 text-black shadow-sm"
            >
              <img 
                src={activeReferenceImage} 
                className="max-w-full max-h-[75vh] rounded object-contain mx-auto" 
                alt="Enlarged Reference Design"
                referrerPolicy="no-referrer"
              />
              <div className="mt-3 flex items-center justify-between px-2 pb-1">
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                  Client Uploaded Design stencil
                </span>
                <button
                  type="button"
                  onClick={() => setActiveReferenceImage(null)}
                  className="px-3 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-widest rounded cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
