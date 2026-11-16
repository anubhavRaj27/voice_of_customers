import { FeedbackRecord, SourceType } from '../types';

export interface ColumnMapping {
  feedbackText: string;
  date?: string;
  source?: string;
  rating?: string;
  customerIdentifier?: string;
  segment?: string;
}

/**
 * Standard RFC4180 CSV line parser supporting quoted fields with commas and newlines
 */
export function parseCSVToRows(csvContent: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Automatically infers likely column mapping from header names
 */
export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    feedbackText: '',
  };

  const findMatch = (candidates: string[]) => {
    return headers.find(h => candidates.some(c => h.toLowerCase().includes(c.toLowerCase()))) || '';
  };

  mapping.feedbackText = findMatch(['feedback', 'review', 'comment', 'text', 'body', 'message', 'description', 'issue']) || headers[0] || '';
  mapping.date = findMatch(['date', 'created', 'timestamp', 'time']);
  mapping.source = findMatch(['source', 'channel', 'platform', 'type']);
  mapping.rating = findMatch(['rating', 'score', 'stars']);
  mapping.customerIdentifier = findMatch(['customer', 'user', 'user_id', 'email', 'phone', 'author', 'id']);
  mapping.segment = findMatch(['segment', 'city', 'tier', 'location', 'device', 'cohort']);

  return mapping;
}

/**
 * Transforms raw parsed CSV rows into typed FeedbackRecords with deduplication & secondhand checks
 */
export function processRawRowsToRecords(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  fileName: string,
  defaultSource: SourceType = 'playstore',
  existingRecords: FeedbackRecord[] = []
): { records: FeedbackRecord[]; duplicatesCount: number; secondhandCount: number } {
  const records: FeedbackRecord[] = [];
  const normalizedTextMap = new Map<string, string>(); // normText -> recordId

  // Populate map with existing records for cross-file duplicate detection
  existingRecords.forEach(r => {
    const norm = normalizeText(r.originalText);
    if (!normalizedTextMap.has(norm)) {
      normalizedTextMap.set(norm, r.id);
    }
  });

  let duplicatesCount = 0;
  let secondhandCount = 0;
  const startIdx = existingRecords.length + 1;

  rows.forEach((row, idx) => {
    const rawText = (row[mapping.feedbackText] || '').trim();
    if (!rawText) return;

    const recordId = `REC-${String(startIdx + idx).padStart(2, '0')}`;
    const norm = normalizeText(rawText);

    // Exact duplicate check
    let duplicateOf: string | undefined;
    let isExcluded = false;

    if (normalizedTextMap.has(norm)) {
      duplicateOf = normalizedTextMap.get(norm);
      isExcluded = true;
      duplicatesCount++;
    } else {
      normalizedTextMap.set(norm, recordId);
    }

    // Secondhand stakeholder check
    const isSecondhand =
      defaultSource === 'stakeholder' ||
      /founder says|internal feedback|stakeholder feels|investor feedback|marketing team believes|management thinks/i.test(rawText);

    if (isSecondhand) {
      secondhandCount++;
    }

    // Language detection
    const language = detectLanguage(rawText);

    // Rating parsing
    let rating: number | undefined;
    if (mapping.rating && row[mapping.rating]) {
      const parsed = parseFloat(row[mapping.rating]);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        rating = parsed;
      }
    }

    const record: FeedbackRecord = {
      id: recordId,
      sourceType: (row[mapping.source || ''] as SourceType) || defaultSource,
      sourceName: fileName,
      originalText: rawText,
      language,
      date: mapping.date ? row[mapping.date] : new Date().toISOString().split('T')[0],
      rating,
      customerIdentifier: mapping.customerIdentifier ? row[mapping.customerIdentifier] : undefined,
      segment: mapping.segment ? row[mapping.segment] : undefined,
      locator: `Row ${idx + 2}`, // +2 for 1-based index and header row
      isSecondhand,
      duplicateOf,
      isExcluded,
    };

    records.push(record);
  });

  return { records, duplicatesCount, secondhandCount };
}

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function detectLanguage(text: string): 'en' | 'hi' | 'hinglish' {
  // Check for Devanagari Unicode range \u0900-\u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return 'hi';

  // Check for common Hinglish Romanized keywords
  const hinglishPatterns = /\b(bhai|nahi|kyu|kyun|kya|par|aata|gaya|gayi|paise|ho|tha|daba|khatam|khali|mein|se|pe|ka|ke|ki|baad|bolta|bolti|karo|raha|rahi|aaya|leke|saare|sade|dhaniya|sukha|kal|hi)\b/i;
  if (hinglishPatterns.test(text)) {
    return 'hinglish';
  }

  return 'en';
}
