#!/bin/bash
set -euo pipefail

# Rewrites novelupdates CDN image URLs in the generated site to local /img/ paths,
# and copies the local image assets into the output folder.
#
#   https://cdn.novelupdates.com/images/2021/02/Aphrodites-Choice.jpg
#        ->  /img/Aphrodites-Choice.jpg
#
# Usage: ./rewrite-images.sh [docs_dir] [img_src_dir]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="${1:-$SCRIPT_DIR/docs}"
IMG_SRC="${2:-$SCRIPT_DIR/public/img}"

# 1. Copy local images into the output folder (docs/img)
if [ -d "$IMG_SRC" ]; then
    echo "📁 Copying images: $IMG_SRC -> $DOCS_DIR/img"
    mkdir -p "$DOCS_DIR/img"
    cp -r "$IMG_SRC/." "$DOCS_DIR/img/"
else
    echo "⚠️  Image source folder not found: $IMG_SRC (skipping copy)"
fi

# 2. Rewrite every novelupdates CDN URL -> /img/<basename>.
#    The path prefix (up to the last '/') is discarded; only the filename is kept.
#    A single grep lists the (few) matching files so sed runs only where needed.
echo "🔗 Rewriting novelupdates CDN paths in HTML files under $DOCS_DIR ..."
changed=0
while IFS= read -r -d '' file; do
    sed -i -E "s#https?://cdn\.novelupdates\.com/[^\"'()[:space:]]*/([^\"'()/[:space:]]+)#/img/\1#g" "$file"
    changed=$((changed + 1))
done < <(grep -rlZ --include='*.html' -E 'cdn\.novelupdates\.com' "$DOCS_DIR" || true)

echo "✅ Done. Rewrote CDN paths in $changed HTML file(s)."
