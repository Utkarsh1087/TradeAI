'use client';

import React from 'react';
import { Sparkles, HelpCircle, FileCheck2, Cpu } from 'lucide-react';

export function ProductThinkingGuide() {
  const steps = [
    {
      index: '01',
      tag: 'INPUT',
      title: 'Discover & Parse',
      desc: 'You provide a natural-language trading idea or market question. We extract instruments, indicators, and intent.',
      icon: Cpu,
    },
    {
      index: '02',
      tag: 'INFERENCE',
      title: 'Infer Safe Defaults',
      desc: 'Sensible market defaults (e.g. Daily timeframe, standard 5-year sample) are clearly flagged as assumed—never invented.',
      icon: Sparkles,
    },
    {
      index: '03',
      tag: 'GUARDRAILS',
      title: 'Clarify Ambiguities',
      desc: 'Vague terms like "sharp fall" or unspecified holding periods prompt discrete quantitative choices.',
      icon: HelpCircle,
    },
    {
      index: '04',
      tag: 'PRODUCTION',
      title: 'Compile Experiment',
      desc: 'Produces a finalized, structured research experiment ready for Backtrader, VectorBT, or QuantConnect.',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="w-full pt-4">
      {/* Section Header with Authentic Aigocy Badge */}
      <div className="mb-10 text-left sm:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/80 bg-white/95 shadow-xs text-xs font-semibold text-[#ea2b16] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ea2b16]" />
          <span>Process</span>
        </div>
        <h2 className="font-['Urbanist'] text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#09090B] tracking-[-0.03em] leading-tight mb-2">
          From Idea to Experiment
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
          Our four-stage pipeline transforms conversational market questions into mathematically sound, testable strategies.
        </p>
      </div>

      {/* 4 Cards in a Single Row on Desktop with 3D Elevation & Glowing Ambient Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <div
              key={idx}
              data-delay={idx * 0.12}
              className="group relative text-left p-6 sm:p-7 xl:p-8 rounded-[36px] bg-white border border-slate-200/90 hover:border-slate-300/90 transition-all duration-300 flex flex-col justify-between gap-6 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_12px_28px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-2 cursor-pointer overflow-hidden"
              style={{
                boxShadow:
                  '0 1px 2px rgba(0,0,0,0.03), 0 8px 24px -4px rgba(0,0,0,0.04), inset 0 1px 1.5px 0 rgba(255,255,255,1), inset 0 -2px 0 0 rgba(0,0,0,0.02)',
              }}
            >
              {/* Subtle Top Ambient Gradient Hover Effect */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-transparent rounded-full blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Stylized Background Watermark Number on Bottom Right */}
              <span className="absolute bottom-1.5 right-4 sm:right-5 text-[76px] sm:text-[88px] xl:text-[96px] font-black font-['Urbanist'] text-slate-200/90 group-hover:text-red-500/20 transition-all duration-300 pointer-events-none select-none leading-none tracking-tighter z-0">
                {step.index}
              </span>

              <div className="relative z-10">
                {/* 3D Glowing Crimson Icon Badge with Ambient Halo */}
                <div className="relative w-14 h-14 mb-6">
                  {/* Ambient Soft Red Glow */}
                  <div className="absolute -inset-1 bg-[#ea2b16] opacity-35 blur-[12px] rounded-2xl group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Physical 3D Crimson Disc */}
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff4d2d] to-[#ea2b16] text-white flex items-center justify-center shadow-[0_10px_24px_-4px_rgba(234,43,22,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-white/25 group-hover:scale-108 group-hover:rotate-2 transition-all duration-300">
                    <StepIcon className="w-6 h-6 text-white drop-shadow-xs" />
                  </div>
                </div>

                <h3 className="font-['Urbanist'] text-lg sm:text-[20px] font-bold text-[#09090B] group-hover:text-[#ea2b16] transition-colors mb-2.5 tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              {/* Bottom Tag */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100/90 relative z-10">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 group-hover:bg-[#09090B] group-hover:text-white group-hover:border-[#09090B] transition-all duration-300 shadow-2xs">
                  {step.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

