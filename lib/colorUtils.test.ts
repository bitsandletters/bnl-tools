// ABOUTME: Tests for color utility functions
// ABOUTME: Validates color scale generation and CSS export functionality

import { describe, expect, test } from 'bun:test';
import { generateColorScale, exportAsCSSVariables, parseColor } from './colorUtils';

describe('Color Utilities', () => {
  describe('parseColor', () => {
    test('should parse hex colors', () => {
      const result = parseColor('#3b82f6');
      expect(result).toBeTruthy();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test('should parse rgb colors', () => {
      const result = parseColor('rgb(59, 130, 246)');
      expect(result).toBeTruthy();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test('should parse named colors', () => {
      const result = parseColor('blue');
      expect(result).toBeTruthy();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test('should return null for invalid colors', () => {
      const result = parseColor('not-a-color');
      expect(result).toBeNull();
    });
  });

  describe('generateColorScale', () => {
    test('should generate a complete color scale', () => {
      const scale = generateColorScale('#3b82f6', 'blue', 0, 0);
      
      expect(scale.name).toBe('blue');
      expect(scale.keyColor).toBe('#3b82f6');
      expect(scale.id).toMatch(/^scale-\d+$/);
      
      // Check all Tailwind shades are present
      const expectedShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
      expectedShades.forEach(shade => {
        expect(scale.shades[shade]).toBeDefined();
        expect(scale.shades[shade].hex).toMatch(/^#[0-9a-f]{6}$/i);
        expect(scale.shades[shade].rgb).toMatch(/^rgb\(/);
        expect(scale.shades[shade].hsl).toMatch(/^hsl\(/);
        expect(scale.shades[shade].luminance).toBeGreaterThanOrEqual(5);
        expect(scale.shades[shade].luminance).toBeLessThanOrEqual(95);
        expect(scale.shades[shade].contrastWhite).toBeDefined();
        expect(scale.shades[shade].contrastWhite.ratio).toBeGreaterThan(0);
        expect(scale.shades[shade].contrastBlack).toBeDefined();
        expect(scale.shades[shade].contrastBlack.ratio).toBeGreaterThan(0);
      });
    });

    test('should generate lighter shades with higher luminance', () => {
      const scale = generateColorScale('#3b82f6', 'blue');
      
      expect(scale.shades['50'].luminance).toBeGreaterThan(scale.shades['100'].luminance);
      expect(scale.shades['100'].luminance).toBeGreaterThan(scale.shades['200'].luminance);
      expect(scale.shades['200'].luminance).toBeGreaterThan(scale.shades['300'].luminance);
      expect(scale.shades['800'].luminance).toBeGreaterThan(scale.shades['900'].luminance);
      expect(scale.shades['900'].luminance).toBeGreaterThan(scale.shades['950'].luminance);
    });

    test('should handle different color formats', () => {
      const hexScale = generateColorScale('#ff0000', 'red-hex');
      const rgbScale = generateColorScale('rgb(255, 0, 0)', 'red-rgb');
      const namedScale = generateColorScale('red', 'red-named');
      
      expect(hexScale.shades['500']).toBeDefined();
      expect(rgbScale.shades['500']).toBeDefined();
      expect(namedScale.shades['500']).toBeDefined();
    });
  });

  describe('exportAsCSSVariables', () => {
    test('should export single scale as CSS variables', () => {
      const scale = generateColorScale('#3b82f6', 'primary');
      const css = exportAsCSSVariables([scale]);
      
      expect(css).toContain(':root {');
      expect(css).toContain('}');
      expect(css).toContain('--color-primary-50:');
      expect(css).toContain('--color-primary-500:');
      expect(css).toContain('--color-primary-950:');
    });

    test('should export multiple scales', () => {
      const scale1 = generateColorScale('#3b82f6', 'primary');
      const scale2 = generateColorScale('#ef4444', 'danger');
      const css = exportAsCSSVariables([scale1, scale2]);
      
      expect(css).toContain('--color-primary-500:');
      expect(css).toContain('--color-danger-500:');
    });

    test('should apply prefix when provided', () => {
      const scale = generateColorScale('#3b82f6', 'primary');
      const css = exportAsCSSVariables([scale], 'brand');
      
      expect(css).toContain('--color-brand-primary-50:');
      expect(css).toContain('--color-brand-primary-500:');
      expect(css).toContain('--color-brand-primary-950:');
    });

    test('should handle empty prefix correctly', () => {
      const scale = generateColorScale('#3b82f6', 'primary');
      const css = exportAsCSSVariables([scale], '');
      
      expect(css).toContain('--color-primary-50:');
      expect(css).not.toContain('--color--primary-50:');
    });
  });
});