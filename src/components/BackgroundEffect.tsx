"use client";

export default function BackgroundEffect() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-dark-900">
      {/* Gradient de base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-dark-900" />

      {/* Blob vert principal - en haut à droite */}
      <div
        className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-500/20 blur-[120px] animate-blob"
        style={{ animationDelay: "0s" }}
      />

      {/* Blob vert secondaire - en bas à gauche */}
      <div
        className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary-600/15 blur-[150px] animate-blob"
        style={{ animationDelay: "2s" }}
      />

      {/* Blob cyan/teal - centre gauche */}
      <div
        className="absolute top-1/2 -left-20 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px] animate-blob-slow"
        style={{ animationDelay: "4s" }}
      />

      {/* Blob violet subtil - haut gauche */}
      <div
        className="absolute -top-20 left-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] animate-blob-reverse"
        style={{ animationDelay: "1s" }}
      />

      {/* Blob bleu subtil - bas droite */}
      <div
        className="absolute bottom-1/4 -right-20 h-[450px] w-[450px] rounded-full bg-blue-500/5 blur-[120px] animate-blob-slow"
        style={{ animationDelay: "3s" }}
      />

      {/* Grain/noise overlay pour texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette subtile */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(10,10,11,0.4)_100%)]" />
    </div>
  );
}
