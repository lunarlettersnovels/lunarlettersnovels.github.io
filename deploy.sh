#!/bin/bash
set -e

echo "🚀 Starting Local Build & Deploy..."

# 1. Build front-end assets (orangered Bootstrap via rspack) -> public/assets
echo "🎨 Building UI assets..."
npm run build

# 2. Build the Site (copies public/ -> docs/, renders templates)
./app.exe build

# 3. Ensure compiled assets (CSS/JS + Bootstrap Icons fonts) are in docs
echo "📦 Syncing assets..."
mkdir -p ./docs/assets
cp -r ./public/assets/. ./docs/assets/

# 4. Copy static pages into the output folder
echo "📄 Copying static pages..."
cp ./pages/*.html ./docs/

# 5. Localise images: copy public/img -> docs/img and rewrite novelupdates CDN URLs
bash ./rewrite-images.sh

# 6. Push to GitHub
echo "📂 Committing and Pushing..."
git add docs/
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M')"
git push origin main

echo "✅ Deployment Complete!"
