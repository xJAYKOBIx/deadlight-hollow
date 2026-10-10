#!/bin/sh
# Copies the Master Creator's assets into the game (dist/mc/assets) and records which version they came from.
# Usage: tools/sync-master-creator.sh /path/to/master-creator
# The game's own art files re-export from dist/mc, so this copy is the single source of the shared art.
set -e
MC=${1:?path to a master-creator checkout}
HERE=$(cd "$(dirname "$0")/.." && pwd)
rm -rf "$HERE/dist/mc"
mkdir -p "$HERE/dist/mc"
cp -R "$MC/assets" "$HERE/dist/mc/assets"
rm -f "$HERE/dist/mc/assets/catalog.js"
REV=$(git -C "$MC" rev-parse --short HEAD 2>/dev/null || echo unknown)
VER=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' "$MC/package.json")
printf 'Master Creator %s (%s)\nCopied by tools/sync-master-creator.sh. Change art in the master-creator repo, then run the script again.\n' "$VER" "$REV" > "$HERE/dist/mc/VERSION"
cat "$HERE/dist/mc/VERSION"
