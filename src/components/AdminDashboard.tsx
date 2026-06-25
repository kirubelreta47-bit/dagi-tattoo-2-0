import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Appointment, AppointmentStatus } from "../types";
import {
  Sparkles, Trash2, Mail, Phone, Calendar, ClipboardList,
  CheckCircle, Clock, Ban, Save, Search, RefreshCw, Bell, Download
} from "lucide-react";

interface AdminDashboardProps {
  refreshTrigger: number;
  theme?: "dark" | "light";
  isAuthenticated?: boolean;
  accessToken?: string;
  onLogout?: () => void;
}

export default function AdminDashboard({ refreshTrigger, isAuthenticated = true, accessToken, onLogout }: AdminDashboardProps) {
  const [schedules, setSchedules] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [activeReferenceImage, setActiveReferenceImage] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const knownScheduleIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedOnceRef = useRef(false);

  const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

  const notifyNewBooking = (appointment: Appointment) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("New Dagi Tattoo booking", {
        body: `${appointment.clientName} requested ${appointment.date} at ${appointment.timeSlot}.`,
        icon: "/image/tattoo_1_virgin_mary.png",
        tag: `booking-${appointment.id}`,
      });
    }
  };

  const fetchSchedules = async (options: { silent?: boolean } = {}) => {
    if (!options.silent) setLoading(true);
    try {
      const response = await fetch("/api/schedules", { headers: authHeaders });
      if (response.ok) {
        const data = await response.json();
        data.sort((a: Appointment, b: Appointment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const incomingIds = new Set<string>(data.map((app: Appointment) => app.id));
        if (hasLoadedOnceRef.current) {
          data
            .filter((app: Appointment) => !knownScheduleIdsRef.current.has(app.id))
            .forEach((app: Appointment) => notifyNewBooking(app));
        }
        setSchedules(data);
        knownScheduleIdsRef.current = incomingIds;
        hasLoadedOnceRef.current = true;
        const initialNotes: { [id: string]: string } = {};
        data.forEach((app: Appointment) => { initialNotes[app.id] = app.notes || ""; });
        setEditingNotes(initialNotes);
      } else if (response.status === 401) {
        console.warn("Admin session invalid or expired.");
      }
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      if (!options.silent) setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, [refreshTrigger]);

  useEffect(() => {
    if ((window as any).__dagiInstallPrompt) setInstallPrompt((window as any).__dagiInstallPrompt);
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).__dagiInstallPrompt = e;
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("dagi-install-ready", () => setInstallPrompt((window as any).__dagiInstallPrompt));
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    const interval = window.setInterval(() => fetchSchedules({ silent: true }), 30000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, accessToken]);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    (window as any).__dagiInstallPrompt = null;
    setInstallPrompt(null);
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setNotificationPermission(p);
  };

  const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setSchedules(schedules.map(item => item.id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) { console.error("Failed to update status", err); }
  };

  const handleNotesSave = async (id: string) => {
    setSavingNotesId(id);
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ notes: editingNotes[id] }),
      });
      if (response.ok) {
        setSchedules(schedules.map(item => item.id === id ? { ...item, notes: editingNotes[id] } : item));
      }
    } catch (err) { console.error("Failed to save notes", err); }
    finally { setSavingNotesId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      const response = await fetch(`/api/schedules/${id}`, { method: "DELETE", headers: authHeaders });
      if (response.ok) setSchedules(schedules.filter(item => item.id !== id));
    } catch (err) { console.error("Failed to delete booking", err); }
  };

  const pendingCount = schedules.filter(s => s.status === "pending").length;
  const approvedCount = schedules.filter(s => s.status === "approved").length;
  const completedCount = schedules.filter(s => s.status === "completed").length;

  const filteredSchedules = schedules.filter(s => {
    const q = searchQuery.toLowerCase();
    const matches = s.clientName.toLowerCase().includes(q) ||
      s.clientEmail.toLowerCase().includes(q) ||
      s.tatStyle.toLowerCase().includes(q);
    if (statusFilter === "All") return matches;
    return matches && s.status === statusFilter.toLowerCase();
  });

  const statusBorderLeft: Record<string, string> = {
    pending:   "border-l-amber-500/60",
    approved:  "border-l-emerald-500/60",
    completed: "border-l-[#C9A84C]/70",
    declined:  "border-l-red-500/60",
  };

  const statusBadge: Record<string, string> = {
    pending:   "border-amber-500/40 text-amber-400",
    approved:  "border-emerald-500/40 text-emerald-400",
    completed: "border-[#C9A84C]/40 text-[#C9A84C]",
    declined:  "border-red-500/40 text-red-400",
  };

  return (
    <section id="admin-section" className="min-h-screen py-12 px-4 md:px-8 bg-[#0d0d0d] text-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-8 border-b border-white/[0.07]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#C9A84C] font-mono mb-2">Admin Portal</p>
              <h1 className="font-bebas text-[2.8rem] md:text-5xl tracking-wider uppercase leading-none text-white">
                Booking Calendar
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {installPrompt && (
                <button onClick={handleInstallApp}
                  className="flex items-center gap-2 px-3 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-[10px] uppercase tracking-widest font-mono transition-all cursor-pointer">
                  <Download className="w-3 h-3" /> Install
                </button>
              )}
              {typeof Notification !== "undefined" && notificationPermission !== "granted" && (
                <button onClick={handleEnableNotifications}
                  className="flex items-center gap-2 px-3 py-2 border border-[#C9A84C]/30 text-[#C9A84C]/80 hover:border-[#C9A84C] hover:text-[#C9A84C] text-[10px] uppercase tracking-widest font-mono transition-all cursor-pointer">
                  <Bell className="w-3 h-3" /> Alerts
                </button>
              )}
              <button onClick={() => fetchSchedules()} disabled={loading}
                className="flex items-center gap-2 px-3 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-[10px] uppercase tracking-widest font-mono transition-all cursor-pointer">
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-[#C9A84C]" : ""}`} />
                Refresh
              </button>
              {onLogout && (
                <button onClick={onLogout}
                  className="px-3 py-2 border border-red-500/25 text-red-400/80 hover:border-red-500/50 hover:text-red-300 text-[10px] uppercase tracking-widest font-mono transition-all cursor-pointer">
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* ── Metrics ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total",     value: schedules.length, icon: ClipboardList, col: "text-white/70" },
              { label: "Pending",   value: pendingCount,     icon: Clock,          col: "text-amber-400" },
              { label: "Approved",  value: approvedCount,    icon: CheckCircle,    col: "text-emerald-400" },
              { label: "Completed", value: completedCount,   icon: Sparkles,       col: "text-[#C9A84C]" },
            ].map(({ label, value, icon: Icon, col }) => (
              <div key={label} className="border border-white/[0.07] bg-white/[0.025] p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.32em] text-white/30 font-mono">{label}</span>
                  <Icon className={`w-3.5 h-3.5 ${col} opacity-50`} />
                </div>
                <span className={`font-bebas text-[2.4rem] leading-none tracking-wide ${col}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* ── Search & Filter ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                type="text"
                placeholder="Search by name, style, email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/20 pl-9 pr-4 py-2.5 text-[11px] text-white/80 placeholder-white/20 outline-none font-mono transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {["All", "Pending", "Approved", "Completed", "Declined"].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-3 py-2.5 text-[9px] uppercase tracking-widest font-mono whitespace-nowrap transition-all cursor-pointer border ${
                    statusFilter === f
                      ? "bg-[#C9A84C] text-black border-[#C9A84C]"
                      : "border-white/[0.08] text-white/35 hover:text-white/70 hover:border-white/20"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* ── Cards ── */}
          <div className="space-y-3">
            {filteredSchedules.length > 0 ? filteredSchedules.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.035 }}
                className={`border border-white/[0.07] border-l-2 bg-white/[0.025] ${statusBorderLeft[app.status] ?? "border-l-white/10"}`}
              >
                {/* ── Top: client + date ── */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <span className="font-bebas text-sm text-white/50 tracking-wider">
                        {app.clientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bebas text-xl tracking-wider text-white uppercase">{app.clientName}</h3>
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border ${statusBadge[app.status] ?? "border-white/15 text-white/40"}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                        {app.clientPhone && (
                          <a href={`tel:${app.clientPhone}`} className="text-[11px] text-white/35 hover:text-white font-mono flex items-center gap-1.5 transition-colors">
                            <Phone className="w-3 h-3" />{app.clientPhone}
                          </a>
                        )}
                        {app.clientEmail && (
                          <a href={`mailto:${app.clientEmail}`} className="text-[11px] text-white/35 hover:text-white font-mono flex items-center gap-1.5 transition-colors truncate max-w-[220px]">
                            <Mail className="w-3 h-3" />{app.clientEmail}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date pill */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Calendar className="w-4 h-4 text-[#C9A84C]/60 shrink-0" />
                    <div>
                      <div className="font-bebas text-2xl text-white tracking-wider leading-none">{app.date}</div>
                      <div className="text-[10px] text-white/35 font-mono uppercase tracking-wider">{app.timeSlot}</div>
                    </div>
                  </div>
                </div>

                {/* ── Detail grid ── */}
                <div className="px-5 pb-4 border-t border-white/[0.05] pt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                  {[
                    { label: "Style",     val: app.tatStyle },
                    { label: "Placement", val: app.placement },
                    { label: "Size",      val: app.size },
                    { label: "Source",    val: app.styleSelectionType === "gallery" ? "Gallery" : app.styleSelectionType === "own_art_opinion" ? "Expert Pick" : "Custom" },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-mono mb-1">{label}</div>
                      <div className="text-[11px] text-white/75 font-mono">{val}</div>
                    </div>
                  ))}

                  {app.description && (
                    <div className="col-span-2 sm:col-span-4">
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-mono mb-1">Concept</div>
                      <p className="text-[11px] text-white/50 font-mono leading-relaxed italic">"{app.description}"</p>
                    </div>
                  )}

                  {app.uploadedImage && (
                    <div className="col-span-2 sm:col-span-4">
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-mono mb-2">Reference Image</div>
                      <button type="button" onClick={() => setActiveReferenceImage(app.uploadedImage || null)}
                        className="group flex items-center gap-3 cursor-pointer">
                        <img src={app.uploadedImage} referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover border border-white/[0.08] group-hover:border-[#C9A84C]/50 transition-all" />
                        <span className="text-[10px] text-white/30 group-hover:text-[#C9A84C] uppercase tracking-wider font-mono transition-colors">View full →</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="px-5 pb-4 border-t border-white/[0.05] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">Status:</span>
                    <button onClick={() => handleStatusUpdate(app.id, "approved")}
                      disabled={app.status === "approved" || app.status === "completed"}
                      className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-mono border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => handleStatusUpdate(app.id, "completed")}
                      disabled={app.status === "completed"}
                      className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-mono border border-[#C9A84C]/25 text-[#C9A84C] hover:bg-[#C9A84C]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Done
                    </button>
                    <button onClick={() => handleStatusUpdate(app.id, "declined")}
                      disabled={app.status === "completed" || app.status === "declined"}
                      className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-mono border border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5">
                      <Ban className="w-3 h-3" /> Decline
                    </button>
                  </div>
                  <button onClick={() => handleDelete(app.id)}
                    className="text-[9px] font-mono text-white/15 hover:text-red-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>

                {/* ── Notes ── */}
                <div className="px-5 pb-5 border-t border-white/[0.05] pt-4">
                  <div className="text-[9px] text-white/20 uppercase tracking-widest font-mono mb-2">Private Notes</div>
                  <div className="relative">
                    <textarea
                      value={editingNotes[app.id] ?? ""}
                      onChange={e => setEditingNotes({ ...editingNotes, [app.id]: e.target.value })}
                      placeholder="Internal session notes…"
                      rows={2}
                      className="w-full bg-white/[0.025] border border-white/[0.07] hover:border-white/12 focus:border-white/20 text-[11px] text-white/65 placeholder-white/15 p-3 outline-none resize-none font-mono transition-colors"
                    />
                    <button
                      onClick={() => handleNotesSave(app.id)}
                      disabled={savingNotesId === app.id}
                      className="absolute right-2 bottom-2 px-3 py-1 bg-white/[0.06] hover:bg-white/12 text-[9px] text-white/50 hover:text-white uppercase tracking-wider font-mono border border-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {savingNotesId === app.id
                        ? <span className="inline-block w-3 h-3 border border-white/30 border-t-transparent rounded-full animate-spin" />
                        : <><Save className="w-3 h-3" /> Save</>
                      }
                    </button>
                  </div>
                </div>

              </motion.div>
            )) : (
              <div className="text-center py-24 border border-dashed border-white/[0.07]">
                <ClipboardList className="w-8 h-8 text-white/10 mx-auto mb-4" />
                <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">No bookings found</p>
              </div>
            )}
          </div>

        </motion.div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {activeReferenceImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveReferenceImage(null)}
            className="fixed inset-0 bg-black/96 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-[#111] border border-white/[0.08] p-1"
            >
              <img src={activeReferenceImage} referrerPolicy="no-referrer"
                className="w-full max-h-[80vh] object-contain" alt="Client Reference" />
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[9px] text-white/25 font-mono uppercase tracking-widest">Client Reference Image</span>
                <button onClick={() => setActiveReferenceImage(null)}
                  className="text-[9px] text-white/40 hover:text-white font-mono uppercase tracking-widest transition-colors cursor-pointer">
                  Close ✕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
