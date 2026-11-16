import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Info,
  Layers,
  UserCheck,
  RotateCcw,
  FileType,
} from 'lucide-react';
import {
  FeedbackRecord,
  FilterState,
  SourceType,
  WorkspaceContext,
} from '../types';
import { parseCSVToRows, autoDetectMapping, processRawRowsToRecords, ColumnMapping } from '../utils/csvParser';

interface FeedbackInboxProps {
  records: FeedbackRecord[];
  setRecords: React.Dispatch<React.SetStateAction<FeedbackRecord[]>>;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  context: WorkspaceContext;
  setContext: React.Dispatch<React.SetStateAction<WorkspaceContext>>;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onSelectRecord: (record: FeedbackRecord) => void;
  eligibleCount: number;
}

export const FeedbackInbox: React.FC<FeedbackInboxProps> = ({
  records,
  setRecords,
  filters,
  setFilters,
  context,
  setContext,
  onRunAnalysis,
  isAnalyzing,
  onSelectRecord,
  eligibleCount,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste' | 'ocr'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType>('playstore');
  const [pastedLocator, setPastedLocator] = useState('Pasted #1');
  const [isSecondhandInput, setIsSecondhandInput] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [pendingCSVRows, setPendingCSVRows] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [pendingFileName, setPendingFileName] = useState('');
  const [activeMapping, setActiveMapping] = useState<ColumnMapping>({ feedbackText: '' });
  const [showAuditDetails, setShowAuditDetails] = useState(false);
  const [showContextEdit, setShowContextEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Calculate audit summary
  const totalExtracted = records.length;
  const duplicatesExcluded = records.filter(r => !!r.duplicateOf).length;
  const secondhandCount = records.filter(r => r.isSecondhand).length;
  const uniqueFiles = Array.from(new Set(records.map(r => r.sourceName)));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const isCSV = fileName.endsWith('.csv');
    const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf';
    const isImage = /\.(jpg|jpeg|png)$/i.test(fileName);

    if (isPDF) {
      handlePDFFile(file);
      return;
    }

    if (isImage) {
      handleImageFile(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      if (isCSV) {
        const { headers, rows } = parseCSVToRows(content);
        if (rows.length === 0) {
          alert('CSV file appears empty or unreadable.');
          return;
        }
        const mapping = autoDetectMapping(headers);
        setCsvHeaders(headers);
        setPendingCSVRows(rows);
        setPendingFileName(fileName);
        setActiveMapping(mapping);
        setShowMappingModal(true);
      } else {
        // Plain text lines or docx text
        const lines = content.split('\n').filter(l => l.trim().length > 5);
        const newRecords: FeedbackRecord[] = lines.map((line, idx) => ({
          id: `REC-${String(records.length + idx + 1).padStart(2, '0')}`,
          sourceType: selectedSourceType,
          sourceName: fileName,
          originalText: line.trim(),
          language: 'en',
          date: new Date().toISOString().split('T')[0],
          locator: `Line ${idx + 1}`,
          isSecondhand: isSecondhandInput,
        }));
        setRecords(prev => [...prev, ...newRecords]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePDFFile = (file: File) => {
    setProcessingFile(true);
    setIngestionError(null);
    const reader = new FileReader();
    reader.onload = async event => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: 'application/pdf',
            sourceType: 'pdf_document',
            fileName: file.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'PDF extraction failed');
        }

        const data = await res.json();
        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
          const mappedRecords: FeedbackRecord[] = data.records.map((item: any, idx: number) => ({
            id: `REC-${String(records.length + idx + 1).padStart(2, '0')}`,
            sourceType: 'pdf_document',
            sourceName: file.name,
            originalText: item.originalText,
            rawOcrText: item.originalText,
            translatedText: item.translatedText,
            language: item.language || 'en',
            date: new Date().toISOString().split('T')[0],
            rating: item.rating || undefined,
            segment: item.segment || 'PDF Extract',
            locator: item.locator || `Page 1, Record #${idx + 1}`,
            isSecondhand: item.senderType === 'stakeholder',
          }));
          setRecords(prev => [...prev, ...mappedRecords]);
        } else {
          setIngestionError('No legible feedback extracted from this PDF.');
        }
      } catch (err: any) {
        setIngestionError(err.message || 'Failed to extract text from PDF document');
      } finally {
        setProcessingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFile = (file: File) => {
    setProcessingFile(true);
    setIngestionError(null);
    const reader = new FileReader();
    reader.onload = async event => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
            sourceType: 'whatsapp',
            fileName: file.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'OCR service returned error');
        }

        const data = await res.json();
        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
          const mappedRecords: FeedbackRecord[] = data.records.map((item: any, idx: number) => ({
            id: `REC-${String(records.length + idx + 1).padStart(2, '0')}`,
            sourceType: 'whatsapp',
            sourceName: file.name,
            originalText: item.originalText,
            rawOcrText: item.originalText,
            originalImageUrl: base64, // Keep original screenshot for PM review
            translatedText: item.translatedText,
            language: item.language || 'en',
            date: new Date().toISOString().split('T')[0],
            rating: item.rating || undefined,
            segment: item.segment || 'WhatsApp Community',
            locator: item.locator || `Screenshot Msg #${idx + 1}`,
            isSecondhand: false,
          }));
          setRecords(prev => [...prev, ...mappedRecords]);
        } else {
          setIngestionError('No legible customer feedback recognized in this screenshot.');
        }
      } catch (err: any) {
        setIngestionError(err.message || 'Failed to extract text from screenshot');
      } finally {
        setProcessingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyCSVMapping = () => {
    if (!activeMapping.feedbackText) {
      alert('Please select a column for Feedback Text.');
      return;
    }
    const { records: mapped } = processRawRowsToRecords(
      pendingCSVRows,
      activeMapping,
      pendingFileName,
      selectedSourceType,
      records
    );
    setRecords(prev => [...prev, ...mapped]);
    setShowMappingModal(false);
  };

  const handleAddPastedText = () => {
    if (!pastedText.trim()) return;
    const newRecord: FeedbackRecord = {
      id: `REC-${String(records.length + 1).padStart(2, '0')}`,
      sourceType: selectedSourceType,
      sourceName: 'Pasted Feedback',
      originalText: pastedText.trim(),
      language: 'en',
      date: new Date().toISOString().split('T')[0],
      locator: pastedLocator || `Entry #${records.length + 1}`,
      isSecondhand: isSecondhandInput,
    };
    setRecords(prev => [...prev, newRecord]);
    setPastedText('');
    setPastedLocator('');
  };

  const sourceLabels: { type: SourceType; label: string }[] = [
    { type: 'playstore', label: 'Play Store' },
    { type: 'ticket', label: 'Support Ticket' },
    { type: 'sales_call', label: 'Sales Call' },
    { type: 'interview', label: 'Interview' },
    { type: 'whatsapp', label: 'WhatsApp' },
    { type: 'pdf_document', label: 'PDF Document' },
    { type: 'stakeholder', label: 'Stakeholder' },
    { type: 'other', label: 'Other' },
  ];

  const uniqueSegments = Array.from(
    new Set(records.map(r => r.segment).filter(Boolean))
  ) as string[];

  return (
    <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-full overflow-y-auto">
      {/* Product Context Header Card */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Workspace
          </span>
          <button
            onClick={() => setShowContextEdit(!showContextEdit)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            {showContextEdit ? 'Done' : 'Edit Context'}
          </button>
        </div>

        {showContextEdit ? (
          <div className="space-y-2 mt-2">
            <div>
              <label className="text-xs text-slate-600 block mb-0.5">Product Name</label>
              <input
                type="text"
                value={context.productName}
                onChange={e => setContext(prev => ({ ...prev, productName: e.target.value }))}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-0.5">Product Context & Scope</label>
              <textarea
                value={context.productContext}
                onChange={e => setContext(prev => ({ ...prev, productContext: e.target.value }))}
                rows={2}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-bold text-slate-900">{context.productName}</h2>
            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{context.productContext}</p>
            {context.isSyntheticDemo && (
              <div className="mt-2 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded px-2 py-1">
                Demo Mode: synthetic Indian quick-commerce dataset
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingestion & Upload Section */}
      <div className="p-4 border-b border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Feedback Ingestion
          </span>
          {/* Input mode switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
            <button
              onClick={() => setActiveInputMode('upload')}
              className={`px-2 py-0.5 rounded ${
                activeInputMode === 'upload' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveInputMode('paste')}
              className={`px-2 py-0.5 rounded ${
                activeInputMode === 'paste' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              Paste
            </button>
            <button
              onClick={() => setActiveInputMode('ocr')}
              className={`px-2 py-0.5 rounded ${
                activeInputMode === 'ocr' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              OCR / PDF
            </button>
          </div>
        </div>

        {/* Source label selection */}
        <div>
          <label className="text-xs text-slate-600 block mb-1">Source Channel</label>
          <select
            value={selectedSourceType}
            onChange={e => setSelectedSourceType(e.target.value as SourceType)}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-none"
          >
            {sourceLabels.map(s => (
              <option key={s.type} value={s.type}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {activeInputMode === 'upload' && (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20 rounded-lg p-4 text-center cursor-pointer transition-all"
            >
              <Upload className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-800">
                {processingFile ? 'Extracting via Gemini...' : 'Drop CSV, PDF, TXT, or Screenshot'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Full PDF page parsing & CSV column mapping
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.docx,.pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {activeInputMode === 'paste' && (
          <div className="space-y-2">
            <textarea
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="Paste raw customer feedback, chat excerpt, or review text here..."
              rows={3}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={pastedLocator}
                onChange={e => setPastedLocator(e.target.value)}
                placeholder="Locator (e.g. Chat Msg #3, Row 5)"
                className="text-xs px-2 py-1 border border-slate-300 rounded w-1/2"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSecondhandInput}
                  onChange={e => setIsSecondhandInput(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Secondhand</span>
              </label>
            </div>
            <button
              onClick={handleAddPastedText}
              disabled={!pastedText.trim()}
              className="w-full py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded transition-colors"
            >
              Add Record to Ingestion
            </button>
          </div>
        )}

        {activeInputMode === 'ocr' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border border-slate-300 hover:border-indigo-500 bg-white rounded-lg p-2.5 text-center cursor-pointer transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-slate-800">WhatsApp / Image</p>
                <p className="text-[10px] text-slate-500">PNG / JPG</p>
              </div>

              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border border-slate-300 hover:border-indigo-500 bg-white rounded-lg p-2.5 text-center cursor-pointer transition-colors"
              >
                <FileType className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-slate-800">PDF Report</p>
                <p className="text-[10px] text-slate-500">Scanned / Text</p>
              </div>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              className="hidden"
            />
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              onChange={e => e.target.files?.[0] && handlePDFFile(e.target.files[0])}
              className="hidden"
            />

            {processingFile && (
              <div className="p-2.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Extracting records with Gemini Vision...</span>
              </div>
            )}

            {ingestionError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                {ingestionError}
              </p>
            )}
          </div>
        )}

        {/* Action Button: Run Analysis */}
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing || eligibleCount === 0}
          className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Feedback...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyse {eligibleCount} Eligible Records</span>
            </>
          )}
        </button>
      </div>

      {/* Ingestion Audit Summary Drawer */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/40">
        <button
          onClick={() => setShowAuditDetails(!showAuditDetails)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ingestion Audit ({totalExtracted} extracted)</span>
          </div>
          {showAuditDetails ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showAuditDetails && (
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span>Files / Sources:</span>
              <span className="font-semibold text-slate-900 tabular-nums">{uniqueFiles.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span>Records Extracted:</span>
              <span className="font-semibold text-slate-900 tabular-nums">{totalExtracted}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span>Eligible for Analysis:</span>
              <span className="font-semibold text-emerald-700 tabular-nums">{eligibleCount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span>Duplicates Quarantined:</span>
              <span className="font-semibold text-amber-700 tabular-nums">{duplicatesExcluded}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span>Secondhand Opinions:</span>
              <span className="font-semibold text-slate-700 tabular-nums">{secondhandCount}</span>
            </div>
            <div className="pt-1 text-[11px] text-slate-500">
              Policy: Exact duplicate records are excluded from theme percentages by default to prevent count inflation.
            </div>
          </div>
        )}
      </div>

      {/* Filter & Slicing Controls */}
      <div className="p-4 space-y-3.5 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Filters & Slicing
            </span>
          </div>
          {(filters.sourceTypes.length > 0 ||
            filters.segments.length > 0 ||
            filters.searchQuery ||
            filters.includeDuplicates ||
            !filters.includeSecondhand) && (
            <button
              onClick={() =>
                setFilters({
                  sourceTypes: [],
                  segments: [],
                  includeSecondhand: false,
                  includeDuplicates: false,
                  minRating: null,
                  maxRating: null,
                  searchQuery: '',
                })
              }
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotes, terms, or IDs..."
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Source Channels */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1.5">Source Channel</label>
          <div className="flex flex-wrap gap-1">
            {sourceLabels.map(s => {
              const active = filters.sourceTypes.includes(s.type);
              return (
                <button
                  key={s.type}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      sourceTypes: active
                        ? prev.sourceTypes.filter(t => t !== s.type)
                        : [...prev.sourceTypes, s.type],
                    }));
                  }}
                  className={`text-[11px] px-2 py-1 rounded transition-colors ${
                    active
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Segment Filter (if available) */}
        {uniqueSegments.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">User Segment</label>
            <div className="flex flex-wrap gap-1">
              {uniqueSegments.slice(0, 5).map(seg => {
                const active = filters.segments.includes(seg);
                return (
                  <button
                    key={seg}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        segments: active
                          ? prev.segments.filter(item => item !== seg)
                          : [...prev.segments, seg],
                      }));
                    }}
                    className={`text-[11px] px-2 py-1 rounded truncate max-w-[150px] ${
                      active
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={seg}
                  >
                    {seg}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Toggles for Policy Control */}
        <div className="space-y-2 pt-2 border-t border-slate-200/70">
          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>Include Flagged Duplicates</span>
            <input
              type="checkbox"
              checked={filters.includeDuplicates}
              onChange={e => setFilters(prev => ({ ...prev, includeDuplicates: e.target.checked }))}
              className="rounded text-indigo-600"
            />
          </label>
          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>Include Secondhand Stakeholder Voice</span>
            <input
              type="checkbox"
              checked={filters.includeSecondhand}
              onChange={e => setFilters(prev => ({ ...prev, includeSecondhand: e.target.checked }))}
              className="rounded text-indigo-600"
            />
          </label>
        </div>
      </div>

      {/* CSV Column Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">CSV Column Mapping</h3>
            <p className="text-xs text-slate-600 mb-4">
              Map the columns from <span className="font-semibold text-slate-800">{pendingFileName}</span> to standard feedback fields.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Feedback Text (Required) *
                </label>
                <select
                  value={activeMapping.feedbackText}
                  onChange={e => setActiveMapping(m => ({ ...m, feedbackText: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                >
                  <option value="">-- Select column --</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Rating / Score (Optional)
                </label>
                <select
                  value={activeMapping.rating || ''}
                  onChange={e => setActiveMapping(m => ({ ...m, rating: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                >
                  <option value="">-- None / Default --</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer / User Identifier (Optional)
                </label>
                <select
                  value={activeMapping.customerIdentifier || ''}
                  onChange={e => setActiveMapping(m => ({ ...m, customerIdentifier: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                >
                  <option value="">-- None / Default --</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  User Segment or City (Optional)
                </label>
                <select
                  value={activeMapping.segment || ''}
                  onChange={e => setActiveMapping(m => ({ ...m, segment: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                >
                  <option value="">-- None / Default --</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={applyCSVMapping}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Import {pendingCSVRows.length} Records
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
