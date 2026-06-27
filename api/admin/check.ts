import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  const localToken = process.env.VITE_LOCAL_ADMIN_TOKEN || "local-admin-token";

  // Local token bypass
  if (token === localToken || token === "local-admin-token") {
    return res.status(200).json({ authenticated: true });
  }

  // Supabase auth check
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ authenticated: false, error: "Unauthorized" });
    }
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false, error: "Unauthorized" });
}
