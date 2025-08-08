// ABOUTME: Modular Scale Generator tool
// ABOUTME: Generate typography and spacing scales based on modular ratios

'use client';

export default function ModularScaleGenerator() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--app-color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>
            Modular Scale Generator
          </h1>
          <p className="text-lg" style={{ color: 'var(--app-color-text-normal)' }}>
            Generate typography and spacing scales using modular ratios like the golden ratio, perfect fourth, and more.
          </p>
        </div>
        
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>
              Coming Soon
            </h2>
            <p style={{ color: 'var(--app-color-text-quiet)' }}>
              The modular scale generator is under development. This tool will help you create consistent typography and spacing scales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 