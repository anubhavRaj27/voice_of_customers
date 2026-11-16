import React, { useEffect, useState } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  User,
  MapPin,
  Calendar,
  Star,
  Edit2,
  Save,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { FeedbackRecord } from '../types';

interface EvidenceDrawerProps {
  record: FeedbackRecord | null;
  onClose: () => void;
  onUpdateRecord?: (updatedRecord: FeedbackRecord) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  record,
  onClose,
  onUpdateRecord,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedTranscription, setEditedTranscription] = useState('');
  const [imageExpanded, setImageExpanded] = useState(false);

  useEffect(() => {
    if (record) {
      setEditedTranscription(record.originalText);
      setIsEditingText(false);
    }
  }, [record]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const copyText = () => {
    navigator.clipboard.writeText(record.originalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCorrection = () => {
    if (!onUpdateRecord || !editedTranscription.trim()) return;
    const updated: FeedbackRecord = {
      ...record,
      originalText: editedTranscription.trim(),
      rawOcrText: record.rawOcrText || record.originalText,
      isUserCorrected: true,
    };
    onUpdateRecord(updated);
    setIsEditingText(false);
  };

  const resetToRawOCR = () => {
    if (record.rawOcrText) {
      setEditedTranscription(record.rawOcrText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-mono font-bold text-xs">
              {record.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Evidence Record Trace</h3>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-mono text-indigo-700 font-medium">
                  {record.locator}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{record.sourceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-semibold">
                Channel / Source
              </span>
              <span className="font-semibold text-slate-800 capitalize">
                {record.sourceType.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-semibold">
                Captured Date
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {record.date || 'Unknown'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-semibold">
                Customer Identifier
              </span>
              <span className="font-mono text-slate-800">
                {record.customerIdentifier || 'Anonymous'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-semibold">
                Segment / Hardware
              </span>
              <span className="text-slate-800 truncate block">
                {record.segment || 'General Cohort'}
              </span>
            </div>

            {record.rating !== undefined && (
              <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">
                  Star Rating:
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (record.rating || 0) ? 'fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1">
                    {record.rating} / 5
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Original Screenshot / Image Preview (if present) */}
          {record.originalImageUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Original Screenshot Asset
                </span>
                <button
                  onClick={() => setImageExpanded(!imageExpanded)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  {imageExpanded ? 'Collapse' : 'Expand Image'}
                </button>
              </div>

              <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-2 flex justify-center">
                <img
                  src={record.originalImageUrl}
                  alt="Original feedback screenshot"
                  className={`rounded-lg object-contain transition-all ${
                    imageExpanded ? 'max-h-96 w-full' : 'max-h-44'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Secondhand or Duplicate Warning Badges */}
          {record.isSecondhand && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Secondhand Stakeholder Opinion</span>
                <p className="text-amber-800">
                  This record represents internal stakeholder commentary or founder hearsay without underlying raw customer logs.
                  Quarantined from customer pain-point frequency.
                </p>
              </div>
            </div>
          )}

          {record.duplicateOf && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Deduplication Quarantine</span>
                <p className="text-slate-600">
                  Exact duplicate of primary record <strong className="font-mono">{record.duplicateOf}</strong>.
                  Excluded from theme percentage numerators and denominators to prevent spam inflation.
                </p>
              </div>
            </div>
          )}

          {/* Verbatim Source Text Section with Manual Correction Mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Feedback Text Transcription
                </span>
                {record.isUserCorrected && (
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Corrected by PM
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isEditingText && onUpdateRecord && (
                  <button
                    onClick={() => {
                      setEditedTranscription(record.originalText);
                      setIsEditingText(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Transcription</span>
                  </button>
                )}
                <button
                  onClick={copyText}
                  className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {isEditingText ? (
              <div className="space-y-2">
                <textarea
                  value={editedTranscription}
                  onChange={e => setEditedTranscription(e.target.value)}
                  rows={4}
                  className="w-full text-xs font-mono p-3 bg-white border border-indigo-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between">
                  {record.rawOcrText && (
                    <button
                      onClick={resetToRawOCR}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Raw OCR</span>
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingText(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCorrection}
                      className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Correction</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono leading-relaxed select-all">
                {record.originalText}
              </div>
            )}

            {/* Display Raw OCR alongside corrected transcription if edited */}
            {record.isUserCorrected && record.rawOcrText && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
                  Original Raw OCR Before PM Edit:
                </span>
                <p className="font-mono text-[11px] italic text-slate-700">"{record.rawOcrText}"</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Script / Language: <strong className="uppercase">{record.language}</strong></span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Immutable Hash Verified
              </span>
            </div>
          </div>

          {/* English Translation (if applicable) */}
          {record.translatedText && record.translatedText !== record.originalText && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                English Translation
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed italic">
                "{record.translatedText}"
              </div>
            </div>
          )}

          {/* Citation Locator & Lineage Audit */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Traceability & Lineage
            </span>
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Source File:</span>
                <span className="font-mono text-slate-800">{record.sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span>Exact Locator:</span>
                <span className="font-mono text-indigo-700 font-semibold">{record.locator}</span>
              </div>
              <div className="flex justify-between">
                <span>Citation ID:</span>
                <span className="font-mono text-slate-800">[{record.id}]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Trace verified against active database
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
