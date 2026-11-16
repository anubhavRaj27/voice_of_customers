/**
 * Voice of Customer Copilot - Core Type Definitions
 */

export type SourceType =
  | 'playstore'
  | 'ticket'
  | 'sales_call'
  | 'interview'
  | 'whatsapp'
  | 'stakeholder'
  | 'pdf_document'
  | 'other';

export interface FeedbackRecord {
  id: string; // e.g. "REC-01"
  sourceType: SourceType;
  sourceName: string; // e.g. "playstore_sept_oct.csv" or "user_interviews.pdf"
  originalText: string;
  rawOcrText?: string; // Stored initial OCR extraction before user edits
  originalImageUrl?: string; // Data URL or path for screenshots/images
  isUserCorrected?: boolean; // True if PM manually edited the transcription
  translatedText?: string; // English translation for Hindi / Hinglish
  language: 'en' | 'hi' | 'hinglish';
  date?: string; // ISO or YYYY-MM-DD
  rating?: number; // 1 to 5 if available
  customerIdentifier?: string; // e.g. "CUST-9021"
  segment?: string; // e.g. "Tier-1 Bangalore", "Daily Active User"
  locator: string; // e.g. "Row 14", "Page 2, Para 3", "Message 4"
  isSecondhand: boolean; // True for internal stakeholder opinion ("Founder says...")
  duplicateOf?: string; // ID of parent record if duplicate
  isDuplicateFlagged?: boolean; // True if suspected near-duplicate
  isExcluded?: boolean; // PM exclusion flag
}

export type EvidenceStrength = 'high' | 'moderate' | 'emerging';

export interface EvidenceQuote {
  recordId: string;
  quoteText: string;
  translatedQuoteText?: string;
  locator: string;
  sourceType: SourceType;
  verifiedMatch: boolean; // Verified against record originalText
}

export interface Theme {
  id: string; // e.g. "THM-OTP"
  title: string;
  problemStatement: string;
  recordIds: string[]; // Bound FeedbackRecord IDs
  evidenceQuotes: EvidenceQuote[];
  evidenceStrength: EvidenceStrength;
  strengthRationale: string;
  contradictionsOrLimitations?: string;
  sourceBreakdown: Record<string, number>;
  segmentDistribution: Record<string, number>;
}

export type ChurnCategory =
  | 'reported_churn' // "I uninstalled yesterday"
  | 'explicit_intent' // "I'm cancelling my subscription"
  | 'risk_competitor' // "Switched to Zepto/Blinkit for this order"
  | 'high_frustration_only'; // Frustrated but no churn statement

export interface ChurnSignal {
  id: string;
  recordId: string;
  category: ChurnCategory;
  quote: string;
  translatedQuote?: string;
  rationale: string;
}

export type RecommendationSeverity =
  | 'P0 - Critical'
  | 'P1 - High'
  | 'P2 - Medium'
  | 'P3 - Low';

export type RecommendationStatus =
  | 'accepted'
  | 'edited'
  | 'deferred'
  | 'dismissed'
  | 'pending';

export interface RoadmapRecommendation {
  id: string;
  title: string;
  customerProblem: string;
  linkedThemeIds: string[];
  proposedIntervention: string;
  meritRationale: string;
  severity: RecommendationSeverity;
  severityRubricExplanation: string;
  hypothesis: string;
  successMetric: string; // Must use "target: to be set after baseline"
  validationStep: string;
  assumptionsAndTradeoffs: string;
  engineeringEffort: string; // "Needs team input"
  revenueImpact: string; // "Needs team input"
  status: RecommendationStatus;
  pmDecisionNotes?: string;
}

export interface WorkspaceContext {
  productName: string;
  productContext: string;
  targetMarket: string;
  isSyntheticDemo: boolean;
}

export interface FilterState {
  sourceTypes: SourceType[];
  segments: string[];
  includeSecondhand: boolean;
  includeDuplicates: boolean;
  minRating: number | null;
  maxRating: number | null;
  searchQuery: string;
}

export interface EvaluationItem {
  id: string;
  name: string;
  category: 'deterministic' | 'semantic' | 'adversarial';
  targetBenchmark: string;
  description: string;
  testCaseCount: number;
  expectedBehavior: string;
  observedResult: string;
  status: 'passed' | 'review' | 'failed' | 'not_run';
  details: {
    passedCount: number;
    totalCount: number;
    logEntries: Array<{
      fixtureId: string;
      testDescription: string;
      expected: string;
      actual: string;
      passed: boolean;
    }>;
  };
}

export interface IngestionAuditSummary {
  filesUploaded: number;
  totalRecordsExtracted: number;
  recordsIncluded: number;
  duplicatesExcluded: number;
  secondhandFlagged: number;
  missingLocators: number;
  warnings: string[];
}
