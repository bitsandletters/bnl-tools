// ABOUTME: Color utility functions for generating color scales using Okhsl color space
// ABOUTME: Based on Matt Strom's approach from https://matthewstrom.com/writing/generating-color-palettes/

import Color from 'colorjs.io';
import 'colorjs.io/fn';

export interface WCAGGrade {
  ratio: number;
  AA: boolean;      // 4.5:1 for normal text
  AALarge: boolean; // 3:1 for large text (AA+)
  AAA: boolean;     // 7:1 for normal text
  AAALarge: boolean; // 4.5:1 for large text (AAA+)
}

export interface ColorScale {
  id: string;
  name: string;
  keyColor: string;
  hueShift?: number;
  chromaShift?: number;
  shades: {
    [key: string]: {
      hex: string;
      rgb: string;
      hsl: string;
      okhsl: { h: number; s: number; l: number };
      luminance: number;
      contrastWhite: WCAGGrade;
      contrastBlack: WCAGGrade;
      apcaWhite: number;
      apcaBlack: number;
    };
  };
}

// Tailwind shade numbers map to scale numbers (0-100)
// 50 = 95 (lightest), 950 = 5 (darkest)
const TAILWIND_SHADES = {
  '50': 95,
  '100': 90,
  '200': 80,
  '300': 70,
  '400': 60,
  '500': 50,
  '600': 40,
  '700': 30,
  '800': 20,
  '900': 10,
  '950': 5,
};

// Normalize scale number to 0-1 range
function normalizeScaleNumber(scaleNumber: number, maxScale: number = 100): number {
  return scaleNumber / maxScale;
}

// Compute hue based on scale value (Matt's approach)
function computeScaleHue(scaleValue: number, baseHue: number): number {
  // Subtle hue shift to counteract Bezold–Brücke effect
  return baseHue + 5 * (1 - scaleValue);
}

// Compute chroma using parabolic curve (Matt's approach)
function computeScaleChroma(scaleValue: number, minChroma: number = 0.01, maxChroma: number = 0.15): number {
  const chromaDifference = maxChroma - minChroma;
  // Parabolic curve that peaks in the middle
  return -4 * chromaDifference * Math.pow(scaleValue, 2) + 
         4 * chromaDifference * scaleValue + 
         minChroma;
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
    AA: ratio >= 4.5,        // WCAG AA for normal text
    AALarge: ratio >= 3,     // WCAG AA for large text (18pt+)
    AAA: ratio >= 7,         // WCAG AAA for normal text
    AAALarge: ratio >= 4.5,  // WCAG AAA for large text
  };
}

// Calculate APCA contrast (simplified version)
function getAPCAContrast(textColor: Color, bgColor: Color): number {
  // This is a simplified APCA calculation
  // Full APCA is more complex but this gives a reasonable approximation
  const textY = textColor.luminance;
  const bgY = bgColor.luminance;
  
  const deltaY = bgY - textY;
  const contrast = Math.abs(deltaY) * 100;
  
  return Math.round(contrast);
}

// Convert Y (luminance) to L* (perceptual lightness)
function YtoL(Y: number): number {
  const fy = Y > 0.008856 ? Math.pow(Y, 1/3) : (7.787 * Y + 16/116);
  return 116 * fy - 16;
}

// Convert L* back to Okhsl lightness (0-1 range)
function labLightnessToOkhslLightness(L: number): number {
  // L* is 0-100, convert to 0-1 for Okhsl
  return L / 100;
}

// Compute lightness based on contrast ratio formula (Matt's approach)
function computeScaleLightness(scaleValue: number, backgroundLuminance: number = 1): number {
  // Calculate target contrast ratio using exponential function
  const contrastRatio = Math.exp(3.04 * scaleValue);
  
  let foregroundY;
  if (backgroundLuminance > 0.18) {
    // Light background - darker colors needed for contrast
    foregroundY = (backgroundLuminance + 0.05) / contrastRatio - 0.05;
  } else {
    // Dark background - lighter colors needed for contrast
    foregroundY = contrastRatio * (backgroundLuminance + 0.05) - 0.05;
  }
  
  // Clamp to valid range
  foregroundY = Math.max(0, Math.min(1, foregroundY));
  
  // Convert Y to L* then to Okhsl lightness
  const labLightness = YtoL(foregroundY);
  return labLightnessToOkhslLightness(labLightness);
}

export function generateColorScale(
  keyColor: string, 
  scaleName: string = 'primary',
  hueShift: number = 0,
  chromaShift: number = 0
): ColorScale {
  const baseColor = new Color(keyColor);
  const white = new Color('#ffffff');
  const black = new Color('#000000');
  
  // Convert to Okhsl for perceptually uniform adjustments
  const okhslBase = baseColor.to('okhsl');
  const baseHue = okhslBase.h || 0;
  const baseChroma = okhslBase.s || 0;  // This is already in 0-1 range
  
  // Set chroma range based on the key color's saturation (keep in 0-1 range)
  const maxChroma = Math.min(baseChroma * 1.2, 1); // Cap at 1
  const minChroma = baseChroma * 0.1;
  
  const shades: ColorScale['shades'] = {};
  
  Object.entries(TAILWIND_SHADES).forEach(([shade, scaleNumber]) => {
    // Invert scale value: 95 (lightest) -> 0.05, 5 (darkest) -> 0.95
    const scaleValue = normalizeScaleNumber(100 - scaleNumber, 100);
    
    // Calculate hue with user-defined shift
    // For hueShift > 0: lighter shades are warmer, darker shades are cooler
    // For hueShift < 0: lighter shades are cooler, darker shades are warmer
    // The shift is centered around the middle (scale 500)
    const hueOffset = hueShift * (0.5 - scaleValue); // Range from -hueShift/2 to +hueShift/2
    const hue = baseHue + hueOffset + 5 * (1 - scaleValue); // Include Matt's subtle shift
    
    // Calculate chroma with user-defined shift
    // Positive chromaShift makes darker shades more vibrant
    // Negative chromaShift makes darker shades more muted
    const chromaAdjustment = chromaShift * (scaleValue - 0.5) * 0.2; // Centered at middle, stronger effect
    const chroma = Math.max(0, Math.min(1, 
      computeScaleChroma(scaleValue, minChroma, maxChroma) + chromaAdjustment
    ));
    const lightness = computeScaleLightness(scaleValue);  // Already in 0-1 range
    
    // Create the color in Okhsl space (h in degrees, s and l in 0-1 range)
    const shadeColor = new Color('okhsl', [hue, chroma, lightness]);
    
    // Convert to various formats
    const srgb = shadeColor.to('srgb');
    let hex = srgb.toString({ format: 'hex' });
    // Ensure 6-digit hex format
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const rgb = srgb.toString({ format: 'rgb' });
    const hsl = srgb.to('hsl').toString({ format: 'hsl' });
    
    // Calculate contrasts against both black and white
    const contrastWhite = getWCAGGrade(shadeColor, white);
    const contrastBlack = getWCAGGrade(shadeColor, black);
    const apcaWhite = getAPCAContrast(shadeColor, white);
    const apcaBlack = getAPCAContrast(shadeColor, black);
    
    shades[shade] = {
      hex,
      rgb,
      hsl,
      okhsl: { h: hue, s: chroma, l: lightness },
      luminance: scaleNumber,
      contrastWhite,
      contrastBlack,
      apcaWhite,
      apcaBlack,
    };
  });
  
  return {
    id: `scale-${Date.now()}`,
    name: scaleName,
    keyColor,
    hueShift,
    chromaShift,
    shades,
  };
}

export function exportAsCSSVariables(
  scales: ColorScale[],
  prefix: string = '',
  useThemeBlock: boolean = false
): string {
  let css = useThemeBlock ? '@theme {\n' : ':root {\n';
  
  scales.forEach(scale => {
    const scalePrefix = prefix ? `${prefix}-${scale.name}` : scale.name;
    
    Object.entries(scale.shades).forEach(([shade, color]) => {
      css += `  --color-${scalePrefix}-${shade}: ${color.hex};\n`;
    });
    
    css += '\n';
  });
  
  css += '}';
  
  return css;
}

export function parseColor(input: string): string | null {
  try {
    const color = new Color(input);
    const hex = color.toString({ format: 'hex' });
    // Ensure 6-digit hex format
    if (hex.length === 4) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
  } catch {
    return null;
  }
}

// Get the best WCAG grade that passes
export function getWCAGGradeString(grade: WCAGGrade): string {
  if (grade.AAA) return 'AAA';
  if (grade.AAALarge) return 'AAA+';
  if (grade.AA) return 'AA';
  if (grade.AALarge) return 'AA+';
  return 'Fail';
}

export function adjustHueChroma(color: string, hueAdjust: number = 0, chromaAdjust: number = 0): string {
  try {
    const c = new Color(color);
    const okhsl = c.to('okhsl');
    
    // Adjust hue (wrap around 360)
    okhsl.h = ((okhsl.h || 0) + hueAdjust + 360) % 360;
    
    // Adjust chroma (clamp to 0-1)
    okhsl.s = Math.max(0, Math.min(1, (okhsl.s || 0) + chromaAdjust));
    
    const adjusted = new Color('okhsl', [okhsl.h, okhsl.s, okhsl.l]);
    let hex = adjusted.to('srgb').toString({ format: 'hex' });
    
    // Ensure 6-digit hex format
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    
    return hex;
  } catch {
    return color;
  }
}