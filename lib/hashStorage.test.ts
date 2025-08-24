import { describe, expect, test, beforeEach, vi, afterEach, beforeAll, afterAll } from 'vitest';
import type { AppState } from './types';
import LZString from 'lz-string';

import { compactAppState, expandAppState, HashStorage } from './hashStorage';

describe('HashStorage', () => {
  beforeEach(() => {
    window.history.replaceState = vi.fn();
    window.location.pathname = '/color-scales';
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should decode state from hash on getItem', async () => {
    window.location.hash = '#XTESTX';

    const decompressSpy = vi.spyOn(LZString, 'decompressFromEncodedURIComponent').mockReturnValue('{"v":2,"s":[]}');
    const storage = new HashStorage();
    const state = await storage.getItem('test');
    expect(state).toBeDefined();
    const parsed = JSON.parse(state!);
    expect(parsed.state).toEqual({ scales: [], prefix: '', useThemeBlock: false });
    expect(parsed.version).toBe(0);
    expect(decompressSpy).toHaveBeenCalledWith('XTESTX');
  });
  
  test('should encode state to hash on setItem', async () => {
    const compressSpy = vi.spyOn(LZString, 'compressToEncodedURIComponent').mockReturnValue('XTESTX');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    
    
    const storage = new HashStorage();
    const state: AppState = { scales: [], prefix: '', useThemeBlock: false };
    const persistData = { state, version: 0 };
    
    await storage.setItem('test', JSON.stringify(persistData));
    
    expect(compressSpy).toHaveBeenCalledWith('{"v":2,"s":[]}');
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/#XTESTX');
  });

  test('should remove hash on removeItem', async () => {
    const storage = new HashStorage();
    await storage.removeItem('test');
    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/');
  });
});

describe('compactAppState', () => {
  test('should compact state to v2 format', () => {
    const state: AppState = { scales: [], prefix: '', useThemeBlock: false };
    const compact = compactAppState(state);
    expect(compact).toEqual({ v: 2, s: [] });
  });
});

describe('expandAppState', () => {
  test('should expand v2 format to full state', () => {
    const compact = { v: 2, s: [] };
    const state = expandAppState(compact);
    expect(state).toEqual({ scales: [], prefix: '', useThemeBlock: false });
  });
});