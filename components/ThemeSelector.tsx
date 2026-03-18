'use client';

import { Theme } from '@/types';
import { motion } from 'motion/react';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes: Theme[] = ['glass', 'natural', 'paper', 'nebula', 'cyberpunk'];

  return (
    <div className="flex items-center gap-4 p-4">
      <Palette className="w-5 h-5 text-[var(--text-muted)]" />
      <div className="flex gap-2">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => onThemeChange(theme)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentTheme === theme
                ? 'bg-[var(--accent)] text-white shadow-md scale-105'
                : 'bg-[var(--panel-bg)] text-[var(--text-muted)] border border-[var(--panel-border)] hover:border-[var(--accent)] hover:text-[var(--text-main)]'
            }`}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
