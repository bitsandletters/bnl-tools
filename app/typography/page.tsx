// ABOUTME: Typography Scale Generator tool
// ABOUTME: Generate font sizes, line heights, and letter spacing scales

'use client';

export default function TypographyGenerator() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--app-color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>
            Typography Scale Generator
          </h1>
          <p className="text-lg" style={{ color: 'var(--app-color-text-normal)' }}>
            Generate consistent font sizes, line heights, and letter spacing for your design system.
          </p>
        </div>
        
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>
              Coming Soon
            </h2>
            <p style={{ color: 'var(--app-color-text-quiet)' }}>
              The typography scale generator is under development. This tool will help you create harmonious type scales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 