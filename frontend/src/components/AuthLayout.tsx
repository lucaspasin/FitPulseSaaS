import React from 'react';
import { LanguageSelector } from './LanguageSelector.js';
import { ThemeToggle } from './ThemeToggle.js';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.10),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.16),_transparent_50%)]"
      aria-hidden="true"
    />
    <div className="relative z-20 flex items-center justify-end gap-2 p-4 sm:p-5">
      <LanguageSelector />
      <ThemeToggle />
    </div>
    <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10">
      {children}
    </div>
  </div>
);
