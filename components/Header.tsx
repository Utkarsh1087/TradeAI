'use client';

import React, { useState } from 'react';
import { RotateCcw, Menu, X } from 'lucide-react';

interface HeaderProps {
  hasActiveExperiment?: boolean;
  onReset?: () => void;
  isMockFallback?: boolean;
}

export function Header({ hasActiveExperiment = false, onReset }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-5 z-50 px-4 sm:px-6 w-full max-w-4xl mx-auto">
      {/* Main Glassmorphic Navigation Pill Bar */}
      <div className="aigocy-nav-pill w-full px-4 sm:pl-6 sm:pr-2 py-2 flex items-center justify-between gap-4">
        {/* Logo Site */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/images/logo-2.svg"
            alt="TradeAI Logo"
            className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-[19px] text-[#09090B] tracking-tight font-urbanist">
            TradeAI
          </span>
        </a>

        {/* Box Navigation (Desktop) - Fonts, Underline, Exact Spacing */}
        <nav className="hidden md:flex items-center justify-center">
          <ul className="flex items-center gap-8 text-[15px] font-semibold list-none m-0 p-0 text-[#09090B]">
            <li>
              <a
                href="/"
                className="relative py-1 text-[#fd3a25] font-bold transition-colors block group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#fd3a25] rounded-full" />
              </a>
            </li>
            <li>
              <a
                href="/#features"
                className="py-1 text-slate-700 hover:text-[#09090B] transition-colors block"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="/#how-it-works"
                className="py-1 text-slate-700 hover:text-[#09090B] transition-colors block"
              >
                How It Works
              </a>
            </li>
          </ul>
        </nav>

        {/* Action Button (Exact 3D Aigocy Dark Button) */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveExperiment && onReset ? (
            <button
              onClick={onReset}
              className="tf-nav-btn text-[14px] sm:text-[15px] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300 mr-1.5" />
              <span>Start New Question</span>
            </button>
          ) : (
            <a
              href="/#research-question-input"
              className="tf-nav-btn text-[14px] sm:text-[15px] cursor-pointer"
            >
              <span>Test an Idea</span>
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100/80 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-4 right-4 p-4 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl space-y-2.5 animate-fadeIn z-50">
          <a
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-[#fd3a25] bg-red-50/60"
          >
            Home
          </a>
          <a
            href="/#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </a>
        </div>
      )}
    </header>
  );
}

