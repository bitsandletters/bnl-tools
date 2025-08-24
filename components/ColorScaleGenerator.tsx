// ABOUTME: Main component for generating and displaying color scales
// ABOUTME: Allows users to input key colors and generate Tailwind-compatible color palettes

'use client';

import { useState, useEffect } from 'react';
import { useColorScaleStore } from '@/lib/colorScaleStore';
import ColorScaleEditor from './ColorScaleEditor';
import CSSExportSidebar from './CSSExportSidebar';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare, faArrowUTurnUpLeft, faArrowUTurnUpRight, faCode } from '@awesome.me/kit-dafe0a6e6d/icons/sharp/regular';

import { Button } from '@/components/catalyst/button';

export default function ColorScaleGenerator() {
  const [copiedURL, setCopiedURL] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  
  const {
    scales,
    addColorScale,
    removeScale,
    updateScale,
    undo,
    redo,
    canUndo,
    canRedo,
    getFullScales,
  } = useColorScaleStore();

  const copyURL = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedURL(true);
    setTimeout(() => setCopiedURL(false), 2000);
  };

  // Initialize app after hydration
  useEffect(() => {
    // Check if we have existing scales from URL state
    if (scales && scales.length > 0) {
      // Existing scales loaded, app is ready
      setIsAppReady(true);
    } else {
      // No existing scales, check if we should add a starter
      const hasQuery = typeof window !== 'undefined' && (window.location.search.length > 1);
      const hasHash = typeof window !== 'undefined' && (window.location.hash && window.location.hash.length > 1);
      const hasUrlState = hasQuery || hasHash;
      if (!hasUrlState) {
        // Add a starter color scale
        addColorScale();
        // Don't set app ready here - wait for the scale to be added
      } else {
        // We have URL state but it hasn't loaded yet, or it's empty
        // Set app ready since we're not adding a starter
        setIsAppReady(true);
      }
    }
  }, []); // Only run once after mount/hydration

  // Watch for scale changes to mark app as ready after starter is added
  useEffect(() => {
    if (scales && scales.length > 0 && !isAppReady) {
      setIsAppReady(true);
    }
  }, [scales, isAppReady]);

  // Show loading state until app is ready
  if (!isAppReady) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: 'var(--app-color-bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded mx-auto mb-4" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}></div>
            <div className="h-4 w-32 rounded mx-auto" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--app-color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-stringer font-light text-text-loud">Color Scale Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            {canUndo && (
            <Button
              plain
              onClick={undo}
              disabled={!canUndo}
              className={cn(
                "disabled:cursor-not-allowed",
              )}
              title="Undo (Cmd/Ctrl+Z)"
            >
              <FontAwesomeIcon icon={faArrowUTurnUpLeft} data-slot="icon" /> Undo
            </Button>
            )}
            {canRedo && (
            <Button
              plain
              onClick={redo}
              disabled={!canRedo}
              className={cn(
                "disabled:cursor-not-allowed",
              )}
              title="Redo (Cmd/Ctrl+Shift+Z)"
            >
              <FontAwesomeIcon icon={faArrowUTurnUpRight} data-slot="icon" /> Redo
            </Button>
            )}
            {scales && scales.length > 0 && (
              <>
                <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--app-color-border-normal)' }} />
                                  <Button
                    plain
                    onClick={copyURL}
                    className={cn(
                      "disabled:cursor-not-allowed",
                    )}
                    title="Copy shareable URL"
                  >
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} data-slot="icon" /> {copiedURL ? 'URL Copied!' : 'Copy URL'}
                  </Button>
                  <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--app-color-border-normal)' }} />
                  <Button
                    onClick={() => setIsExportOpen(true)}
                    title="Export CSS"
                  >
                    <FontAwesomeIcon icon={faCode} data-slot="icon" /> Export CSS
                  </Button>

                </>
              )}
          </div>
        </div>

        {scales && scales.length > 0 ? (
          <div className="space-y-6">
            {getFullScales().map((scale) => (
              <ColorScaleEditor
                key={scale.id}
                scale={scale}
                onUpdate={updateScale}
                onRemove={() => removeScale(scale.id)}
              />
            ))}
            
            {/* Add Color Scale Button */}
            <div className="flex justify-center">
              <button
                onClick={addColorScale}
                className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--app-color-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-secondary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-secondary)'}
              >
                + Add Color Scale
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg shadow-lg p-12 text-center" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>No Color Scales Yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--app-color-text-normal)' }}>
              Create your first color scale to get started
            </p>
            <button
              onClick={addColorScale}
              className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--app-color-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-secondary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-secondary)'}
            >
              + Add Your First Color Scale
            </button>
          </div>
        )}
      </div>
      
      {/* CSS Export Sidebar */}
      <CSSExportSidebar isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}