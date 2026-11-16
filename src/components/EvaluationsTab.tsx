import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Info,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';
import { EvaluationItem } from '../types';

interface EvaluationsTabProps {
  evaluations: EvaluationItem[];
  onReRunSuite: () => void;
  datasetSize: number;
}

export const EvaluationsTab: React.FC<EvaluationsTabProps> = ({
  evaluations,
  onReRunSuite,
  datasetSize,
}) => {
  const [expandedEvalId, setExpandedEvalId] = useState<string | null>(evaluations[0]?.id || null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'passed' | 'review' | 'failed'>('all');

  const totalTests = evaluations.length;
  const passedTests = evaluations.filter(e => e.status === 'passed').length;
  const reviewTests = evaluations.filter(e => e.status === 'review').length;
  const failedTests = evaluations.filter(e => e.status === 'failed').length;

  const filteredEvals =
    selectedFilter === 'all'
      ? evaluations
      : evaluations.filter(e => e.status === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Header and Live Benchmark Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              AI & Deterministic Evaluation Suite
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              11 automated evaluation batteries assessing citation coverage, quote fidelity, counting math, multilingual preservation, and prompt injection defense.
            </p>
          </div>
          <button
            onClick={onReRunSuite}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Re-Run All 11 Tests</span>
          </button>
        </div>

        {/* Benchmark Dataset Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Evaluations Passed</span>
            <div className="text-xl font-bold text-emerald-700 tabular-nums">
              {passedTests} / {totalTests}
            </div>
            <span className="text-[10px] text-slate-400">100% Deterministic Target</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Under Review / Semantic</span>
            <div className="text-xl font-bold text-amber-700 tabular-nums">{reviewTests}</div>
            <span className="text-[10px] text-slate-400">Human / Semantic rubrics</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Failed Invariants</span>
            <div className="text-xl font-bold text-rose-700 tabular-nums">{failedTests}</div>
            <span className="text-[10px] text-slate-400">0 allowed on citations/math</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Test Dataset Size</span>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {datasetSize} records
            </div>
            <span className="text-[10px] text-slate-400">Hindi, Hinglish, & English</span>
          </div>
        </div>

        {/* Evaluation Rigor Disclaimer */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">
              Evaluation Methodology & Limitations Disclaimer:
            </p>
            <p className="text-slate-600 leading-relaxed">
              These evaluations distinguish deterministic mathematical checks ($N/D$, substring verification, deduplication quarantine)
              from semantic categorizations and adversarial defenses. Passing this curated benchmark demonstrates correctness on known failure modes;
              it does not guarantee zero edge cases on unconstrained production data. All test results reflect code actually executed in this session.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 text-xs">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Tests ({totalTests})
        </button>
        <button
          onClick={() => setSelectedFilter('passed')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            selectedFilter === 'passed'
              ? 'bg-white text-emerald-800 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Passed ({passedTests})
        </button>
        <button
          onClick={() => setSelectedFilter('review')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            selectedFilter === 'review'
              ? 'bg-white text-amber-800 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Under Review ({reviewTests})
        </button>
      </div>

      {/* Evaluations List */}
      <div className="space-y-3">
        {filteredEvals.map((item, idx) => {
          const isExpanded = expandedEvalId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              <div
                onClick={() => setExpandedEvalId(isExpanded ? null : item.id)}
                className="p-4 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] font-mono text-slate-500 uppercase">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-normal">{item.description}</p>

                  <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      Target: <strong className="text-slate-800">{item.targetBenchmark}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Observed: <strong className="text-slate-800">{item.observedResult}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      item.status === 'passed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.status === 'review'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {item.status === 'passed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : item.status === 'review' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span className="capitalize">{item.status}</span>
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Test Fixture Inspection Drawer */}
              {isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-200/80 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">
                        Expected Invariant Behavior:
                      </span>
                      <p className="text-slate-800">{item.expectedBehavior}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">
                        Observed Execution Result:
                      </span>
                      <p className="text-slate-800 font-mono text-[11px]">{item.observedResult}</p>
                    </div>
                  </div>

                  {/* Individual Test Fixture Logs */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Executed Fixture Logs ({item.details.logEntries.length} test assertions)
                    </h4>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {item.details.logEntries.map((log, lIdx) => (
                        <div
                          key={lIdx}
                          className="bg-white border border-slate-200/70 rounded p-2.5 text-xs flex items-start justify-between gap-3"
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400">
                                {log.fixtureId}
                              </span>
                              <span className="font-medium text-slate-800">
                                {log.testDescription}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Expected: {log.expected}
                            </p>
                            <p className="text-[11px] text-slate-700">
                              Actual: {log.actual}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              log.passed
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {log.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      ))}
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
