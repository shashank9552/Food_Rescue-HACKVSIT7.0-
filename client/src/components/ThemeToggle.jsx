import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-text shadow-sm transition-all hover:bg-background hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-accent" />
      ) : (
        <Moon className="w-4 h-4 text-secondary" />
      )}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
