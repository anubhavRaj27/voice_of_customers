import React, { useState } from 'react';
import {
  AlertTriangle,
  UserX,
  TrendingDown,
  ShieldCheck,
  ExternalLink,
  Info,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ChurnCategory, ChurnSignal, FeedbackRecord } from '../types';

interface ChurnTabProps {
  churnSignals: ChurnSignal[];
  records: FeedbackRecord[];
  onOpenCitation: (recordId: string) => void;
}

export const ChurnTab: React.FC<ChurnTabProps> = ({
  churnSignals,
  records,
  onOpenCitation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ChurnCategory | 'all'>('all');

  const recordMap = new Map(records.map(r => [r.id, r]));

  const categoryDefinitions: Record<
    ChurnCategory,
    { label: string; badgeColor: string; description: string }
  > = {
    reported_churn: {
      label: 'Reported Past Churn',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200/80',
      description: 'Customer explicitly states they completed the uninstall or deleted their account.',
    },
    explicit_intent: {
      label: 'Explicit Churn Intent',
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200/80',
      description: 'Clear statement of future intention to cancel subscription or close account.',
    },
    risk_competitor: {
      label: 'Competitor Consideration / Churn Risk',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
      description: 'Transferring basket spend to a competitor (e.g. Blinkit/Zepto) or severe repeat unresolved issues.',
    },
    high_frustration_only: {
      label: 'Negative Sentiment (No Churn Signal)',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      description: 'Angry tone or low 1-star rating without any statement of uninstalling, cancelling, or leaving.',
    },
  };

  const filteredSignals =
    selectedCategory === 'all'
      ? churnSignals
      : churnSignals.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header & Rigor Notice */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Churn Signal Taxonomy
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Disciplined isolation of verified churn actions and explicit statements from general customer dissatisfaction.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Signals Identified:</span>
            <strong className="text-slate-900 font-mono">{churnSignals.length}</strong>
          </div>
        </div>

        {/* Analytical Rubric Notice */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Product Management Integrity Rule: Low Rating ≠ Churn Intent
            </p>
            <p className="text-amber-800 leading-normal">
              Many customers leave 1-star reviews out of transient frustration while continuing daily usage.
              VoC Copilot never hallucinates churn probabilities without a calibrated predictive model, and explicitly quarantines
              negative sentiment that lacks an actionable cancellation or uninstallation statement.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Signals ({churnSignals.length})
        </button>
        {(Object.keys(categoryDefinitions) as ChurnCategory[]).map(cat => {
          const count = churnSignals.filter(s => s.category === cat).length;
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                active
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {categoryDefinitions[cat].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Churn Signal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSignals.map(signal => {
          const parent = recordMap.get(signal.recordId);
          const meta = categoryDefinitions[signal.category];

          return (
            <div
              key={signal.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${meta.badgeColor}`}
                  >
                    {meta.label.toUpperCase()}
                  </span>
                  <button
                    onClick={() => onOpenCitation(signal.recordId)}
                    className="font-mono text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{signal.recordId}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-sans text-[11px] text-slate-600">
                      {parent?.locator || 'Locator'}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                {/* Verbatim Supporting Quote */}
                <blockquote className="text-xs text-slate-900 font-medium italic border-l-2 border-slate-200 pl-3 py-0.5">
                  "{signal.quote}"
                </blockquote>

                {/* English Translation if Vernacular */}
                {signal.translatedQuote && signal.translatedQuote !== signal.quote && (
                  <div className="bg-slate-50 border border-slate-200/60 rounded p-2 text-xs text-slate-600">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                      English Translation
                    </span>
                    "{signal.translatedQuote}"
                  </div>
                )}

                {/* Analytical Rationale */}
                <div className="text-xs text-slate-600 pt-1">
                  <span className="font-semibold text-slate-700">PM Analytical Basis: </span>
                  {signal.rationale}
                </div>
              </div>

              {/* Footer Metadata */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="capitalize">{parent?.sourceType || 'Source'}</span>
                <span>{parent?.segment || 'General Segment'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
