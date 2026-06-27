-- Copy and paste this script into your Supabase SQL Editor
-- It will create the necessary table and security policies for bookings to work.

CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT NOT NULL,
  style_selection_type TEXT,
  selected_gallery_item_id TEXT,
  tat_style TEXT,
  placement TEXT,
  size TEXT,
  description TEXT,
  date TEXT NOT NULL,
  time_slot TEXT,
  status TEXT DEFAULT 'pending',
  has_prior_tattoo BOOLEAN DEFAULT false,
  skin_tone TEXT,
  uploaded_image TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies so your application can read/insert data
CREATE POLICY "Enable read access for all" ON schedules FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON schedules FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON schedules FOR DELETE USING (true);
