// ABOUTME: Enhanced color scale editor with hue/chroma controls and detailed color info
// ABOUTME: Provides interactive editing of color scales with contrast information

'use client';

import { useState, useEffect } from 'react';
import { generateColorScaleData, getWCAGGradeString, parseColor } from '@/lib/colorUtils';
import { ColorScale, ColorScaleData } from '@/lib/types';
import ColorSwatch from './ColorSwatch';
import { Button } from '@/components/catalyst/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faTrash } from '@awesome.me/kit-dafe0a6e6d/icons/sharp/regular';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

interface ColorScaleEditorProps {
  scale: ColorScale;
  onUpdate: (scale: ColorScaleData) => void;
  onRemove: () => void;
}

interface ColorScaleRecipePopoverProps {
  scale: ColorScale;
  onUpdate: (scale: ColorScaleData) => void;
}

function ColorScaleRecipePopover({ scale, onUpdate }: ColorScaleRecipePopoverProps) {
  return (
    <Popover>
      <PopoverButton>
        <FontAwesomeIcon icon={faSliders} data-slot="icon" />
        <span>Settings</span>
      </PopoverButton>
      <PopoverPanel anchor="bottom end" className="bg-bg-primary shadow-lg">
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--app-color-bg-tertiary)' }}>
          <div className="space-y-3">
            <div>
              <label className="flex justify-between text-xs mb-1 text-text-normal" >
                <span>Hue Shift (warmer → cooler gradient)</span>
                <span>{(scale.hueShift || 0) > 0 ? '+' : ''}{scale.hueShift || 0}°</span>
              </label>
              <input
                type="range"
                min="-60"
                max="60"
                step="1"
                value={scale.hueShift || 0}
                onChange={(e) => {
                  const newScaleData = generateColorScaleData(scale.keyColor, scale.name, Number(e.target.value), scale.chromaShift || 0);
                  onUpdate({ ...newScaleData, id: scale.id });
                }}
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
                <span>{(scale.chromaShift || 0) > 0 ? '+' : ''}{scale.chromaShift || 0}</span>
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.2"
                value={scale.chromaShift || 0}
                onChange={(e) => {
                  const newScaleData = generateColorScaleData(scale.keyColor, scale.name, scale.hueShift || 0, Number(e.target.value));
                  onUpdate({ ...newScaleData, id: scale.id });
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--app-color-text-muted)' }}>
                <span>← Muted darks</span>
                <span>Vibrant darks →</span>
              </div>
            </div>
            {((scale.hueShift || 0) !== 0 || (scale.chromaShift || 0) !== 0) && (
              <button
                onClick={() => {
                  const newScaleData = generateColorScaleData(scale.keyColor, scale.name, 0, 0);
                  onUpdate({ ...newScaleData, id: scale.id });
                }}
                className="w-full px-3 py-1 text-sm border rounded" style={{ color: 'var(--app-color-text-quiet)', borderColor: 'var(--app-color-border-normal)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
              >
                Reset Shifts
              </button>
            )}
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  );
}

export default function ColorScaleEditor({ scale, onUpdate, onRemove }: ColorScaleEditorProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [hoveredShade, setHoveredShade] = useState<string | null>(null);
  const [keyColorInput, setKeyColorInput] = useState(scale.keyColor);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(scale.name);

  // Update local state when scale changes (for undo/redo)
  useEffect(() => {
    setKeyColorInput(scale.keyColor);
    setNameInput(scale.name);
  }, [scale.keyColor, scale.name]);

  const copyHex = (hex: string, shade: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(shade);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleKeyColorChange = (newColor: string) => {
    const parsedColor = parseColor(newColor);
    if (parsedColor) {
      setKeyColorInput(parsedColor);
      const newScaleData = generateColorScaleData(parsedColor, scale.name, scale.hueShift || 0, scale.chromaShift || 0);
      onUpdate({ ...newScaleData, id: scale.id });
    }
  };

  const handleNameChange = () => {
    if (nameInput.trim()) {
      onUpdate({ 
        id: scale.id,
        name: nameInput.trim(),
        keyColor: scale.keyColor,
        hueShift: scale.hueShift,
        chromaShift: scale.chromaShift,
      });
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
              </div>
            </div>
          </div>
        </div>
        <ColorScaleRecipePopover scale={scale} onUpdate={onUpdate} />
        <Button
          plain
          onClick={onRemove}
        >
          <FontAwesomeIcon icon={faTrash} data-slot="icon" />
          Remove
        </Button>
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