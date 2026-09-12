'use client';

import React, { useState } from 'react';
import {
  Edit3,
  Copy,
  RotateCcw,
  Check,
  TrendingUp,
  Clock,
  LogIn,
  LogOut,
  Timer,
  SlidersHorizontal,
  HelpCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { FinalExperiment } from '@/types/experiment';

interface ExperimentCardProps {
  experiment: FinalExperiment;
  onEdit: () => void;
  onReset: () => void;
}

export function ExperimentCard({ experiment, onEdit, onReset }: ExperimentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const text = `# Experiment: ${experiment.instrument}

MARKET: ${experiment.instrument}
TIMEFRAME: ${experiment.timeframe}
ENTRY CONDITION: ${experiment.entryCondition}
EXIT CONDITION: ${experiment.exitCondition}
HOLDING PERIOD: ${experiment.holdingPeriod}
FILTERS: ${experiment.filters.join(', ') || 'None'}
TEST PERIOD: ${experiment.testPeriod || 'Not specified'}

QUESTION:
${experiment.researchQuestion}

HYPOTHESIS:
${experiment.hypothesis}

ASSUMPTIONS:
${experiment.assumptions.map((a) => `• ${a}`).join('\n')}

MISSING INFORMATION:
${
  experiment.missingInformation.length > 0
    ? experiment.missingInformation.map((m) => `• ${m}`).join('\n')
    : '• None'
}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full aigocy-card overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-50/90 p-6 sm:p-8 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="aigocy-badge mb-2.5">
            <span className="aigocy-badge-dot"></span>
            <span>Experiment Specification Ready</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] tracking-tight">
            {experiment.instrument} Research Plan
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="aigocy-btn-secondary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Parameters</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="aigocy-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Spec'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Research Question & Hypothesis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 sm:p-6 rounded-[24px] bg-slate-50/80 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Research Question
            </span>
            <p className="text-sm sm:text-base font-semibold text-[#09090B] leading-relaxed">
              {experiment.researchQuestion}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-[24px] bg-slate-50/80 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Working Hypothesis
            </span>
            <p className="text-sm sm:text-base font-semibold text-[#09090B] leading-relaxed">
              {experiment.hypothesis}
            </p>
          </div>
        </div>

        {/* Structured Spec Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bold">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>MARKET</span>
            </div>
            <div className="text-base font-bold text-[#09090B]">{experiment.instrument}</div>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bold">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>TIMEFRAME</span>
            </div>
            <div className="text-base font-bold text-[#09090B]">{experiment.timeframe}</div>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bold">
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>ENTRY CONDITION</span>
            </div>
            <div className="text-base font-bold text-[#09090B]">{experiment.entryCondition}</div>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bold">
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>EXIT CONDITION</span>
            </div>
            <div className="text-base font-bold text-[#09090B]">{experiment.exitCondition}</div>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bold">
              <Timer className="w-4 h-4 text-amber-600" />
              <span>HOLDING PERIOD</span>
            </div>
            <div className="text-base font-bold text-[#09090B]">{experiment.holdingPeriod}</div>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bold">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              <span>FILTERS</span>
            </div>
            <div className="text-base font-bold text-[#09090B]">
              {experiment.filters.length > 0 ? experiment.filters.join(', ') : 'None'}
            </div>
          </div>
        </div>

        {/* Assumptions & Residual Missing info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-5 sm:p-6 rounded-[24px] bg-amber-50/40 border border-amber-200/90">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>Assumptions Documented</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-amber-950">
              {experiment.assumptions.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 sm:p-6 rounded-[24px] bg-slate-50/80 border border-slate-200/90">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>Residual Missing Details</span>
            </h4>
            {experiment.missingInformation.length > 0 ? (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {experiment.missingInformation.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-emerald-700 font-semibold">
                • None remaining — Ready for backtesting engine
              </p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start new question</span>
          </button>

          <button
            onClick={onEdit}
            className="aigocy-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Experiment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
