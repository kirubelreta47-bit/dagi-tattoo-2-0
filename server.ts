import express from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Vite dev server is started separately (start-client.ts)
// Define Appointment type directly here
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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

const placeholderValues = [
  "https://your-project-ref.supabase.co",
  "your-anon-key",
  "your-service-role-key",
  "admin@example.com"
];

const USE_SUPABASE = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ADMIN_EMAIL &&
  !placeholderValues.includes(SUPABASE_URL) &&
  !placeholderValues.includes(SUPABASE_SERVICE_ROLE_KEY) &&
  !placeholderValues.includes(SUPABASE_ADMIN_EMAIL)
);

const USE_LOCAL_ADMIN = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_TOKEN);

if (!USE_SUPABASE && !USE_LOCAL_ADMIN) {
  throw new Error(
    "Missing admin setup. Set either SUPABASE_* variables for Supabase auth or ADMIN_* variables for local admin auth in .env."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// === YOUR EXISTING HELPER FUNCTIONS (keep them as they are) ===
const INITIAL_SCHEDULES: Appointment[] = [
  // Add default schedule entries here if needed.
];

function loadSchedules(): Appointment[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    return INITIAL_SCHEDULES;
  }
}
function saveSchedules(schedules: Appointment[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(schedules, null, 2), "utf8");
}

interface CMSData {
  [key: string]: any;
}
const DEFAULT_CMS: CMSData = {};
function loadCMS(): CMSData {
  try {
    return JSON.parse(fs.readFileSync(CMS_FILE, "utf8"));
  } catch (error) {
    return DEFAULT_CMS;
  }
}
function saveCMS(cmsData: CMSData) {
  fs.writeFileSync(CMS_FILE, JSON.stringify(cmsData, null, 2), "utf8");
}

function mapAppointmentRecord(record: any): Appointment {
  return {
    id: record.id,
    clientName: record.client_name || "",
    clientEmail: record.client_email || "",
    clientPhone: record.client_phone || "",
    styleSelectionType: record.style_selection_type || "gallery",
    selectedGalleryItemId: record.selected_gallery_item_id || "",
    tatStyle: record.tat_style || "Custom Tattoo",
    placement: record.placement || "Forearm",
    size: record.size || "Medium",
    description: record.description || "",
    date: record.date || "",
    timeSlot: record.time_slot || "11:00 AM",
    status: record.status || "pending",
    hasPriorTattoo: record.has_prior_tattoo ?? false,
    skinTone: record.skin_tone || "",
    uploadedImage: record.uploaded_image || "",
    notes: record.notes || "",
    createdAt: record.created_at || "",
  };
}

async function verifyAdminAuth(req: express.Request, res: express.Response): Promise<boolean> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ authenticated: false, error: "Missing authorization header" });
    return false;
  }

  const token = authHeader.split(" ")[1];
  if (USE_LOCAL_ADMIN && token === ADMIN_TOKEN) {
    return true;
  }

  if (!USE_SUPABASE) {
    res.status(401).json({ authenticated: false, error: "Unauthorized" });
    return false;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user || data.user.email !== SUPABASE_ADMIN_EMAIL) {
    res.status(401).json({ authenticated: false, error: "Unauthorized" });
    return false;
  }

  return true;
}

// === MAIN SERVER ===
async function startServer() {
  const app = express();
  
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // === API ROUTES ===
  app.get('/api/schedules', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) {
      return;
    }

    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json((data || []).map(mapAppointmentRecord));
    }

    res.json(loadSchedules());
  });

  app.post('/api/schedules', async (req, res) => {
    const data = req.body;
    if (!data.clientName || !data.clientPhone || !data.date) {
      return res.status(400).json({ error: 'clientName, clientPhone, and date are required' });
    }

    const record = {
      id: randomUUID(),
      clientName: data.clientName,
      clientEmail: data.clientEmail || '',
      clientPhone: data.clientPhone,
      styleSelectionType: data.styleSelectionType || 'gallery',
      selectedGalleryItemId: data.selectedGalleryItemId || '',
      tatStyle: data.tatStyle || 'Custom Tattoo',
      placement: data.placement || 'Forearm',
      size: data.size || 'Medium',
      description: data.description || '',
      date: data.date,
      timeSlot: data.timeSlot || '11:00 AM',
      status: 'pending',
      hasPriorTattoo: data.hasPriorTattoo ?? false,
      skinTone: data.skinTone || '',
      uploadedImage: data.uploadedImage || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    if (USE_SUPABASE) {
      const dbRecord = {
        id: record.id,
        client_name: record.clientName,
        client_email: record.clientEmail,
        client_phone: record.clientPhone,
        style_selection_type: record.styleSelectionType,
        selected_gallery_item_id: record.selectedGalleryItemId,
        tat_style: record.tatStyle,
        placement: record.placement,
        size: record.size,
        description: record.description,
        date: record.date,
        time_slot: record.timeSlot,
        status: record.status,
        has_prior_tattoo: record.hasPriorTattoo,
        skin_tone: record.skinTone,
        uploaded_image: record.uploadedImage,
        notes: record.notes,
        created_at: record.createdAt,
      };

      const { data: inserted, error } = await supabase
        .from('schedules')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(mapAppointmentRecord(inserted));
    }

    const schedules = loadSchedules();
    schedules.unshift(record);
    saveSchedules(schedules);
    res.status(201).json(record);
  });

  app.put('/api/schedules/:id', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) {
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;
    const updateFields: any = {};

    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    if (USE_SUPABASE) {
      const { data: updated, error } = await supabase
        .from('schedules')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!updated) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      return res.json(mapAppointmentRecord(updated));
    }

    const schedules = loadSchedules();
    const index = schedules.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    schedules[index] = { ...schedules[index], ...updateFields };
    saveSchedules(schedules);
    res.json(schedules[index]);
  });

  app.delete('/api/schedules/:id', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) {
      return;
    }

    const { id } = req.params;
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true });
    }

    const schedules = loadSchedules();
    const filtered = schedules.filter((item) => item.id !== id);
    if (filtered.length === schedules.length) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    saveSchedules(filtered);
    res.json({ success: true });
  });

  app.get('/api/admin/check', async (req, res) => {
    if (!(await verifyAdminAuth(req, res))) {
      return;
    }
    res.json({ authenticated: true });
  });

  // === YOUR EXISTING VITE / PRODUCTION CODE (unchanged) ===
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // In development, the frontend runs on http://localhost:3000 (Vite).
    // Redirect root to the Vite dev server. Vite config proxies `/api` to this backend.
    app.get('/', (req, res) => res.redirect('http://localhost:3000'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();