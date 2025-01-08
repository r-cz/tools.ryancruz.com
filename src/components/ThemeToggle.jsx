import { useState, useEffect, useRef } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const [themeState, setThemeState] = useTheme();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setTheme = (isDark, source) => {
    setThemeState({
      isDark,
      source
    });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 
                   hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Theme settings"
      >
        {themeState.source === 'system' ? (
          <ComputerDesktopIcon className="w-6 h-6" />
        ) : themeState.isDark ? (
          <MoonIcon className="w-6 h-6" />
        ) : (
          <SunIcon className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTheme(false, 'user')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <SunIcon className="w-5 h-5" />
            Light
          </button>
          <button
            onClick={() => setTheme(true, 'user')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <MoonIcon className="w-5 h-5" />
            Dark
          </button>
          <button
            onClick={() => setTheme(
              window.matchMedia('(prefers-color-scheme: dark)').matches,
              'system'
            )}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <ComputerDesktopIcon className="w-5 h-5" />
            System
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;