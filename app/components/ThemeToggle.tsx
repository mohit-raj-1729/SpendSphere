'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  // Prevent hydration mismatch by using a safe default
  const displayTheme = theme || 'light';

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-200 flex items-center justify-center border-2 border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg min-w-[40px] min-h-[40px] z-10"
      aria-label="Toggle theme"
      title={displayTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      type="button"
      style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
    >
      {displayTheme === 'light' ? (
        // Moon icon for dark mode
        <svg
          className="w-6 h-6 text-slate-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          className="w-6 h-6 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}

