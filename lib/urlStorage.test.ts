import { describe, it, expect, beforeEach, vi } from 'vitest';
import { urlStorage } from './urlStorage';
import { AppState } from './types';

function setLocation(href: string) {
  // @ts-expect-error allow override for tests
  delete window.location;
  // @ts-expect-error allow override for tests
  window.location = new URL(href) as unknown as Location;
}

function getHref() {
  return window.location.pathname + window.location.search + window.location.hash;
}

describe('urlStorage (query-string format)', () => {
  const basePath = 'http://localhost/color-scales';

  beforeEach(() => {
    // Reset location and history.replaceState spy
    setLocation(basePath);
    vi.spyOn(window.history, 'replaceState');
    (window.history.replaceState as unknown as vi.Mock).mockClear();
  });

  it('parses state from query string with s, prefix, and output', () => {
    setLocation(
      `${basePath}?s=primary:%233b82f6,h:10,c:-5&s=danger:%23ef4444&prefix=brand&output=tailwind`
    );

    const state = urlStorage.getState();

    expect(state.prefix).toBe('brand');
    expect(state.useThemeBlock).toBe(true); // tailwind => theme block
    expect(state.scales.length).toBe(2);
    expect(state.scales[0].name).toBe('primary');
    expect(state.scales[0].keyColor.toLowerCase()).toBe('#3b82f6');
    expect(state.scales[0].hueShift).toBe(10);
    expect(state.scales[0].chromaShift).toBe(-5);
    expect(state.scales[1].name).toBe('danger');
    expect(state.scales[1].keyColor.toLowerCase()).toBe('#ef4444');
  });

  it('respects useThemeBlock boolean alias if output missing', () => {
    setLocation(`${basePath}?s=primary:%233b82f6&useThemeBlock=1`);
    const state = urlStorage.getState();
    expect(state.useThemeBlock).toBe(true);
  });

  it('falls back to legacy hash compressed state when no query present', () => {
    // Compose a compressed hash of a simple state
    const state: AppState = {
      scales: [
        { id: 'x', name: 'primary', keyColor: '#3b82f6', hueShift: 0, chromaShift: 0 }
      ],
      prefix: 'brand',
      useThemeBlock: false,
    };
    // Import on-demand to access LZString without changing urlStorage export
    const { default: LZString } = require('lz-string');
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));

    setLocation(`${basePath}#${compressed}`);
    const loaded = urlStorage.getState();

    expect(loaded.scales.length).toBe(1);
    expect(loaded.prefix).toBe('brand');
    expect(loaded.useThemeBlock).toBe(false);
  });

  it('saveState writes query-string with s, prefix, and output', () => {
    const state: AppState = {
      scales: [
        { id: '1', name: 'primary', keyColor: '#3b82f6', hueShift: 0, chromaShift: 0 },
        { id: '2', name: 'danger', keyColor: '#ef4444', hueShift: 15, chromaShift: -10 },
      ],
      prefix: 'brand',
      useThemeBlock: true,
    };

    urlStorage.saveState(state);

    // Check that replaceState updated the URL with expected params
    expect(window.history.replaceState).toHaveBeenCalled();
    const href = getHref();
    expect(href).toContain('?');
    // Both s params exist
    expect(href).toMatch(/s=primary%3A%253b82f6/i); // name:color (color encoded)
    expect(href).toMatch(/s=danger%3A%2523ef4444/i);
    // prefix and output
    expect(href).toContain('prefix=brand');
    expect(href).toContain('output=tailwind');
  });

  it('clear removes query and hash', () => {
    setLocation(`${basePath}?s=primary:%233b82f6#legacy`);

    urlStorage.clear();

    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/color-scales');
  });

  it('hasData detects query-string state', () => {
    setLocation(`${basePath}?s=primary:%233b82f6`);
    expect(urlStorage.hasData()).toBe(true);
  });

  it('hasData detects legacy hash state', () => {
    setLocation(`${basePath}#abc`);
    expect(urlStorage.hasData()).toBe(true);
  });

  it('getShareableUrl returns current href', () => {
    setLocation(`${basePath}?prefix=brand`);
    expect(urlStorage.getShareableUrl()).toContain('/color-scales?prefix=brand');
  });
});