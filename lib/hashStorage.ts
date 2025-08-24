import { StateStorage } from "zustand/middleware";
import LZString from 'lz-string';
import type { AppState, ColorScaleData } from "./types";

// Helper: compact (v2) encode/decode for shorter hashes while remaining backward-compatible
// Compact format:
// { v: 2, s: [ [id, name, keyColor, hueShift?, chromaShift?], ... ], p?: string, t?: boolean }
export function compactAppState(state: AppState): { v: 2; s: (string | number)[][]; p?: string; t?: boolean } {
  const tuples: (string | number)[][] = (state.scales || []).map((scale) => {
    const tuple: (string | number)[] = [scale.id, scale.name, scale.keyColor];
    const hue = scale.hueShift || 0;
    const chr = scale.chromaShift || 0;
    if (hue !== 0 || chr !== 0) tuple.push(hue);
    if (chr !== 0) tuple.push(chr);
    return tuple;
  });

  const result: { v: 2; s: (string | number)[][]; p?: string; t?: boolean } = {
    v: 2,
    s: tuples,
  };
  if (state.prefix) result.p = state.prefix;
  if (state.useThemeBlock) result.t = true;
  return result;
}

export function expandAppState(compact: any): AppState {
  // v2 compact -> full
  if (compact && compact.v === 2 && Array.isArray(compact.s)) {
    const scales: ColorScaleData[] = compact.s.map((tuple: any[]) => {
      const [id, name, keyColor, hueShift = 0, chromaShift = 0] = tuple as [string, string, string, number?, number?];
      return {
        id,
        name,
        keyColor,
        ...(hueShift ? { hueShift } : {}),
        ...(chromaShift ? { chromaShift } : {}),
      };
    });
    return {
      scales,
      prefix: typeof compact.p === 'string' ? compact.p : '',
      useThemeBlock: !!compact.t,
    };
  }

  // v1 full JSON already
  const v1 = compact as Partial<AppState>;
  return {
    scales: Array.isArray(v1?.scales) ? (v1.scales as ColorScaleData[]) : [],
    prefix: typeof v1?.prefix === 'string' ? (v1.prefix as string) : '',
    useThemeBlock: typeof v1?.useThemeBlock === 'boolean' ? (v1.useThemeBlock as boolean) : false,
  };
}

// Decode a decompressed JSON string (v1 or v2) into a full AppState JSON string for persist()
export function decodeDecompressedToFullJsonString(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw);
    const full = expandAppState(parsed);
    return JSON.stringify(full);
  } catch {
    return null;
  }
}

// Hash storage adapter for Zustand
export class HashStorage implements StateStorage {
  getItem(_name: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return Promise.resolve(null);
    }
    
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(hash);
      if (!decompressed) return Promise.resolve(null);
      const fullJson = decodeDecompressedToFullJsonString(decompressed);
      if (!fullJson) return Promise.resolve(null);
      
      // Wrap in Zustand persist format
      const persistFormat = {
        state: JSON.parse(fullJson),
        version: 0
      };
      return Promise.resolve(JSON.stringify(persistFormat));
    } catch (error) {
      console.error('Failed to decompress hash:', error);
      return Promise.resolve(null);
    }
  }

  setItem(_name: string, value: string): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    
    try {
      // Zustand persist sends data in format: { state: {...}, version: 0 }
      const persistData = JSON.parse(value);
      const state: AppState = persistData.state;
      
      const compact = compactAppState(state);
      const compactString = JSON.stringify(compact);
      const compressed = LZString.compressToEncodedURIComponent(compactString);
      const newUrl = window.location.pathname + (compressed ? `#${compressed}` : '');
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.error('Failed to save to hash:', error);
    }
    
    return Promise.resolve();
  }

  removeItem(_name: string): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error('Failed to clear hash:', error);
    }
    
    return Promise.resolve();
  }
}