// ABOUTME: URL-based persistence utilities for color scales and settings
// ABOUTME: Supports query-string format and falls back to legacy hash-compressed state

import LZString from 'lz-string';
import { AppState as PersistedAppState, ColorScaleData } from './types';

type AppState = PersistedAppState;

const defaultState: AppState = {
  scales: [],
  prefix: '',
  useThemeBlock: false,
};

function isTruthyFlag(value: string | null): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function decodeScaleParam(param: string): ColorScaleData | null {
  const [rawName, rawColor] = param.split(':');
  if (!rawName || !rawColor) return null;

  // Handle colors encoded as "%3b82f6" (where leading '%' represents '#')
  // Also handle already-decoded '#3b82f6' or bare '3b82f6'
  let keyColor = rawColor;
  if (keyColor.startsWith('%')) {
    keyColor = `#${keyColor.slice(1)}`;
  } else if (!keyColor.startsWith('#')) {
    keyColor = `#${keyColor}`;
  }

  return {
    id: `scale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: rawName,
    keyColor,
  };
}

function encodeColorForQuery(hexColor: string): string {
  // Expect '#rrggbb' – encode as '%rrggbb' so that URLSearchParams double-encodes '%' to '%25'
  const normalized = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  return `%${normalized}`;
}

export const urlStorage = {
  // Get current state from URL: prefer query-string, fallback to legacy hash-compressed JSON
  getState(): AppState {
    if (typeof window === 'undefined') {
      return defaultState;
    }

    try {
      const searchParams = new URLSearchParams(window.location.search);

      // New query-string format
      const scaleParams = searchParams.getAll('s');
      if (scaleParams.length > 0) {
        const scales: ColorScaleData[] = scaleParams
          .map(decodeScaleParam)
          .filter((s): s is ColorScaleData => Boolean(s));

        const prefix = searchParams.get('prefix') || '';
        // Map output alias to useThemeBlock
        const output = (searchParams.get('output') || '').toLowerCase();
        const themeAlias = searchParams.get('tb') || searchParams.get('theme');
        const useThemeBlock = output === 'tailwind' || output === 'theme' || isTruthyFlag(themeAlias);

        return { scales, prefix, useThemeBlock };
      }

      // Legacy: hash-compressed JSON using LZString
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decompressed = LZString.decompressFromEncodedURIComponent(hash);
        if (decompressed) {
          const state = JSON.parse(decompressed);
          return {
            scales: Array.isArray(state.scales) ? state.scales : [],
            prefix: typeof state.prefix === 'string' ? state.prefix : '',
            useThemeBlock: typeof state.useThemeBlock === 'boolean' ? state.useThemeBlock : false,
          };
        }
      }

      return defaultState;
    } catch (error) {
      console.error('Failed to load state from URL:', error);
      return defaultState;
    }
  },

  // Save state to URL query-string (new format)
  saveState(state: AppState): void {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams();
      for (const scale of state.scales) {
        const colorPart = encodeColorForQuery(scale.keyColor);
        params.append('s', `${scale.name}:${colorPart}`);
      }

      if (state.prefix) {
        params.set('prefix', state.prefix);
      }

      params.set('output', state.useThemeBlock ? 'tailwind' : 'root');

      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.error('Failed to save state to URL:', error);
    }
  },

  // Clear the URL (remove query and hash)
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error('Failed to clear URL:', error);
    }
  },

  // Check if there's data in the URL (query-string or legacy hash)
  hasData(): boolean {
    if (typeof window === 'undefined') return false;
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has('s') || window.location.hash.length > 1;
  },

  // Get URL for sharing
  getShareableUrl(): string {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  },

  // Listen for navigation changes that might alter state (use popstate for query changes)
  onHashChange(callback: (state: AppState) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleChange = () => {
      const state = urlStorage.getState();
      callback(state);
    };

    window.addEventListener('popstate', handleChange);
    window.addEventListener('hashchange', handleChange);
    
    return () => {
      window.removeEventListener('popstate', handleChange);
      window.removeEventListener('hashchange', handleChange);
    };
  }
};