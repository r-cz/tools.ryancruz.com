import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WrenchScrewdriverIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// We use the 'lazy' function we imported from React instead of React.lazy
const JWTDecoder = lazy(() => import('./tools/JWTDecoder'));
const MermaidViewer = lazy(() => import('./tools/MermaidViewer'));

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for system preference and saved preference
    if (typeof localStorage !== 'undefined' && localStorage.getItem('darkMode') !== null) {
      return localStorage.getItem('darkMode') === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update body class and save preference
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center">
                  <WrenchScrewdriverIcon className="h-8 w-8 text-primary" />
                  <span className="ml-2 text-xl font-semibold">Dev Tools</span>
                </Link>
              </div>
              
              {/* Theme toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* We use Suspense instead of React.Suspense */}
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<ToolsList />} />
              <Route path="/jwt" element={<JWTDecoder />} />
              <Route path="/mermaid" element={<MermaidViewer />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

function ToolsList() {
  const tools = [
    {
      name: 'JWT Decoder',
      description: 'Decode and verify JWT tokens with ease',
      path: '/jwt',
      icon: '🔑'
    },
    {
      name: 'Mermaid Viewer',
      description: 'Live preview for Mermaid diagrams',
      path: '/mermaid',
      icon: '📊'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <Link
          key={tool.path}
          to={tool.path}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border"
        >
          <div className="text-2xl mb-2">{tool.icon}</div>
          <h3 className="text-lg font-semibold">{tool.name}</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300">{tool.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default App;