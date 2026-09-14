import { ExperimentAnalysis, ParameterStatus, ClarificationQuestion, ExtractedConcept } from '@/types/experiment';

export const SYSTEM_PROMPT = `You are an expert quantitative trading research assistant.
Your job is to analyze a natural-language trading idea or hypothesis from a researcher/trader, extract structured parameters, identify ambiguities and missing critical variables, and produce a rigorous research experiment specification.

CRITICAL RULES:
1. Distinguish between:
   - EXPLICIT: Directly specified by the user in their question.
   - ASSUMED: Reasonably inferred default (e.g. Daily timeframe if unspecified, or execution at next session close/open). Must be listed in assumptions.
   - MISSING: Crucial research parameters not mentioned at all (e.g. Holding period, Exit condition, Test historical period).
   - AMBIGUOUS: Vague terms like "sharp fall", "dip", "breakout", "rally", "losing streak" that require a concrete quantitative threshold.
2. NEVER silently invent critical parameters (like assuming "sharp fall" = 1% without asking, or inventing a 5-day holding period without asking).
3. If an important parameter is missing or ambiguous, generate a clear, focused clarification question with 3-4 sensible choices plus a custom option.
4. Output STRICT JSON ONLY matching the requested schema. No markdown formatting around JSON or extra text.

Return JSON in this exact structure:
{
  "instrument": "string (e.g. NIFTY, BANK NIFTY, Reliance, SPY, or 'Not specified')",
  "timeframe": "string (e.g. Daily, 15-minute, 1-hour, or 'Not specified')",
  "entryCondition": "string (e.g. NIFTY falls by >= 1% in a single day)",
  "exitCondition": "string (e.g. 'Not specified' or 'Close after N days')",
  "holdingPeriod": "string (e.g. 'Not specified' or '3 trading days')",
  "filters": ["string array of market regimes or indicator conditions, e.g. 'High volatility (India VIX > 20)'"],
  "researchQuestion": "string (Precise formulation of the question)",
  "hypothesis": "string (Testable quantitative hypothesis)",
  "extractedConcepts": [
    { "label": "string", "category": "instrument | timeframe | condition | filter | intent" }
  ],
  "parameterStatuses": {
    "instrument": "explicit | assumed | missing | ambiguous",
    "timeframe": "explicit | assumed | missing | ambiguous",
    "entryCondition": "explicit | assumed | missing | ambiguous",
    "exitCondition": "explicit | assumed | missing | ambiguous",
    "holdingPeriod": "explicit | assumed | missing | ambiguous",
    "filters": "explicit | assumed | missing | ambiguous"
  },
  "missingInformation": ["List of missing or underspecified items"],
  "assumptions": ["List of reasonable assumptions made, e.g. 'Daily timeframe inferred from wording'"],
  "confidence": "high | medium | low",
  "clarificationNeeded": true | false,
  "clarificationQuestions": [
    {
      "id": "string unique id",
      "field": "entryCondition | holdingPeriod | exitCondition | timeframe | filters",
      "question": "Clear question to clarify",
      "context": "Why this clarification matters",
      "options": [
        { "label": "Option label", "value": "Option value", "description": "optional brief description" }
      ],
      "allowCustom": true
    }
  ]
}`;

// Defense-in-depth string sanitizer and length limiter
function cleanString(val: any, fallback: string = '', maxLen: number = 500): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') {
    if (typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }
    return fallback;
  }
  // Remove dangerous control characters (except newline, tab) and trim
  const sanitized = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  if (sanitized.length === 0) return fallback;
  return sanitized.slice(0, maxLen);
}

function cleanStringArray(val: any, maxItems: number = 10, maxLen: number = 300): string[] {
  if (!Array.isArray(val)) return [];
  const result: string[] = [];
  for (const item of val) {
    if (result.length >= maxItems) break;
    const cleaned = cleanString(item, '', maxLen);
    if (cleaned) {
      result.push(cleaned);
    }
  }
  return result;
}

export function validateAndSanitizeAnalysis(data: any, originalQuestion: string): ExperimentAnalysis {
  const safeData = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

  const sanitizeStatus = (val: any): ParameterStatus => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      if (['explicit', 'assumed', 'missing', 'ambiguous'].includes(lower)) {
        return lower as ParameterStatus;
      }
    }
    return 'missing';
  };

  const rawStatuses = safeData.parameterStatuses && typeof safeData.parameterStatuses === 'object' ? safeData.parameterStatuses : {};
  const parameterStatuses = {
    instrument: sanitizeStatus(rawStatuses.instrument),
    timeframe: sanitizeStatus(rawStatuses.timeframe),
    entryCondition: sanitizeStatus(rawStatuses.entryCondition),
    exitCondition: sanitizeStatus(rawStatuses.exitCondition),
    holdingPeriod: sanitizeStatus(rawStatuses.holdingPeriod),
    filters: sanitizeStatus(rawStatuses.filters),
  };

  const rawQuestions = Array.isArray(safeData.clarificationQuestions) ? safeData.clarificationQuestions : [];
  const clarificationQuestions: ClarificationQuestion[] = [];

  for (let i = 0; i < Math.min(rawQuestions.length, 6); i++) {
    const q = rawQuestions[i];
    if (!q || typeof q !== 'object') continue;

    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const options: { label: string; value: string; description?: string }[] = [];

    for (let j = 0; j < Math.min(rawOptions.length, 6); j++) {
      const opt = rawOptions[j];
      if (typeof opt === 'string') {
        const cleaned = cleanString(opt, '', 100);
        if (cleaned && !cleaned.toLowerCase().startsWith('custom')) {
          options.push({ label: cleaned, value: cleaned });
        }
      } else if (opt && typeof opt === 'object') {
        const label = cleanString(opt.label, 'Option', 100);
        const value = cleanString(opt.value, label, 100);
        const desc = opt.description ? cleanString(opt.description, '', 200) : undefined;
        if (!label.toLowerCase().startsWith('custom') && !value.toLowerCase().startsWith('custom')) {
          options.push({ label, value, description: desc });
        }
      }
    }

    clarificationQuestions.push({
      id: cleanString(q.id, `clarify_${i + 1}`, 50),
      field: cleanString(q.field, 'general', 50),
      question: cleanString(q.question, 'Please clarify this parameter:', 250),
      context: cleanString(q.context, '', 300),
      options,
      allowCustom: q.allowCustom !== false,
    });
  }

  const rawConcepts = Array.isArray(safeData.extractedConcepts) ? safeData.extractedConcepts : [];
  const extractedConcepts: ExtractedConcept[] = [];

  for (let i = 0; i < Math.min(rawConcepts.length, 12); i++) {
    const c = rawConcepts[i];
    if (typeof c === 'string') {
      const label = cleanString(c, '', 60);
      if (label) extractedConcepts.push({ label, category: 'condition' });
    } else if (c && typeof c === 'object') {
      const label = cleanString(c.label, '', 60);
      const cat = ['instrument', 'timeframe', 'condition', 'filter', 'intent'].includes(c.category)
        ? c.category
        : 'condition';
      if (label) extractedConcepts.push({ label, category: cat as any });
    }
  }

  const missingInfo = cleanStringArray(safeData.missingInformation, 10, 200);
  const assumptions = cleanStringArray(safeData.assumptions, 10, 300);
  const filters = cleanStringArray(safeData.filters, 8, 200);

  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (typeof safeData.confidence === 'string') {
    const confLower = safeData.confidence.toLowerCase().trim();
    if (['high', 'medium', 'low'].includes(confLower)) {
      confidence = confLower as 'high' | 'medium' | 'low';
    }
  }

  const cleanedOriginalQuestion = cleanString(originalQuestion, 'No question provided', 1000);
  const cleanedInstrument = cleanString(safeData.instrument, 'Not specified', 100);
  const cleanedTimeframe = cleanString(safeData.timeframe, 'Daily (inferred)', 100);
  const cleanedEntry = cleanString(safeData.entryCondition, 'Not specified', 300);
  const cleanedExit = cleanString(safeData.exitCondition, 'Not specified', 300);
  const cleanedHolding = cleanString(safeData.holdingPeriod, 'Not specified', 100);
  const cleanedResearchQ = cleanString(safeData.researchQuestion, cleanedOriginalQuestion, 500);
  const cleanedHypothesis = cleanString(
    safeData.hypothesis,
    `Testing whether ${cleanedEntry} yields a statistically positive edge on ${cleanedInstrument}.`,
    600
  );

  return {
    originalQuestion: cleanedOriginalQuestion,
    instrument: cleanedInstrument,
    timeframe: cleanedTimeframe,
    entryCondition: cleanedEntry,
    exitCondition: cleanedExit,
    holdingPeriod: cleanedHolding,
    filters: filters.length > 0 ? filters : ['None (Broad market condition)'],
    researchQuestion: cleanedResearchQ,
    hypothesis: cleanedHypothesis,
    extractedConcepts,
    parameterStatuses,
    missingInformation: missingInfo,
    assumptions,
    confidence,
    clarificationNeeded: Boolean(safeData.clarificationNeeded || clarificationQuestions.length > 0),
    clarificationQuestions,
    isMockFallback: Boolean(safeData.isMockFallback),
  };
}
