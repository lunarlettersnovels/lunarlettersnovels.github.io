#!/bin/bash
set -e

echo "🚀 Starting Local Build & Deploy..."

# 1. Build the Site
./app.exe build

# 2. Copy static pages into the output folder
echo "📄 Copying static pages..."
cp ./pages/*.html ./docs/

# 3. Push to GitHub
echo "📂 Committing and Pushing..."
git add docs/
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M')"
git push origin main

echo "✅ Deployment Complete!"