// ABOUTME: Type definitions for the color scale generator
// ABOUTME: Separates persisted state from computed properties

export interface WCAGGrade {
  ratio: number;
  AA: boolean;      // 4.5:1 for normal text
  AALarge: boolean; // 3:1 for large text (AA+)
  AAA: boolean;     // 7:1 for normal text
  AAALarge: boolean; // 4.5:1 for large text (AAA+)
}

// Core persisted state - only the essential data needed to regenerate the scale
export interface ColorScaleData {
  id: string;
  name: string;
  keyColor: string;
  hueShift?: number;
  chromaShift?: number;
}

// Computed shade data - generated at runtime
export interface ColorShade {
  hex: string;
  rgb: string;
  hsl: string;
  okhsl: { h: number; s: number; l: number };
  luminance: number;
  contrastWhite: WCAGGrade;
  contrastBlack: WCAGGrade;
  apcaWhite: number;
  apcaBlack: number;
}

// Full color scale with computed shades - used for display
export interface ColorScale extends ColorScaleData {
  shades: {
    [key: string]: ColorShade;
  };
}

// App state interface
export interface AppState {
  scales: ColorScaleData[];
  prefix: string;
  useThemeBlock: boolean;
} 