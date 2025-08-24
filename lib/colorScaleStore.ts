// ABOUTME: Zustand store for color scale generator with hash storage and undo/redo
// ABOUTME: Manages color scales, settings, and provides undo/redo functionality

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import LZString from 'lz-string';
import { generateColorScale, generateColorScaleData } from './colorUtils';
import { AppState, ColorScale, ColorScaleData } from './types';

import { HashStorage } from './hashStorage';

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

function expandAppState(compact: any): AppState {
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
function decodeDecompressedToFullJsonString(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw);
    const full = expandAppState(parsed);
    return JSON.stringify(full);
  } catch {
    return null;
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
          const newScales = [...(state.scales || []), newScale];
          
          set({ scales: newScales });
          get()._addToHistory({ scales: newScales, prefix: state.prefix, useThemeBlock: state.useThemeBlock });
        },

        removeScale: (id: string) => {
          const state = get();
          const newScales = (state.scales || []).filter(scale => scale.id !== id);
          
          set({ scales: newScales });
          get()._addToHistory({ scales: newScales, prefix: state.prefix, useThemeBlock: state.useThemeBlock });
        },

        updateScale: (updatedScale: ColorScaleData) => {
          const state = get();
          const newScales = (state.scales || []).map(scale => 
            scale.id === updatedScale.id ? updatedScale : scale
          );
          
          set({ scales: newScales });
          get()._addToHistory({ scales: newScales, prefix: state.prefix, useThemeBlock: state.useThemeBlock });
        },

        updatePrefix: (prefix: string) => {
          const state = get();
          
          set({ prefix });
          get()._addToHistory({ scales: state.scales, prefix, useThemeBlock: state.useThemeBlock });
        },

        updateUseThemeBlock: (useThemeBlock: boolean) => {
          const state = get();
          
          set({ useThemeBlock });
          get()._addToHistory({ scales: state.scales, prefix: state.prefix, useThemeBlock });
        },

        clearAll: () => {
          set({ scales: defaultState.scales, prefix: defaultState.prefix, useThemeBlock: defaultState.useThemeBlock });
          get()._addToHistory(defaultState);
        },

        getFullScales: () => {
          const state = get();
          return (state.scales || []).map(scaleData => generateColorScale(scaleData));
        },

        undo: () => {
          const { history, currentIndex } = get();
          if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const previousState = history[newIndex];
            set({ 
              scales: previousState.scales,
              prefix: previousState.prefix,
              useThemeBlock: previousState.useThemeBlock,
              currentIndex: newIndex,
              canUndo: newIndex > 0,
              canRedo: true
            });
          }
        },

        redo: () => {
          const { history, currentIndex } = get();
          if (currentIndex < history.length - 1) {
            const newIndex = currentIndex + 1;
            const nextState = history[newIndex];
            set({ 
              scales: nextState.scales,
              prefix: nextState.prefix,
              useThemeBlock: nextState.useThemeBlock,
              currentIndex: newIndex,
              canUndo: true,
              canRedo: newIndex < history.length - 1
            });
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
        storage: createJSONStorage(() => new HashStorage()),
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
          const fullJson = decodeDecompressedToFullJsonString(decompressed);
          if (fullJson) {
            const newState = JSON.parse(fullJson) as AppState;
            // Update the store state directly without adding to history
            store._setHistoryIndex(0);
            store._addToHistory(newState);
          }
        }
      } catch (error) {
        console.error('Failed to parse hash change:', error);
      }
    }
  };

  window.addEventListener('hashchange', handleHashChange);
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