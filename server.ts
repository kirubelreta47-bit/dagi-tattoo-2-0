import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Appointment } from "./src/types";

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "schedules.json");

// Initial mock data to ensure a premium out-of-the-box system
const INITIAL_SCHEDULES: Appointment[] = [
  {
    id: "app-101",
    clientName: "Eden Yosef",
    clientEmail: "eden.yosef@gmail.com",
    clientPhone: "+251 911 234567",
    styleSelectionType: "gallery",
    selectedGalleryItemId: "img-line-1",
    tatStyle: "Celestial & Geometric",
    placement: "Forearm",
    size: "Medium",
    description: "A combination of a delicate moon cycle with clean line graphics in gold-style black ink.",
    date: "2026-06-02",
    timeSlot: "11:00 AM",
    status: "approved",
    hasPriorTattoo: true,
    notes: "Design finalized. Pre-shading stencil is ready.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "app-102",
    clientName: "Michael Abraham",
    clientEmail: "miki.abraham@gmail.com",
    clientPhone: "+251 909 876543",
    styleSelectionType: "own_art_opinion",
    tatStyle: "Neo-Traditional Lion",
    placement: "Chest (Right Chest)",
    size: "Large",
    description: "Bold lion portrait styled with elegant geometric crown patterns around the mane.",
    date: "2026-06-05",
    timeSlot: "02:00 PM",
    status: "pending",
    hasPriorTattoo: false,
    skinTone: "#e6c29b", // Warm sandy
    notes: "Requires a review call for the size scaling.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "app-103",
    clientName: "Selam Gashaw",
    clientEmail: "selamg@outlook.com",
    clientPhone: "+251 930 112233",
    styleSelectionType: "gallery",
    selectedGalleryItemId: "img-floral-2",
    tatStyle: "Florals & Botanicals",
    placement: "Outer Thigh / Leg",
    size: "Large",
    description: "Fine line cascading rose vine and ornamental geometric detailing.",
    date: "2026-05-24",
    timeSlot: "10:00 AM",
    status: "completed",
    hasPriorTattoo: true,
    notes: "Perfect session. Session took 3 hours. Provided luxury healing balm.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "app-104",
    clientName: "Yonas Daniel",
    clientEmail: "yonas.dan@yahoo.com",
    clientPhone: "+251 912 554433",
    styleSelectionType: "own_art",
    tatStyle: "Japanese-Inspired Wave",
    placement: "Upper Sleeve / Arm",
    size: "Medium",
    description: "Minimalist wave layout with aesthetic falling cherry blossom patterns.",
    date: "2026-06-10",
    timeSlot: "04:30 PM",
    status: "pending",
    hasPriorTattoo: false,
    skinTone: "#cfa170", // Olive caramel
    createdAt: "2026-05-25T03:15:00.000Z"
  }
];

// Helper to interact with DB file
function loadSchedules(): Appointment[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SCHEDULES, null, 2));
      return INITIAL_SCHEDULES;
    }
  } catch (error) {
    console.error("Error accessing database file, using memory storage", error);
    return INITIAL_SCHEDULES;
  }
}

function saveSchedules(schedules: Appointment[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(schedules, null, 2));
  } catch (error) {
    console.error("Failed to save schedules to disk", error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // In-memory shadow copy of schedules
  let schedules = loadSchedules();

  // API Endpoints
  // GET all schedules
  app.get("/api/schedules", (req, res) => {
    res.json(schedules);
  });

  // POST create schedule
  app.post("/api/schedules", (req, res) => {
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      tatStyle, 
      placement, 
      size, 
      description, 
      date, 
      timeSlot,
      styleSelectionType,
      selectedGalleryItemId,
      hasPriorTattoo,
      skinTone,
      uploadedImage
    } = req.body;
    
    if (!clientName || !clientPhone || !tatStyle || !date || !timeSlot) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newAppoint: Appointment = {
      id: "app-" + Math.random().toString(36).substr(2, 9),
      clientName,
      clientEmail: clientEmail || "",
      clientPhone,
      styleSelectionType: styleSelectionType || "own_art",
      selectedGalleryItemId,
      tatStyle,
      placement: placement || "Unspecified",
      size: size || "Medium",
      description: description || "",
      date,
      timeSlot,
      status: "pending",
      hasPriorTattoo: hasPriorTattoo !== undefined ? hasPriorTattoo : true,
      skinTone,
      uploadedImage,
      createdAt: new Date().toISOString()
    };

    schedules.push(newAppoint);
    saveSchedules(schedules);
    res.status(201).json(newAppoint);
  });

  // PUT update schedule (status, notes, etc.)
  app.put("/api/schedules/:id", (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointIdx = schedules.findIndex(s => s.id === id);
    if (appointIdx === -1) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    if (status) {
      schedules[appointIdx].status = status;
    }
    if (notes !== undefined) {
      schedules[appointIdx].notes = notes;
    }

    saveSchedules(schedules);
    res.json(schedules[appointIdx]);
  });

  // DELETE schedule
  app.delete("/api/schedules/:id", (req, res) => {
    const { id } = req.params;
    const appointIdx = schedules.findIndex(s => s.id === id);
    if (appointIdx === -1) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    schedules.splice(appointIdx, 1);
    saveSchedules(schedules);
    res.json({ success: true, message: `Appointment ${id} removed` });
  });

  // Serve static UI assets based on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}

startServer();
