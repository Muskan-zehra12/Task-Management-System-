import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-2xl transition-all ${
        theme === 'dark' 
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 shadow-lg shadow-slate-900/20' 
          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-lg shadow-indigo-100'
      } ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  );
};
