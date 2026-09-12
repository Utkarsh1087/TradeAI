'use client';

import React, { useState } from 'react';
import { X, Check, Sliders } from 'lucide-react';
import { FinalExperiment } from '@/types/experiment';

interface EditExperimentProps {
  experiment: FinalExperiment;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: FinalExperiment) => void;
}

export function EditExperiment({
  experiment,
  isOpen,
  onClose,
  onSave,
}: EditExperimentProps) {
  const [formData, setFormData] = useState<FinalExperiment>({ ...experiment });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastModified: new Date().toLocaleTimeString(),
    });
    onClose();
  };

  const handleFilterChange = (val: string) => {
    const list = val.split(',').map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, filters: list }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl shadow-xl p-6 sm:p-7 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Edit experiment</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Instrument
              </label>
              <input
                type="text"
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Timeframe
              </label>
              <input
                type="text"
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Entry condition
            </label>
            <input
              type="text"
              value={formData.entryCondition}
              onChange={(e) => setFormData({ ...formData, entryCondition: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Exit condition
              </label>
              <input
                type="text"
                value={formData.exitCondition}
                onChange={(e) => setFormData({ ...formData, exitCondition: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Holding period
              </label>
              <input
                type="text"
                value={formData.holdingPeriod}
                onChange={(e) => setFormData({ ...formData, holdingPeriod: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Filters (comma separated)
            </label>
            <input
              type="text"
              value={formData.filters.join(', ')}
              onChange={(e) => handleFilterChange(e.target.value)}
              placeholder="e.g. High volatility"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Hypothesis
            </label>
            <textarea
              rows={2}
              value={formData.hypothesis}
              onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update experiment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
