// ABOUTME: URL-based persistence utilities for color scales and settings
// ABOUTME: Uses LZString compression to store app state in URL hash

import LZString from 'lz-string';
import { ColorScale } from './colorUtils';

export interface Settings {
  prefix: string;
  useThemeBlock: boolean;
}

export interface AppState {
  scales: ColorScale[];
  prefix: string;
  useThemeBlock: boolean;
}

export const urlStorage = {
  // Get the current state from URL hash
  getState(): AppState {
    if (typeof window === 'undefined') {
      return { scales: [], prefix: '', useThemeBlock: false };
    }

    try {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (!hash) {
        return { scales: [], prefix: '', useThemeBlock: false };
      }

      const decompressed = LZString.decompressFromEncodedURIComponent(hash);
      if (!decompressed) {
        return { scales: [], prefix: '', useThemeBlock: false };
      }

      const state = JSON.parse(decompressed);
      
      // Validate and provide defaults for missing properties
      return {
        scales: Array.isArray(state.scales) ? state.scales : [],
        prefix: typeof state.prefix === 'string' ? state.prefix : '',
        useThemeBlock: typeof state.useThemeBlock === 'boolean' ? state.useThemeBlock : false,
      };
    } catch (error) {
      console.error('Failed to load state from URL:', error);
      return { scales: [], prefix: '', useThemeBlock: false };
    }
  },

  // Save state to URL hash
  saveState(state: AppState): void {
    if (typeof window === 'undefined') return;

    try {
      const jsonString = JSON.stringify(state);
      const compressed = LZString.compressToEncodedURIComponent(jsonString);
      
      // Update URL hash without triggering a page reload
      const newUrl = window.location.pathname + (compressed ? `#${compressed}` : '');
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.error('Failed to save state to URL:', error);
    }
  },

  // Clear the URL hash
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error('Failed to clear URL:', error);
    }
  },

  // Check if there's data in the URL
  hasData(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.hash.length > 1;
  },

  // Get URL for sharing
  getShareableUrl(): string {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  },

  // Listen for URL changes (useful for browser back/forward)
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