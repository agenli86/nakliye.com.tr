-- Engelli IP'ler tablosu
CREATE TABLE IF NOT EXISTS engelli_ipler (
  id SERIAL PRIMARY KEY,
  ip_adresi VARCHAR(45) NOT NULL UNIQUE,
  sebep TEXT,
  engelleme_tarihi TIMESTAMP DEFAULT NOW(),
  engelleyen VARCHAR(100) DEFAULT 'admin'
);

-- Row Level Security
ALTER TABLE engelli_ipler ENABLE ROW LEVEL SECURITY;

-- Politikalar
CREATE POLICY "Public read engelli_ipler" ON engelli_ipler FOR SELECT USING (true);
CREATE POLICY "Public insert engelli_ipler" ON engelli_ipler FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete engelli_ipler" ON engelli_ipler FOR DELETE USING (true);
