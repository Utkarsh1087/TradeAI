export type ParameterStatus = 'explicit' | 'assumed' | 'missing' | 'ambiguous';

export interface ExtractedConcept {
  label: string;
  category: 'instrument' | 'timeframe' | 'condition' | 'filter' | 'intent';
}

export interface ClarificationOption {
  label: string;
  value: string;
  description?: string;
}

export interface ClarificationQuestion {
  id: string;
  field: 'instrument' | 'timeframe' | 'entryCondition' | 'exitCondition' | 'holdingPeriod' | 'filters' | string;
  question: string;
  context?: string;
  options: ClarificationOption[];
  allowCustom?: boolean;
  selectedValue?: string;
  customValue?: string;
}

export interface ExperimentAnalysis {
  originalQuestion: string;
  instrument: string;
  timeframe: string;
  entryCondition: string;
  exitCondition: string;
  holdingPeriod: string;
  filters: string[];
  researchQuestion: string;
  hypothesis: string;
  extractedConcepts: ExtractedConcept[];
  parameterStatuses: {
    instrument: ParameterStatus;
    timeframe: ParameterStatus;
    entryCondition: ParameterStatus;
    exitCondition: ParameterStatus;
    holdingPeriod: ParameterStatus;
    filters: ParameterStatus;
  };
  missingInformation: string[];
  assumptions: string[];
  confidence: 'high' | 'medium' | 'low';
  clarificationNeeded: boolean;
  clarificationQuestions: ClarificationQuestion[];
  isMockFallback?: boolean;
}

export interface FinalExperiment {
  id: string;
  originalQuestion: string;
  instrument: string;
  timeframe: string;
  entryCondition: string;
  exitCondition: string;
  holdingPeriod: string;
  filters: string[];
  testPeriod?: string;
  researchQuestion: string;
  hypothesis: string;
  assumptions: string[];
  missingInformation: string[];
  confidence: 'high' | 'medium' | 'low';
  userClarificationsApplied?: Record<string, string>;
  lastModified?: string;
}
