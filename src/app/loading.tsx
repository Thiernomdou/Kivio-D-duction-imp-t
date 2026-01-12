"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]">
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent-purple/20 rounded-full blur-[100px] animate-pulse-glow" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo avec effet de glow */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-accent-purple/30 to-accent-pink/30 blur-xl animate-pulse-glow" />

          {/* Logo container */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-2xl shadow-accent-purple/30">
            <span className="text-2xl sm:text-3xl font-bold text-white">K</span>
          </div>

          {/* Spinning gradient border */}
          <div className="absolute -inset-2">
            <svg className="w-20 h-20 sm:w-24 sm:h-24" viewBox="0 0 96 96">
              <defs>
                <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7">
                    <animate attributeName="stop-color" values="#a855f7;#ec4899;#a855f7" dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#ec4899">
                    <animate attributeName="stop-color" values="#ec4899;#a855f7;#ec4899" dur="2s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="rgba(168, 85, 247, 0.1)"
                strokeWidth="3"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="url(#loading-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="200"
                strokeDashoffset="100"
                className="animate-spin-gradient"
                style={{ transformOrigin: "center" }}
              />
            </svg>
          </div>
        </div>

        {/* Loading text avec animation */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-400 font-medium">Chargement</span>
          <span className="flex gap-1">
            <span className="w-1 h-1 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
