import express from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Vite dev server is started separately (start-client.ts)
interface Appointment {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;  
  styleSelectionType?: string;
  selectedGalleryItemId?: string;
  tatStyle: string;
  placement?: string;
  size?: string;
  description?: string;
  date: string;
  timeSlot: string;
  status: string;
  hasPriorTattoo: boolean;
  skinTone?: string;
  uploadedImage?: string;
  notes?: string;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "schedules.json");
const CMS_FILE = path.join(process.cwd(), "cms-data.json");

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ADMIN_EMAIL = process.env.SUPABASE_ADMIN_EMAIL || "";

const placeholderValues = [
  "https://your-project-ref.supabase.co",
  "your-anon-key",
  "your-service-role-key",
  "admin@example.com"
];

const isSupabaseConfigured = 
  SUPABASE_URL && 
  SUPABASE_SERVICE_ROLE_KEY && 
  SUPABASE_ADMIN_EMAIL &&
  !placeholderValues.includes(SUPABASE_URL) && 
  !placeholderValues.includes(SUPABASE_SERVICE_ROLE_KEY) && 
  !placeholderValues.includes(SUPABASE_ADMIN_EMAIL);

const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase credentials not found or using placeholders. Falling back to local JSON storage.");
}

// === HELPER FUNCTIONS FOR LOCAL STORAGE ===
function loadSchedules(): Appointment[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    console.error("Error loading schedules:", error);
    return [];
  }
}

function saveSchedules(schedules: Appointment[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(schedules, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving schedules:", error);
  }
}

function mapAppointmentRecord(record: any): Appointment {
  return {
    id: record.id,
    clientName: record.client_name || record.clientName || "",
    clientEmail: record.client_email || record.clientEmail || "",
    clientPhone: record.client_phone || record.clientPhone || "",
    styleSelectionType: record.style_selection_type || record.styleSelectionType || "gallery",
    selectedGalleryItemId: record.selected_gallery_item_id || record.selectedGalleryItemId || "",
    tatStyle: record.tat_style || record.tatStyle || "Custom Tattoo",
    placement: record.placement || record.placement || "Forearm",
    size: record.size || record.size || "Medium",
    description: record.description || record.description || "",
    date: record.date || record.date || "",
    timeSlot: record.time_slot || record.timeSlot || "11:00 AM",
    status: record.status || "pending",
    hasPriorTattoo: record.has_prior_tattoo ?? record.hasPriorTattoo ?? false,
    skinTone: record.skin_tone || record.skinTone || "",
    uploadedImage: record.uploaded_image || record.uploadedImage || "",
    notes: record.notes || record.notes || "",
    createdAt: record.created_at || record.createdAt || "",
  };
}

// Admin Auth Helper (Simplified for Local Dev if no Supabase)
async function verifyAdminAuth(req: express.Request, res: express.Response): Promise<boolean> {
  // If in local dev without Supabase, we rely on the ADMIN_TOKEN in .env for a simple bypass
  // or just return true if the token matches VITE_LOCAL_ADMIN_TOKEN
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ authenticated: false, error: "Missing authorization header" });
    return false;
  }
  const token = authHeader.split(" ")[1];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user || data.user.email !== SUPABASE_ADMIN_EMAIL) {
      // Check for local token bypass even if Supabase is on
      if (token === process.env.ADMIN_TOKEN || token === process.env.VITE_LOCAL_ADMIN_TOKEN) return true;
      
      res.status(401).json({ authenticated: false, error: "Unauthorized" });
      return false;
    }
    return true;
  } else {
    // Local development auth bypass
    const localToken = process.env.VITE_LOCAL_ADMIN_TOKEN || "local-admin-token";
    if (token === localToken || token === "local-admin-token") {
      return true;
    }
    res.status(401).json({ authenticated: false, error: "Unauthorized (Local Dev)" });
    return false;
  }
}

// === MAIN SERVER ===
async function startServer() {
  const app = express();
  
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // === API ROUTES ===
  app.get('/api/schedules', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) return;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json((data || []).map(mapAppointmentRecord));
    } else {
      const schedules = loadSchedules();
      // Sort by createdAt descending
      schedules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(schedules);
    }
  });

  app.post('/api/schedules', async (req, res) => {
    const data = req.body;
    if (!data.clientName || !data.clientPhone || !data.date) {
      return res.status(400).json({ error: 'clientName, clientPhone, and date are required' });
    }

    const record = {
      id: randomUUID(),
      client_name: data.clientName,
      client_email: data.clientEmail || '',
      client_phone: data.clientPhone,
      style_selection_type: data.styleSelectionType || 'gallery',
      selected_gallery_item_id: data.selectedGalleryItemId || '',
      tat_style: data.tatStyle || 'Custom Tattoo',
      placement: data.placement || 'Forearm',
      size: data.size || 'Medium',
      description: data.description || '',
      date: data.date,
      time_slot: data.timeSlot || '11:00 AM',
      status: 'pending',
      has_prior_tattoo: data.hasPriorTattoo ?? false,
      skin_tone: data.skinTone || '',
      uploaded_image: data.uploadedImage || '',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data: inserted, error } = await supabase
        .from('schedules')
        .insert([record])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      res.status(201).json(mapAppointmentRecord(inserted));
    } else {
      const schedules = loadSchedules();
      const newAppointment = mapAppointmentRecord(record);
      schedules.push(newAppointment);
      saveSchedules(schedules);
      res.status(201).json(newAppointment);
    }
  });

  app.put('/api/schedules/:id', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) return;

    const { id } = req.params;
    const { status, notes } = req.body;

    if (isSupabaseConfigured && supabase) {
      const updateFields: any = {};
      if (status) updateFields.status = status;
      if (notes !== undefined) updateFields.notes = notes;

      const { data: updated, error } = await supabase
        .from('schedules')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      if (!updated) return res.status(404).json({ error: 'Schedule not found' });
      res.json(mapAppointmentRecord(updated));
    } else {
      const schedules = loadSchedules();
      const idx = schedules.findIndex(s => s.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Schedule not found' });
      
      if (status) schedules[idx].status = status;
      if (notes !== undefined) schedules[idx].notes = notes;
      
      saveSchedules(schedules);
      res.json(schedules[idx]);
    }
  });

  app.delete('/api/schedules/:id', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) return;

    const { id } = req.params;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    } else {
      let schedules = loadSchedules();
      schedules = schedules.filter(s => s.id !== id);
      saveSchedules(schedules);
      res.json({ success: true });
    }
  });

  app.get('/api/admin/check', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) return;
    res.json({ authenticated: true });
  });

  // === PRODUCTION / DEV WRAPPERS ===
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Redirect root to the Vite dev server (usually 3000)
    app.get('/', (req, res) => res.redirect('http://localhost:3000'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    if (!isSupabaseConfigured) {
      console.log(`📁 Modes: Running with LOCAL JSON storage (${DATA_FILE})`);
    } else {
      console.log(`☁️ Mode: Running with SUPABASE storage`);
    }
  });
}

startServer();