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
            ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
            : 'linear-gradient(180deg, #000000 0%, #0a0a0f 100%)'
        }}
      />
    );
  }

  // Mode clair - Desktop (effets réduits)
  if (theme === "light") {
    return (
      <div className="fixed inset-0 -z-10">
        {/* Base */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
          }}
        />

        {/* Gradient violet - optimisé */}
        <div
          className="absolute -top-[15%] -left-[5%] w-[45%] h-[45%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
            filter: 'blur(50px)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Gradient rose - optimisé */}
        <div
          className="absolute -bottom-[15%] -right-[5%] w-[35%] h-[35%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
            transform: 'translateZ(0)'
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
