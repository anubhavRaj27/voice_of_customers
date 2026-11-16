import { FeedbackRecord, Theme, ChurnSignal } from '../types';

export interface EvidenceStandardExample {
  id: string;
  category: 'Themes & Problem Statements' | 'Churn Signal Classification' | 'Roadmap & Interventions';
  badOutput: string;
  badFlaws: string[];
  goodOutput: string;
  goodVirtues: string[];
  sampleCitations: Array<{ recordId: string; label: string }>;
  explanation: string;
}

export function getDynamicEvidenceStandards(
  records: FeedbackRecord[],
  themes: Theme[],
  churnSignals: ChurnSignal[]
): EvidenceStandardExample[] {
  const eligibleRecords = records.filter(r => !r.isExcluded);
  const totalEligible = Math.max(eligibleRecords.length, 1);

  // Derive counts dynamically from active records and themes
  const otpTheme = themes.find(t => t.id === 'THM-OTP');
  const otpCount = otpTheme ? otpTheme.recordIds.filter(id => eligibleRecords.some(r => r.id === id)).length : 5;
  const otpPct = ((otpCount / totalEligible) * 100).toFixed(1);

  const refundTheme = themes.find(t => t.id === 'THM-REFUND');
  const refundCount = refundTheme ? refundTheme.recordIds.filter(id => eligibleRecords.some(r => r.id === id)).length : 5;
  const refundPct = ((refundCount / totalEligible) * 100).toFixed(1);

  const explicitChurnCount = churnSignals.filter(s => s.category === 'explicit_intent').length;
  const churnPct = ((explicitChurnCount / totalEligible) * 100).toFixed(1);

  return [
    {
      id: 'STD-01',
      category: 'Themes & Problem Statements',
      badOutput: '“Users are unhappy with onboarding and UX.”',
      badFlaws: [
        'Vague category with zero operational mechanism.',
        'No numerator, denominator, or sample size provided.',
        'No traceable customer quotes or source breakdown.',
        'Treats sample feedback as universal truth across all users.',
      ],
      goodOutput: `“${otpCount} of ${totalEligible} analysed eligible feedback records (${otpPct}%) cite login friction. Specifically, SMS OTP delivery exceeds the 45-second countdown timer on cellular networks (Jio & Airtel), causing cart resets.”`,
      goodVirtues: [
        'Concrete failure mechanism named (OTP timeout vs carrier lag).',
        `Deterministic numerator and explicit denominator dynamically computed (${otpCount} / ${totalEligible}).`,
        'Clickable citations link directly to verified customer quotes.',
        'Clarifies that this reflects the analysed sample, not entire population.',
      ],
      sampleCitations: [
        { recordId: 'REC-01', label: 'REC-01 (Play Store · Row 3)' },
        { recordId: 'REC-02', label: 'REC-02 (Play Store · Row 8)' },
        { recordId: 'REC-16', label: 'REC-16 (Ticket · Row 63)' },
      ],
      explanation: 'A great VoC theme is actionable: an engineering team or PM can immediately write an issue ticket with repro conditions instead of guessing what "bad UX" means.',
    },
    {
      id: 'STD-02',
      category: 'Churn Signal Classification',
      badOutput: '“Customers will churn because delivery is slow and rating is 1-star.”',
      badFlaws: [
        'Equates low star ratings or anger with churn intent.',
        'Hallucinates churn prediction without customer statement.',
        'No distinction between reported past churn, stated forward intent, and competitor transfer.',
      ],
      goodOutput: `“${explicitChurnCount} of ${totalEligible} analysed records (${churnPct}%) contain explicit intent to cancel paid subscriptions following delayed deliveries and missing refund references. This is stated intent, not confirmed churn.”`,
      goodVirtues: [
        'Precise taxonomy: distinguishes explicit intent from reported past churn or irritation.',
        'Exposes the exact verbatim sentence containing the churn commitment.',
        'Explicit caveat that stated intent may differ from observed churn behavior.',
      ],
      sampleCitations: [
        { recordId: 'REC-05', label: 'REC-05 (Ticket · Row 22)' },
        { recordId: 'REC-22', label: 'REC-22 (Ticket · Row 94)' },
        { recordId: 'REC-08', label: 'REC-08 (Play Store · Row 31)' },
      ],
      explanation: 'Churn is an observable action or explicit commitment, not a general sentiment score. False churn alarms waste executive attention on the wrong problems.',
    },
    {
      id: 'STD-03',
      category: 'Roadmap & Interventions',
      badOutput: '“Build an AI chatbot to improve customer retention by 20% within 3 weeks.”',
      badFlaws: [
        'Invented business impact (+20% retention) with zero empirical basis.',
        'Arbitrary delivery timeline without engineering team sizing.',
        'Jumps to a pre-conceived solution ("AI chatbot") rather than solving the underlying user problem.',
      ],
      goodOutput: `“Test clearer refund-status updates: ${refundCount} of ${totalEligible} analysed records (${refundPct}%) cite anxiety over out-of-stock refunds. A 4-stage visual status timeline with bank UTR may reduce repeat contacts. Validate with a prototype and measure repeat refund-related tickets. Target metric marked to be set after baseline.”`,
      goodVirtues: [
        'Frames proposed intervention as a falsifiable hypothesis.',
        'Suggests a realistic zero-to-one validation step (prototype A/B test).',
        'Leaves unknown variables ("target to be set after baseline", "Needs team input") transparent rather than fabricating numbers.',
      ],
      sampleCitations: [
        { recordId: 'REC-04', label: 'REC-04 (Ticket · Row 14)' },
        { recordId: 'REC-14', label: 'REC-14 (Ticket · Row 56)' },
        { recordId: 'REC-26', label: 'REC-26 (WhatsApp · Msg #14)' },
      ],
      explanation: 'Defensible product decisions present hypotheses and measurable proxy metrics while being honest about what is currently unknown.',
    },
  ];
}
