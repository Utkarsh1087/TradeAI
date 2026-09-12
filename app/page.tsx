'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { QuestionInput } from '@/components/QuestionInput';
import { FeaturesSection } from '@/components/FeaturesSection';
import { ProductThinkingGuide } from '@/components/ProductThinkingGuide';

export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleAnalyze = (customQ?: string) => {
    const qToAnalyze = (customQ || question).trim();
    if (!qToAnalyze) {
      setError('Please enter a research question first.');
      return;
    }
    setError(null);
    setIsTransitioning(true);
    router.push(`/results?q=${encodeURIComponent(qToAnalyze)}`);
  };

  const handleReset = () => {
    setQuestion('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#edecec] p-3 sm:p-5 lg:p-6 selection:bg-slate-900 selection:text-white relative">
      {/* Top Glowing Laser Line during transition */}
      {isTransitioning && <div className="laser-loader-bar" />}

      {/* Aigocy Main Framed Canvas with Rounded Vertices & Screen Gap */}
      <div className={`aigocy-page-frame flex flex-col pt-3 pb-10 transition-all duration-300 ${isTransitioning ? 'opacity-85 scale-[0.995]' : ''}`}>
        {/* Aigocy Hero Image Background Layer */}
        <div className="hero-image" />

        <Header
          hasActiveExperiment={false}
          onReset={handleReset}
        />

        <main className="flex-1 max-w-7xl xl:max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 sm:space-y-10 relative z-10">
          {/* Hero Section with Question Input & Examples */}
          <QuestionInput
            question={question}
            setQuestion={setQuestion}
            onAnalyze={handleAnalyze}
            isLoading={isTransitioning}
            error={error}
          />

          {/* All Features in One Section */}
          <FeaturesSection />

          {/* How It Works / Process Guide */}
          <div className="pt-2 w-full mx-auto" id="how-it-works">
            <ProductThinkingGuide />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-xs sm:text-sm mt-8 relative z-10">
          <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 text-slate-500 font-medium">
            <span className="font-bold text-slate-800">ResearchAI</span>
            <span className="text-slate-300">•</span>
            <span>AI Trading Research Assistant</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">From trading idea to structured experiment</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
