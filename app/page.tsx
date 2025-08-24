// ABOUTME: Home page for Bits & Letters Color Tool
// ABOUTME: Landing page for the color scale generator tool

'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ToolIcon from '@/components/ToolIcon';

const tools = [
  {
    name: 'Color Scales',
    description: 'Generate Tailwind-compatible color scales using Okhsl color space',
    path: '/color-scales',
    status: 'ready',
    tool: 'color-scales' as const
  }
];

export default function HomePage() {
  const router = useRouter();

  // Redirect to color-scales if there's URL state (query or hash)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasQuery = window.location.search && window.location.search.length > 1;
      const hasHash = window.location.hash && window.location.hash.length > 1;
      if (hasQuery || hasHash) {
        router.replace('/color-scales' + (hasQuery ? window.location.search : '') + (hasHash ? window.location.hash : ''));
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--app-color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6" style={{ color: 'var(--app-color-text-loud)' }}>
            Bits & Letters Color Tool
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--app-color-text-normal)' }}>
            Professional color scale generator for creating consistent, accessible color systems using Okhsl color space.
          </p>
        </div>

        {/* Tool Card */}
        <div className="max-w-2xl mx-auto">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="group block"
            >
              <div 
                className="rounded-lg shadow-lg p-6 transition-all duration-200 h-full"
                style={{ 
                  backgroundColor: 'var(--app-color-bg-primary)',
                  border: '1px solid var(--app-color-border-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">
                    <ToolIcon tool={tool.tool} />
                  </div>
                  {tool.status === 'coming-soon' && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: 'var(--app-color-warning-bg)',
                        color: 'var(--app-color-warning)'
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors" style={{ color: 'var(--app-color-text-loud)' }}>
                  {tool.name}
                </h3>
                
                <p className="text-sm" style={{ color: 'var(--app-color-text-quiet)' }}>
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t" style={{ borderColor: 'var(--app-color-border-normal)' }}>
          <p className="text-sm" style={{ color: 'var(--app-color-text-quiet)' }}>
            Built with ❤️ by{' '}
            <a 
              href="https://bitsandletters.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-normal transition-colors"
              style={{ color: 'var(--app-color-text-quiet)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
            >
              Bits & Letters
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
