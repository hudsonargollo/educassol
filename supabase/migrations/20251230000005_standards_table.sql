-- Migration: Standards Table
-- Creates standards table for curriculum standards (BNCC, Common Core, TEKS)

-- Standards Database Table
CREATE TABLE IF NOT EXISTS standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework TEXT NOT NULL CHECK (framework IN ('bncc', 'common-core', 'teks')),
  code TEXT NOT NULL,
  text TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  parent_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(framework, code)
);

-- Full-text search index for standards
CREATE INDEX IF NOT EXISTS idx_standards_search 
ON standards USING GIN (to_tsvector('portuguese', code || ' ' || text));

-- Filter index for grade level and subject queries
CREATE INDEX IF NOT EXISTS idx_standards_filter 
ON standards (framework, grade_level, subject);

-- Index for parent-child relationships
CREATE INDEX IF NOT EXISTS idx_standards_parent 
ON standards (parent_code) WHERE parent_code IS NOT NULL;

-- Enable RLS
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;

-- Standards are public read (no auth required for reading)
CREATE POLICY "Standards are publicly readable"
ON standards FOR SELECT
TO authenticated, anon
USING (true);

-- Only service role can insert/update standards
CREATE POLICY "Service role can manage standards"
ON standards FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
