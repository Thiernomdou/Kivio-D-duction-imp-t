"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, Wallet, Users, Heart, Baby, Banknote, Calculator, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { formatCurrency } from "@/lib/tax-calculator";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const { fiscalProfile, estimatedRecovery, loading } = useDashboard();
  const router = useRouter();

  // Utiliser fiscalProfile du DashboardContext qui est à jour
  const displayProfile = fiscalProfile || profile;

  // Traduire le type de bénéficiaire
  const getBeneficiaryLabel = (type: string | null | undefined) => {
    switch (type) {
      case "parents":
        return "Parents";
      case "children":
        return "Enfants";
      case "siblings":
        return "Frères/Soeurs";
      default:
        return "Non défini";
    }
  };

  // Formater le TMI
  const formatTMI = (tmi: number | null | undefined) => {
    if (!tmi) return "Non calculé";
    return `${tmi}%`;
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Paramètres
        </h1>
        <p className="text-gray-500">
          Gérez vos informations personnelles et votre profil fiscal
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du compte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 bg-[#0D0D0D] border border-white/10"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Informations du compte
          </h2>

          <div className="space-y-4">
            <InfoRow
              icon={<User className="w-4 h-4" />}
              label="Nom complet"
              value={displayProfile?.full_name || user?.user_metadata?.full_name || "Non renseigné"}
            />
            <InfoRow
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={displayProfile?.email || user?.email || "Non renseigné"}
            />
            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="Téléphone"
              value={displayProfile?.phone || "Non renseigné"}
            />
          </div>
        </motion.div>

        {/* Profil fiscal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 bg-[#0D0D0D] border border-emerald-500/30"
          style={{
            boxShadow: "0 0 40px rgba(16, 185, 129, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Profil fiscal
            </h2>
            {loading && (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            )}
          </div>

          {displayProfile?.monthly_amount ? (
            <div className="space-y-4">
              <InfoRow
                icon={<Wallet className="w-4 h-4" />}
                label="Montant mensuel envoyé"
                value={formatCurrency(displayProfile.monthly_amount)}
                highlight
              />
              <InfoRow
                icon={<Users className="w-4 h-4" />}
                label="Bénéficiaire"
                value={getBeneficiaryLabel(displayProfile.beneficiary_type)}
              />
              <InfoRow
                icon={<Heart className="w-4 h-4" />}
                label="Situation"
                value={displayProfile.is_married ? "Marié(e)" : "Célibataire"}
              />
              <InfoRow
                icon={<Baby className="w-4 h-4" />}
                label="Enfants à charge"
                value={`${displayProfile.children_count || 0}`}
              />
              <InfoRow
                icon={<Banknote className="w-4 h-4" />}
                label="Revenu annuel"
                value={formatCurrency(displayProfile.annual_income || 0)}
              />
              {displayProfile.is_married && displayProfile.spouse_income && (
                <InfoRow
                  icon={<Banknote className="w-4 h-4" />}
                  label="Revenu conjoint"
                  value={formatCurrency(displayProfile.spouse_income)}
                />
              )}
              <InfoRow
                icon={<Calculator className="w-4 h-4" />}
                label="Tranche marginale (TMI)"
                value={formatTMI(displayProfile.tmi)}
              />

              {/* Montant estimé - mis en évidence */}
              <div className="pt-4 mt-4 border-t border-white/10">
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-gray-400">Récupération estimée</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(estimatedRecovery)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Aucun profil fiscal enregistré
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Faire une simulation
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 bg-[#0D0D0D] border border-white/10"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refaire une simulation
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Refaire une simulation mettra à jour votre profil fiscal avec les nouvelles données.
        </p>
      </motion.div>
    </div>
  );
}

// Composant pour afficher une ligne d'information
function InfoRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <span className={`font-medium ${highlight ? "text-emerald-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
