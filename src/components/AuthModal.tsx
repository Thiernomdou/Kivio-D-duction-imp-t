"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveFiscalProfile } from "@/lib/supabase/fiscal-profile";

const PENDING_SIMULATION_KEY = "kivio_pending_simulation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string) => void | Promise<void>;
  defaultMode?: "signin" | "signup";
  redirectToDashboard?: boolean;
  showEmailConfirmed?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = "signup",
  redirectToDashboard = true,
  showEmailConfirmed = false,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setEmail("");
      setPassword("");
      setFullName("");
      setError(null);
      setLoading(false);
      setSuccess(false);
    }
  }, [isOpen, defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          throw new Error("Veuillez entrer votre nom complet");
        }
        const { error, session } = await signUp(email, password, fullName);
        if (error) throw error;

        // Si une session est créée, sauvegarder la simulation et rediriger
        if (session && session.user) {
          const userId = session.user.id;
          console.log("[AuthModal] Signup successful, user:", userId);

          // Sauvegarder le profil fiscal depuis localStorage vers Supabase
          const pending = localStorage.getItem(PENDING_SIMULATION_KEY);
          console.log("[AuthModal] localStorage pending:", pending ? "found" : "empty");

          if (pending) {
            try {
              const simulationData = JSON.parse(pending);
              console.log("[AuthModal] Parsed simulation data:", {
                monthlySent: simulationData.monthlySent,
                gain: simulationData.result?.gain,
                beneficiaryType: simulationData.beneficiaryType
              });

              // Attendre que le profil soit créé par le trigger
              await new Promise(resolve => setTimeout(resolve, 1500));

              // Sauvegarder le profil fiscal avec toutes les données du questionnaire
              const { data, error: saveError } = await saveFiscalProfile(userId, {
                monthlyAmount: simulationData.monthlySent || 0,
                beneficiaryType: simulationData.beneficiaryType || "parents",
                expenseType: simulationData.expenseType || "alimentary",
                isMarried: simulationData.isMarried || false,
                childrenCount: simulationData.childrenCount || 0,
                annualIncome: simulationData.annualIncome || 0,
                spouseIncome: simulationData.spouseIncome,
                tmi: simulationData.result?.tmi || 0,
                estimatedRecovery: simulationData.result?.gain || 0,
                fiscalParts: simulationData.result?.parts || null,
                taxBefore: simulationData.result?.taxBefore || null,
                taxAfter: simulationData.result?.taxAfter || null,
              });

              if (saveError) {
                console.error("[AuthModal] Failed to save fiscal profile:", saveError.message);
              } else if (data) {
                console.log("[AuthModal] Fiscal profile saved! estimated_recovery:", data.estimated_recovery);
                localStorage.removeItem(PENDING_SIMULATION_KEY);
              }
            } catch (e) {
              console.error("[AuthModal] Error:", e);
            }
          } else {
            console.log("[AuthModal] No simulation in localStorage to save");
          }

          onClose();
          if (redirectToDashboard) {
            window.location.href = "/dashboard";
          }
        } else {
          // Fallback si pas de session (confirmation email requise côté Supabase)
          setSuccess(true);
        }
      } else {
        const { error, user: signedInUser } = await signIn(email, password);
        if (error) throw error;

        // Rediriger AVANT de fermer le modal pour éviter les problèmes de timing
        if (redirectToDashboard) {
          window.location.href = "/dashboard";
        } else {
          onClose();
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      if (message.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect");
      } else if (message.includes("User already registered")) {
        setError("Un compte existe déjà avec cet email");
      } else if (message.includes("Password should be")) {
        setError("Le mot de passe doit contenir au moins 6 caractères");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError(null);
    setSuccess(false);
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - simple opacity, no blur on mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 sm:bg-black/60 z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-5 sm:p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-zinc-400 active:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success State */}
          {success ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Vérifiez votre email
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 mb-6">
                Un lien de confirmation a été envoyé à{" "}
                <span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => {
                  setMode("signin");
                  setSuccess(false);
                }}
                className="text-emerald-400 active:text-emerald-300 font-medium text-sm sm:text-base"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              {/* Email Confirmed Message */}
              {showEmailConfirmed && mode === "signin" && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-300">Email confirmé avec succès !</p>
                    <p className="text-xs text-green-400/80 mt-0.5 sm:mt-1">Connectez-vous pour accéder à votre dashboard.</p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {mode === "signup" ? "Créer un compte" : "Connexion"}
                </h2>
                <p className="text-sm sm:text-base text-zinc-400">
                  {mode === "signup"
                    ? "Sauvegardez votre simulation fiscale"
                    : "Accédez à votre espace personnel"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-400 mb-1.5 sm:mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-zinc-400 mb-1.5 sm:mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                    <input
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-zinc-400 mb-1.5 sm:mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none"
                      required
                    />
                  </div>
                  {mode === "signup" && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Minimum 6 caractères
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 active:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Chargement...
                    </>
                  ) : mode === "signup" ? (
                    "Créer mon compte"
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>

              {/* Switch Mode */}
              <div className="mt-5 sm:mt-6 text-center">
                <p className="text-sm text-zinc-400">
                  {mode === "signup" ? "Déjà un compte ?" : "Pas encore de compte ?"}
                  <button
                    onClick={switchMode}
                    className="ml-2 text-emerald-400 active:text-emerald-300 font-medium"
                  >
                    {mode === "signup" ? "Se connecter" : "Créer un compte"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
