-- ============================================
-- Migration: Add orders table for Paywall
-- Date: 2025-01-10
-- Description: Table pour gérer les paiements et le paywall
-- ============================================

-- Table des commandes/paiements
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    amount DECIMAL(10, 2) NOT NULL DEFAULT 49.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    pdf_generated BOOLEAN NOT NULL DEFAULT FALSE,
    pdf_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Un utilisateur ne peut avoir qu'une commande complétée par année fiscale
    UNIQUE(user_id, tax_year, status) WHERE (status = 'completed')
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_year ON orders(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);

-- RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leurs propres commandes
CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres commandes en attente
CREATE POLICY "Users can update own pending orders" ON orders
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Note: La mise à jour du statut à 'completed' se fait via webhook Stripe (service role)
-- Le service role bypass le RLS

-- Fonction pour vérifier si un utilisateur a payé pour une année fiscale
CREATE OR REPLACE FUNCTION has_paid_for_year(p_user_id UUID, p_tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM orders
        WHERE user_id = p_user_id
        AND tax_year = p_tax_year
        AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder l'accès à la fonction
GRANT EXECUTE ON FUNCTION has_paid_for_year TO authenticated;

COMMENT ON TABLE orders IS 'Table des commandes/paiements pour le paywall (49€/an)';
COMMENT ON COLUMN orders.status IS 'pending = en attente de paiement, completed = payé, failed = échec, refunded = remboursé';
COMMENT ON COLUMN orders.pdf_generated IS 'Indique si le PDF justificatif a été généré';
