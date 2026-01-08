-- Migration: Ajouter les colonnes fiscales manquantes à la table profiles
-- Date: 2025-01-08
-- Description: Ajoute expense_type, fiscal_parts, tax_before, tax_after

-- Ajouter la colonne expense_type (type de dépenses: alimentary ou investment)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'alimentary';

-- Ajouter la colonne fiscal_parts (nombre de parts fiscales)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fiscal_parts DECIMAL(3,1) DEFAULT NULL;

-- Ajouter la colonne tax_before (impôt avant déduction)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tax_before DECIMAL(10,2) DEFAULT NULL;

-- Ajouter la colonne tax_after (impôt après déduction)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tax_after DECIMAL(10,2) DEFAULT NULL;

-- Commenter les colonnes pour documentation
COMMENT ON COLUMN profiles.expense_type IS 'Type de dépenses: alimentary (besoins vitaux) ou investment';
COMMENT ON COLUMN profiles.fiscal_parts IS 'Nombre de parts fiscales du foyer';
COMMENT ON COLUMN profiles.tax_before IS 'Montant de l impôt avant déduction';
COMMENT ON COLUMN profiles.tax_after IS 'Montant de l impôt après déduction';

-- Index optionnel pour améliorer les requêtes par type de bénéficiaire
CREATE INDEX IF NOT EXISTS idx_profiles_beneficiary_type ON profiles(beneficiary_type);
