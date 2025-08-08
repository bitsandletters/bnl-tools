// ABOUTME: Main component for generating and displaying color scales
// ABOUTME: Allows users to input key colors and generate Tailwind-compatible color palettes

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ColorScale, generateColorScale, exportAsCSSVariables, parseColor } from '@/lib/colorUtils';
import { urlStorage, AppState } from '@/lib/urlStorage';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import ColorScaleEditor from './ColorScaleEditor';
import MigrationBanner from './MigrationBanner';

export default function ColorScaleGenerator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [copiedURL, setCopiedURL] = useState(false);
  
  const {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useUndoRedo<AppState>({
    scales: [],
    prefix: '',
    useThemeBlock: false,
  });

  // Load data from URL on mount
  useEffect(() => {
    const loadedState = urlStorage.getState();
    
    // Migrate old scales that don't have contrast data
    const migratedScales = loadedState.scales.map(scale => {
      // Check if this scale needs migration (doesn't have new contrast data)
      const firstShade = scale.shades['50'];
      if (firstShade && !firstShade.contrastWhite) {
        // Regenerate the scale with the same settings but keep the ID
        const newScale = generateColorScale(
          scale.keyColor, 
          scale.name,
          scale.hueShift || 0,
          scale.chromaShift || 0
        );
        return { ...newScale, id: scale.id };
      }
      return scale;
    });
    
    setState({
      scales: migratedScales,
      prefix: loadedState.prefix,
      useThemeBlock: loadedState.useThemeBlock,
    });
    setIsLoaded(true);
  }, []);

  // Save to URL whenever state changes
  useEffect(() => {
    if (isLoaded) {
      urlStorage.saveState(state);
    }
  }, [state, isLoaded]);

  // Listen for URL hash changes (browser back/forward)
  useEffect(() => {
    const cleanup = urlStorage.onHashChange((newState) => {
      if (isLoaded) {
        setState(newState);
      }
    });
    
    return cleanup;
  }, [isLoaded]);

  const addColorScale = () => {
    // Generate a default scale with a nice blue and unique name
    const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    const defaultColor = defaultColors[state.scales.length % defaultColors.length];
    const scaleName = `scale-${state.scales.length + 1}`;
    
    const newScale = generateColorScale(defaultColor, scaleName);
    setState(prev => ({
      ...prev,
      scales: [...prev.scales, newScale],
    }));
  };

  const removeScale = (id: string) => {
    setState(prev => ({
      ...prev,
      scales: prev.scales.filter(scale => scale.id !== id),
    }));
  };

  const updateScale = (updatedScale: ColorScale) => {
    setState(prev => ({
      ...prev,
      scales: prev.scales.map(scale => 
        scale.id === updatedScale.id ? updatedScale : scale
      ),
    }));
  };

  const copyCSS = () => {
    const css = exportAsCSSVariables(state.scales, state.prefix, state.useThemeBlock);
    navigator.clipboard.writeText(css);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2000);
  };

  const copyURL = () => {
    const url = urlStorage.getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedURL(true);
    setTimeout(() => setCopiedURL(false), 2000);
  };

  const clearAll = () => {
    if (window.confirm('Clear all color scales and reset settings?')) {
      reset();
      urlStorage.clear();
    }
  };

  return (
    <>
      <MigrationBanner />
      <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--app-color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--app-color-text-loud)' }}>Color Scale Generator</h1>
            <Link
              href="/"
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--app-color-text-quiet)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
            >
              ← Back to Tools
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-3 py-1 text-sm font-medium disabled:cursor-not-allowed"
              style={{ color: canUndo ? 'var(--app-color-text-quiet)' : 'var(--app-color-disabled-text)' }}
              onMouseEnter={(e) => canUndo && (e.currentTarget.style.color = 'var(--app-color-text-normal)')}
              onMouseLeave={(e) => canUndo && (e.currentTarget.style.color = 'var(--app-color-text-quiet)')}
              title="Undo (Cmd/Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-1 text-sm font-medium disabled:cursor-not-allowed"
              style={{ color: canRedo ? 'var(--app-color-text-quiet)' : 'var(--app-color-disabled-text)' }}
              onMouseEnter={(e) => canRedo && (e.currentTarget.style.color = 'var(--app-color-text-normal)')}
              onMouseLeave={(e) => canRedo && (e.currentTarget.style.color = 'var(--app-color-text-quiet)')}
              title="Redo (Cmd/Ctrl+Shift+Z)"
            >
              ↷ Redo
            </button>
            {state.scales.length > 0 && (
              <>
                <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--app-color-border-normal)' }} />
                <button
                  onClick={copyURL}
                  className="px-3 py-1 text-sm font-medium"
                  style={{ color: 'var(--app-color-text-quiet)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
                  title="Copy shareable URL"
                >
                  {copiedURL ? 'URL Copied!' : 'Share URL'}
                </button>
                <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--app-color-border-normal)' }} />
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-sm font-medium"
                  style={{ color: 'var(--app-color-text-quiet)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-6 mb-8" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--app-color-text-loud)' }}>CSS Export Settings</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-color-text-normal)' }}>
                  Variable Prefix (optional)
                </label>
                <input
                  type="text"
                  value={state.prefix}
                  onChange={(e) => setState(prev => ({ ...prev, prefix: e.target.value }))}
                  placeholder="e.g., brand"
                  className="w-full max-w-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{ color: 'var(--app-color-text-inputs)', borderColor: 'var(--app-color-border-normal)', backgroundColor: 'var(--app-color-bg-secondary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-color-text-normal)' }}>
                  Output Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!state.useThemeBlock}
                      onChange={() => setState(prev => ({ ...prev, useThemeBlock: false }))}
                      className="mr-2"
                    />
                    <span style={{ color: 'var(--app-color-text-normal)' }}>:root</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={state.useThemeBlock}
                      onChange={() => setState(prev => ({ ...prev, useThemeBlock: true }))}
                      className="mr-2"
                    />
                    <span style={{ color: 'var(--app-color-text-normal)' }}>@theme (Tailwind 4)</span>
                  </label>
                </div>
              </div>
            </div>
            
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

        {state.scales.length > 0 && (
          <div className="space-y-6">
            {state.scales.map((scale) => (
              <ColorScaleEditor
                key={scale.id}
                scale={scale}
                onUpdate={updateScale}
                onRemove={() => removeScale(scale.id)}
              />
            ))}
            
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--app-color-text-loud)' }}>CSS Variables</h3>
                <button
                  onClick={copyCSS}
                  className="px-4 py-2 text-white rounded-md transition-colors"
                  style={{ backgroundColor: 'var(--app-color-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-primary-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-primary)'}
                >
                  {copiedCSS ? 'Copied!' : 'Copy CSS'}
                </button>
              </div>
              <pre className="p-4 rounded-md overflow-x-auto text-sm" style={{ backgroundColor: 'var(--app-color-bg-tertiary)', color: 'var(--app-color-text-normal)' }}>
                <code>{exportAsCSSVariables(state.scales, state.prefix, state.useThemeBlock)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}


