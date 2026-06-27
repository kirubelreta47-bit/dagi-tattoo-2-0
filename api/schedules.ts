import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const placeholderValues = [
  "https://your-project-ref.supabase.co",
  "your-service-role-key",
];

const isSupabaseConfigured =
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY &&
  !placeholderValues.includes(SUPABASE_URL) &&
  !placeholderValues.includes(SUPABASE_SERVICE_ROLE_KEY);

const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

// In-memory fallback store (resets on cold start — for demo/testing only)
let memoryStore: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS from same origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── GET: list all bookings (admin only) ──
  if (req.method === "GET") {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const localToken = process.env.VITE_LOCAL_ADMIN_TOKEN || "local-admin-token";

    if (isSupabaseConfigured && supabase) {
      const { data: user, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !user?.user) {
        if (token !== localToken) {
          return res.status(401).json({ error: "Unauthorized" });
        }
      }
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data || []);
    } else {
      if (token !== localToken && token !== "local-admin-token") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(200).json(memoryStore);
    }
  }

  // ── POST: create a new booking ──
  if (req.method === "POST") {
    const data = req.body;

    if (!data.clientName || !data.clientPhone || !data.date) {
      return res
        .status(400)
        .json({ error: "clientName, clientPhone, and date are required" });
    }

    const record = {
      id: randomUUID(),
      client_name: data.clientName,
      client_email: data.clientEmail || "",
      client_phone: data.clientPhone,
      style_selection_type: data.styleSelectionType || "gallery",
      selected_gallery_item_id: data.selectedGalleryItemId || "",
      tat_style: data.tatStyle || "Custom Tattoo",
      placement: data.placement || "Forearm",
      size: data.size || "Medium",
      description: data.description || "",
      date: data.date,
      time_slot: data.timeSlot || "11:00 AM",
      status: "pending",
      has_prior_tattoo: data.hasPriorTattoo ?? false,
      skin_tone: data.skinTone || "",
      uploaded_image: data.uploadedImage || "",
      notes: data.notes || "",
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data: inserted, error } = await supabase
        .from("schedules")
        .insert([record])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(inserted);
    } else {
      // Memory fallback — works for demo; data resets on redeploy
      memoryStore.unshift(record);
      return res.status(201).json(record);
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
