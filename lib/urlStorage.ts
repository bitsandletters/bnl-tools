// ABOUTME: URL-based persistence utilities for color scales and settings
// ABOUTME: Supports new query-string format and legacy hash compression

import LZString from 'lz-string';
import { generateColorScaleData } from './colorUtils';
import { AppState, ColorScaleData } from './types';

const defaultState: AppState = {
  scales: [],
  prefix: '',
  useThemeBlock: false,
};

function parseScaleParam(param: string): ColorScaleData | null {
  try {
    const firstColon = param.indexOf(':');
    if (firstColon === -1) return null;

    const rawName = param.slice(0, firstColon);
    const name = decodeURIComponent(rawName);

    const rest = param.slice(firstColon + 1);
    const [colorPart, ...restParts] = rest.split(',');
    const keyColor = decodeURIComponent(colorPart || '').trim();

    if (!keyColor) return null;

    let hueShift = 0;
    let chromaShift = 0;

    for (const part of restParts) {
      const sep = part.indexOf(':');
      if (sep === -1) continue;
      const k = part.slice(0, sep).trim();
      const v = part.slice(sep + 1).trim();
      if (k === 'h') {
        const n = Number(v);
        if (!Number.isNaN(n)) hueShift = n;
      } else if (k === 'c') {
        const n = Number(v);
        if (!Number.isNaN(n)) chromaShift = n;
      }
    }

    return generateColorScaleData(keyColor, name, hueShift, chromaShift);
  } catch {
    return null;
  }
}

function serializeScaleParam(scale: ColorScaleData): string {
  const name = encodeURIComponent(scale.name);
  const color = encodeURIComponent(scale.keyColor);
  const parts: string[] = [`${name}:${color}`];
  if (scale.hueShift && scale.hueShift !== 0) parts.push(`h:${scale.hueShift}`);
  if (scale.chromaShift && scale.chromaShift !== 0) parts.push(`c:${scale.chromaShift}`);
  return parts.join(',');
}

export const urlStorage = {
  // Get the current state (prefer query string, fallback to hash)
  getState(): AppState {
    if (typeof window === 'undefined') {
      return defaultState;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const sParams = params.getAll('s');
      if (sParams.length > 0 || params.has('prefix') || params.has('useThemeBlock')) {
        const scales: ColorScaleData[] = [];
        for (const p of sParams) {
          const parsed = parseScaleParam(p);
          if (parsed) scales.push(parsed);
        }

        const prefix = params.get('prefix') || '';
        const useThemeBlockParam = params.get('useThemeBlock');
        const useThemeBlock = useThemeBlockParam === '1' || useThemeBlockParam === 'true';

        return { scales, prefix, useThemeBlock };
      }

      // Legacy hash format
      const hash = window.location.hash.slice(1);
      if (!hash) {
        return defaultState;
      }

      const decompressed = LZString.decompressFromEncodedURIComponent(hash);
      if (!decompressed) {
        return defaultState;
      }

      const state = JSON.parse(decompressed);
      return {
        scales: Array.isArray(state.scales) ? state.scales : [],
        prefix: typeof state.prefix === 'string' ? state.prefix : '',
        useThemeBlock: typeof state.useThemeBlock === 'boolean' ? state.useThemeBlock : false,
      };
    } catch (error) {
      console.error('Failed to load state from URL:', error);
      return defaultState;
    }
  },

  // Save state to query string (new format)
  saveState(state: AppState): void {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams();
      (state.scales || []).forEach((scale) => {
        params.append('s', serializeScaleParam(scale));
      });
      if (state.prefix) params.set('prefix', state.prefix);
      if (state.useThemeBlock) params.set('useThemeBlock', '1');

      const query = params.toString();
      const newUrl = window.location.pathname + (query ? `?${query}` : '');
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.error('Failed to save state to URL:', error);
    }
  },

  // Clear the URL query and hash
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error('Failed to clear URL:', error);
    }
  },

  // Check if there's data in the URL (query or hash)
  hasData(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hasQuery = params.getAll('s').length > 0 || params.has('prefix') || params.has('useThemeBlock');
    const hasHash = window.location.hash.length > 1;
    return hasQuery || hasHash;
  },

  // Get URL for sharing
  getShareableUrl(): string {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  },

  // Legacy: Listen for URL hash changes
  onHashChange(callback: (state: AppState) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleHashChange = () => {
      const state = urlStorage.getState();
      callback(state);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }
}; 