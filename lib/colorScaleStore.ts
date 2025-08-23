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