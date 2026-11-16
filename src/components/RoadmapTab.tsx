import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Edit3,
  ExternalLink,
  Target,
  FlaskConical,
  AlertCircle,
  Save,
  MessageSquare,
} from 'lucide-react';
import {
  RoadmapRecommendation,
  RecommendationStatus,
  Theme,
  FeedbackRecord,
} from '../types';
import { calculateThemeFrequency } from '../utils/mathEngine';

interface RoadmapTabProps {
  recommendations: RoadmapRecommendation[];
  themes: Theme[];
  records: FeedbackRecord[];
  onUpdateRecommendation: (rec: RoadmapRecommendation) => void;
  onOpenCitation: (recordId: string) => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({
  recommendations,
  themes,
  records,
  onUpdateRecommendation,
  onOpenCitation,
}) => {
  const [filterStatus, setFilterStatus] = useState<RecommendationStatus | 'all'>('all');
  const [editingHypothesisId, setEditingHypothesisId] = useState<string | null>(null);
  const [tempHypothesis, setTempHypothesis] = useState('');
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});

  const eligibleRecords = records.filter(r => !r.isExcluded);
  const themeMap = new Map(themes.map(t => [t.id, t]));

  const filteredRecs =
    filterStatus === 'all'
      ? recommendations
      : recommendations.filter(r => r.status === filterStatus);

  const setStatus = (rec: RoadmapRecommendation, status: RecommendationStatus) => {
    onUpdateRecommendation({
      ...rec,
      status,
      pmDecisionNotes: tempNotes[rec.id] !== undefined ? tempNotes[rec.id] : rec.pmDecisionNotes,
    });
  };

  const handleSaveNotes = (rec: RoadmapRecommendation) => {
    onUpdateRecommendation({
      ...rec,
      pmDecisionNotes: tempNotes[rec.id],
    });
  };

  const startEditHypothesis = (rec: RoadmapRecommendation) => {
    setEditingHypothesisId(rec.id);
    setTempHypothesis(rec.hypothesis);
  };

  const saveEditHypothesis = (rec: RoadmapRecommendation) => {
    onUpdateRecommendation({
      ...rec,
      hypothesis: tempHypothesis,
    });
    setEditingHypothesisId(null);
  };

  const statusBadges: Record<RecommendationStatus, { label: string; color: string }> = {
    accepted: { label: 'Accepted', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    pending: { label: 'Under Review', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    deferred: { label: 'Deferred', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    dismissed: { label: 'Dismissed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    edited: { label: 'Revised', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header & Prioritization Philosophy */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Evidence-Backed Roadmap Actions
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Prioritized interventions tied directly to observed customer friction. Effort and revenue impact leave unverified metrics as "Needs team input".
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Actions:</span>
            <strong className="text-slate-900 font-mono">{recommendations.length}</strong>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Actions ({recommendations.length})
          </button>
          {(['accepted', 'pending', 'deferred', 'dismissed'] as RecommendationStatus[]).map(st => {
            const count = recommendations.filter(r => r.status === st).length;
            const active = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {statusBadges[st].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-6">
        {filteredRecs.map(rec => {
          const linkedThemes = rec.linkedThemeIds.map(id => themeMap.get(id)).filter(Boolean) as Theme[];
          const isHypothesisEditing = editingHypothesisId === rec.id;

          // Compute aggregate evidence citations
          const allLinkedRecordIds = Array.from(new Set(linkedThemes.flatMap(t => t.recordIds)));

          return (
            <div
              key={rec.id}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Card Header: Severity, Title, Status, and PM Quick Actions */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-500">{rec.id}</span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                          rec.severity.startsWith('P0')
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : rec.severity.startsWith('P1')
                            ? 'bg-orange-50 text-orange-800 border-orange-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {rec.severity}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          statusBadges[rec.status].color
                        }`}
                      >
                        {statusBadges[rec.status].label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {rec.title}
                    </h3>
                  </div>

                  {/* PM Prioritization Decision Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setStatus(rec, 'accepted')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        rec.status === 'accepted'
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setStatus(rec, 'deferred')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        rec.status === 'deferred'
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800'
                      }`}
                    >
                      Defer
                    </button>
                    <button
                      onClick={() => setStatus(rec, 'dismissed')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        rec.status === 'dismissed'
                          ? 'bg-slate-700 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-Section Visual Breakdown: Observation -> Interpretation -> Intervention */}
              <div className="p-5 space-y-5">
                {/* 1. Observation: Empirical Customer Problem & Linked Evidence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wide">
                    <span>1. Empirical Customer Evidence</span>
                    <span className="font-mono text-slate-500 lowercase font-normal">
                      {allLinkedRecordIds.length} supporting records in sample
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                    {rec.customerProblem}
                  </p>

                  {/* Linked Theme Badges & Citations */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-500 font-medium">Linked Themes:</span>
                    {linkedThemes.map(th => {
                      const freq = calculateThemeFrequency(th, eligibleRecords);
                      return (
                        <span
                          key={th.id}
                          className="bg-indigo-50 border border-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {th.title} ({freq.numerator}/{freq.denominator})
                        </span>
                      );
                    })}

                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500 font-medium">Evidence Citations:</span>
                    {allLinkedRecordIds.slice(0, 4).map(recId => (
                      <button
                        key={recId}
                        onClick={() => onOpenCitation(recId)}
                        className="font-mono text-[11px] text-indigo-700 hover:underline cursor-pointer"
                      >
                        [{recId}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Proposed Intervention & Validation Architecture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  {/* Left Column: Product Intervention */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wide block">
                      2. Proposed Intervention
                    </span>
                    <div className="text-slate-700 bg-white border border-slate-200 rounded-lg p-3 whitespace-pre-line leading-relaxed">
                      {rec.proposedIntervention}
                    </div>

                    <div className="pt-1">
                      <span className="font-semibold text-slate-800 block mb-0.5">
                        Severity Rubric:
                      </span>
                      <p className="text-slate-600 italic text-[11px]">
                        {rec.severityRubricExplanation}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Hypothesis, Metric, and Validation Test */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 uppercase tracking-wide">
                          Falsifiable Hypothesis
                        </span>
                        {!isHypothesisEditing && (
                          <button
                            onClick={() => startEditHypothesis(rec)}
                            className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        )}
                      </div>

                      {isHypothesisEditing ? (
                        <div className="space-y-1.5">
                          <textarea
                            value={tempHypothesis}
                            onChange={e => setTempHypothesis(e.target.value)}
                            rows={2}
                            className="w-full text-xs p-2 border border-slate-300 rounded focus:border-indigo-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditHypothesis(rec)}
                              className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white rounded font-medium"
                            >
                              Save Hypothesis
                            </button>
                            <button
                              onClick={() => setEditingHypothesisId(null)}
                              className="px-2.5 py-1 text-[11px] text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded border border-slate-200/60">
                          "{rec.hypothesis}"
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        Suggested Success Metric
                      </span>
                      <p className="text-slate-600 pl-4">{rec.successMetric}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        Practical Validation Step
                      </span>
                      <p className="text-slate-600 pl-4">{rec.validationStep}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Trade-offs & Uninvented Metrics Notice */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <span className="font-semibold text-slate-700">
                      Assumptions & Operational Trade-offs:
                    </span>
                    <p className="text-slate-600 leading-normal">
                      {rec.assumptionsAndTradeoffs}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Engineering Effort:</span>
                      <span className="font-mono text-slate-700">{rec.engineeringEffort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Revenue Impact:</span>
                      <span className="font-mono text-slate-700">{rec.revenueImpact}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200/50">
                      Zero invented RICE scores. Requires engineering team sizing.
                    </div>
                  </div>
                </div>

                {/* Persisted PM Decision Notes */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Record your PM decision rationale or sprint notes here..."
                    value={
                      tempNotes[rec.id] !== undefined
                        ? tempNotes[rec.id]
                        : rec.pmDecisionNotes || ''
                    }
                    onChange={e => setTempNotes({ ...tempNotes, [rec.id]: e.target.value })}
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveNotes(rec)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
