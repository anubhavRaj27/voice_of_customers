import React, { useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getDynamicEvidenceStandards } from '../data/evidenceStandards';
import { FeedbackRecord, Theme, ChurnSignal } from '../types';

interface EvidenceStandardsTabProps {
  records: FeedbackRecord[];
  themes: Theme[];
  churnSignals: ChurnSignal[];
  onOpenCitation: (recordId: string) => void;
}

export const EvidenceStandardsTab: React.FC<EvidenceStandardsTabProps> = ({
  records,
  themes,
  churnSignals,
  onOpenCitation,
}) => {
  const dynamicStandards = useMemo(() => {
    return getDynamicEvidenceStandards(records, themes, churnSignals);
  }, [records, themes, churnSignals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Evidence Standards: Good vs. Bad Output
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          A definitive PM benchmark distinguishing hand-waving assertions from rigorous, evidence-backed synthesis. All fractions below are derived dynamically from the active records and filters.
        </p>
      </div>

      {/* Standards Cards List */}
      <div className="space-y-6">
        {dynamicStandards.map(standard => (
          <div
            key={standard.id}
            className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs space-y-4 p-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {standard.category}
              </span>
              <span className="text-[11px] font-mono text-slate-400">{standard.id}</span>
            </div>

            {/* Side-by-side: Bad vs Good */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bad Output Card */}
              <div className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Sub-standard AI / PM Output</span>
                </div>
                <blockquote className="text-xs font-medium text-slate-900 italic bg-white p-3 rounded-lg border border-rose-200/60 shadow-2xs">
                  {standard.badOutput}
                </blockquote>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-rose-900 block">
                    Critical Flaws & Antipatterns:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                    {standard.badFlaws.map((flaw, idx) => (
                      <li key={idx}>{flaw}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Good Output Card */}
              <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Defensible VoC Copilot Standard</span>
                </div>
                <blockquote className="text-xs font-medium text-slate-900 italic bg-white p-3 rounded-lg border border-emerald-200/60 shadow-2xs">
                  {standard.goodOutput}
                </blockquote>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-emerald-900 block">
                    Why This Demonstrates Senior Product Thinking:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                    {standard.goodVirtues.map((virtue, idx) => (
                      <li key={idx}>{virtue}</li>
                    ))}
                  </ul>
                </div>

                {/* Interactive Citations */}
                <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700">Resolvable Evidence:</span>
                  {standard.sampleCitations.map(cit => (
                    <button
                      key={cit.recordId}
                      onClick={() => onOpenCitation(cit.recordId)}
                      className="font-mono text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 hover:border-indigo-400 px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{cit.label}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Commentary Explanation */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">PM Takeaway: </strong>
              {standard.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
