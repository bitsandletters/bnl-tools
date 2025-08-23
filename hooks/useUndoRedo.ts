// ABOUTME: Custom hook for managing undo/redo functionality with keyboard shortcuts
// ABOUTME: Provides a complete history stack for any state changes

import { useState, useCallback, useEffect } from 'react';

interface UseUndoRedoOptions {
  maxHistorySize?: number;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
) {
  const { maxHistorySize = 50 } = options;
  
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(prev => {
      const actualNewState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev[currentIndex])
        : newState;
      
      // Remove any future history when setting a new state
      const newHistory = [...prev.slice(0, currentIndex + 1), actualNewState];
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, maxHistorySize]);
  
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canUndo]);
  
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canRedo]);
  
  const reset = useCallback(() => {
    setHistory([initialState]);
    setCurrentIndex(0);
  }, [initialState]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (modifier && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
  
  return {
    state: history[currentIndex] || initialState,
    setState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historySize: history.length,
    currentIndex,
  };
}