"use client";

import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ActionCards from "@/components/dashboard/ActionCards";
import TransfersTable from "@/components/dashboard/TransfersTable";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div>
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Bonjour, {profile?.full_name?.split(" ")[0] || "Utilisateur"} !
        </h1>
        <p className="text-zinc-500 mt-1">
          Voici l&apos;état de votre dossier fiscal
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
