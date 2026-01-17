"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { memo, useEffect, useState } from "react";

// Style Finary optimisé pour performance
const BackgroundEffect = memo(function BackgroundEffect() {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(true); // Default to mobile for SSR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    // Throttled resize listener
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Version ultra-légère pour mobile et SSR
  if (!mounted || isMobile) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: theme === "light"
            ? '#f0f0f3'
            : 'linear-gradient(180deg, #000000 0%, #0a0a0f 100%)'
        }}
      />
    );
  }

  // Mode clair - Desktop style Finary moderne
  if (theme === "light") {
    return (
      <div className="fixed inset-0 -z-10">
        {/* Base gris moderne */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #f5f5f8 0%, #ededf0 50%, #e8e8ec 100%)'
          }}
        />

        {/* Gradient violet subtil en haut à gauche */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
            filter: 'blur(80px)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Gradient rose subtil en bas à droite */}
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[45%] h-[45%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 60%)',
            filter: 'blur(80px)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Légère texture de bruit pour profondeur */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    );
  }

  // Mode sombre - Desktop (effets réduits)
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base noir */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #050508 50%, #0a0a0f 100%)'
        }}
      />

      {/* Gradient violet - optimisé */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translateZ(0)'
        }}
      />

      {/* Gradient rose - optimisé */}
      <div
        className="absolute top-[25%] -right-[10%] w-[40%] h-[40%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translateZ(0)'
        }}
      />

      {/* Vignette légère */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.25) 100%)'
        }}
      />
    </div>
  );
});

export default BackgroundEffect;
