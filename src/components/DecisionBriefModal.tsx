import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  Share2,
} from 'lucide-react';
import {
  WorkspaceContext,
  Theme,
  ChurnSignal,
  RoadmapRecommendation,
  FeedbackRecord,
} from '../types';
import { calculateThemeFrequency } from '../utils/mathEngine';

interface DecisionBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: WorkspaceContext;
  themes: Theme[];
  churnSignals: ChurnSignal[];
  recommendations: RoadmapRecommendation[];
  records: FeedbackRecord[];
}

export const DecisionBriefModal: React.FC<DecisionBriefModalProps> = ({
  isOpen,
  onClose,
  context,
  themes,
  churnSignals,
  recommendations,
  records,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const eligibleRecords = records.filter(r => !r.isExcluded);
  const totalEligible = eligibleRecords.length;
  const recordMap = new Map(records.map(r => [r.id, r]));

  // Generate clean Markdown brief
  const generateMarkdown = (): string => {
    const today = new Date().toISOString().split('T')[0];
    let md = `# Product Decision Brief: ${context.productName}\n\n`;
    md += `**Date:** ${today}  \n`;
    md += `**Context:** ${context.productContext}  \n`;
    md += `**Sample Size:** ${totalEligible} eligible customer feedback records analyzed (${records.length - totalEligible} duplicate/unverified records excluded).  \n\n`;
    md += `---\n\n`;

    md += `## 1. Executive Summary\n\n`;
    md += `This brief synthesizes qualitative customer feedback into evidence-backed product priorities. `;
    md += `All frequency claims cite deterministic record bindings ($N / D$); churn signals are strictly separated from general negative sentiment.\n\n`;

    md += `## 2. Key Customer Pain Points (Ranked Themes)\n\n`;
    themes.forEach((theme, idx) => {
      const freq = calculateThemeFrequency(theme, eligibleRecords);
      md += `### ${idx + 1}. ${theme.title}\n`;
      md += `- **Frequency:** ${freq.numerator} of ${freq.denominator} analyzed records (${freq.percentage.toFixed(1)}%)\n`;
      md += `- **Problem Statement:** ${theme.problemStatement}\n`;
      md += `- **Evidence Strength:** ${theme.evidenceStrength.toUpperCase()} (${theme.strengthRationale})\n`;
      if (theme.contradictionsOrLimitations) {
        md += `- **Limitations/Caveats:** ${theme.contradictionsOrLimitations}\n`;
      }
      md += `- **Verbatim Customer Quotes:**\n`;
      theme.evidenceQuotes.forEach(q => {
        md += `  > "${q.quoteText}" — [${q.recordId} · ${q.locator}]\n`;
        if (q.translatedQuoteText && q.translatedQuoteText !== q.quoteText) {
          md += `  > *(English Translation: "${q.translatedQuoteText}")*\n`;
        }
      });
      md += `\n`;
    });

    md += `## 3. Churn Signal Breakdown\n\n`;
    const reported = churnSignals.filter(s => s.category === 'reported_churn');
    const explicit = churnSignals.filter(s => s.category === 'explicit_intent');
    const competitor = churnSignals.filter(s => s.category === 'risk_competitor');

    md += `- **Reported Past Churn (Uninstalled/Deleted):** ${reported.length} records\n`;
    reported.forEach(s => {
      md += `  - "${s.quote}" [${s.recordId}]\n`;
    });
    md += `- **Stated Churn Intent (Forward-looking Cancellation):** ${explicit.length} records\n`;
    explicit.forEach(s => {
      md += `  - "${s.quote}" [${s.recordId}]\n`;
    });
    md += `- **Competitor Consideration:** ${competitor.length} records\n\n`;

    md += `## 4. Prioritized Roadmap Interventions & Decisions\n\n`;
    recommendations.forEach(rec => {
      md += `### [${rec.severity}] ${rec.title} (${rec.status.toUpperCase()})\n`;
      md += `- **Customer Problem:** ${rec.customerProblem}\n`;
      md += `- **Proposed Intervention:** ${rec.proposedIntervention.replace(/\n/g, ' ')}\n`;
      md += `- **Hypothesis:** ${rec.hypothesis}\n`;
      md += `- **Success Metric:** ${rec.successMetric}\n`;
      md += `- **Validation Test:** ${rec.validationStep}\n`;
      md += `- **Trade-offs & Assumptions:** ${rec.assumptionsAndTradeoffs}\n`;
      md += `- **Effort & Revenue Impact:** ${rec.engineeringEffort} (Zero fabricated RICE scores)\n`;
      if (rec.pmDecisionNotes) {
        md += `- **PM Decision Rationale:** ${rec.pmDecisionNotes}\n`;
      }
      md += `\n`;
    });

    md += `## 5. Traceable Citation Index\n\n`;
    eligibleRecords.forEach(r => {
      md += `- **[${r.id}]**: ${r.sourceName} (${r.locator}) · *"${r.originalText.slice(0, 70)}..."*\n`;
    });

    return md;
  };

  const markdownContent = generateMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `decision_brief_${context.productName.toLowerCase().replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Export Decision Brief: {context.productName}
              </h3>
              <p className="text-xs text-slate-500">
                Formatted executive brief ready for leadership or sprint reviews with traceable citations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Markdown Preview */}
        <div className="p-5 flex-1 overflow-y-auto font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 whitespace-pre-wrap leading-relaxed select-all">
          {markdownContent}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Includes {themes.length} themes, {churnSignals.length} churn signals, and {recommendations.length} action items
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
