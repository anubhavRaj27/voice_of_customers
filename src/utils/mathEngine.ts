import { FeedbackRecord, FilterState, Theme } from '../types';

export interface FrequencyResult {
  numerator: number;
  denominator: number;
  percentage: number;
  uniqueCustomers: number | null; // null if customer identifiers missing
  denominatorExplanation: string;
  sourceCounts: Record<string, number>;
}

/**
 * Filters the master records based on the active filter state
 */
export function getFilteredRecords(records: FeedbackRecord[], filters: FilterState): FeedbackRecord[] {
  return records.filter(record => {
    // Exclusion check (e.g. deduplicated record quarantine)
    if (record.isExcluded && !filters.includeDuplicates) {
      return false;
    }

    // Secondhand stakeholder opinion check
    if (record.isSecondhand && !filters.includeSecondhand) {
      return false;
    }

    // Source type filter
    if (filters.sourceTypes.length > 0 && !filters.sourceTypes.includes(record.sourceType)) {
      return false;
    }

    // Segment filter
    if (filters.segments.length > 0) {
      if (!record.segment || !filters.segments.some(s => record.segment?.toLowerCase().includes(s.toLowerCase()))) {
        return false;
      }
    }

    // Rating filter
    if (filters.minRating !== null && record.rating !== undefined && record.rating < filters.minRating) {
      return false;
    }
    if (filters.maxRating !== null && record.rating !== undefined && record.rating > filters.maxRating) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchText = record.originalText.toLowerCase().includes(q);
      const matchTranslated = record.translatedText?.toLowerCase().includes(q);
      const matchId = record.id.toLowerCase().includes(q);
      const matchSource = record.sourceName.toLowerCase().includes(q);
      if (!matchText && !matchTranslated && !matchId && !matchSource) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Computes deterministic frequency for a specific theme within the active filtered cohort
 */
export function calculateThemeFrequency(
  theme: Theme,
  activeEligibleRecords: FeedbackRecord[]
): FrequencyResult {
  const eligibleRecordIdSet = new Set(activeEligibleRecords.map(r => r.id));
  const recordMap = new Map(activeEligibleRecords.map(r => [r.id, r]));

  // Match unique records bound to this theme that are currently eligible
  const matchedUniqueRecordIds = Array.from(
    new Set(theme.recordIds.filter(id => eligibleRecordIdSet.has(id)))
  );

  const numerator = matchedUniqueRecordIds.length;
  const denominator = activeEligibleRecords.length;
  const percentage = denominator > 0 ? (numerator / denominator) * 100 : 0;

  // Count unique customer identifiers where present
  const customerIds = new Set<string>();
  let hasValidCustomerIds = false;
  const sourceCounts: Record<string, number> = {};

  matchedUniqueRecordIds.forEach(id => {
    const rec = recordMap.get(id);
    if (rec) {
      sourceCounts[rec.sourceType] = (sourceCounts[rec.sourceType] || 0) + 1;
      if (rec.customerIdentifier && !rec.customerIdentifier.startsWith('ATTACK')) {
        customerIds.add(rec.customerIdentifier);
        hasValidCustomerIds = true;
      }
    }
  });

  const uniqueCustomers = hasValidCustomerIds ? customerIds.size : null;
  const denominatorExplanation = `of ${denominator} analysed records in active slice (sample only, not total population)`;

  return {
    numerator,
    denominator,
    percentage,
    uniqueCustomers,
    denominatorExplanation,
    sourceCounts,
  };
}

/**
 * Calculates overall workspace summary statistics
 */
export function calculateWorkspaceStats(
  allRecords: FeedbackRecord[],
  filteredRecords: FeedbackRecord[],
  themes: Theme[],
  churnCount: number
) {
  const totalRaw = allRecords.length;
  const totalActive = filteredRecords.length;
  const totalExcludedDuplicates = allRecords.filter(r => !!r.duplicateOf).length;
  const totalSecondhand = allRecords.filter(r => r.isSecondhand).length;

  const sourceBreakdown: Record<string, number> = {};
  filteredRecords.forEach(r => {
    sourceBreakdown[r.sourceType] = (sourceBreakdown[r.sourceType] || 0) + 1;
  });

  return {
    totalRaw,
    totalActive,
    totalExcludedDuplicates,
    totalSecondhand,
    totalThemes: themes.length,
    totalChurnSignals: churnCount,
    sourceBreakdown,
  };
}
