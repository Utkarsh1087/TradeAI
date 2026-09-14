import { ExperimentAnalysis, ClarificationQuestion, ExtractedConcept } from '@/types/experiment';

export function analyzeQuestionWithMock(question: string): ExperimentAnalysis {
  const qLower = question.toLowerCase();

  // 1. Detect Instrument
  let instrument = 'Not specified';
  let instrumentStatus: 'explicit' | 'assumed' | 'missing' | 'ambiguous' = 'missing';

  if (qLower.includes('bank nifty') || qLower.includes('banknifty')) {
    instrument = 'BANK NIFTY';
    instrumentStatus = 'explicit';
  } else if (qLower.includes('nifty')) {
    instrument = 'NIFTY 50';
    instrumentStatus = 'explicit';
  } else if (qLower.includes('reliance')) {
    instrument = 'RELIANCE';
    instrumentStatus = 'explicit';
  } else if (qLower.includes('tcs')) {
    instrument = 'TCS';
    instrumentStatus = 'explicit';
  } else if (qLower.includes('spy') || qLower.includes('s&p 500') || qLower.includes('s&p')) {
    instrument = 'S&P 500 (SPY)';
    instrumentStatus = 'explicit';
  } else if (qLower.includes('btc') || qLower.includes('bitcoin')) {
    instrument = 'Bitcoin (BTC/USD)';
    instrumentStatus = 'explicit';
  } else if (qLower.includes('eth') || qLower.includes('ethereum')) {
    instrument = 'Ethereum (ETH/USD)';
    instrumentStatus = 'explicit';
  } else {
    // Check if any capital ticker or generic market mention exists
    const words = question.split(/\s+/);
    const potentialTicker = words.find(w => /^[A-Z]{3,8}$/.test(w) && !['WHAT', 'WHEN', 'DOES', 'AFTER', 'WITH'].includes(w));
    if (potentialTicker) {
      instrument = potentialTicker;
      instrumentStatus = 'explicit';
    } else {
      instrument = 'Equity Index (Unspecified)';
      instrumentStatus = 'missing';
    }
  }

  // 2. Detect Timeframe
  let timeframe = 'Daily';
  let timeframeStatus: 'explicit' | 'assumed' | 'missing' | 'ambiguous' = 'assumed';

  if (qLower.includes('intraday') || qLower.includes('5-minute') || qLower.includes('5 min') || qLower.includes('15 min') || qLower.includes('15-minute')) {
    timeframe = qLower.includes('5') ? '5-Minute Intraday' : '15-Minute Intraday';
    timeframeStatus = 'explicit';
  } else if (qLower.includes('hourly') || qLower.includes('1 hour') || qLower.includes('1-hour')) {
    timeframe = '1-Hour';
    timeframeStatus = 'explicit';
  } else if (qLower.includes('weekly') || qLower.includes('week')) {
    timeframe = 'Weekly';
    timeframeStatus = 'explicit';
  } else if (qLower.includes('daily') || qLower.includes('days') || qLower.includes('day')) {
    timeframe = 'Daily';
    timeframeStatus = 'explicit';
  } else {
    timeframe = 'Daily (Inferred)';
    timeframeStatus = 'assumed';
  }

  // 3. Detect Entry Condition & Ambiguity
  let entryCondition = 'Not specified';
  let entryStatus: 'explicit' | 'assumed' | 'missing' | 'ambiguous' = 'missing';
  let isSharpFall = false;
  let isDip = false;

  const pctMatch = question.match(/(\d+(?:\.\d+)?)\s*%\s*(?:fall|falls|drop|drops|dip|dips|decline|declines|loss|losses|down|crash|crashes|pullback|pullbacks|rally|rallies|gain|gains|jump|jumps|up)/i) ||
                   question.match(/(?:fall|falls|drop|drops|dip|dips|decline|declines|loss|losses|down|crash|crashes|pullback|pullbacks|rally|rallies|gain|gains|jump|jumps|up)\s*(?:of|by)?\s*(\d+(?:\.\d+)?)\s*%/i);

  if (pctMatch) {
    const pct = pctMatch[1];
    entryCondition = `${instrument !== 'Not specified' ? instrument : 'Price'} falls >= ${pct}% in a single ${timeframe.toLowerCase().replace(' (inferred)', '')} session`;
    entryStatus = 'explicit';
  } else if (qLower.includes('sharp fall') || qLower.includes('sharp drop') || qLower.includes('steep fall') || qLower.includes('big fall') || qLower.includes('crash')) {
    entryCondition = `Sharp fall in ${instrument} (Threshold ambiguous)`;
    entryStatus = 'ambiguous';
    isSharpFall = true;
  } else if (qLower.includes('consecutive losing days') || qLower.includes('losing days') || qLower.includes('red days') || qLower.includes('down days')) {
    const numMatch = question.match(/(\d+|three|two|four|five)\s*(?:consecutive)?\s*(?:losing|red|down)\s*days/i);
    const countStr = numMatch ? numMatch[1] : '3';
    const count = countStr.toLowerCase() === 'three' ? '3' : countStr.toLowerCase() === 'two' ? '2' : countStr.toLowerCase() === 'four' ? '4' : countStr;
    entryCondition = `${instrument} closes negative for ${count} consecutive trading days`;
    entryStatus = 'explicit';
  } else if (qLower.includes('dip') || qLower.includes('buying the dip')) {
    entryCondition = `Buying the dip (Pullback magnitude ambiguous)`;
    entryStatus = 'ambiguous';
    isDip = true;
  } else if (qLower.includes('breakout') || qLower.includes('200 sma') || qLower.includes('50 sma') || qLower.includes('moving average')) {
    entryCondition = `${instrument} crosses technical level / moving average`;
    entryStatus = 'explicit';
  } else {
    entryCondition = `Condition identified in text: "${question.substring(0, 60)}..."`;
    entryStatus = 'ambiguous';
  }

  // 4. Detect Filters (e.g. Volatility, Trend, Volume)
  const filters: string[] = [];
  let filterStatus: 'explicit' | 'assumed' | 'missing' | 'ambiguous' = 'missing';

  if (qLower.includes('high-volatility') || qLower.includes('high volatility') || qLower.includes('volatility is high') || qLower.includes('vix')) {
    filters.push('High market volatility regime (e.g., India VIX / CBOE VIX above median)');
    filterStatus = 'explicit';
  }
  if (qLower.includes('low-volatility') || qLower.includes('low volatility')) {
    filters.push('Low market volatility regime (VIX in lower quartile)');
    filterStatus = 'explicit';
  }
  if (qLower.includes('uptrend') || qLower.includes('bull market')) {
    filters.push('Macro Trend Filter: 200-day Simple Moving Average sloping upward');
    filterStatus = 'explicit';
  }
  if (filters.length === 0) {
    filterStatus = 'assumed';
  }

  // 5. Holding Period & Exit Condition
  let holdingPeriod = 'Not specified';
  let holdingStatus: 'explicit' | 'assumed' | 'missing' | 'ambiguous' = 'missing';
  let exitCondition = 'Not specified';
  let exitStatus: 'explicit' | 'assumed' | 'missing' | 'ambiguous' = 'missing';

  const holdMatch = question.match(/(\d+)\s*(?:day|days|session|sessions|week|weeks|month|months)\s*(?:holding|hold|later|after)/i) ||
                    question.match(/hold(?:ing)?\s*(?:for)?\s*(\d+)\s*(?:day|days|session|sessions|week|weeks)/i);

  if (holdMatch) {
    holdingPeriod = `${holdMatch[1]} days`;
    holdingStatus = 'explicit';
    exitCondition = `Close position after ${holdMatch[1]} trading days`;
    exitStatus = 'explicit';
  }

  // 6. Extracted Concepts
  const extractedConcepts: ExtractedConcept[] = [];
  if (instrumentStatus !== 'missing') {
    extractedConcepts.push({ label: instrument, category: 'instrument' });
  }
  extractedConcepts.push({ label: timeframe, category: 'timeframe' });
  if (pctMatch) {
    extractedConcepts.push({ label: `${pctMatch[1]}% fall`, category: 'condition' });
  } else if (isSharpFall) {
    extractedConcepts.push({ label: 'Sharp fall (Ambiguous)', category: 'condition' });
  } else if (isDip) {
    extractedConcepts.push({ label: 'Dip / Pullback', category: 'condition' });
  } else if (qLower.includes('consecutive losing days')) {
    extractedConcepts.push({ label: '3-Day Losing Streak', category: 'condition' });
  }

  if (filters.length > 0) {
    filters.forEach(f => {
      extractedConcepts.push({
        label: f.includes('High') ? 'High Volatility' : f.includes('Low') ? 'Low Volatility' : 'Trend Filter',
        category: 'filter',
      });
    });
  }

  // 7. Missing Information
  const missingInformation: string[] = [];
  if (holdingStatus === 'missing') missingInformation.push('Holding period / Time in trade');
  if (exitStatus === 'missing') missingInformation.push('Exit rule / Stop-loss & Target parameters');
  missingInformation.push('Historical test period (e.g., 2018–2024)');
  if (isSharpFall || isDip) missingInformation.push('Quantitative definition for "sharp fall / dip"');
  if (instrumentStatus === 'missing') missingInformation.push('Specific trading instrument or contract');

  // 8. Assumptions
  const assumptions: string[] = [
    'Daily closing prices are used for signal evaluation.',
    'Execution occurs at the market open/close of the next eligible trading session.',
    'Slippage, exchange transaction fees, and brokerage costs are excluded in this preliminary prototype.',
  ];
  if (timeframeStatus === 'assumed') {
    assumptions.unshift('Daily timeframe inferred from phrasing since no intraday resolution was specified.');
  }

  // 9. Clarification Questions
  const clarificationQuestions: ClarificationQuestion[] = [];

  // Question 1: Sharp fall / Dip ambiguity
  if (isSharpFall || isDip) {
    clarificationQuestions.push({
      id: 'clarify_entry_fall',
      field: 'entryCondition',
      question: `How do you define a "${isSharpFall ? 'sharp fall' : 'dip'}" for ${instrument}?`,
      context: 'Quantitative testing requires an unambiguous percentage drop threshold to measure signals.',
      options: [
        { label: '≥ 1% drop in one period', value: '1% drop in one period' },
        { label: '≥ 2% drop in one period', value: '2% drop in one period' },
        { label: '≥ 3% drop in one period', value: '3% drop in one period' },
      ],
      allowCustom: true,
    });
  }

  // Question 2: Holding period
  if (holdingStatus === 'missing' || isSharpFall || isDip) {
    clarificationQuestions.push({
      id: 'clarify_holding_period',
      field: 'holdingPeriod',
      question: 'What is the intended holding period after entering the trade?',
      context: 'Holding horizon determines mean-reversion recovery window and risk exposure.',
      options: [
        { label: '1 trading day', value: '1 trading day' },
        { label: '3 trading days', value: '3 trading days' },
        { label: '1 week', value: '1 week' },
      ],
      allowCustom: true,
    });
  }

  // Question 3: Exit rule
  if (isSharpFall || isDip || exitStatus === 'missing') {
    clarificationQuestions.push({
      id: 'clarify_exit_rule',
      field: 'exitCondition',
      question: 'Which exit rule should be applied to close the position?',
      context: 'Explicit exit rule determines risk and take-profit mechanics.',
      options: [
        { label: 'Fixed holding period (as defined above)', value: 'Fixed holding period (as defined above)' },
        { label: 'Target profit of X%', value: 'Target profit of 3%' },
        { label: 'Stop-loss of X%', value: 'Stop-loss of 2%' },
      ],
      allowCustom: true,
    });
  }

  // Question 4: Market regime / filter
  if (isSharpFall || isDip || filterStatus === 'missing' || filters.some(f => f.toLowerCase().includes('volatility'))) {
    clarificationQuestions.push({
      id: 'clarify_filters',
      field: 'filters',
      question: 'Do you want to apply any market-regime or indicator filters to the strategy?',
      context: 'Specifying regime filters creates objective market conditions.',
      options: [
        { label: 'No filters (trade every signal)', value: 'None (Broad market)' },
        { label: 'High volatility only (e.g., India VIX > 20)', value: 'High volatility only (e.g., India VIX > 20)' },
        { label: 'Uptrend only (e.g., 50-day SMA upward)', value: 'Uptrend only (e.g., 50-day SMA upward)' },
      ],
      allowCustom: true,
    });
  }

  // Research Question & Hypothesis synthesis
  const filterDesc = filters.length > 0 ? ` during ${filters.join(' and ')}` : '';
  const researchQuestion = `Does buying ${instrument} after ${entryCondition}${filterDesc} generate an edge relative to a buy-and-hold baseline?`;
  const hypothesis = `Purchasing ${instrument} following ${isSharpFall ? 'a quantified sharp decline' : entryCondition}${filterDesc} exhibits a positive post-entry mean-reversion drift over the subsequent holding window.`;

  return {
    originalQuestion: question,
    instrument,
    timeframe,
    entryCondition,
    exitCondition,
    holdingPeriod,
    filters: filters.length > 0 ? filters : ['None (Broad market condition)'],
    researchQuestion,
    hypothesis,
    extractedConcepts,
    parameterStatuses: {
      instrument: instrumentStatus,
      timeframe: timeframeStatus,
      entryCondition: entryStatus,
      exitCondition: exitStatus,
      holdingPeriod: holdingStatus,
      filters: filterStatus,
    },
    missingInformation,
    assumptions,
    confidence: isSharpFall || isDip ? 'medium' : 'high',
    clarificationNeeded: clarificationQuestions.length > 0,
    clarificationQuestions,
    isMockFallback: true,
  };
}
