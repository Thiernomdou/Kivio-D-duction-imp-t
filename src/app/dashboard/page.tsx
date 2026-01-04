"use client";

import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ActionCards from "@/components/dashboard/ActionCards";
import TransfersTable from "@/components/dashboard/TransfersTable";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { simulation, syncing } = useDashboard();

  // Obtenir le prénom de l'utilisateur
  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ")[0];
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Utilisateur";
  };

  return (
    <div>
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Bonjour, {getFirstName()} !
          </h1>
          {syncing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Synchronisation...</span>
            </div>
          )}
        </div>
        <p className="text-zinc-500 mt-1">
          {simulation
            ? `Gain fiscal estimé: ${simulation.tax_gain?.toLocaleString("fr-FR")}€/an`
            : "Voici l'état de votre dossier fiscal"}
        </p>
      </motion.div>

      {/* Header avec Gain et Score */}
      <DashboardHeader />

      {/* Actions Prioritaires */}
      <ActionCards />

      {/* Tableau des Transferts */}
      <TransfersTable />
    </div>
  );
}
