// ABOUTME: Local storage utilities for persisting color scales and settings
// ABOUTME: Provides type-safe access to localStorage with automatic JSON serialization

import { ColorScale } from './colorUtils';

const STORAGE_KEYS = {
  SCALES: 'color-tool-scales',
  SETTINGS: 'color-tool-settings',
} as const;

export interface Settings {
  prefix: string;
  useThemeBlock: boolean;
}

export const storage = {
  getScales(): ColorScale[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCALES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load scales from storage:', error);
      return [];
    }
  },

  saveScales(scales: ColorScale[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.SCALES, JSON.stringify(scales));
    } catch (error) {
      console.error('Failed to save scales to storage:', error);
    }
  },

  getSettings(): Settings {
    if (typeof window === 'undefined') {
      return { prefix: '', useThemeBlock: false };
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : { prefix: '', useThemeBlock: false };
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
      return { prefix: '', useThemeBlock: false };
    }
  },

  saveSettings(settings: Settings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.SCALES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};