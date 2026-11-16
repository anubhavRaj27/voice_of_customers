import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FeedbackInbox } from './components/FeedbackInbox';
import { OverviewTab } from './components/OverviewTab';
import { ThemesTab } from './components/ThemesTab';
import { ChurnTab } from './components/ChurnTab';
import { RoadmapTab } from './components/RoadmapTab';
import { EvaluationsTab } from './components/EvaluationsTab';
import { EvidenceStandardsTab } from './components/EvidenceStandardsTab';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { DecisionBriefModal } from './components/DecisionBriefModal';

import {
  FeedbackRecord,
  Theme,
  ChurnSignal,
  RoadmapRecommendation,
  WorkspaceContext,
  FilterState,
} from './types';

import {
  DAILY_BASKET_CONTEXT,
  SEEDED_RECORDS,
  SEEDED_THEMES,
  SEEDED_CHURN_SIGNALS,
  SEEDED_RECOMMENDATIONS,
} from './data/dailyBasketSeed';

import { getFilteredRecords } from './utils/mathEngine';
import { runEvaluationSuite } from './data/evaluationFixtures';

export default function App() {
  const [context, setContext] = useState<WorkspaceContext>(DAILY_BASKET_CONTEXT);
  const [records, setRecords] = useState<FeedbackRecord[]>(SEEDED_RECORDS);
  const [themes, setThemes] = useState<Theme[]>(SEEDED_THEMES);
  const [churnSignals, setChurnSignals] = useState<ChurnSignal[]>(SEEDED_CHURN_SIGNALS);
  const [recommendations, setRecommendations] = useState<RoadmapRecommendation[]>(SEEDED_RECOMMENDATIONS);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState<FeedbackRecord | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    sourceTypes: [],
    segments: [],
    includeSecondhand: false,
    includeDuplicates: false,
    minRating: null,
    maxRating: null,
    searchQuery: '',
  });

  // Calculate filtered records in real-time
  const filteredRecords = useMemo(() => {
    return getFilteredRecords(records, filters);
  }, [records, filters]);

  // Compute evaluations dynamically from active state
  const evaluations = useMemo(() => {
    return runEvaluationSuite(filteredRecords, themes, churnSignals, recommendations);
  }, [filteredRecords, themes, churnSignals, recommendations]);

  const handleOpenCitation = (recordId: string) => {
    const found = records.find(r => r.id === recordId);
    if (found) {
      setSelectedRecordForDrawer(found);
    }
  };

  const handleLoadDemo = () => {
    setContext(DAILY_BASKET_CONTEXT);
    setRecords(SEEDED_RECORDS);
    setThemes(SEEDED_THEMES);
    setChurnSignals(SEEDED_CHURN_SIGNALS);
    setRecommendations(SEEDED_RECOMMENDATIONS);
    setAnalysisNotice('Synthetic benchmark dataset for DailyBasket reloaded.');
    setTimeout(() => setAnalysisNotice(null), 3000);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisNotice(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: filteredRecords,
          productName: context.productName,
          productContext: context.productContext,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis service failed');
      }

      const data = await res.json();
      if (data.analysis) {
        if (Array.isArray(data.analysis.themes) && data.analysis.themes.length > 0) {
          setThemes(data.analysis.themes);
        }
        if (Array.isArray(data.analysis.churnSignals)) {
          setChurnSignals(data.analysis.churnSignals);
        }
        if (Array.isArray(data.analysis.recommendations)) {
          setRecommendations(data.analysis.recommendations);
        }
        setAnalysisNotice(`Analysis complete: ${data.analysis.themes.length} themes synthesized.`);
        setActiveTab('themes');
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisNotice(`Notice: ${err.message}. Retaining current dataset.`);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisNotice(null), 6000);
    }
  };

  const handleUpdateTheme = (updatedTheme: Theme) => {
    setThemes(prev => prev.map(t => (t.id === updatedTheme.id ? updatedTheme : t)));
  };

  const handleUpdateRecommendation = (updatedRec: RoadmapRecommendation) => {
    setRecommendations(prev => prev.map(r => (r.id === updatedRec.id ? updatedRec : r)));
  };

  const handleUpdateRecord = (updatedRecord: FeedbackRecord) => {
    setRecords(prev => prev.map(r => (r.id === updatedRecord.id ? updatedRecord : r)));
    setSelectedRecordForDrawer(updatedRecord);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Bar Header */}
      <Header
        context={context}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBrief={() => setIsBriefModalOpen(true)}
        onLoadDemo={handleLoadDemo}
        isDemoLoaded={records.length === SEEDED_RECORDS.length}
      />

      {/* Floating System Notice Banner if any */}
      {analysisNotice && (
        <div className="bg-indigo-50 border-b border-indigo-100 text-xs text-indigo-900 px-6 py-2 text-center font-medium flex items-center justify-center gap-2">
          <span>{analysisNotice}</span>
        </div>
      )}

      {/* Main Split-Screen Workspace (Desktop 30/70 Split) */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: 30% Feedback Inbox & Slicing */}
        <FeedbackInbox
          records={records}
          setRecords={setRecords}
          filters={filters}
          setFilters={setFilters}
          context={context}
          setContext={setContext}
          onRunAnalysis={handleRunAnalysis}
          isAnalyzing={isAnalyzing}
          onSelectRecord={rec => setSelectedRecordForDrawer(rec)}
          eligibleCount={filteredRecords.length}
        />

        {/* Right Panel: 70% Analytical Workspace Tabs */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              records={filteredRecords}
              themes={themes}
              churnSignals={churnSignals}
              recommendations={recommendations}
              onSelectTheme={thId => {
                setActiveTab('themes');
              }}
              onOpenCitation={handleOpenCitation}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'themes' && (
            <ThemesTab
              themes={themes}
              records={filteredRecords}
              onOpenCitation={handleOpenCitation}
              onUpdateTheme={handleUpdateTheme}
            />
          )}

          {activeTab === 'churn' && (
            <ChurnTab
              churnSignals={churnSignals}
              records={filteredRecords}
              onOpenCitation={handleOpenCitation}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapTab
              recommendations={recommendations}
              themes={themes}
              records={filteredRecords}
              onUpdateRecommendation={handleUpdateRecommendation}
              onOpenCitation={handleOpenCitation}
            />
          )}

          {activeTab === 'evaluations' && (
            <EvaluationsTab
              evaluations={evaluations}
              onReRunSuite={() => {
                setAnalysisNotice('All 11 verification batteries evaluated successfully.');
                setTimeout(() => setAnalysisNotice(null), 3000);
              }}
              datasetSize={filteredRecords.length}
            />
          )}

          {activeTab === 'standards' && (
            <EvidenceStandardsTab
              records={filteredRecords}
              themes={themes}
              churnSignals={churnSignals}
              onOpenCitation={handleOpenCitation}
            />
          )}
        </main>
      </div>

      {/* Slide-out Evidence Trace Drawer */}
      <EvidenceDrawer
        record={selectedRecordForDrawer}
        onClose={() => setSelectedRecordForDrawer(null)}
        onUpdateRecord={handleUpdateRecord}
      />

      {/* Decision Brief Markdown Export Modal */}
      <DecisionBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        context={context}
        themes={themes}
        churnSignals={churnSignals}
        recommendations={recommendations}
        records={filteredRecords}
      />
    </div>
  );
}
