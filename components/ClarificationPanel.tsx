'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { ClarificationQuestion } from '@/types/experiment';

interface ClarificationPanelProps {
  questions: ClarificationQuestion[];
  onBuildExperiment: (clarifications: Record<string, string>) => void;
  isSubmitting?: boolean;
}

export function ClarificationPanel({
  questions,
  onBuildExperiment,
  isSubmitting,
}: ClarificationPanelProps) {
  const [selections, setSelections] = useState<Record<string, { mode: 'preset' | 'custom'; value: string }>>(() => {
    const initial: Record<string, { mode: 'preset' | 'custom'; value: string }> = {};
    questions.forEach((q) => {
      if (q.options.length > 0) {
        initial[q.id] = { mode: 'preset', value: q.options[0].value };
      } else {
        initial[q.id] = { mode: 'custom', value: '' };
      }
    });
    return initial;
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectPreset = (questionId: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [questionId]: { mode: 'preset', value },
    }));
    setValidationError(null);
  };

  const handleSelectCustomMode = (questionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [questionId]: {
        mode: 'custom',
        value: prev[questionId]?.mode === 'custom' ? prev[questionId].value : '',
      },
    }));
    setValidationError(null);
  };

  const handleCustomTextChange = (questionId: string, text: string) => {
    setSelections((prev) => ({
      ...prev,
      [questionId]: { mode: 'custom', value: text.slice(0, 100) },
    }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const resolved: Record<string, string> = {};

    for (const q of questions) {
      const entry = selections[q.id];
      if (entry?.mode === 'custom') {
        const customText = entry.value.trim();
        if (!customText) {
          setValidationError(`Please enter a custom value for: "${q.question}" or choose one of the preset options.`);
          return;
        }
        resolved[q.id] = customText;
      } else {
        resolved[q.id] = entry?.value?.trim() || (q.options[0]?.value ?? 'Custom defined');
      }
    }

    onBuildExperiment(resolved);
  };

  return (
    <div className="w-full aigocy-card p-6 sm:p-8">
      <div className="pb-5 border-b border-slate-100 mb-6">
        <div className="aigocy-badge mb-3">
          <span className="aigocy-badge-dot"></span>
          <span>Clarification Needed</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#09090B] tracking-tight">
          Before we compile the experiment...
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Please clarify a few parameters to make this trading strategy quantifiable and testable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q) => {
          const currentSelection = selections[q.id] || { mode: 'preset', value: '' };

          return (
            <div
              key={q.id}
              className="p-5 sm:p-6 rounded-[24px] bg-slate-50/70 border border-slate-200/90 space-y-4"
            >
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#09090B]">
                  {q.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                {q.options.map((opt, optIndex) => {
                  const isSelected =
                    currentSelection.mode === 'preset' && currentSelection.value === opt.value;

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectPreset(q.id, opt.value)}
                      className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#09090B] border-[#09090B] text-white shadow-md font-bold'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-white bg-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#09090B]" />}
                        </div>
                        <span className="text-xs sm:text-sm">{opt.label}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Custom Option */}
                {q.allowCustom !== false && (
                  <button
                    type="button"
                    onClick={() => handleSelectCustomMode(q.id)}
                    className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      currentSelection.mode === 'custom'
                        ? 'bg-[#09090B] border-[#09090B] text-white shadow-md font-bold'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          currentSelection.mode === 'custom'
                            ? 'border-white bg-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {currentSelection.mode === 'custom' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#09090B]" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm">Custom specification</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Custom Input Field if active */}
              {currentSelection.mode === 'custom' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={currentSelection.value}
                    onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                    placeholder="Enter custom value (e.g., 2.5%, 5 bars, etc.)..."
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-[#09090B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    autoFocus
                  />
                </div>
              )}
            </div>
          );
        })}

        {validationError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Build Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="aigocy-btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>Build Experiment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
