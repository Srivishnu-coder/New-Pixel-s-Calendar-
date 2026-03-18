'use client';

import { LayoutDashboard, BarChart2, Settings, FolderKanban } from 'lucide-react';
import { Theme } from '@/types';

export type ViewType = 'dashboard' | 'analytics' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  theme: Theme;
}

export default function Sidebar({ currentView, onViewChange, theme }: SidebarProps) {
  const panelClass = theme === 'glass' ? 'glass-panel' : theme === 'natural' ? 'natural-panel' : theme === 'nebula' ? 'nebula-panel' : theme === 'cyberpunk' ? 'cyberpunk-panel' : 'paper-border';

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <div className={`w-20 lg:w-64 h-full flex flex-col bg-[var(--panel-bg)] ${panelClass} border-r border-[var(--panel-border)] transition-all duration-300 z-20`}>
      <div className="p-4 lg:p-6 border-b border-[var(--panel-border)] flex items-center justify-center lg:justify-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/20">
          <FolderKanban className="w-6 h-6 text-white" />
        </div>
        <h1 className="hidden lg:block text-xl font-bold text-[var(--text-main)] tracking-tight">Chronos</h1>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--panel-border)] hover:text-[var(--text-main)]'
              }`}
              title={item.label}
            >
              <Icon className="w-6 h-6 shrink-0" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
