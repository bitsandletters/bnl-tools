# Future Tools Roadmap

This document outlines potential future tools for the Bits&Letters design system toolkit. These tools are not currently implemented but represent areas for future development. I had Claude generate this file and I may not agree with all of it... that said, if any of this sounds useful, email <david@bitsandletters.com> or open a discussion on this repo. 😉

## Possible Tools

### 1. Modular Scale Generator
**Purpose:** Generate typography and spacing scales using modular ratios like the golden ratio, perfect fourth, and more.

**Features to consider:**
- Multiple ratio presets (golden ratio, perfect fourth, perfect fifth, etc.)
- Custom ratio input
- Base value configuration
- Scale visualization
- Export to CSS custom properties
- Export to Tailwind config
- Preview with real text

### 2. Typography Scale Generator
**Purpose:** Generate consistent font sizes, line heights, and letter spacing for design systems.

**Features to consider:**
- Type scale generation (major third, perfect fourth, etc.)
- Line height optimization
- Letter spacing scales
- Font pairing suggestions
- Responsive typography scales
- Fluid typography calculations
- Export to various formats (CSS, Tailwind, Sass)

### 3. Spacing Scale Generator
**Purpose:** Generate consistent spacing scales for margins, padding, gaps, and layout spacing.

**Features to consider:**
- Multiple scale types (linear, exponential, custom)
- Base unit configuration
- Visual preview grid
- Export to design tokens
- Integration with modular scale
- Responsive spacing systems
- Export to CSS custom properties and Tailwind

## Current Status

As of now, only the **Color Scales Generator** is fully implemented and functional. It provides:
- Tailwind-compatible color scale generation
- Okhsl color space for perceptually uniform scales
- Import/export functionality
- Visual preview and accessibility indicators
- Undo/redo support

## Implementation Priority

Based on user needs and design system requirements, the suggested implementation order would be:
1. Modular Scale Generator - Foundational for both typography and spacing
2. Typography Scale Generator - Critical for consistent text hierarchy
3. Spacing Scale Generator - Essential for layout consistency

## Technical Considerations

- All tools should maintain consistent UI/UX patterns
- Export formats should be compatible with popular frameworks (Tailwind, CSS-in-JS, Sass)
- Tools should support URL-based sharing for collaboration
- Consider implementing a unified export system across all tools
- Maintain accessibility standards across all generated outputs