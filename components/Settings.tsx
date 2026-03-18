'use client';

import { useState, useRef } from 'react';
import { Theme, Task } from '@/types';
import ThemeSelector from './ThemeSelector';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
  onClearTasks: () => void;
}

export default function Settings({ theme, onThemeChange, tasks, onImportTasks, onClearTasks }: SettingsProps) {
  const panelClass = theme === 'glass' ? 'glass-panel' : theme === 'natural' ? 'natural-panel' : theme === 'nebula' ? 'nebula-panel' : theme === 'cyberpunk' ? 'cyberpunk-panel' : 'paper-border';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `chronos-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedTasks)) {
          onImportTasks(importedTasks);
          setImportStatus(`Successfully imported ${importedTasks.length} tasks.`);
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid JSON format. Expected an array of tasks.');
          setTimeout(() => setImportStatus(null), 3000);
        }
      } catch (error) {
        setImportStatus('Error parsing JSON file.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    onClearTasks();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-[var(--text-main)]">Settings</h1>

      <div className={`p-6 rounded-2xl bg-[var(--panel-bg)] ${panelClass} flex flex-col gap-6`}>
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-main)] mb-2">Appearance</h2>
          <p className="text-[var(--text-muted)] mb-4">Customize the look and feel of your workspace.</p>
          <div className="flex items-center gap-4">
            <span className="text-[var(--text-main)] font-medium">Theme:</span>
            <ThemeSelector currentTheme={theme} onThemeChange={onThemeChange} />
          </div>
        </div>

        <div className="w-full h-px bg-[var(--panel-border)] my-2"></div>

        <div>
          <h2 className="text-xl font-semibold text-[var(--text-main)] mb-2">Data Management</h2>
          <p className="text-[var(--text-muted)] mb-4">Backup your tasks or restore them from a previous backup. Your data never leaves your browser.</p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--panel-border)] text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-white transition-colors font-medium"
            >
              <Download className="w-5 h-5" /> Export Data (JSON)
            </button>
            
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--panel-border)] text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-white transition-colors font-medium"
            >
              <Upload className="w-5 h-5" /> Import Data
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            {importStatus && (
              <span className="text-sm font-medium text-[var(--accent)]">{importStatus}</span>
            )}
          </div>
        </div>

        <div className="w-full h-px bg-[var(--panel-border)] my-2"></div>

        <div>
          <h2 className="text-xl font-semibold text-red-500 mb-2">Danger Zone</h2>
          <p className="text-[var(--text-muted)] mb-4">Permanently delete all your tasks and data.</p>
          
          {showClearConfirm ? (
            <div className="flex items-center gap-4 p-4 rounded-lg border border-red-500/50 bg-red-500/10">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-main)]">Are you absolutely sure?</p>
                <p className="text-xs text-[var(--text-muted)]">This action cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded text-sm font-medium text-[var(--text-main)] hover:bg-[var(--panel-border)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5" /> Clear All Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
