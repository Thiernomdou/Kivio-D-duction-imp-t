"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function Logo({ size = "md", onClick }: LogoProps) {
  const sizes = {
    sm: { text: "text-xl", icon: "w-7 h-7", svg: "w-4 h-4" },
    md: { text: "text-[1.4rem]", icon: "w-9 h-9", svg: "w-5 h-5" },
    lg: { text: "text-3xl", icon: "w-11 h-11", svg: "w-6 h-6" },
  };

  const Container = onClick ? "button" : "div";

  return (
    <Container
      onClick={onClick}
      className="flex items-center gap-2.5 transition-all hover:opacity-90 group"
    >
      {/* Icône moderne - Deux cercles connectés représentant le transfert */}
      <div
        className={`${sizes[size].icon} rounded-[12px] flex items-center justify-center relative overflow-hidden`}
        style={{
          background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
          boxShadow: "0 2px 12px -2px rgba(168, 85, 247, 0.4)",
        }}
      >
        {/* Shine subtil */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
          }}
        />
        {/* Symbole de connexion/transfert */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`${sizes[size].svg} relative z-10`}
        >
          {/* Cercle gauche (vous) */}
          <circle cx="7" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
          {/* Cercle droit (parents) */}
          <circle cx="17" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
          {/* Flèche de connexion */}
          <path
            d="M11 12h2"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Texte épuré */}
      <span className={`font-semibold tracking-[-0.02em] ${sizes[size].text}`}>
        <span className="text-white">kiv</span>
        <span className="text-accent-purple">io</span>
      </span>
    </Container>
  );
}
