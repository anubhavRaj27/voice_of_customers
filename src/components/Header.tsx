import React from 'react';
import { FileText, Sparkles, ShieldCheck, Database, BookOpen } from 'lucide-react';
import { WorkspaceContext } from '../types';

interface HeaderProps {
  context: WorkspaceContext;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBrief: () => void;
  onLoadDemo: () => void;
  isDemoLoaded: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  context,
  activeTab,
  setActiveTab,
  onOpenBrief,
  onLoadDemo,
  isDemoLoaded,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'themes', label: 'Themes & Quotes' },
    { id: 'churn', label: 'Churn Signals' },
    { id: 'roadmap', label: 'Roadmap Actions' },
    { id: 'evaluations', label: 'Evaluations' },
    { id: 'standards', label: 'Evidence Standards' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand title & workspace context */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            VoC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                Voice of Customer Copilot
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded">
                {context.productName}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-[380px]">
              Evidence-backed product decisions with traceable citations
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation tabs (single-line, clean typography) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onLoadDemo}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              isDemoLoaded
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Load 28 synthetic Indian quick-commerce records with WhatsApp, Play Store, and tickets"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>{isDemoLoaded ? 'Demo Loaded (DailyBasket)' : 'Try Demo Data'}</span>
          </button>

          <button
            onClick={onOpenBrief}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Decision Brief</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Tab Bar */}
      <div className="lg:hidden border-t border-slate-200/80 px-4 py-2 bg-slate-50/90 overflow-x-auto flex items-center gap-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
