import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our theme state
export interface ThemeState {
  isDark: boolean;
  source: 'system' | 'user' | 'localStorage';
}

// Define the shape of our context value
type ThemeContextValue = [ThemeState, React.Dispatch<React.SetStateAction<ThemeState>>];

// Create our context with a meaningful default value of null
const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize state from our global variable, which will be set by our early script
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    // If window.__INITIAL_THEME_STATE__ doesn't exist yet (during SSR), provide fallback values
    return window.__INITIAL_THEME_STATE__ ?? {
      isDark: false,
      source: 'system'
    };
  });
  
  // Effect to apply theme changes to the document and localStorage
  useEffect(() => {
    if (themeState.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(themeState.isDark));
  }, [themeState.isDark]);

  // Effect to handle system theme changes when using system preference
  useEffect(() => {
    if (themeState.source !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeState(prev => ({
        ...prev,
        isDark: e.matches
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeState.source]);

  return (
    <ThemeContext.Provider value={[themeState, setThemeState]}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to access the theme context with proper error handling
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}