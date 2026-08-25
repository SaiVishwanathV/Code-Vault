import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Problem } from '../../types';
import { exportProblemsToCsv, parseProblemsCsv } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface CsvImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Problem[];
  onImportSuccess: (imported: Partial<Problem>[]) => Promise<void>;
}

export const CsvImportExportModal: React.FC<CsvImportExportModalProps> = ({
  isOpen,
  onClose,
  problems,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importedData, setImportedData] = useState<Partial<Problem>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { success, error: showError } = useToast();

  const handleExport = () => {
    exportProblemsToCsv(problems, `codetracker_problems_${Date.now()}.csv`);
    success('Export Complete', `Exported ${problems.length} problems to CSV file.`);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseProblemsCsv(text);
        if (parsed.length === 0) {
          showError('Invalid CSV', 'Could not parse any valid problem records from this CSV file.');
          return;
        }
        setImportedData(parsed);
      } catch (err: any) {
        showError('Parse Error', err.message || 'Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (importedData.length === 0) return;
    setIsProcessing(true);
    try {
      await onImportSuccess(importedData);
      success('Import Successful', `Added ${importedData.length} problems to your tracker.`);
      setImportedData([]);
      setFileName('');
      onClose();
    } catch (err: any) {
      showError('Import Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleCsv = `Problem ID,Problem Name,Platform,Difficulty,Topic,Problem Link,Solution Link,Solved Date,Time Taken (mins),Favorite,Revision Needed,Revision Date,Notes
LC-1,Two Sum,LeetCode,Easy,Arrays,https://leetcode.com/problems/two-sum/,,2026-08-25,15,Yes,No,,Hash map approach O(N)
LC-15,3Sum,LeetCode,Medium,Two Pointers,https://leetcode.com/problems/3sum/,,2026-08-25,30,No,Yes,2026-09-01,Sort array first and use two pointers`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'codetracker_sample_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="CSV Data Management"
      description="Export your solved problems for backup or import problems from an existing spreadsheet"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
        <button
          onClick={() => setActiveTab('export')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Export to CSV
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Import from CSV
        </button>
      </div>

      {activeTab === 'export' ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Export {problems.length} Solved Problems
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Download your complete problem history, including notes, platform badges, difficulty ratings, and revision dates as a CSV file.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all mt-2"
          >
            <Download className="w-4 h-4" /> Download Problems CSV
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload CSV Spreadsheet
            </span>
            <button
              onClick={downloadSampleTemplate}
              className="text-[11px] text-indigo-500 hover:underline inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Download Sample CSV Template
            </button>
          </div>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {fileName ? fileName : 'Choose CSV file or drag here'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Supports standard CodeTracker CSV formatting
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importedData.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready to import {importedData.length} valid problem records</span>
              </div>
              <button
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {isProcessing && <RefreshCw className="w-3 h-3 animate-spin" />}
                Confirm Import
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
