import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Couleurs principales du design
        dark: {
          950: "#0a0a0f", // Fond principal
          900: "#0d0d12",
          850: "#101016",
          800: "#13131a", // Cards background
          700: "#1a1a24",
          600: "#1e1e2e", // Borders
          500: "#2a2a3c",
          400: "#3a3a4c",
        },
        // Accents
        accent: {
          purple: "#a855f7",
          pink: "#ec4899",
          cyan: "#22d3ee",
          blue: "#3b82f6",
        },
        // Statuts
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        // Texte
        text: {
          primary: "#ffffff",
          secondary: "#6b7280",
          muted: "#4b5563",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        "glow-purple": "0 0 40px rgba(168, 85, 247, 0.15)",
        "glow-pink": "0 0 40px rgba(236, 72, 153, 0.15)",
        "glow-cyan": "0 0 40px rgba(34, 211, 238, 0.15)",
        "glow-success": "0 0 40px rgba(16, 185, 129, 0.15)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
        "spin-slow": "spin 3s linear infinite",
        "progress": "progress 1s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        progress: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "var(--progress-value)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
