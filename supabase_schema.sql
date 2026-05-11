-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team_id UUID REFERENCES teams(id) NOT NULL,
  away_team_id UUID REFERENCES teams(id) NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) NOT NULL,
  goals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public Read Access Teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read Access Matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public Read Access Players" ON players FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admin Write Access Teams" ON teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Access Matches" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Access Players" ON players FOR ALL USING (auth.role() = 'authenticated');

-- Seed data
INSERT INTO teams (name) VALUES 
('REAL BAÑIL'),
('SAN FRANCIS'),
('SABROSTAR'),
('FARSA BSC'),
('PEOR ES NADA');

-- Insert matches (assuming IDs are resolved via subqueries for seeding)
DO $$ 
DECLARE 
  rb_id UUID;
  sf_id UUID;
  sb_id UUID;
  fb_id UUID;
  pn_id UUID;
BEGIN
  SELECT id INTO rb_id FROM teams WHERE name = 'REAL BAÑIL';
  SELECT id INTO sf_id FROM teams WHERE name = 'SAN FRANCIS';
  SELECT id INTO sb_id FROM teams WHERE name = 'SABROSTAR';
  SELECT id INTO fb_id FROM teams WHERE name = 'FARSA BSC';
  SELECT id INTO pn_id FROM teams WHERE name = 'PEOR ES NADA';

  INSERT INTO matches (home_team_id, away_team_id, match_date) VALUES
  (rb_id, sf_id, '2026-05-11 21:00:00+00'),
  (sb_id, fb_id, '2026-05-18 21:00:00+00'),
  (pn_id, rb_id, '2026-05-25 21:00:00+00'),
  (sf_id, sb_id, '2026-06-01 21:00:00+00'),
  (fb_id, pn_id, '2026-06-08 21:00:00+00'),
  (rb_id, sb_id, '2026-06-15 21:00:00+00'),
  (sf_id, fb_id, '2026-06-22 21:00:00+00'),
  (pn_id, sb_id, '2026-06-29 21:00:00+00'),
  (rb_id, fb_id, '2026-07-06 21:00:00+00'),
  (sf_id, pn_id, '2026-07-13 21:00:00+00');

  -- Seed Players
  INSERT INTO players (name, team_id, goals) VALUES
  ('Gasperin', rb_id, 12),
  ('M. Rojas', rb_id, 8),
  ('N. Castillo', sf_id, 10),
  ('F. Diaz', sf_id, 7),
  ('A. Guerrero', sb_id, 9),
  ('J. Morales', fb_id, 6),
  ('D. Lopez', pn_id, 5);
END $$;
