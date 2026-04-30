/**
 * =============================================================================
 * USE THEME HOOK
 * =============================================================================
 * Custom hook for managing dark/light mode theme.
 */

import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export type Theme = 'light' | 'dark' | 'system';

export default function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme_preference', 'light');
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Determine actual theme to apply
    let actualTheme: 'light' | 'dark' = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
    
    // Apply theme class
    root.classList.add(actualTheme);
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  return { theme, setTheme };
}
