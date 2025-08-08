// ABOUTME: Reusable color swatch component with detailed contrast overlay
// ABOUTME: Shows WCAG, APCA, and OKHsl values on hover with click-to-copy

'use client';

import { useState } from 'react';
import Color from 'colorjs.io';
import 'colorjs.io/fn';
import { getWCAGGradeString, WCAGGrade } from '@/lib/colorUtils';

interface ColorSwatchProps {
  color: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onColorCopy?: (color: string) => void;
  className?: string;
}

// Calculate WCAG contrast ratio and grades
function getWCAGGrade(color1: Color, color2: Color): WCAGGrade {
  const l1 = color1.luminance;
  const l2 = color2.luminance;
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5,
    AALarge: ratio >= 3,
    AAA: ratio >= 7,
    AAALarge: ratio >= 4.5,
  };
}

// Calculate APCA contrast
function getAPCAContrast(textColor: Color, bgColor: Color): number {
  const textY = textColor.luminance;
  const bgY = bgColor.luminance;
  const deltaY = bgY - textY;
  const contrast = Math.abs(deltaY) * 100;
  return Math.round(contrast);
}

export default function ColorSwatch({ 
  color, 
  label, 
  size = 'md', 
  onClick,
  onColorCopy,
  className = ''
}: ColorSwatchProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleClick = () => {
    if (onColorCopy) {
      navigator.clipboard.writeText(color);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onColorCopy(color);
    }
    if (onClick) {
      onClick();
    }
  };

  // Calculate color properties
  let colorData = null;
  try {
    const c = new Color(color);
    const white = new Color('#ffffff');
    const black = new Color('#000000');
    
    const okhsl = c.to('okhsl');
    const contrastWhite = getWCAGGrade(c, white);
    const contrastBlack = getWCAGGrade(c, black);
    const apcaWhite = getAPCAContrast(c, white);
    const apcaBlack = getAPCAContrast(c, black);
    
    colorData = {
      hex: c.toString({ format: 'hex' }),
      okhsl: { h: okhsl.h || 0, s: okhsl.s || 0, l: okhsl.l || 0 },
      contrastWhite,
      contrastBlack,
      apcaWhite,
      apcaBlack,
    };
  } catch {
    // Invalid color
  }

  return (
    <div className="relative group">
      <div
        className={`${sizeClasses[size]} rounded border-2 cursor-pointer transition-transform hover:scale-105 ${className}`}
        style={{ backgroundColor: color, borderColor: 'var(--app-color-border-normal)' }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={label}
      />
      
      {copied && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-green-600 whitespace-nowrap">
          Copied!
        </div>
      )}
      
      {/* Detailed overlay */}
      {isHovered && colorData && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-zinc-900 text-white text-xs rounded-lg shadow-lg z-50 w-64 pointer-events-none">
          <div className="space-y-2">
            <div className="font-semibold text-sm border-b border-zinc-700 pb-1">
              {colorData.hex}
              {label && <span className="text-zinc-400 ml-2">{label}</span>}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* White background */}
              <div>
                <div className="font-medium mb-1">On White</div>
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>WCAG:</span>
                    <span className={`font-medium ${
                      colorData.contrastWhite.AA ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getWCAGGradeString(colorData.contrastWhite)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio:</span>
                    <span>{colorData.contrastWhite.ratio}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>APCA:</span>
                    <span>Lc {colorData.apcaWhite}</span>
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
                      colorData.contrastBlack.AA ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getWCAGGradeString(colorData.contrastBlack)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio:</span>
                    <span>{colorData.contrastBlack.ratio}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>APCA:</span>
                    <span>Lc {colorData.apcaBlack}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-zinc-400 pt-1 border-t border-zinc-700">
              OKHsl: {Math.round(colorData.okhsl.h)}° {Math.round(colorData.okhsl.s * 100)}% {Math.round(colorData.okhsl.l * 100)}%
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-zinc-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}