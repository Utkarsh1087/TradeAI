'use client';

import React from 'react';
import {
  Bot,
  ClipboardCheck,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Plug,
} from 'lucide-react';

export function FeaturesSection() {
  const leftFeatures = [
    {
      icon: Bot,
      title: 'Hypothesis Extraction',
      badge: { label: 'Available Now', isUpcoming: false },
      description:
        'Parse conversational market ideas, indicator combinations, and multi-asset logic into testable mathematical conditions.',
    },
    {
      icon: ClipboardCheck,
      title: 'Ambiguity & Edge-Case Flagging',
      badge: { label: 'Available Now', isUpcoming: false },
      description:
        'Identify missing stop-losses, vague lookback periods, unstated trade horizons, and execution biases before backtesting.',
    },
    {
      icon: BookOpen,
      title: 'Market Universe & Regimes',
      badge: { label: 'Available Now', isUpcoming: false },
      description:
        'Categorize instruments across index futures, equities, volatility regimes, and intraday trading sessions with clarity.',
    },
  ];

  const rightFeatures = [
    {
      icon: UserCheck,
      title: 'Interactive Refinement',
      badge: { label: 'Available Now', isUpcoming: false },
      description:
        'Refine entry triggers, take-profit targets, holding periods, and market filters in a real-time copilot workspace.',
    },
    {
      icon: ShieldCheck,
      title: 'Quantitative Guardrails',
      badge: { label: 'Coming Soon', isUpcoming: true },
      description:
        'Flags unstated assumptions & parameter gaps in your spec today. Full automated backtest simulation engine with Deflated Sharpe & overfit testing is coming soon.',
    },
    {
      icon: Plug,
      title: 'Backtest Spec & Code Export',
      badge: { label: 'Coming Soon', isUpcoming: true },
      description:
        'Exports standardized JSON experiment schemas (strategy_spec.json) & Markdown rules today. Auto-generated Python (VectorBT & Backtrader) executable script export is coming soon.',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto pt-6 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8" id="features">
      {/* Title */}
      <div className="text-center mb-14 sm:mb-20 space-y-3">
        {/* Exact Aigocy Pill Badge: • Features */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/80 bg-white/95 shadow-xs text-xs font-semibold text-[#ea2b16] mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ea2b16]" />
          <span>Features</span>
        </div>

        {/* Exact 72px Urbanist Heading */}
        <h2 className="heading-title font-extrabold text-4xl sm:text-6xl lg:text-[72px] text-[#09090B] tracking-[-0.03em] leading-[1.06] mb-3">
          All Features in One
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Everything you need to turn raw market hypotheses into verifiable, production-ready quantitative research experiments.
        </p>
      </div>

      {/* Main Feature Layout matching Aigocy tree architecture */}
      <div className="relative">
        <div className="features-wrap flex-col lg:flex-row justify-between items-center gap-8 lg:gap-0">
          {/* Left Column (No outer sharp overflow wrappers) */}
          <div className="features-col col-left lg:mb-0">
            {leftFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="features-item effectFade fadeUp cursor-pointer"
                  data-delay={idx * 0.15}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="icon-badge !mb-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {feat.badge && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border shadow-2xs ${
                          feat.badge.isUpcoming
                            ? 'bg-amber-50 text-amber-800 border-amber-200/90'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            feat.badge.isUpcoming ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{feat.badge.label}</span>
                      </span>
                    )}
                  </div>
                  <h6 className="title">{feat.title}</h6>
                  <p>{feat.description}</p>
                </div>
              );
            })}
          </div>

          {/* Center Connector & SVG Circuit */}
          <div className="hidden lg:flex items-center justify-center relative flex-1 self-stretch min-h-[750px]">
            {/* SVG Connecting Circuit Branches with True 90-Degree Curves and Wide Horizontal Spacing */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 900"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Static Base Lines */}
              <path
                d="M200 450 H90 Q60 450 60 410 V190 Q60 150 30 150 H0"
                stroke="#e2e8f0"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />
              <path
                d="M200 450 H0"
                stroke="#e2e8f0"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />
              <path
                d="M200 450 H90 Q60 450 60 490 V710 Q60 750 30 750 H0"
                stroke="#e2e8f0"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />

              {/* Left Red Accent Line */}
              <path
                d="M200 450 H80"
                stroke="#ea2b16"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />

              {/* Right Static Base Lines */}
              <path
                d="M200 450 H310 Q340 450 340 410 V190 Q340 150 370 150 H400"
                stroke="#e2e8f0"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />
              <path
                d="M200 450 H400"
                stroke="#e2e8f0"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />
              <path
                d="M200 450 H310 Q340 450 340 490 V710 Q340 750 370 750 H400"
                stroke="#e2e8f0"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />

              {/* Right Red Accent Line */}
              <path
                d="M200 450 H320"
                stroke="#ea2b16"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />

              {/* Animated Solid Orange Pulse Beams (No Blur with Generous Center Card Gap) */}
              <path
                d="M200 450 H90 Q60 450 60 410 V190 Q60 150 30 150 H0"
                stroke="#ff4d2d"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="circuit-pulse-beam"
              />
              <path
                d="M200 450 H0"
                stroke="#ff4d2d"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="circuit-pulse-beam"
                style={{ animationDelay: '0.35s' }}
              />
              <path
                d="M200 450 H90 Q60 450 60 490 V710 Q60 750 30 750 H0"
                stroke="#ff4d2d"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="circuit-pulse-beam"
                style={{ animationDelay: '0.7s' }}
              />

              <path
                d="M200 450 H310 Q340 450 340 410 V190 Q340 150 370 150 H400"
                stroke="#ff4d2d"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="circuit-pulse-beam"
              />
              <path
                d="M200 450 H400"
                stroke="#ff4d2d"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="circuit-pulse-beam"
                style={{ animationDelay: '0.35s' }}
              />
              <path
                d="M200 450 H310 Q340 450 340 490 V710 Q340 750 370 750 H400"
                stroke="#ff4d2d"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="circuit-pulse-beam"
                style={{ animationDelay: '0.7s' }}
              />

              {/* Junction Dots */}
              <circle cx="80" cy="450" r="4" fill="#cbd5e1" />
              <circle cx="320" cy="450" r="4" fill="#cbd5e1" />
            </svg>

            {/* Subtle Ambient Red Glow Behind Middle Card */}
            <div className="absolute w-36 h-30 sm:w-42 sm:h-34 bg-[#ea2b16] opacity-35 blur-[20px] rounded-full pointer-events-none" />

            {/* Glowing Center Hub Badge */}
            <div className="features-center effectFade fadeZoom cursor-pointer">
              <svg
                width="42"
                height="32"
                viewBox="19 24 48 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-md mb-1.5"
              >
                <path
                  d="M43 53.8667C40.7022 55.2267 38.0128 56 35.1667 56C26.5239 56 19.5 48.8267 19.5 40C19.5 31.1733 26.5239 24 35.1667 24C38.0128 24 40.7022 24.7733 43 26.1333C38.3261 28.9067 35.1667 34.08 35.1667 40C35.1667 45.9467 38.3261 51.0933 43 53.8667Z"
                  fill="white"
                />
                <path
                  d="M43 53.8667C45.2978 55.2267 47.9872 56 50.8333 56C59.4761 56 66.5 48.8267 66.5 40C66.5 31.1733 59.4761 24 50.8333 24C47.9872 24 45.2978 24.7733 43 26.1333C47.6739 28.9067 50.8333 34.08 50.8333 40C50.8333 45.9467 47.6739 51.0933 43 53.8667Z"
                  fill="white"
                />
              </svg>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white drop-shadow-xs">
                TradeAI
              </span>
            </div>
          </div>

          {/* Right Column (No outer sharp overflow wrappers) */}
          <div className="features-col col-right">
            {rightFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="features-item effectFade fadeUp cursor-pointer"
                  data-delay={idx * 0.15 + 0.1}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="icon-badge !mb-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {feat.badge && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border shadow-2xs ${
                          feat.badge.isUpcoming
                            ? 'bg-amber-50 text-amber-800 border-amber-200/90'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            feat.badge.isUpcoming ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{feat.badge.label}</span>
                      </span>
                    )}
                  </div>
                  <h6 className="title">{feat.title}</h6>
                  <p>{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
