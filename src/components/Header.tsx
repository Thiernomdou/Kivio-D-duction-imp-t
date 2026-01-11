"use client";

import { LogIn } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onLogoClick: () => void;
  onSignIn: () => void;
  showSignIn?: boolean;
}

export default function Header({ onLogoClick, onSignIn, showSignIn = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" onClick={onLogoClick} />

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {showSignIn && (
              <button
                onClick={onSignIn}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 border border-white/10"
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
