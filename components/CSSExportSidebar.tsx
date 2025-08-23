// ABOUTME: CSS Export sidebar with settings and output
// ABOUTME: Provides a collapsible sidebar for CSS export functionality

'use client';

import { useState, useEffect } from 'react';
import { exportAsCSSVariables } from '@/lib/colorUtils';
import { useColorScaleStore } from '@/lib/colorScaleStore';

interface CSSExportSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CSSExportSidebar({ isOpen, onClose }: CSSExportSidebarProps) {
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const {
    prefix,
    useThemeBlock,
    updatePrefix,
    updateUseThemeBlock,
    getFullScales,
  } = useColorScaleStore();

  // Prevent hydration mismatch by only rendering CSS after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const copyCSS = () => {
    const fullScales = getFullScales();
    const css = exportAsCSSVariables(fullScales, prefix, useThemeBlock);
    navigator.clipboard.writeText(css);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2000);
  };

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Export CSS</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Export Settings */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Export Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Variable Prefix (optional)
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => updatePrefix(e.target.value)}
                    placeholder="e.g., brand"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Output Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!useThemeBlock}
                        onChange={() => updateUseThemeBlock(false)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">:root</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={useThemeBlock}
                        onChange={() => updateUseThemeBlock(true)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">@theme (Tailwind 4)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* CSS Output */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">CSS Variables</h3>
                <button
                  onClick={copyCSS}
                  className="px-4 py-2 text-white rounded-md transition-colors text-sm font-medium"
                  style={{ backgroundColor: 'var(--app-color-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-primary-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-primary)'}
                >
                  {copiedCSS ? 'Copied!' : 'Copy CSS'}
                </button>
              </div>
              <pre className="p-4 rounded-md overflow-x-auto text-sm bg-gray-100 text-gray-800 border">
                <code>
                  {isClient ? exportAsCSSVariables(getFullScales(), prefix, useThemeBlock) : ':root {\n}'}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 