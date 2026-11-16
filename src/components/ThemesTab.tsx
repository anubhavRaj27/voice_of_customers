import React, { useState } from 'react';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { FeedbackRecord, Theme } from '../types';
import { calculateThemeFrequency } from '../utils/mathEngine';

interface ThemesTabProps {
  themes: Theme[];
  records: FeedbackRecord[];
  onOpenCitation: (recordId: string) => void;
  onUpdateTheme: (updatedTheme: Theme) => void;
}

export const ThemesTab: React.FC<ThemesTabProps> = ({
  themes,
  records,
  onOpenCitation,
  onUpdateTheme,
}) => {
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(themes[0]?.id || null);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProblem, setEditProblem] = useState('');
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});

  const eligibleRecords = records.filter(r => !r.isExcluded);

  const startEdit = (theme: Theme) => {
    setEditingThemeId(theme.id);
    setEditTitle(theme.title);
    setEditProblem(theme.problemStatement);
  };

  const saveEdit = (theme: Theme) => {
    onUpdateTheme({
      ...theme,
      title: editTitle,
      problemStatement: editProblem,
    });
    setEditingThemeId(null);
  };

  const toggleTranslation = (quoteKey: string) => {
    setShowTranslations(prev => ({
      ...prev,
      [quoteKey]: !prev[quoteKey],
    }));
  };

  return (
    <div className="space-y-5">
      {/* Tab Header & Methodological Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Customer Themes & Pain Points
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Ranked by deterministic frequency within active analysed records. All citations resolve to source evidence.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60 shrink-0">
          Denominator: <span className="font-semibold text-slate-800">{eligibleRecords.length} records</span> in active slice
        </div>
      </div>

      {/* Themes List */}
      <div className="space-y-4">
        {themes.map((theme, index) => {
          const freq = calculateThemeFrequency(theme, eligibleRecords);
          const isExpanded = expandedThemeId === theme.id;
          const isEditing = editingThemeId === theme.id;

          return (
            <div
              key={theme.id}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs transition-all hover:border-slate-300"
            >
              {/* Theme Header Card */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Index, Theme ID, and Frequency Metric */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        #{index + 1} · {theme.id}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {freq.numerator} of {freq.denominator} records ({freq.percentage.toFixed(1)}%)
                      </span>
                      {freq.uniqueCustomers && (
                        <>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 tabular-nums">
                            {freq.uniqueCustomers} unique customers
                          </span>
                        </>
                      )}
                      <span className="text-slate-400">·</span>
                      {/* Evidence Strength Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          theme.evidenceStrength === 'high'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                            : theme.evidenceStrength === 'moderate'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200/70'
                            : 'bg-amber-50 text-amber-800 border border-amber-200/70'
                        }`}
                        title={theme.strengthRationale}
                      >
                        {theme.evidenceStrength.toUpperCase()} EVIDENCE
                      </span>
                    </div>

                    {/* Title & Problem Statement */}
                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full text-sm font-bold text-slate-900 px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                        />
                        <textarea
                          value={editProblem}
                          onChange={e => setEditProblem(e.target.value)}
                          rows={2}
                          className="w-full text-xs text-slate-700 px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(theme)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingThemeId(null)}
                            className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {theme.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {theme.problemStatement}
                        </p>
                      </>
                    )}

                    {/* Rationale explanation */}
                    <p className="text-[11px] text-slate-500 italic">
                      Strength rationale: {theme.strengthRationale}
                    </p>
                  </div>

                  {/* Top-right quick actions: Edit & Expand */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(theme)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit theme title or problem statement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedThemeId(isExpanded ? null : theme.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Source Channels Breakdown Strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Source breakdown:</span>
                  {Object.entries(freq.sourceCounts).map(([src, count]) => (
                    <span key={src} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] tabular-nums">
                      {src}: <strong className="text-slate-900">{count}</strong>
                    </span>
                  ))}
                  {theme.segmentDistribution && Object.keys(theme.segmentDistribution).length > 0 && (
                    <>
                      <span className="text-slate-300">|</span>
                      <span className="font-semibold text-slate-700">Segments:</span>
                      {Object.entries(theme.segmentDistribution).map(([seg, count]) => (
                        <span key={seg} className="text-slate-600 text-[11px]">
                          {seg} ({count})
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Expanded Evidence & Quotes Drawer Section */}
              {isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-200/80 p-5 space-y-4">
                  {/* Contradictory Evidence or Limitations Callout */}
                  {theme.contradictionsOrLimitations && (
                    <div className="bg-amber-50/80 border border-amber-200/70 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">
                          Contradictory Signals & Caveats:
                        </span>
                        <p className="text-amber-800 leading-normal">
                          {theme.contradictionsOrLimitations}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Supporting Quotes Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Verbatim Customer Quotes ({theme.evidenceQuotes.length} citations)
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Click citation to inspect raw file & locator
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {theme.evidenceQuotes.map((quote, qIdx) => {
                        const quoteKey = `${theme.id}-${quote.recordId}-${qIdx}`;
                        const showGloss = showTranslations[quoteKey];

                        return (
                          <div
                            key={quoteKey}
                            className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <button
                                  onClick={() => onOpenCitation(quote.recordId)}
                                  className="font-mono font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <span>{quote.recordId}</span>
                                  <span className="text-slate-400">·</span>
                                  <span className="font-sans text-[11px] text-slate-600">{quote.locator}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </button>
                                <span className="text-[11px] text-slate-500 capitalize">
                                  {quote.sourceType}
                                </span>
                              </div>

                              {/* Verbatim Quote in Original Script */}
                              <blockquote className="text-xs text-slate-800 italic leading-relaxed pt-1">
                                "{quote.quoteText}"
                              </blockquote>

                              {/* Optional English Translation */}
                              {quote.translatedQuoteText && quote.translatedQuoteText !== quote.quoteText && (
                                <div className="pt-1">
                                  {showGloss ? (
                                    <div className="bg-slate-50 border border-slate-200/60 rounded p-2 text-xs text-slate-600 mt-1">
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                                        English Translation
                                      </span>
                                      "{quote.translatedQuoteText}"
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                              {quote.translatedQuoteText && quote.translatedQuoteText !== quote.quoteText ? (
                                <button
                                  onClick={() => toggleTranslation(quoteKey)}
                                  className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                                >
                                  {showGloss ? 'Hide Translation' : 'View English Translation'}
                                </button>
                              ) : (
                                <span className="text-slate-400">Original in English</span>
                              )}

                              {quote.verifiedMatch && (
                                <span className="text-emerald-700 font-medium flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Verbatim Matched
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
