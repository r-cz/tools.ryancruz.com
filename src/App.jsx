import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './components/ThemeToggle';

// Lazy load tool components for better initial load performance
const JWTDecoder = lazy(() => import('./tools/JWTDecoder'));
const MermaidViewer = lazy(() => import('./tools/MermaidViewer'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <nav className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center">
                  <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
                  <span className="ml-2 text-xl font-semibold">Dev Tools</span>
                </Link>
              </div>
              
              {/* Theme toggle using our new component */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
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