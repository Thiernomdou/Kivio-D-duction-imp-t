"use client";

import { User, Mail, Phone, Wallet, Users, Heart, Baby, Banknote, Calculator, TrendingUp, RefreshCw, Loader2, ShoppingBag, Receipt, Scale } from "lucide-react";
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
        return "Parents / Grands-parents";
      case "children":
        return "Enfants";
      case "siblings":
        return "Frères / Sœurs";
      default:
        return "Non défini";
    }
  };

  // Traduire le type de dépenses
  const getExpenseTypeLabel = (type: string | null | undefined) => {
    switch (type) {
      case "alimentary":
        return "Besoins vitaux";
      case "investment":
        return "Investissement";
      default:
        return "Besoins vitaux";
    }
  };

  // Formater le TMI
  const formatTMI = (tmi: number | null | undefined) => {
    if (!tmi) return "Non calculé";
    return `${tmi}%`;
  };

  // Formater les parts fiscales
  const formatParts = (parts: number | null | undefined) => {
    if (!parts) return "Non calculé";
    return parts.toString();
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
          Paramètres
        </h1>
        <p className="text-xs sm:text-base text-gray-500">
          Vos informations personnelles et profil fiscal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Informations du compte */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-white/10">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            Compte
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <InfoRow
              icon={<User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              label="Nom complet"
              value={displayProfile?.full_name || user?.user_metadata?.full_name || "Non renseigné"}
            />
            <InfoRow
              icon={<Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              label="Email"
              value={displayProfile?.email || user?.email || "Non renseigné"}
            />
            <InfoRow
              icon={<Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              label="Téléphone"
              value={displayProfile?.phone || "Non renseigné"}
            />
          </div>
        </div>

        {/* Profil fiscal */}
        <div
          className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              Profil fiscal
            </h2>
            {loading && (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            )}
          </div>

          {displayProfile?.monthly_amount ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Informations du questionnaire */}
              <InfoRow
                icon={<Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                label="Montant mensuel"
                value={formatCurrency(displayProfile.monthly_amount)}
                highlight
              />
              <InfoRow
                icon={<Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                label="Bénéficiaire"
                value={getBeneficiaryLabel(displayProfile.beneficiary_type)}
              />
              <InfoRow
                icon={<ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                label="Type de dépenses"
                value={getExpenseTypeLabel(displayProfile.expense_type)}
              />
              <InfoRow
                icon={<Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                label="Situation"
                value={displayProfile.is_married ? "Marié(e) / Pacsé(e)" : "Célibataire"}
              />
              <InfoRow
                icon={<Baby className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                label="Enfants à charge"
                value={`${displayProfile.children_count || 0}`}
              />
              <InfoRow
                icon={<Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                label="Revenu annuel"
                value={formatCurrency(displayProfile.annual_income || 0)}
              />
              {displayProfile.is_married && displayProfile.spouse_income && (
                <InfoRow
                  icon={<Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  label="Revenu conjoint"
                  value={formatCurrency(displayProfile.spouse_income)}
                />
              )}

              {/* Résultats du calcul fiscal */}
              <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-white/10">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Calcul fiscal</p>
                <div className="space-y-2 sm:space-y-3">
                  <InfoRow
                    icon={<Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    label="Tranche marginale (TMI)"
                    value={formatTMI(displayProfile.tmi)}
                  />
                  <InfoRow
                    icon={<Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    label="Parts fiscales"
                    value={formatParts(displayProfile.fiscal_parts)}
                  />
                  {displayProfile.tax_before !== null && displayProfile.tax_before !== undefined && (
                    <InfoRow
                      icon={<Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      label="Impôt avant déduction"
                      value={formatCurrency(displayProfile.tax_before)}
                    />
                  )}
                  {displayProfile.tax_after !== null && displayProfile.tax_after !== undefined && (
                    <InfoRow
                      icon={<Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      label="Impôt après déduction"
                      value={formatCurrency(displayProfile.tax_after)}
                    />
                  )}
                </div>
              </div>

              {/* Montant estimé - mis en évidence */}
              <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-white/10">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span className="text-xs sm:text-sm text-gray-400">Récupération estimée</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                    {formatCurrency(estimatedRecovery)}
                  </span>
                </div>
              </div>

              {/* Déduction annuelle */}
              <div className="text-center pt-2">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Déduction annuelle: <span className="text-white font-medium">{formatCurrency((displayProfile.monthly_amount || 0) * 12)}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
                Aucun profil fiscal enregistré
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 active:bg-emerald-500/20 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Faire une simulation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-white/10">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
          Actions
        </h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-500 text-black font-medium active:bg-emerald-400 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refaire une simulation
          </button>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-600 mt-2 sm:mt-3">
          Refaire une simulation mettra à jour votre profil fiscal.
        </p>
      </div>
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
    <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-gray-500">{icon}</span>
        <span className="text-gray-400 text-xs sm:text-sm">{label}</span>
      </div>
      <span className={`font-medium text-xs sm:text-sm ${highlight ? "text-emerald-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
