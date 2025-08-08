// ABOUTME: Enhanced color scale editor with hue/chroma controls and detailed color info
// ABOUTME: Provides interactive editing of color scales with contrast information

'use client';

import { useState, useEffect } from 'react';
import { ColorScale, generateColorScale, getWCAGGradeString, parseColor } from '@/lib/colorUtils';
import ColorSwatch from './ColorSwatch';

interface ColorScaleEditorProps {
  scale: ColorScale;
  onUpdate: (scale: ColorScale) => void;
  onRemove: () => void;
}

export default function ColorScaleEditor({ scale, onUpdate, onRemove }: ColorScaleEditorProps) {
  const [hueShift, setHueShift] = useState(scale.hueShift || 0);
  const [chromaShift, setChromaShift] = useState(scale.chromaShift || 0);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [hoveredShade, setHoveredShade] = useState<string | null>(null);
  const [keyColorInput, setKeyColorInput] = useState(scale.keyColor);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(scale.name);

  // Auto-apply changes when shift sliders move
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newScale = generateColorScale(scale.keyColor, scale.name, hueShift, chromaShift);
      onUpdate({ ...newScale, id: scale.id });
    }, 100); // Small debounce to avoid too many updates

    return () => clearTimeout(timeoutId);
  }, [hueShift, chromaShift]);

  const copyHex = (hex: string, shade: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(shade);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleKeyColorChange = (newColor: string) => {
    const parsedColor = parseColor(newColor);
    if (parsedColor) {
      setKeyColorInput(parsedColor);
      const newScale = generateColorScale(parsedColor, scale.name, hueShift, chromaShift);
      onUpdate({ ...newScale, id: scale.id });
    }
  };

  const handleNameChange = () => {
    if (nameInput.trim()) {
      onUpdate({ ...scale, name: nameInput.trim() });
      setEditingName(false);
    } else {
      setNameInput(scale.name);
      setEditingName(false);
    }
  };

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--app-color-bg-primary)' }}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div>
            {editingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameChange();
                  if (e.key === 'Escape') {
                    setNameInput(scale.name);
                    setEditingName(false);
                  }
                }}
                className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none" style={{ color: 'var(--app-color-text-loud)' }}
                autoFocus
              />
            ) : (
              <h3 
                className="text-lg font-semibold cursor-pointer" style={{ color: 'var(--app-color-text-loud)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-hover-text)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-loud)'}
                onClick={() => setEditingName(true)}
                title="Click to edit name"
              >
                {scale.name}
              </h3>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={scale.keyColor}
                  onChange={(e) => handleKeyColorChange(e.target.value)}
                  className="w-8 h-8 border rounded cursor-pointer" style={{ borderColor: 'var(--app-color-border-normal)' }}
                  title="Pick a color"
                />
                <input
                  type="text"
                  value={keyColorInput}
                  onChange={(e) => {
                    setKeyColorInput(e.target.value);
                    handleKeyColorChange(e.target.value);
                  }}
                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 w-28" style={{ color: 'var(--app-color-text-inputs)', borderColor: 'var(--app-color-border-normal)', backgroundColor: 'var(--app-color-bg-secondary)' }}
                  placeholder="#000000"
                />
              </div>
              <span className="text-sm" style={{ color: 'var(--app-color-text-muted)' }}>Key Color</span>
            </div>
          </div>
          <ColorSwatch
            color={scale.keyColor}
            label="Current"
            size="lg"
            onColorCopy={() => {}}
          />
        </div>
        <button
          onClick={onRemove}
          className="px-4 py-2 text-white rounded-md transition-colors" style={{ backgroundColor: 'var(--app-color-danger)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-danger-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-color-danger)'}
        >
          Remove
        </button>
      </div>


      {/* Scale Generation Recipe */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--app-color-bg-tertiary)' }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--app-color-text-loud)' }}>Scale Generation Recipe</h4>
        <div className="space-y-3">
          <div>
            <label className="flex justify-between text-xs mb-1" style={{ color: 'var(--app-color-text-normal)' }}>
              <span>Hue Shift (warmer → cooler gradient)</span>
              <span>{hueShift > 0 ? '+' : ''}{hueShift}°</span>
            </label>
            <input
              type="range"
              min="-60"
              max="60"
              step="1"
              value={hueShift}
              onChange={(e) => setHueShift(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--app-color-text-muted)' }}>
              <span>← Cooler lights</span>
              <span>Warmer lights →</span>
            </div>
          </div>
          <div>
            <label className="flex justify-between text-xs mb-1" style={{ color: 'var(--app-color-text-normal)' }}>
              <span>Chroma Shift (vibrant → muted gradient)</span>
              <span>{chromaShift > 0 ? '+' : ''}{chromaShift}</span>
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.2"
              value={chromaShift}
              onChange={(e) => setChromaShift(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--app-color-text-muted)' }}>
              <span>← Muted darks</span>
              <span>Vibrant darks →</span>
            </div>
          </div>
          {(hueShift !== 0 || chromaShift !== 0) && (
            <button
              onClick={() => {
                setHueShift(0);
                setChromaShift(0);
              }}
              className="w-full px-3 py-1 text-sm border rounded" style={{ color: 'var(--app-color-text-quiet)', borderColor: 'var(--app-color-border-normal)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
            >
              Reset Shifts
            </button>
          )}
        </div>
      </div>
      
      {/* Color Swatches */}
      <div className="grid grid-cols-11 gap-2">
        {Object.entries(scale.shades).map(([shade, color]) => (
          <div key={shade} className="relative group">
            <div
              className="w-full h-20 rounded-md shadow-sm mb-2 cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyHex(color.hex, shade)}
              onMouseEnter={() => setHoveredShade(shade)}
              onMouseLeave={() => setHoveredShade(null)}
            />
            
            {/* Tooltip */}
            {hoveredShade === shade && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-zinc-900 text-white text-xs rounded-lg shadow-lg z-10 w-64 pointer-events-none">
                <div className="space-y-2">
                  <div className="font-semibold text-sm border-b border-zinc-700 pb-1">{color.hex}</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* White background */}
                    <div>
                      <div className="font-medium mb-1">On White</div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span>WCAG:</span>
                          <span className={`font-medium ${
                            color.contrastWhite?.AA ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {color.contrastWhite ? getWCAGGradeString(color.contrastWhite) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ratio:</span>
                          <span>{color.contrastWhite?.ratio || 'N/A'}:1</span>
                        </div>
                        <div className="flex justify-between">
                          <span>APCA:</span>
                          <span>Lc {color.apcaWhite || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Black background */}
                    <div>
                      <div className="font-medium mb-1">On Black</div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span>WCAG:</span>
                          <span className={`font-medium ${
                            color.contrastBlack?.AA ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {color.contrastBlack ? getWCAGGradeString(color.contrastBlack) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ratio:</span>
                          <span>{color.contrastBlack?.ratio || 'N/A'}:1</span>
                        </div>
                        <div className="flex justify-between">
                          <span>APCA:</span>
                          <span>Lc {color.apcaBlack || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-zinc-400 pt-1 border-t border-zinc-700">
                    {color.okhsl ? 
                      `OKHsl: ${Math.round(color.okhsl.h)}° ${Math.round(color.okhsl.s * 100)}% ${Math.round(color.okhsl.l * 100)}%` :
                      'OKHsl: N/A'
                    }
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-zinc-900"></div>
                </div>
              </div>
            )}
            
            <p className="text-xs font-medium text-center" style={{ color: 'var(--app-color-text-normal)' }}>{shade}</p>
            {copiedHex === shade && (
              <p className="text-xs text-green-600 text-center">Copied!</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}