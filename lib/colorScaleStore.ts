// ABOUTME: Zustand store for color scale generator with hash storage and undo/redo
// ABOUTME: Manages color scales, settings, and provides undo/redo functionality

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import LZString from 'lz-string';
import { generateColorScale, generateColorScaleData } from './colorUtils';
import { AppState, ColorScale, ColorScaleData } from './types';

export interface ColorScaleStore extends AppState {
  // Actions
  addColorScale: () => void;
  removeScale: (id: string) => void;
  updateScale: (updatedScale: ColorScaleData) => void;
  updatePrefix: (prefix: string) => void;
  updateUseThemeBlock: (useThemeBlock: boolean) => void;
  clearAll: () => void;
  
  // Computed properties
  getFullScales: () => ColorScale[];
  
  // Undo/Redo
  history: AppState[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  
  // Internal
  _addToHistory: (state: AppState) => void;
  _setHistoryIndex: (index: number) => void;
}

// Hash storage adapter for Zustand
class HashStorage implements StateStorage {
  getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return Promise.resolve(null);
    }
    
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(hash);
      return Promise.resolve(decompressed);
    } catch (error) {
      console.error('Failed to decompress hash:', error);
      return Promise.resolve(null);
    }
  }

  setItem(name: string, value: string): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    
    try {
      const compressed = LZString.compressToEncodedURIComponent(value);
      const newUrl = window.location.pathname + (compressed ? `#${compressed}` : '');
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.error('Failed to save to hash:', error);
    }
    
    return Promise.resolve();
  }

  removeItem(name: string): Promise<void> {
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

// New: Query string storage adapter for Zustand
class QueryStringStorage implements StateStorage {
  private parseScaleParam(param: string, index: number): ColorScaleData | null {
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

      // Use existing helper to ensure consistent data shape (generates id)
      return generateColorScaleData(keyColor, name, hueShift, chromaShift);
    } catch {
      return null;
    }
  }

  private serializeScaleParam(scale: ColorScaleData): string {
    const name = encodeURIComponent(scale.name);
    const color = encodeURIComponent(scale.keyColor);
    const parts: string[] = [`${name}:${color}`];
    if (scale.hueShift && scale.hueShift !== 0) parts.push(`h:${scale.hueShift}`);
    if (scale.chromaShift && scale.chromaShift !== 0) parts.push(`c:${scale.chromaShift}`);
    return parts.join(',');
  }

  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const sParams = params.getAll('s');

    if (sParams.length > 0 || params.has('prefix') || params.has('useThemeBlock') || params.has('output')) {
      const scales: ColorScaleData[] = [];
      sParams.forEach((p, i) => {
        const parsed = this.parseScaleParam(p, i);
        if (parsed) scales.push(parsed);
      });

      const prefix = params.get('prefix') || '';
      const output = params.get('output');
      const useThemeBlockParam = params.get('useThemeBlock');
      // Priority: explicit output setting, else boolean alias
      const useThemeBlock = output ? (output === 'tailwind') : (useThemeBlockParam === '1' || useThemeBlockParam === 'true');

      const state: AppState = {
        scales,
        prefix,
        useThemeBlock,
      };

      try {
        return JSON.stringify(state);
      } catch {
        return null;
      }
    }

    // Fallback: support legacy hash-based compressed state if present
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(hash);
        return decompressed ?? null;
      } catch {
        return null;
      }
    }

    return null;
  }

  async setItem(name: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const parsed = JSON.parse(value) as AppState;
      const params = new URLSearchParams();

      (parsed.scales || []).forEach((scale) => {
        params.append('s', this.serializeScaleParam(scale));
      });

      if (parsed.prefix) {
        params.set('prefix', parsed.prefix);
      }

      // Preferred new param: output
      params.set('output', parsed.useThemeBlock ? 'tailwind' : 'root');

      const query = params.toString();
      const newUrl = window.location.pathname + (query ? `?${query}` : '');
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.error('Failed to save to query string:', error);
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error('Failed to clear query string:', error);
    }
  }
}

const defaultState: AppState = {
  scales: [],
  prefix: '',
  useThemeBlock: false,
};

export const useColorScaleStore = create<ColorScaleStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...defaultState,
        history: [defaultState],
        currentIndex: 0,
        canUndo: false,
        canRedo: false,

        addColorScale: () => {
          const state = get();
          const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
          const scales = state.scales || [];
          const defaultColor = defaultColors[scales.length % defaultColors.length];
          const scaleName = `scale-${scales.length + 1}`;
          
          const newScale = generateColorScaleData(defaultColor, scaleName);
          const newState = {
            ...state,
            scales: [...(state.scales || []), newScale],
          };
          
          set(newState);
          get()._addToHistory(newState);
        },

        removeScale: (id: string) => {
          const state = get();
          const newState = {
            ...state,
            scales: (state.scales || []).filter(scale => scale.id !== id),
          };
          
          set(newState);
          get()._addToHistory(newState);
        },

        updateScale: (updatedScale: ColorScaleData) => {
          const state = get();
          const newState = {
            ...state,
            scales: (state.scales || []).map(scale => 
              scale.id === updatedScale.id ? updatedScale : scale
            ),
          };
          
          set(newState);
          get()._addToHistory(newState);
        },

        updatePrefix: (prefix: string) => {
          const state = get();
          const newState = { ...state, prefix };
          
          set(newState);
          get()._addToHistory(newState);
        },

        updateUseThemeBlock: (useThemeBlock: boolean) => {
          const state = get();
          const newState = { ...state, useThemeBlock };
          
          set(newState);
          get()._addToHistory(newState);
        },

        clearAll: () => {
          const newState = { ...defaultState };
          set(newState);
          get()._addToHistory(newState);
        },

        getFullScales: () => {
          const state = get();
          return (state.scales || []).map(scaleData => generateColorScale(scaleData));
        },

        undo: () => {
          const { history, currentIndex, _setHistoryIndex } = get();
          if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const previousState = history[newIndex];
            set({ ...previousState, currentIndex: newIndex, canUndo: newIndex > 0, canRedo: newIndex < history.length - 1 });
            _setHistoryIndex(newIndex);
          }
        },

        redo: () => {
          const { history, currentIndex, _setHistoryIndex } = get();
          if (currentIndex < history.length - 1) {
            const newIndex = currentIndex + 1;
            const nextState = history[newIndex];
            set({ ...nextState, currentIndex: newIndex, canUndo: newIndex > 0, canRedo: newIndex < history.length - 1 });
            _setHistoryIndex(newIndex);
          }
        },

        _addToHistory: (state: AppState) => {
          const { history, currentIndex } = get();
          const maxHistorySize = 50;
          
          // Remove any future history when adding a new state
          const newHistory = [...history.slice(0, currentIndex + 1), state];
          
          // Limit history size
          if (newHistory.length > maxHistorySize) {
            newHistory.shift();
          }
          
          const newIndex = newHistory.length - 1;
          
          set({
            ...state,
            history: newHistory,
            currentIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: newIndex < newHistory.length - 1,
          });
        },

        _setHistoryIndex: (index: number) => {
          const { history } = get();
          set({
            currentIndex: index,
            canUndo: index > 0,
            canRedo: index < history.length - 1,
          });
        },
      }),
      {
        name: 'color-scale-generator',
        storage: createJSONStorage(() => new QueryStringStorage()),
        // Only persist the core state, not the history
        partialize: (state) => ({
          scales: state.scales,
          prefix: state.prefix,
          useThemeBlock: state.useThemeBlock,
        }),
        // When rehydrating, initialize history with the loaded state
        onRehydrateStorage: () => (state) => {
          if (state) {
            const loadedState = {
              scales: state.scales || [],
              prefix: state.prefix || '',
              useThemeBlock: state.useThemeBlock || false,
            };
            state.history = [loadedState];
            state.currentIndex = 0;
            state.canUndo = false;
            state.canRedo = false;
          }
        },
      }
    )
  )
);

// Listen for URL popstate changes (browser back/forward) for query string format
if (typeof window !== 'undefined') {
  const handlePopState = () => {
    const store = useColorScaleStore.getState();
    const loader = new QueryStringStorage();
    loader.getItem('color-scale-generator').then((json) => {
      if (json) {
        try {
          const newState = JSON.parse(json) as AppState;
          store._setHistoryIndex(0);
          store._addToHistory(newState);
        } catch (error) {
          console.error('Failed to parse query state:', error);
        }
      }
    });
  };

  window.addEventListener('popstate', handlePopState);
}

// Listen for URL hash changes (browser back/forward)
if (typeof window !== 'undefined') {
  const handleHashChange = () => {
    const store = useColorScaleStore.getState();
    // Force a rehydration from the new hash
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(hash);
        if (decompressed) {
          const newState = JSON.parse(decompressed);
          // Update the store state directly without adding to history
          store._setHistoryIndex(0);
          store._addToHistory(newState);
        }
      } catch (error) {
        console.error('Failed to parse hash change:', error);
      }
    }
  };

  window.addEventListener('hashchange', handleHashChange);

  // Note: We don't automatically add a scale to prevent hydration mismatches
  // The user can add scales manually, or we can handle this in the component
}

// Keyboard shortcuts for undo/redo
if (typeof window !== 'undefined') {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;
    
    if (modifier && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      useColorScaleStore.getState().undo();
    } else if (modifier && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault();
      useColorScaleStore.getState().redo();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
} 