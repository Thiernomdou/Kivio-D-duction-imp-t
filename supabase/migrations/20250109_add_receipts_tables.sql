-- Migration: Add receipts, identity_documents, and tax_calculations tables
-- Date: 2025-01-09
-- Description: Support for document analysis and tax calculation features

-- ============================================
-- Table: receipts
-- Store transfer receipt data with OCR results
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  -- OCR extracted fields
  sender_name TEXT,
  receiver_name TEXT,
  amount_sent DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  fees DECIMAL(10,2) DEFAULT 0,
  transfer_date DATE,
  provider TEXT,
  -- Validation fields
  ocr_confidence DECIMAL(3,2),
  is_validated BOOLEAN DEFAULT false,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'auto_validated', 'manual_review', 'rejected')),
  matched_relation TEXT CHECK (matched_relation IN ('father', 'mother', 'child', NULL)),
  match_confidence DECIMAL(3,2),
  -- Converted amounts
  amount_eur DECIMAL(12,2),
  exchange_rate DECIMAL(10,6),
  -- Metadata
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: identity_documents
-- Store family document data with OCR results
-- ============================================
CREATE TABLE IF NOT EXISTS identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  -- OCR extracted fields
  document_type TEXT CHECK (document_type IN ('livret_famille', 'extrait_naissance', 'acte_naissance', NULL)),
  person_name TEXT,
  father_name TEXT,
  mother_name TEXT,
  children JSONB DEFAULT '[]',
  -- Validation
  ocr_confidence DECIMAL(3,2),
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: tax_calculations
-- Yearly tax calculation summaries
-- ============================================
CREATE TABLE IF NOT EXISTS tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tax_year INTEGER NOT NULL,
  -- Summary data
  total_receipts INTEGER DEFAULT 0,
  total_amount_sent DECIMAL(12,2) DEFAULT 0,
  total_fees DECIMAL(10,2) DEFAULT 0,
  total_deductible DECIMAL(12,2) DEFAULT 0,
  -- Tax calculation
  tmi_rate INTEGER,
  tax_reduction DECIMAL(12,2),
  -- Matched relations summary
  matched_relations JSONB DEFAULT '{}',
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'finalized')),
  -- PDF generation
  pdf_path TEXT,
  pdf_generated_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One calculation per user per year
  UNIQUE(user_id, tax_year)
);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Receipts: Users can only access their own receipts
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Identity Documents: Users can only access their own documents
CREATE POLICY "Users can view own identity_documents"
  ON identity_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own identity_documents"
  ON identity_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own identity_documents"
  ON identity_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own identity_documents"
  ON identity_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Tax Calculations: Users can only access their own calculations
CREATE POLICY "Users can view own tax_calculations"
  ON tax_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax_calculations"
  ON tax_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax_calculations"
  ON tax_calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax_calculations"
  ON tax_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_year ON receipts(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_receipts_validation ON receipts(user_id, validation_status);
CREATE INDEX IF NOT EXISTS idx_identity_docs_user ON identity_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calc_user_year ON tax_calculations(user_id, tax_year);

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_receipts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_receipts();

CREATE TRIGGER trigger_identity_documents_updated_at
  BEFORE UPDATE ON identity_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_receipts();

CREATE TRIGGER trigger_tax_calculations_updated_at
  BEFORE UPDATE ON tax_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_receipts();
