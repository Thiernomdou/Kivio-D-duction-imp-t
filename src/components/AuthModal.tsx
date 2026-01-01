"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: "signin" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = "signup",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          throw new Error("Veuillez entrer votre nom complet");
        }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSuccess(true);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      // Traduire les erreurs courantes
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
          >
            <div className="glass rounded-2xl p-6 sm:p-8 glow-green">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Vérifiez votre email
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    Un lien de confirmation a été envoyé à{" "}
                    <span className="text-white">{email}</span>
                  </p>
                  <button
                    onClick={() => {
                      setMode("signin");
                      setSuccess(false);
                    }}
                    className="text-primary-400 hover:text-primary-300 font-medium"
                  >
                    Retour à la connexion
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {mode === "signup" ? "Créer un compte" : "Connexion"}
                    </h2>
                    <p className="text-zinc-400">
                      {mode === "signup"
                        ? "Sauvegardez votre simulation fiscale"
                        : "Accédez à votre espace personnel"}
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{error}</p>
                    </motion.div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          Nom complet
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jean Dupont"
                            className="w-full pl-12 pr-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-xl text-white placeholder-zinc-600 focus:border-primary-500 focus:outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vous@exemple.com"
                          className="w-full pl-12 pr-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-xl text-white placeholder-zinc-600 focus:border-primary-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          className="w-full pl-12 pr-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-xl text-white placeholder-zinc-600 focus:border-primary-500 focus:outline-none transition-colors"
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
                      className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
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
                  <div className="mt-6 text-center">
                    <p className="text-zinc-400">
                      {mode === "signup" ? "Déjà un compte ?" : "Pas encore de compte ?"}
                      <button
                        onClick={switchMode}
                        className="ml-2 text-primary-400 hover:text-primary-300 font-medium"
                      >
                        {mode === "signup" ? "Se connecter" : "Créer un compte"}
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
