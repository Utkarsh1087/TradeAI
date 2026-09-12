'use client';

import React from 'react';
import { ArrowUpRight, TrendingUp, SlidersHorizontal, Zap, Sparkles } from 'lucide-react';

interface ExampleQuestionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const EXAMPLES = [
  {
    index: '01',
    title: 'Price Action',
    prompt: 'Does buying NIFTY after a 1% fall have an edge?',
    tag: 'Popular',
    tagClass: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
    icon: TrendingUp,
    accentGlow: 'hover:border-amber-200/90',
  },
  {
    index: '02',
    title: 'Regime Filter',
    prompt: 'Does buying NIFTY after a 1% fall work better during high-volatility periods?',
    tag: 'Market Filter',
    tagClass: 'bg-blue-500/10 text-blue-700 border-blue-500/25',
    icon: SlidersHorizontal,
    accentGlow: 'hover:border-blue-200/90',
  },
  {
    index: '03',
    title: 'Mean Reversion',
    prompt: 'Does BANK NIFTY perform better after three consecutive losing days?',
    tag: 'Streak',
    tagClass: 'bg-purple-500/10 text-purple-700 border-purple-500/25',
    icon: Zap,
    accentGlow: 'hover:border-purple-200/90',
  },
  {
    index: '04',
    title: 'AI Clarification',
    prompt: 'Does buying NIFTY after a sharp fall work?',
    tag: 'Clarification Demo',
    tagClass: 'bg-rose-500/10 text-rose-700 border-rose-500/25',
    icon: Sparkles,
    accentGlow: 'hover:border-rose-200/90',
  },
];

export function ExampleQuestions({ onSelect, disabled }: ExampleQuestionsProps) {
  return (
    <div className="w-full pt-2 sm:pt-4">
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full border border-slate-200/90 bg-white shadow-xs text-sm sm:text-base font-bold text-[#09090B]">
          <span className="w-2 h-2 rounded-full bg-[#ea2b16]" />
          <span>Sample Questions</span>
        </div>
        <span className="text-sm sm:text-[15px] text-slate-500 font-medium hidden sm:inline-block">
          Select any prompt to test hypothesis extraction
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 sm:gap-x-10">
        {EXAMPLES.map((example, idx) => {
          const Icon = example.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(example.prompt)}
              className={`group relative text-left p-7 sm:p-8 rounded-[36px] bg-white border border-slate-200/90 ${example.accentGlow} transition-all duration-300 flex flex-col justify-between gap-6 min-h-[220px] sm:min-h-[240px] shadow-[0_2px_10px_rgba(0,0,0,0.03),0_12px_28px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_45px_-10px_rgba(0,0,0,0.1),0_4px_14px_rgba(0,0,0,0.03)] hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden`}
              style={{
                boxShadow:
                  '0 1px 2px rgba(0,0,0,0.03), 0 8px 24px -4px rgba(0,0,0,0.04), inset 0 1px 1.5px 0 rgba(255,255,255,1), inset 0 -2px 0 0 rgba(0,0,0,0.02)',
              }}
            >
              {/* Subtle Ambient Hover Glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-transparent rounded-full blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Top Header inside Card: Category Badge + 3D Obsidian Arrow Action Button */}
              <div className="flex items-center justify-between gap-3 w-full relative z-10">
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${example.tagClass} shadow-2xs`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{example.tag}</span>
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    • {example.title}
                  </span>
                </div>

                {/* 3D Obsidian / Crimson Circle Action Button */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#111215] text-white flex items-center justify-center shrink-0 border border-white/12 shadow-[0_4px_12px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:bg-[#ea2b16] group-hover:border-[#ff735f]/50 group-hover:shadow-[0_8px_22px_-2px_rgba(234,43,22,0.55),inset_0_1px_1.5px_rgba(255,255,255,0.45)] group-hover:scale-105 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </div>
              </div>

              {/* Question Text */}
              <div className="relative z-10 my-auto">
                <h4 className="font-['Urbanist'] text-[18px] sm:text-[20px] font-bold text-[#09090B] group-hover:text-[#ea2b16] transition-colors leading-[1.38] tracking-tight">
                  &ldquo;{example.prompt}&rdquo;
                </h4>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100/90 relative z-10">
                <span className="text-[13px] sm:text-sm font-semibold text-slate-400 group-hover:text-slate-700 transition-colors inline-flex items-center gap-1.5">
                  <span>Load prompt</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

