# Color Scale Generator

A modern web application for generating Tailwind-compatible color scales using the Okhsl color space. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Color Scale Generation**: Create beautiful color palettes from a single key color
- **Okhsl Color Space**: Uses perceptually uniform color space for better color relationships
- **Tailwind Integration**: Export CSS variables compatible with Tailwind CSS v4
- **URL-based Persistence**: Share your color scales via URL - no server required
- **Real-time Preview**: See your color scales update as you adjust parameters
- **WCAG Contrast**: Built-in accessibility checking with WCAG and APCA contrast ratios
- **Undo/Redo**: Full history support for all changes

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4.1.x](https://tailwindcss.com/)
- **Color Processing**: [colorjs.io](https://colorjs.io/) for Okhsl color space
- **Compression**: [LZString](https://github.com/pieroxy/lz-string/) for URL storage
- **Icons**: [Font Awesome Pro 7](https://fontawesome.com/) for professional icons

## Getting Started

1. **Set up Font Awesome Pro authentication**:
   ```bash
   # Run the setup script
   ./scripts/setup-env.sh
   
   # Update .npmrc.local with your Font Awesome Pro token
   # Get your token from: https://fontawesome.com/account
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the development server**:
   ```bash
   bun dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Add Color Scales**: Click "Add Color Scale" to create a new palette
2. **Customize Colors**: Adjust the key color, hue shift, and chroma shift
3. **Export CSS**: Copy the generated CSS variables for use in your projects
4. **Share**: Use the "Share URL" button to copy a link with your color scales

## URL-based Storage

This app uses URL-based persistence with LZString compression, similar to [pocketcal](https://github.com/cassidoo/pocketcal). Your color scales are automatically saved to the URL hash, making them:

- **Shareable**: Send the URL to others to share your color scales
- **Bookmarkable**: Save your work as browser bookmarks
- **Serverless**: No backend required for data persistence
- **Portable**: Works across devices and browsers

## Color Science

The app uses the Okhsl color space for perceptually uniform color adjustments:

- **Hue**: Color wheel position (0-360°)
- **Chroma**: Colorfulness/saturation (0-1)
- **Lightness**: Perceptual brightness (0-1)

Color scales are generated using Matt Strom's approach from [Generating Color Palettes](https://matthewstrom.com/writing/generating-color-palettes/).

## Development

```bash
# Setup environment variables (first time only)
./scripts/setup-env.sh

# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

## Deployment

### Vercel Setup

For deployment to Vercel (or other platforms), private package authentication is handled automatically:

1. **The `.npmrc` file** is committed to git and uses environment variables
2. **Set environment variables** in Vercel dashboard:
   - Name: `FONT_AWESOME_TOKEN`
     - Value: Your Font Awesome Pro token
   - Name: `GITHUB_ACCESS_TOKEN`
     - Value: Your GitHub personal access token with `read:packages` scope for @bitsandletters namespace
3. **Build process** will automatically authenticate and download private packages

### Local Development

For local development, use `.npmrc.local` (not committed to git) with your actual tokens:

```bash
# .npmrc.local (local only)
@awesome.me:registry=https://npm.fontawesome.com/
@fortawesome:registry=https://npm.fontawesome.com/
@bitsandletters:registry=https://npm.pkg.github.com/
//npm.fontawesome.com/:_authToken=YOUR_FONTAWESOME_TOKEN_HERE
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN_HERE
```

## Brand Fonts

This project uses commercial brand fonts from a private NPM package:

- **Package**: `@bitsandletters/brand-fonts` (private)
- **Fonts**: GT Standard, GT Standard Mono, Stringer
- **Import**: `@import '@bitsandletters/brand-fonts/fonts.css';`

### Open Source Considerations

The main codebase can be open-sourced, but the brand fonts package remains private due to commercial licensing. To make this project open-source ready:

1. **Remove the brand fonts import** from `app/globals.css`
2. **Replace with system fonts** or open-source alternatives
3. **Update documentation** to explain font setup requirements

## Project Structure

```
color-tool/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and storage
│   ├── colorUtils.ts   # Color processing logic
│   ├── urlStorage.ts   # URL-based persistence
│   └── localStorage.ts # Legacy localStorage (for migration)
└── public/             # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
