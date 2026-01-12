"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function BackgroundEffect() {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Détecter mobile pour simplifier les effets
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mode clair
  if (theme === "light") {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Version simplifiée sans blur lourd sur mobile */}
        {!isMobile && (
          <>
            <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-purple-200/30 blur-[120px]" />
            <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-pink-200/20 blur-[150px]" />
          </>
        )}
      </div>
    );
  }

  // Mode sombre - version simplifiée sur mobile
  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 bg-[#0a0a0f]">
        {/* Gradient simple sans animation ni blur lourd */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f15] to-[#0a0a0f]" />
        {/* Un seul blob statique avec blur réduit */}
        <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-accent-purple/10 blur-[80px]" />
      </div>
    );
  }

  // Desktop - version complète
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-dark-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-dark-900" />

      <div
        className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-500/20 blur-[120px] animate-blob"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary-600/15 blur-[150px] animate-blob"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 -left-20 h-[400px] w-[400px] rounded-full bg-accent-purple/10 blur-[100px] animate-blob-slow"
        style={{ animationDelay: "4s" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(10,10,11,0.4)_100%)]" />
    </div>
  );
}
