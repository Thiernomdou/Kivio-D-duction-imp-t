-- =====================================================
-- KIVIO DATABASE SETUP
-- Execute this in: https://supabase.com/dashboard/project/ayjqsgxrmqyfofwlorou/sql
-- =====================================================

-- Table: receipts (store transfer receipt data with OCR results)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  sender_name TEXT,
  receiver_name TEXT,
  amount_sent DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  fees DECIMAL(10,2) DEFAULT 0,
  transfer_date DATE,
  provider TEXT,
  ocr_confidence DECIMAL(3,2),
  is_validated BOOLEAN DEFAULT false,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'auto_validated', 'manual_review', 'rejected')),
  matched_relation TEXT CHECK (matched_relation IN ('father', 'mother', 'child')),
  match_confidence DECIMAL(3,2),
  amount_eur DECIMAL(12,2),
  exchange_rate DECIMAL(10,6),
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: identity_documents (store family document data with OCR results)
CREATE TABLE IF NOT EXISTS identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT CHECK (document_type IN ('livret_famille', 'extrait_naissance', 'acte_naissance')),
  person_name TEXT,
  father_name TEXT,
  mother_name TEXT,
  children JSONB DEFAULT '[]',
  ocr_confidence DECIMAL(3,2),
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tax_calculations (yearly tax calculation summaries)
CREATE TABLE IF NOT EXISTS tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tax_year INTEGER NOT NULL,
  total_receipts INTEGER DEFAULT 0,
  total_amount_sent DECIMAL(12,2) DEFAULT 0,
  total_fees DECIMAL(10,2) DEFAULT 0,
  total_deductible DECIMAL(12,2) DEFAULT 0,
  tmi_rate INTEGER,
  tax_reduction DECIMAL(12,2),
  matched_relations JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'finalized')),
  pdf_path TEXT,
  pdf_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tax_year)
);

-- Enable Row Level Security
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR TABLES
-- =====================================================

-- Receipts policies
DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own receipts" ON receipts;
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
CREATE POLICY "Users can update own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;
CREATE POLICY "Users can delete own receipts" ON receipts FOR DELETE USING (auth.uid() = user_id);

-- Identity documents policies
DROP POLICY IF EXISTS "Users can view own identity_documents" ON identity_documents;
CREATE POLICY "Users can view own identity_documents" ON identity_documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own identity_documents" ON identity_documents;
CREATE POLICY "Users can insert own identity_documents" ON identity_documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own identity_documents" ON identity_documents;
CREATE POLICY "Users can update own identity_documents" ON identity_documents FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own identity_documents" ON identity_documents;
CREATE POLICY "Users can delete own identity_documents" ON identity_documents FOR DELETE USING (auth.uid() = user_id);

-- Tax calculations policies
DROP POLICY IF EXISTS "Users can view own tax_calculations" ON tax_calculations;
CREATE POLICY "Users can view own tax_calculations" ON tax_calculations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tax_calculations" ON tax_calculations;
CREATE POLICY "Users can insert own tax_calculations" ON tax_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tax_calculations" ON tax_calculations;
CREATE POLICY "Users can update own tax_calculations" ON tax_calculations FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tax_calculations" ON tax_calculations;
CREATE POLICY "Users can delete own tax_calculations" ON tax_calculations FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Receipts bucket policies
DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
CREATE POLICY "Users can upload receipts" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read own receipts" ON storage.objects;
CREATE POLICY "Users can read own receipts" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own receipts storage" ON storage.objects;
CREATE POLICY "Users can update own receipts storage" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own receipts storage" ON storage.objects;
CREATE POLICY "Users can delete own receipts storage" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Identity documents bucket policies
DROP POLICY IF EXISTS "Users can upload identity docs" ON storage.objects;
CREATE POLICY "Users can upload identity docs" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read own identity docs" ON storage.objects;
CREATE POLICY "Users can read own identity docs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own identity docs" ON storage.objects;
CREATE POLICY "Users can update own identity docs" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own identity docs" ON storage.objects;
CREATE POLICY "Users can delete own identity docs" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_year ON receipts(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_receipts_validation ON receipts(user_id, validation_status);
CREATE INDEX IF NOT EXISTS idx_identity_docs_user ON identity_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calc_user_year ON tax_calculations(user_id, tax_year);

-- Done!
SELECT 'Database setup complete!' as status;
