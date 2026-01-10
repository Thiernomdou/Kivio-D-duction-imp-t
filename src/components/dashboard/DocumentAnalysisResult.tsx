"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useAuth } from "@/contexts/AuthContext";
import PaywallCard from "./PaywallCard";

export default function DocumentAnalysisResult() {
  const {
    taxCalculationSummary,
    hasPaid,
    case6GU,
    pdfPath,
    startCheckout,
    checkoutLoading,
    adminBypass,
    bypassLoading,
  } = useDashboard();

  const { user } = useAuth();

  // Only show results if calculation is complete
  if (!taxCalculationSummary) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8">
      <PaywallCard
        hasPaid={hasPaid}
        summary={taxCalculationSummary}
        case6GU={case6GU}
        pdfPath={pdfPath}
        onCheckout={startCheckout}
        checkoutLoading={checkoutLoading}
        userEmail={user?.email}
        onAdminBypass={adminBypass}
        bypassLoading={bypassLoading}
      />
    </div>
  );
}
