// ABOUTME: Spacing Scale Generator tool
// ABOUTME: Generate margin, padding, and gap scales for consistent spacing

'use client';

export default function SpacingGenerator() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--app-color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>
            Spacing Scale Generator
          </h1>
          <p className="text-lg" style={{ color: 'var(--app-color-text-normal)' }}>
            Generate consistent spacing scales for margins, padding, gaps, and layout spacing.
          </p>
        </div>
        
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>
              Coming Soon
            </h2>
            <p style={{ color: 'var(--app-color-text-quiet)' }}>
              The spacing scale generator is under development. This tool will help you create consistent spacing systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 