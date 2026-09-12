'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditExperiment } from '@/components/EditExperiment';
import { ExperimentAnalysis, FinalExperiment, ParameterStatus, ExtractedConcept } from '@/types/experiment';
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Edit3,
  Copy,
  Check,
  TrendingUp,
  Clock,
  LogIn,
  LogOut,
  Timer,
  SlidersHorizontal,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Send,
  Bot,
  User,
  MessageSquare,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  chips?: string[];
  isStreaming?: boolean;
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ExperimentAnalysis | null>(null);
  const [finalExperiment, setFinalExperiment] = useState<FinalExperiment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chat conversation state - Pre-seed with initial question so user message is visible instantly on load
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (!initialQuery) return [];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: `msg_user_initial`,
        sender: 'user',
        text: initialQuery,
        timestamp: timeStr,
      },
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const streamingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clarification state
  const [clarifications, setClarifications] = useState<Record<string, { mode: 'preset' | 'custom'; value: string }>>({});
  const [clarificationError, setClarificationError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const STAGE_LABELS = [
    'Detecting instrument & market timeframe...',
    'Extracting quantitative entry & exit rules...',
    'Parsing filters & volatility regimes...',
    'Synthesizing formal research hypothesis...',
  ];

  const generateShortResponse = (data: ExperimentAnalysis) => {
    const hasAmbiguity = data.clarificationNeeded && data.clarificationQuestions.length > 0;
    if (hasAmbiguity) {
      return `I parsed your hypothesis for **${data.instrument}** on **${data.timeframe}** timeframe. However, "${data.clarificationQuestions[0]?.question || 'some parameters'}" is ambiguous. Please select a threshold on the left to compile the experiment.`;
    }
    return `Structured your experiment for **${data.instrument}** (${data.timeframe}) with entry on **${data.entryCondition}** and holding period of **${data.holdingPeriod}**. The strategy plan is ready for backtesting.`;
  };

  const getDynamicContextChips = (
    analysisData: ExperimentAnalysis | null,
    finalExp: FinalExperiment | null,
    contextStage: 'initial' | 'holding_changed' | 'timeframe_changed' | 'stoploss_changed' | 'clarified'
  ): string[] => {
    const inst = finalExp?.instrument || analysisData?.instrument || 'NIFTY';
    const tf = (finalExp?.timeframe || analysisData?.timeframe || 'Daily').toLowerCase();
    const holding = (finalExp?.holdingPeriod || analysisData?.holdingPeriod || '3 trading days').toLowerCase();
    const exit = (finalExp?.exitCondition || analysisData?.exitCondition || '').toLowerCase();
    const filters = ((finalExp?.filters || analysisData?.filters || []).join(' ')).toLowerCase();

    if (contextStage === 'holding_changed') {
      const chips: string[] = [];
      chips.push(tf.includes('daily') ? '+ Switch to 1-Hour timeframe' : '+ Switch to Daily timeframe');
      chips.push(exit.includes('stop') ? '+ Add 3% Take Profit' : '+ Add 2% Stop Loss');
      chips.push(`+ Compare vs Buy & Hold ${inst}`);
      return chips;
    }

    if (contextStage === 'timeframe_changed') {
      const chips: string[] = [];
      chips.push(holding.includes('5') ? '+ Test on 3-day swing' : '+ Test on 5-day holding');
      chips.push(filters.includes('volatility') ? '+ Filter: RSI < 30 Oversold' : '+ Filter: India VIX > 20');
      chips.push('+ Add 2% Stop Loss');
      return chips;
    }

    if (contextStage === 'stoploss_changed') {
      return [
        '+ Add 3% Take Profit Target',
        '+ Test on 10-day continuation',
        '+ Switch to 1-Hour timeframe',
      ];
    }

    if (contextStage === 'clarified') {
      return [
        '+ Test on 5-day holding',
        '+ Add 2% Stop Loss',
        `+ Compare vs Buy & Hold ${inst}`,
      ];
    }

    // Initial stage: contextual to instrument & ambiguity
    const chips: string[] = [];
    const isCrypto = ['btc', 'eth', 'bitcoin', 'crypto'].some((c) => inst.toLowerCase().includes(c));
    const isStock = ['reliance', 'tcs', 'hdfc', 'infy', 'apple', 'tsla'].some((s) => inst.toLowerCase().includes(s));

    if (isCrypto) {
      chips.push('+ Switch to 4-Hour timeframe');
      chips.push('+ Add 4% Trailing Stop');
      chips.push('+ Test on 7-day holding');
    } else if (isStock) {
      chips.push('+ Test on 5-day holding');
      chips.push('+ Add 1.5% Stop Loss');
      chips.push(`+ Filter: Earnings season only`);
    } else {
      // Default index (NIFTY, BANK NIFTY, SPY)
      chips.push(holding.includes('5') ? '+ Test on 3-day swing' : '+ Test on 5-day holding');
      chips.push(tf.includes('1-hour') ? '+ Switch to Daily timeframe' : '+ Switch to 1-Hour timeframe');
      chips.push(filters.includes('volatility') ? '+ Add 2% Stop Loss' : '+ Filter: India VIX > 20');
    }

    return chips;
  };

  const streamAiMessage = (fullText: string, chips: string[] = [], onComplete?: () => void) => {
    if (streamingTimerRef.current) {
      clearInterval(streamingTimerRef.current);
    }

    const aiTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `msg_ai_${Date.now()}`;

    // Add initial streaming message
    setChatMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: 'assistant',
        text: '',
        timestamp: aiTimeStr,
        isStreaming: true,
      },
    ]);

    const words = fullText.split(' ');
    let currentWordIndex = 0;

    streamingTimerRef.current = setInterval(() => {
      currentWordIndex += 1;
      if (currentWordIndex >= words.length) {
        if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, text: fullText, chips, isStreaming: false } : m
          )
        );
        if (onComplete) onComplete();
      } else {
        const textChunk = words.slice(0, currentWordIndex).join(' ');
        setChatMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: textChunk } : m))
        );
      }
    }, 40); // 40ms per word for natural conversational cadence
  };

  const performAnalysis = async (queryText: string, isFromChat = false) => {
    const q = queryText.trim();
    if (!q) {
      setError('Please enter a research question first.');
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (stageTimerRef.current) {
      clearInterval(stageTimerRef.current);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setAnalysisStage(0);
    setError(null);
    if (!isFromChat) {
      setAnalysis(null);
      setFinalExperiment(null);
    }
    setClarifications({});
    setClarificationError(null);

    // If from chat, append user message (initial query is already seeded in initial state)
    if (isFromChat) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_user_${Date.now()}`,
          sender: 'user',
          text: q,
          timestamp: timeStr,
        },
      ]);
    }

    // Step through stages every 450ms for visible AI thinking progression
    let currentStage = 0;
    stageTimerRef.current = setInterval(() => {
      currentStage = (currentStage + 1) % STAGE_LABELS.length;
      setAnalysisStage(currentStage);
    }, 450);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'We could not analyze the question right now. Please try again.');
      }

      const receivedAnalysis: ExperimentAnalysis = data.analysis;

      // Pacing: ensure minimum 1800ms thinking time so the 3-dot thinking bubble & stages are clearly seen
      const elapsed = Date.now() - startTime;
      if (elapsed < 1800) {
        await new Promise((r) => setTimeout(r, 1800 - elapsed));
      }

      if (stageTimerRef.current) {
        clearInterval(stageTimerRef.current);
      }

      setAnalysis(receivedAnalysis);

      // Initialize clarification selections
      const initialClarify: Record<string, { mode: 'preset' | 'custom'; value: string }> = {};
      receivedAnalysis.clarificationQuestions.forEach((cq) => {
        if (cq.options.length > 0) {
          initialClarify[cq.id] = { mode: 'preset', value: cq.options[0].value };
        } else {
          initialClarify[cq.id] = { mode: 'custom', value: '' };
        }
      });
      setClarifications(initialClarify);

      // Transition out of loading state
      setIsLoading(false);
      setIsChatSending(false);

      // Stream assistant response word-by-word
      const responseText = generateShortResponse(receivedAnalysis);
      const dynamicChips = getDynamicContextChips(receivedAnalysis, null, 'initial');

      streamAiMessage(responseText, dynamicChips, () => {
        // Auto-compile experiment smoothly after typewriter completes
        if (!receivedAnalysis.clarificationNeeded || receivedAnalysis.clarificationQuestions.length === 0) {
          const autoExperiment: FinalExperiment = {
            id: `exp_${Date.now()}`,
            originalQuestion: receivedAnalysis.originalQuestion,
            instrument: receivedAnalysis.instrument,
            timeframe: receivedAnalysis.timeframe,
            entryCondition: receivedAnalysis.entryCondition,
            exitCondition:
              receivedAnalysis.exitCondition !== 'Not specified'
                ? receivedAnalysis.exitCondition
                : 'Close at holding period expiry',
            holdingPeriod:
              receivedAnalysis.holdingPeriod !== 'Not specified'
                ? receivedAnalysis.holdingPeriod
                : '3 trading days (Standard default)',
            filters: receivedAnalysis.filters,
            testPeriod: '2019 - 2024 (5-Year Historical Sample)',
            researchQuestion: receivedAnalysis.researchQuestion,
            hypothesis: receivedAnalysis.hypothesis,
            assumptions: receivedAnalysis.assumptions,
            missingInformation: receivedAnalysis.missingInformation,
            confidence: receivedAnalysis.confidence,
          };
          setFinalExperiment(autoExperiment);
        }
      });
    } catch (err: any) {
      if (stageTimerRef.current) {
        clearInterval(stageTimerRef.current);
      }
      if (err.name === 'AbortError') return;
      setError(err?.message || 'We could not analyze the question right now. Please try again.');
      setIsLoading(false);
      setIsChatSending(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setInputQuery(initialQuery);
      performAnalysis(initialQuery, false);
    } else {
      setIsLoading(false);
    }

    return () => {
      abortControllerRef.current?.abort();
      if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    };
  }, [initialQuery]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const handleChatSubmit = (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msg = (customMsg || chatInput).trim();
    if (!msg || isChatSending || isLoading) return;

    setChatInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Check for simple conversational acknowledgments / greetings
    const lower = msg.toLowerCase();
    const conversationalPhrases = ['ok', 'okay', 'yes', 'no', 'hi', 'hello', 'hey', 'thanks', 'thank you', 'got it', 'great', 'cool', 'perfect', 'nice', 'sure', 'fine'];

    if (conversationalPhrases.includes(lower) || (lower.length <= 3 && !['btc', 'spy', 'eth', 'tcs'].includes(lower))) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_user_${Date.now()}`,
          sender: 'user',
          text: msg,
          timestamp: timeStr,
        },
      ]);
      setIsChatSending(true);
      setTimeout(() => {
        setIsChatSending(false);
        streamAiMessage(
          `Got it! You can explore the parameters on the left, select clarification options to compile, or ask to tweak rules (e.g. "Test on 5-day holding" or "Add a 2% stop loss").`,
          ['Test on 5-day holding', 'Switch to 1-Hour timeframe', 'Add 2% Stop Loss']
        );
      }, 400);
      return;
    }

    // 2. Check for parameter modifier chips & refinements (e.g. "Test on 5-day holding", "Switch to 1-Hour timeframe", "Add 2% Stop Loss")
    const isHoldingTweak = lower.includes('5-day') || lower.includes('5 day') || lower.includes('10-day') || lower.includes('holding');
    const isTimeframeTweak = lower.includes('1-hour') || lower.includes('1 hour') || lower.includes('intraday') || lower.includes('timeframe');
    const isStopLossTweak = lower.includes('stop loss') || lower.includes('stoploss') || lower.includes('target');

    if ((isHoldingTweak || isTimeframeTweak || isStopLossTweak) && analysis) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_user_${Date.now()}`,
          sender: 'user',
          text: msg,
          timestamp: timeStr,
        },
      ]);
      setIsChatSending(true);

      const targetInstrument = finalExperiment?.instrument || analysis.instrument || 'NIFTY';
      let tweakSummary = '';

      if (isHoldingTweak) {
        const days = lower.includes('10') ? '10 trading days' : lower.includes('1') ? '1 trading day' : '5 trading days';
        tweakSummary = `Updated holding period to **${days}** for **${targetInstrument}**.`;
        
        if (finalExperiment) {
          setFinalExperiment({
            ...finalExperiment,
            holdingPeriod: days,
            hypothesis: `Purchasing ${finalExperiment.instrument} on ${finalExperiment.entryCondition} exhibits a positive post-entry drift over the subsequent ${days} window.`,
            lastModified: new Date().toLocaleTimeString(),
          });
        }
      } else if (isTimeframeTweak) {
        const tf = lower.includes('1-hour') || lower.includes('1 hour') ? '1-Hour (60m)' : lower.includes('intraday') ? 'Intraday (5m)' : 'Daily';
        tweakSummary = `Switched execution timeframe to **${tf}** for **${targetInstrument}**.`;
        
        if (finalExperiment) {
          setFinalExperiment({
            ...finalExperiment,
            timeframe: tf,
            lastModified: new Date().toLocaleTimeString(),
          });
        }
      } else if (isStopLossTweak) {
        tweakSummary = `Added **2.0% Fixed Stop-Loss** risk protection to **${targetInstrument}**.`;
        
        if (finalExperiment) {
          setFinalExperiment({
            ...finalExperiment,
            exitCondition: `${finalExperiment.exitCondition} or 2% Stop Loss`,
            lastModified: new Date().toLocaleTimeString(),
          });
        }
      }

      setTimeout(() => {
        setIsChatSending(false);
        streamAiMessage(
          `${tweakSummary} Specification updated on the left.`,
          ['+ Test on 10-day holding', '+ Switch to Daily timeframe', '+ Add 3% Take Profit']
        );
      }, 450);
      return;
    }

    // 3. Otherwise process as research query with context preservation if instrument is omitted
    setIsChatSending(true);
    let fullQuery = msg;
    const hasInstrument = ['nifty', 'bank', 'reliance', 'btc', 'eth', 'spy', 'tcs', 'hdfc', 'gold', 'crude', 'stock'].some((kw) => lower.includes(kw));
    if (!hasInstrument && analysis?.instrument && analysis.instrument !== 'Not specified') {
      fullQuery = `For ${analysis.instrument}: ${msg}`;
    }

    setInputQuery(fullQuery);
    performAnalysis(fullQuery, true);
  };

  const handleCompileClarifications = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis) return;
    setClarificationError(null);

    const resolved: Record<string, string> = {};

    for (const q of analysis.clarificationQuestions) {
      const entry = clarifications[q.id];
      if (entry?.mode === 'custom') {
        const customText = entry.value.trim();
        if (!customText) {
          setClarificationError(`Please specify a value for: "${q.question}"`);
          return;
        }
        resolved[q.id] = customText;
      } else {
        resolved[q.id] = entry?.value?.trim() || (q.options[0]?.value ?? 'Standard parameter');
      }
    }

    const cleanText = (val: string) => {
      if (!val) return val;
      const map: Record<string, string> = {
        same_day: 'End of same trading day',
        next_day: 'End of next trading day',
        '1_day': '1 trading day',
        '3_days': '3 trading days',
        '5_days': '5 trading days',
        '10_days': '10 trading days',
      };
      return map[val] || val;
    };

    let updatedEntry = analysis.entryCondition;
    let updatedHolding = analysis.holdingPeriod;
    let updatedExit = analysis.exitCondition;
    let updatedTimeframe = analysis.timeframe;
    let updatedFilters = [...analysis.filters];

    Object.entries(resolved).forEach(([qId, rawVal]) => {
      const val = cleanText(rawVal);
      const qObj = analysis.clarificationQuestions.find((q) => q.id === qId);
      const field = qObj?.field || '';
      const qText = qObj?.question?.toLowerCase() || '';

      if (field === 'timeframe' || qText.includes('timeframe')) {
        updatedTimeframe = val;
      } else if (field === 'entryCondition' || qText.includes('fall') || qText.includes('dip')) {
        updatedEntry = `${analysis.instrument} falls by >= ${val} in a single session`;
      } else if (field === 'holdingPeriod' || qText.includes('holding') || qText.includes('how long')) {
        updatedHolding = val;
        if (updatedExit === 'Not specified') {
          updatedExit = `Close position after ${val}`;
        }
      } else if (field === 'exitCondition' || qText.includes('closed') || qText.includes('exit')) {
        updatedExit = val;
      } else if (field === 'filters' || qText.includes('volatility') || qText.includes('regime')) {
        updatedFilters = updatedFilters.filter((f) => !f.toLowerCase().includes('volatility'));
        updatedFilters.push(val);
      }
    });

    if (updatedTimeframe === 'Not specified') {
      updatedTimeframe = 'Daily';
    }
    if (updatedHolding === 'Not specified') {
      updatedHolding = '3 trading days';
    }
    if (updatedExit === 'Not specified') {
      updatedExit = `Close position after ${updatedHolding}`;
    }
    if (updatedFilters.length === 0 || updatedFilters[0] === 'None (Broad market condition)') {
      updatedFilters = ['High volatility periods (India VIX > 20)'];
    }

    const compiled: FinalExperiment = {
      id: `exp_${Date.now()}`,
      originalQuestion: analysis.originalQuestion,
      instrument: analysis.instrument,
      timeframe: updatedTimeframe,
      entryCondition: updatedEntry,
      exitCondition: updatedExit,
      holdingPeriod: updatedHolding,
      filters: updatedFilters.filter((f) => f !== 'None (Broad market condition)'),
      testPeriod: '2019 - 2024 (5-Year Historical Sample)',
      researchQuestion: analysis.researchQuestion,
      hypothesis: `Purchasing ${analysis.instrument} on ${updatedEntry} exhibits a positive post-entry drift over the subsequent ${updatedHolding} window during ${updatedFilters.join(' & ')}.`,
      assumptions: analysis.assumptions,
      missingInformation: [],
      confidence: 'high',
      userClarificationsApplied: resolved,
      lastModified: new Date().toLocaleTimeString(),
    };

    setFinalExperiment(compiled);

    // Stream confirmation with next-step contextual chips
    const compileChips = getDynamicContextChips(analysis, compiled, 'clarified');
    streamAiMessage(
      `Clarifications applied! Compiled experiment for **${compiled.instrument}** (${compiled.timeframe}) with rule: *"${compiled.entryCondition}"*. Specification is ready.`,
      compileChips
    );
  };

  const handleCopyMarkdown = () => {
    if (!finalExperiment) return;
    const text = `# Experiment: ${finalExperiment.instrument} Strategy

MARKET: ${finalExperiment.instrument}
TIMEFRAME: ${finalExperiment.timeframe}
ENTRY CONDITION: ${finalExperiment.entryCondition}
EXIT CONDITION: ${finalExperiment.exitCondition}
HOLDING PERIOD: ${finalExperiment.holdingPeriod}
FILTERS: ${finalExperiment.filters.join(', ') || 'None'}
TEST PERIOD: ${finalExperiment.testPeriod || '2019 - 2024 (5-Year Historical Sample)'}

RESEARCH QUESTION:
${finalExperiment.researchQuestion}

HYPOTHESIS:
${finalExperiment.hypothesis}

ASSUMPTIONS:
${finalExperiment.assumptions.map((a) => `• ${a}`).join('\n')}

MISSING INFORMATION:
${
  finalExperiment.missingInformation.length > 0
    ? finalExperiment.missingInformation.map((m) => `• ${m}`).join('\n')
    : '• None'
}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: ParameterStatus | 'clarified' | 'provided' | string) => {
    switch (status) {
      case 'provided':
      case 'explicit':
        return {
          label: 'Provided',
          cls: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
        };
      case 'clarified':
        return {
          label: 'Clarified',
          cls: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
        };
      case 'assumed':
        return {
          label: 'Inferred',
          cls: 'bg-amber-50 text-amber-800 border-amber-200/90',
        };
      case 'ambiguous':
        return {
          label: 'Ambiguous',
          cls: 'bg-purple-50 text-purple-800 border-purple-200/90',
        };
      case 'missing':
      default:
        return {
          label: 'Missing',
          cls: 'bg-rose-50 text-rose-800 border-rose-200/90',
        };
    }
  };

  const getCategoryColor = (category: ExtractedConcept['category']) => {
    switch (category) {
      case 'instrument':
        return 'bg-blue-50 text-blue-800 border-blue-200/90';
      case 'timeframe':
        return 'bg-amber-50 text-amber-800 border-amber-200/90';
      case 'condition':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/90';
      case 'filter':
        return 'bg-purple-50 text-purple-800 border-purple-200/90';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/90';
    }
  };

  const renderFormattedMessage = (text: string, isStreaming?: boolean) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={idx} className="font-extrabold text-[#09090B]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-[#fd3a25] animate-pulse ml-1 align-middle rounded-xs" />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#edecec] p-3 sm:p-5 lg:p-6 text-[#09090B] relative overflow-x-hidden">
      {/* Ambient Soft Blurred Hero Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-45 bg-cover bg-top bg-no-repeat blur-[18px] transform scale-105"
        style={{
          backgroundImage: `url('/images/hero-1.jpg')`,
        }}
      />

      {/* Top Floating App Bar */}
      <header className="max-w-7xl mx-auto mb-6 relative z-10">
        <div className="aigocy-nav-pill px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Brand & Back Button */}
          <div className="flex items-center gap-3.5 shrink-0">
            <button
              onClick={() => router.push('/')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-100/90 active:scale-95 border border-slate-200/90 shadow-2xs flex items-center justify-center transition-all duration-200 text-slate-800 hover:text-slate-950 cursor-pointer"
              title="Return to Home"
              aria-label="Return to Home"
            >
              <ArrowLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-800" />
            </button>
            <a href="/" className="flex items-center gap-2.5">
              <img
                src="/images/logo-2.svg"
                alt="TradeAI Logo"
                className="w-8 h-8 rounded-xl object-contain shadow-xs"
              />
              <span className="font-extrabold text-lg text-[#09090B] tracking-tight font-urbanist">TradeAI</span>
            </a>
          </div>

          {/* Quick Info & Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-11 px-5 rounded-full border border-slate-200/90 bg-white shadow-xs inline-flex items-center gap-2.5 text-[14px] sm:text-[15px] font-bold text-[#09090B] font-urbanist select-none">
              <span className="w-2 h-2 rounded-full bg-[#ea2b16] shrink-0" />
              <span>Research Workspace</span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="tf-nav-btn h-11 px-5 !py-0 text-[14px] sm:text-[15px] font-bold inline-flex items-center gap-2 cursor-pointer font-urbanist"
            >
              <RotateCcw className="w-4 h-4 text-slate-300 shrink-0" />
              <span>New Search</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Left Side Results (7 cols) + Right Side Chat (5 cols) with Smooth Entrance */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10 animate-page-entrance">
        {/* ================= LEFT SIDE: RESULTS DISPLAY (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-6 animate-slide-left">
          {/* Question Summary Bar */}
          <div className="aigocy-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Target Research Question
              </span>
              <p className="text-base sm:text-lg font-bold text-[#09090B] leading-snug">
                &ldquo;{inputQuery || initialQuery}&rdquo;
              </p>
            </div>

            {analysis && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/90 shrink-0 self-start sm:self-center">
                Confidence: <strong className="text-[#09090B] capitalize">{analysis.confidence}</strong>
              </span>
            )}
          </div>

          {/* Loading Skeleton State */}
          {isLoading && (
            <div className="space-y-6 animate-fadeIn">
              {/* Shimmering Concepts Placeholder */}
              <div className="aigocy-card p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Extracting Concepts &amp; Entities
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#ea2b16] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#ea2b16] animate-ping" />
                    <span>Analyzing</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="h-7 w-24 rounded-full bg-slate-200/80 animate-pulse" />
                  <div className="h-7 w-32 rounded-full bg-slate-200/80 animate-pulse [animation-delay:150ms]" />
                  <div className="h-7 w-20 rounded-full bg-slate-200/80 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>

              {/* Shimmering 6-Variable Grid */}
              <div className="aigocy-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Parsing 6 Quantitative Strategy Variables
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">In Progress</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Market',
                    'Timeframe',
                    'Entry Rule',
                    'Exit Rule',
                    'Holding Window',
                    'Regime Filter',
                  ].map((label, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2.5 animate-pulse"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="space-y-1.5 w-full">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block leading-tight">
                          {label}
                        </span>
                        <div className="h-4 bg-slate-200/90 rounded-md w-3/4" />
                      </div>
                      <div className="h-5 w-14 rounded-full bg-slate-200/90 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="aigocy-card p-6 border-rose-200 bg-rose-50/60 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Could not complete analysis</span>
              </div>
              <p className="text-xs sm:text-sm text-rose-700">{error}</p>
              <button
                onClick={() => performAnalysis(inputQuery || initialQuery)}
                className="aigocy-btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results Content */}
          {analysis && !isLoading && (
            <div className="space-y-6">
              {/* Detected Market Concepts */}
              <div className="aigocy-card p-5 sm:p-6 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Detected Concepts &amp; Entities
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.extractedConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${getCategoryColor(
                        concept.category
                      )}`}
                    >
                      {concept.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* 6-Variable Parameter Grid */}
              <div className="aigocy-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Extracted Strategy Rules
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">6 Variables</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Market',
                      val: finalExperiment ? finalExperiment.instrument : analysis.instrument,
                      status: finalExperiment ? 'provided' : analysis.parameterStatuses.instrument,
                      icon: TrendingUp,
                    },
                    {
                      label: 'Timeframe',
                      val: finalExperiment ? finalExperiment.timeframe : analysis.timeframe,
                      status: finalExperiment ? 'clarified' : analysis.parameterStatuses.timeframe,
                      icon: Clock,
                    },
                    {
                      label: 'Entry Rule',
                      val: finalExperiment ? finalExperiment.entryCondition : analysis.entryCondition,
                      status: finalExperiment ? 'provided' : analysis.parameterStatuses.entryCondition,
                      icon: LogIn,
                    },
                    {
                      label: 'Exit Rule',
                      val: finalExperiment ? finalExperiment.exitCondition : analysis.exitCondition,
                      status: finalExperiment ? 'clarified' : analysis.parameterStatuses.exitCondition,
                      icon: LogOut,
                    },
                    {
                      label: 'Holding Window',
                      val: finalExperiment ? finalExperiment.holdingPeriod : analysis.holdingPeriod,
                      status: finalExperiment ? 'clarified' : analysis.parameterStatuses.holdingPeriod,
                      icon: Timer,
                    },
                    {
                      label: 'Regime Filter',
                      val: finalExperiment
                        ? finalExperiment.filters.join(', ')
                        : analysis.filters.length > 0
                        ? analysis.filters.join(', ')
                        : 'None (Broad market)',
                      status: finalExperiment ? 'clarified' : analysis.parameterStatuses.filters,
                      icon: SlidersHorizontal,
                    },
                  ].map((row, idx) => {
                    const badge = getStatusBadge(row.status);
                    const Icon = row.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block leading-tight">
                              {row.label}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#09090B] truncate block">
                              {row.val}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clarification Box if needed */}
              {analysis.clarificationNeeded &&
                analysis.clarificationQuestions.length > 0 &&
                !finalExperiment && (
                  <div className="aigocy-card p-6 border-amber-200/90 shadow-md space-y-4">
                    <div>
                      <div className="aigocy-badge mb-2">
                        <span className="aigocy-badge-dot"></span>
                        <span>Clarify Missing Parameters</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#09090B]">
                        Specify Strategy Threshold
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select an option below or type a custom rule.
                      </p>
                    </div>

                    <form onSubmit={handleCompileClarifications} className="space-y-4">
                      {analysis.clarificationQuestions.map((q) => {
                        const cur = clarifications[q.id] || { mode: 'preset', value: '' };
                        return (
                          <div key={q.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                            <span className="text-xs sm:text-sm font-bold text-[#09090B] block">
                              {q.question}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isSel = cur.mode === 'preset' && cur.value === opt.value;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() =>
                                      setClarifications((prev) => ({
                                        ...prev,
                                        [q.id]: { mode: 'preset', value: opt.value },
                                      }))
                                    }
                                    className={`p-3 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                                      isSel
                                        ? 'bg-[#09090B] border-[#09090B] text-white shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                              {q.allowCustom !== false && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setClarifications((prev) => ({
                                      ...prev,
                                      [q.id]: { mode: 'custom', value: prev[q.id]?.value || '' },
                                    }))
                                  }
                                  className={`p-3 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                                    cur.mode === 'custom'
                                      ? 'bg-[#09090B] border-[#09090B] text-white shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  Custom threshold
                                </button>
                              )}
                            </div>

                            {cur.mode === 'custom' && (
                              <input
                                type="text"
                                value={cur.value}
                                onChange={(e) =>
                                  setClarifications((prev) => ({
                                    ...prev,
                                    [q.id]: { mode: 'custom', value: e.target.value },
                                  }))
                                }
                                placeholder="Enter custom value..."
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#09090B] focus:outline-none focus:ring-2 focus:ring-slate-900"
                                autoFocus
                              />
                            )}
                          </div>
                        );
                      })}

                      {clarificationError && (
                        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{clarificationError}</span>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="aigocy-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-red-400" />
                          <span>Compile Strategy Plan</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              {/* Final Compiled Experiment Card */}
              {finalExperiment && (
                <div className="aigocy-card p-6 sm:p-7 space-y-5 border-emerald-200/90 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Experiment Specification Ready</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#09090B]">
                        {finalExperiment.instrument} Strategy Plan
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="aigocy-btn-secondary px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={handleCopyMarkdown}
                        className="aigocy-btn-primary px-4 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy Spec'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hypothesis */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Working Hypothesis
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-[#09090B] leading-relaxed">
                      {finalExperiment.hypothesis}
                    </p>
                  </div>

                  {/* Specification Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Market</span>
                      <span className="text-xs sm:text-sm font-bold text-[#09090B]">{finalExperiment.instrument}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Timeframe</span>
                      <span className="text-xs sm:text-sm font-bold text-[#09090B]">{finalExperiment.timeframe}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Entry Rule</span>
                      <span className="text-xs sm:text-sm font-bold text-[#09090B]">{finalExperiment.entryCondition}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Exit Rule</span>
                      <span className="text-xs sm:text-sm font-bold text-[#09090B]">{finalExperiment.exitCondition}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Holding Window</span>
                      <span className="text-xs sm:text-sm font-bold text-[#09090B]">{finalExperiment.holdingPeriod}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Regime Filter</span>
                      <span className="text-xs sm:text-sm font-bold text-[#09090B]">
                        {finalExperiment.filters.length > 0
                          ? finalExperiment.filters.join(', ')
                          : 'None (Broad market)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE: CHAT ASSISTANT (5 cols) ================= */}
        <div className="lg:col-span-5 sticky top-6 space-y-4 animate-slide-right">
          <div className="aigocy-card flex flex-col h-[640px] border border-slate-200/90 shadow-lg overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/95">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#09090B]">TradeAI Copilot</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
              {chatMessages.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">Ask follow-up questions or refine parameters</p>
                </div>
              )}

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-1">
                    {msg.sender === 'user' ? (
                      <>
                        <span>You</span>
                        <span>&bull;</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[#ea2b16] font-bold">TradeAI</span>
                        <span>&bull;</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl max-w-[92%] text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#09090B] text-white rounded-br-xs shadow-sm font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {renderFormattedMessage(msg.text, msg.isStreaming)}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.chips && (
                    <div className="flex flex-wrap gap-1.5 pt-1 max-w-[95%]">
                      {msg.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          disabled={isLoading || isChatSending}
                          onClick={() => handleChatSubmit(undefined, chip)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {(isLoading || isChatSending) && (
                <div className="flex flex-col items-start space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-1">
                    <span className="text-[#ea2b16] font-bold">TradeAI</span>
                    <span>&bull;</span>
                    <span>Analyzing...</span>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl rounded-bl-xs bg-white text-slate-800 border border-slate-200/90 shadow-xs flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-600">Structuring research plan</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fd3a25] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fd3a25] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fd3a25] animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Refine rule, change timeframe, or add filter..."
                disabled={isLoading || isChatSending}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-[#09090B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={isLoading || isChatSending || !chatInput.trim()}
                className="p-2 rounded-full bg-[#09090B] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Edit Experiment Modal */}
      {finalExperiment && (
        <EditExperiment
          experiment={finalExperiment}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updated) => setFinalExperiment(updated)}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#edecec] p-6 flex items-center justify-center">
          <div className="aigocy-card p-8 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-800">Loading analysis workspace...</span>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
