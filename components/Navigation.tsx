// ABOUTME: Navigation component for the multi-tool interface
// ABOUTME: Includes BNL branding and navigation between different tools

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const tools = [
  { name: 'Color Scales', path: '/color-scales' },
  { name: 'Modular Scale', path: '/modular-scale' },
  { name: 'Typography', path: '/typography' },
  { name: 'Spacing', path: '/spacing' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b" style={{ borderColor: 'var(--app-color-border-normal)', backgroundColor: 'var(--app-color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center text-2xl">
                <svg viewBox='0 0 273 273' className='size-[1.375em]'>
                <path
                  d="M136.3 0c103.5 0 136.1 35.4 136.1 136 0 100.8-32.7 136.2-136 136.2C32.8 272.2.1 236.8.1 136 .2 35.4 33 0 136.3 0ZM113 38.5c-16.2 0-21.4 5.6-21.4 21.4 0 9.3-7.4 16.7-16.7 16.7-16.3 0-21.4 5.6-21.4 21.4 0 15.8 5.2 21.5 21.4 21.5a16.7 16.7 0 1 1 0 33.3c-16.3 0-21.4 5.6-21.4 21.4 0 15.8 5.2 21.4 21.4 21.4 9.2 0 16.7 7.5 16.7 16.7 0 15.8 5.2 21.4 21.5 21.4 16.2 0 21.4-5.6 21.4-21.4a16.7 16.7 0 1 1 33.3 0c0 15.8 5.2 21.4 21.4 21.4 16.3 0 21.5-5.6 21.5-21.4 0-15.9-5.2-21.4-21.4-21.4a16.7 16.7 0 0 1 0-33.4c16.2 0 21.4-5.5 21.4-21.4 0-15.9-5.2-21.4-21.4-21.4-16.3 0-21.5 5.6-21.5 21.4a16.7 16.7 0 1 1-33.3 0c0-15.8-5.2-21.4-21.5-21.4a16.7 16.7 0 1 1 0-33.3h38.5c16.3 0 21.4-5.6 21.4-21.5 0-15.8-5-21.4-21.4-21.4H113Zm0 119a16.7 16.7 0 1 1-16.7 16.7c0-9.2 7.5-16.7 16.8-16.7Z"
                  fill="currentColor"></path>
                </svg>
                <span className='sr-only'>
                  Bits&amp;Letters
                </span>
                <span className="font-stringer font-light ml-2">
                  Tools
                </span>
              </div>
            </Link>
          </div>

          {/* Tool Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {tools.map((tool) => {
              const isActive = pathname === tool.path;
              return (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-quiet hover:text-normal'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--app-color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--app-color-text-quiet)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--app-color-text-normal)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--app-color-text-quiet)';
                    }
                  }}
                >
                  {tool.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md"
              style={{ color: 'var(--app-color-text-quiet)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* External Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://www.bitsandletters.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--app-color-text-quiet)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
            >
              bitsandletters.com
            </a>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" style={{ backgroundColor: 'var(--app-color-bg-primary)', borderTop: '1px solid var(--app-color-border-normal)' }}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {tools.map((tool) => {
              const isActive = pathname === tool.path;
              return (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-quiet hover:text-normal'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--app-color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--app-color-text-quiet)',
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--app-color-text-normal)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--app-color-text-quiet)';
                    }
                  }}
                >
                  {tool.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
} 