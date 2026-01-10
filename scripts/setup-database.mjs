// Script to setup database tables and storage policies
// Run with: node scripts/setup-database.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ayjqsgxrmqyfofwlorou.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5anFzZ3hybXF5Zm9md2xvcm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY4NjUzMiwiZXhwIjoyMDgyMjYyNTMyfQ.i5lgQFV5zGdD971GqnvyTIxeag_hGcKTfD2VB3HWTmE';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SQL_MIGRATIONS = `
-- Table: receipts
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
  matched_relation TEXT CHECK (matched_relation IN ('father', 'mother', 'child', NULL)),
  match_confidence DECIMAL(3,2),
  amount_eur DECIMAL(12,2),
  exchange_rate DECIMAL(10,6),
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: identity_documents
CREATE TABLE IF NOT EXISTS identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT CHECK (document_type IN ('livret_famille', 'extrait_naissance', 'acte_naissance', NULL)),
  person_name TEXT,
  father_name TEXT,
  mother_name TEXT,
  children JSONB DEFAULT '[]',
  ocr_confidence DECIMAL(3,2),
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tax_calculations
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

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
`;

const RLS_POLICIES = [
  // Receipts policies
  {
    table: 'receipts',
    name: 'Users can view own receipts',
    operation: 'SELECT',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'receipts',
    name: 'Users can insert own receipts',
    operation: 'INSERT',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'receipts',
    name: 'Users can update own receipts',
    operation: 'UPDATE',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'receipts',
    name: 'Users can delete own receipts',
    operation: 'DELETE',
    definition: 'auth.uid() = user_id'
  },
  // Identity documents policies
  {
    table: 'identity_documents',
    name: 'Users can view own identity_documents',
    operation: 'SELECT',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'identity_documents',
    name: 'Users can insert own identity_documents',
    operation: 'INSERT',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'identity_documents',
    name: 'Users can update own identity_documents',
    operation: 'UPDATE',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'identity_documents',
    name: 'Users can delete own identity_documents',
    operation: 'DELETE',
    definition: 'auth.uid() = user_id'
  },
  // Tax calculations policies
  {
    table: 'tax_calculations',
    name: 'Users can view own tax_calculations',
    operation: 'SELECT',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'tax_calculations',
    name: 'Users can insert own tax_calculations',
    operation: 'INSERT',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'tax_calculations',
    name: 'Users can update own tax_calculations',
    operation: 'UPDATE',
    definition: 'auth.uid() = user_id'
  },
  {
    table: 'tax_calculations',
    name: 'Users can delete own tax_calculations',
    operation: 'DELETE',
    definition: 'auth.uid() = user_id'
  }
];

async function runMigration() {
  console.log('🚀 Starting database setup...\n');

  // Run SQL via RPC or direct query
  // Since we can't run raw SQL directly, we'll check if tables exist and create them via the Management API

  // For now, let's output the SQL that needs to be run
  console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/ayjqsgxrmqyfofwlorou/sql\n');
  console.log('─'.repeat(60));
  console.log(SQL_MIGRATIONS);
  console.log('─'.repeat(60));

  // Generate RLS policy SQL
  console.log('\n-- RLS Policies');
  for (const policy of RLS_POLICIES) {
    const sql = policy.operation === 'INSERT' || policy.operation === 'DELETE'
      ? `CREATE POLICY "${policy.name}" ON ${policy.table} FOR ${policy.operation} WITH CHECK (${policy.definition});`
      : `CREATE POLICY "${policy.name}" ON ${policy.table} FOR ${policy.operation} USING (${policy.definition});`;
    console.log(sql);
  }

  // Storage policies
  console.log('\n-- Storage Policies for receipts bucket');
  console.log(`CREATE POLICY "Users can upload receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);`);
  console.log(`CREATE POLICY "Users can read own receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);`);

  console.log('\n-- Storage Policies for identity-documents bucket');
  console.log(`CREATE POLICY "Users can upload identity docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);`);
  console.log(`CREATE POLICY "Users can read own identity docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);`);

  console.log('\n─'.repeat(60));
  console.log('\n✅ Copy all the SQL above and run it in Supabase SQL Editor');
}

runMigration().catch(console.error);
