-- =============================================
-- KIVIO - Schéma de base de données Supabase
-- =============================================

-- Table des profils utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- Profil fiscal (données du questionnaire)
  monthly_amount INTEGER,                -- Montant mensuel envoyé
  beneficiary_type TEXT,                 -- parents, children, siblings
  is_married BOOLEAN DEFAULT FALSE,      -- Situation familiale
  children_count INTEGER DEFAULT 0,      -- Nombre d'enfants
  annual_income INTEGER,                 -- Revenu net annuel
  spouse_income INTEGER,                 -- Revenu du conjoint (si marié)
  tmi INTEGER,                           -- Tranche marginale d'imposition (calculé)
  estimated_recovery INTEGER DEFAULT 0,  -- Montant potentiel de récupération (calculé)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des simulations fiscales
CREATE TABLE IF NOT EXISTS public.tax_simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Données du questionnaire
  monthly_sent INTEGER NOT NULL,
  annual_deduction INTEGER NOT NULL,
  beneficiary_type TEXT NOT NULL CHECK (beneficiary_type IN ('parents', 'children', 'siblings')),
  is_married BOOLEAN NOT NULL DEFAULT FALSE,
  children_count INTEGER NOT NULL DEFAULT 0,
  annual_income INTEGER NOT NULL,

  -- Résultats calculés
  tax_gain INTEGER NOT NULL,
  tmi INTEGER NOT NULL,
  tax_before INTEGER NOT NULL,
  tax_after INTEGER NOT NULL,
  fiscal_parts DECIMAL(3,1) NOT NULL,
  is_eligible BOOLEAN NOT NULL DEFAULT TRUE,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des documents/reçus (pour l'OCR futur)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  simulation_id UUID REFERENCES public.tax_simulations(id) ON DELETE SET NULL,

  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  provider TEXT, -- Wave, TapTap, Western Union, etc.
  amount DECIMAL(10,2),
  transfer_date DATE,
  ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pour tax_simulations
CREATE POLICY "Users can view own simulations" ON public.tax_simulations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations" ON public.tax_simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations" ON public.tax_simulations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations" ON public.tax_simulations
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour documents
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Fonctions et Triggers
-- =============================================

-- Fonction pour créer automatiquement un profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil à l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_simulations_updated_at
  BEFORE UPDATE ON public.tax_simulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Index pour les performances
-- =============================================

CREATE INDEX IF NOT EXISTS idx_tax_simulations_user_id ON public.tax_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_simulations_created_at ON public.tax_simulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_simulation_id ON public.documents(simulation_id);
