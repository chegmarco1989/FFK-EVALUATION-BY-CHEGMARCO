/**
 * =============================================================================
 * THEME TOGGLE COMPONENT
 * =============================================================================
 * Toggle button for switching between light and dark modes.
 */

'use client';

import { useEffect, useState } from 'react';
import useTheme from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
    );
  }
  
  const isDark = theme === 'dark';
  
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        isDark ? 'bg-neutral-700' : 'bg-primary-200'
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Toggle circle */}
      <div
        className={cn(
          'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center',
          isDark ? 'translate-x-7' : 'translate-x-1'
        )}
      >
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
