#!/bin/bash

# Setup script for local development environment variables
echo "Setting up environment variables for local development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Font Awesome Pro token for @awesome.me and @fortawesome packages
FONT_AWESOME_TOKEN=your_fontawesome_token_here

# GitHub personal access token for @bitsandletters private packages
# Requires 'read:packages' scope
GITHUB_ACCESS_TOKEN=your_github_token_here
EOF
    echo "Created .env file. Please update it with your actual tokens."
else
    echo ".env file already exists."
fi

# Check if .npmrc.local exists
if [ ! -f .npmrc.local ]; then
    echo "Creating .npmrc.local file..."
    cat > .npmrc.local << EOF
@awesome.me:registry=https://npm.fontawesome.com/
@fortawesome:registry=https://npm.fontawesome.com/
@bitsandletters:registry=https://npm.pkg.github.com/
//npm.fontawesome.com/:_authToken=your_fontawesome_token_here
//npm.pkg.github.com/:_authToken=your_github_token_here
EOF
    echo "Created .npmrc.local file. Please update it with your actual tokens."
else
    echo ".npmrc.local file already exists."
fi

echo ""
echo "Next steps:"
echo "1. Update .env with your actual tokens"
echo "2. Update .npmrc.local with your actual tokens"
echo "3. Run 'bun install' to install dependencies"
echo ""
echo "For Vercel deployment, set these environment variables in your Vercel dashboard:"
echo "- FONT_AWESOME_TOKEN"
echo "- GITHUB_ACCESS_TOKEN" 