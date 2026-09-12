'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, CornerDownLeft } from 'lucide-react';
import { ExampleQuestions } from './ExampleQuestions';

interface QuestionInputProps {
  question: string;
  setQuestion: (q: string) => void;
  onAnalyze: (customQuestion?: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export function QuestionInput({
  question,
  setQuestion,
  onAnalyze,
  isLoading,
  error,
}: QuestionInputProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [scrollY, setScrollY] = useState(0);

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const qToSubmit = (customQ || question).trim();
    if (!qToSubmit) {
      setLocalError('Please enter a trading question first.');
      return;
    }
    setLocalError(null);
    onAnalyze(qToSubmit);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectExample = (prompt: string) => {
    setQuestion(prompt);
    setLocalError(null);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const displayError = error || localError;

  return (
    <section className="w-full max-w-4xl mx-auto pt-10 sm:pt-14 pb-4 sm:pb-6 section-hero">
      {/* Aigocy Exact Hero Header Structure */}
      <div className="text-center space-y-4 mb-10">
        {/* Sub Pill Badge with Aigocy SVG Sparkle */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/80 bg-white/95 shadow-xs text-xs font-semibold text-slate-800">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path
              d="M3.53252 12.0966C3.75106 11.5025 4.59108 11.5025 4.81645 12.0966L5.54037 14.0567C5.60866 14.2411 5.75891 14.3913 5.9433 14.4596L7.90335 15.1835C8.49751 15.4021 8.49751 16.2421 7.90335 16.4674L5.9433 17.1914C5.75891 17.2597 5.60866 17.4099 5.54037 17.5943L4.81645 19.5543C4.59791 20.1485 3.75789 20.1485 3.53252 19.5543L2.8086 17.5943C2.74031 17.4099 2.59006 17.2597 2.40566 17.1914L0.44562 16.4674C-0.14854 16.2489 -0.14854 15.4089 0.44562 15.1835L2.40566 14.4596C2.59006 14.3913 2.74031 14.2411 2.8086 14.0567L3.53252 12.0966Z"
              fill="url(#sparkle_gradient_1)"
            />
            <path
              d="M11.4068 0.670991C11.7346 -0.223664 12.9981 -0.223664 13.3259 0.670991L14.7874 4.61157C14.8898 4.89157 15.1152 5.11011 15.3952 5.21938L19.3358 6.68088C20.2304 7.00869 20.2304 8.27214 19.3358 8.59995L15.3952 10.0614C15.1152 10.1639 14.8967 10.3893 14.7874 10.6693L13.3259 14.6098C12.9981 15.5045 11.7346 15.5045 11.4068 14.6098L9.94534 10.6693C9.8429 10.3893 9.61753 10.1707 9.33752 10.0614L5.39694 8.59995C4.50229 8.27214 4.50229 7.00869 5.39694 6.68088L9.33752 5.21938C9.61753 5.11694 9.83607 4.89157 9.94534 4.61157L11.4068 0.670991Z"
              fill="url(#sparkle_gradient_2)"
            />
            <defs>
              <linearGradient id="sparkle_gradient_1" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EA2B16" />
                <stop offset="100%" stopColor="#FF3B26" />
              </linearGradient>
              <linearGradient id="sparkle_gradient_2" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EA2B16" />
                <stop offset="100%" stopColor="#FF3B26" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-[#ea2b16]">AI-Driven Trading Assistant</span>
        </div>

        {/* Display Title with Exact Aigocy Sizing & 3D Title-Icon Pill */}
        <h1 className="title text-display-2 flex flex-col items-center justify-center text-center max-w-full">
          <span className="title1 font-['Urbanist'] font-bold text-gradient-1 text-4xl sm:text-6xl md:text-7xl lg:text-[78px] xl:text-[86px] tracking-[-0.03em] leading-[1.05] block">
            Turn Market Ideas
          </span>
          <div className="title2 inline-flex flex-nowrap items-center justify-center mt-2 sm:mt-3 whitespace-nowrap">
            <span className="font-['Urbanist'] font-bold text-gradient-1 text-4xl sm:text-6xl md:text-7xl lg:text-[78px] xl:text-[86px] tracking-[-0.03em] leading-[1.05]">
              into Experiments
            </span>
            
            {/* Exact Aigocy Title Icon Pill with Floating Vector Cards */}
            <div className="title-icon select-none">
              <div className="box"></div>
              <div className="title-icon-wrap">
                <img
                  className="img-1 img-transform-3"
                  src="/images/hero-1.svg"
                  alt="Feature 1"
                />
                <div
                  className="img-2-wrap"
                  style={{ transform: `translate3d(${scrollY * 0.12}px, ${scrollY * -0.1}px, 0px)` }}
                >
                  <img
                    className="img-2 img-transform-3"
                    src="/images/hero-2.svg"
                    alt="Feature 2"
                  />
                </div>
                <div
                  className="img-3-wrap"
                  style={{ transform: `translate3d(${scrollY * 0.08}px, ${scrollY * 0.38}px, 0px)` }}
                >
                  <img
                    className="img-3 img-transform-3"
                    src="/images/hero-3.svg"
                    alt="Feature 3"
                  />
                </div>
              </div>
            </div>
          </div>
        </h1>

        {/* Subtitle Paragraph */}
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed pt-2">
          Describe your trading hypothesis in your way. We&apos;ll extract parameters,
          <br className="hidden sm:inline" />
          {' '}flag ambiguities, and compile a testable research experiment.
        </p>

        {/* Quick Jump Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <a
            href="#research-question-input"
            className="aigocy-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <span>Start Analyzing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#examples"
            className="aigocy-btn-secondary px-6 py-2.5 text-xs font-bold"
          >
            Explore Examples
          </a>
        </div>
      </div>

      {/* Input Box Card with Aigocy Glass Styling */}
      <form
        onSubmit={handleSubmit}
        className="aigocy-glass-card p-5 sm:p-7 transition-all duration-200 mt-6"
      >
        <label htmlFor="research-question-input" className="sr-only">
          Trading Research Question
        </label>
        
        <textarea
          ref={textareaRef}
          id="research-question-input"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (localError) setLocalError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={3}
          placeholder="e.g. Does buying NIFTY after a 1% fall work better during high-volatility periods?"
          className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base sm:text-lg resize-none focus:outline-none leading-relaxed"
        />

        {displayError && (
          <div className="mt-3 mb-2 flex items-center gap-2 text-rose-700 text-xs sm:text-sm bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-2xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>{question.length} / 1000 characters</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <CornerDownLeft className="w-3 h-3" />
              <span>Press Enter to analyze</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {question && (
              <button
                type="button"
                onClick={() => setQuestion('')}
                disabled={isLoading}
                className="aigocy-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="aigocy-btn-primary px-7 py-3 text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>{isLoading ? 'Analyzing...' : 'Analyze question'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>

      {/* Examples Grid */}
      <div className="mt-20 sm:mt-24 lg:mt-28" id="examples">
        <ExampleQuestions onSelect={handleSelectExample} disabled={isLoading} />
      </div>

      {/* Aigocy Scroll-More Indicator */}
      <div className="flex justify-center pt-6">
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <span>Scroll for methodology & workflow</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-90 group-hover:translate-y-0.5 transition-transform text-[#ea2b16]" />
        </a>
      </div>
    </section>
  );
}
