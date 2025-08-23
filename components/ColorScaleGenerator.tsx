// ABOUTME: Main component for generating and displaying color scales
// ABOUTME: Allows users to input key colors and generate Tailwind-compatible color palettes

'use client';

import { useState } from 'react';
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