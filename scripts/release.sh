#!/usr/bin/env bash
# Deploy a new shared release to ALL sites at once.
# Usage:  npm run release v1.1.0
set -euo pipefail

VERSION="${1:-}"
OWNER="${IPS_OWNER:-pchin2}"   # GitHub owner/org
REPO="insurance-ui"

if [ -z "$VERSION" ]; then echo "usage: npm run release vX.Y.Z"; exit 1; fi

echo "▶ building…"
npm run build --silent

echo "▶ committing + tagging $VERSION…"
git add -A
git commit -m "release $VERSION" || echo "  (nothing to commit)"
git tag -a "$VERSION" -m "release $VERSION"

echo "▶ moving production pointer -> $VERSION…"
git branch -f production "$VERSION"

echo "▶ pushing…"
git push origin main "$VERSION"
git push -f origin production

echo "▶ purging CDN (@production)…"
curl -s "https://purge.jsdelivr.net/gh/${OWNER}/${REPO}@production/dist/ips.min.css" >/dev/null || true
curl -s "https://purge.jsdelivr.net/gh/${OWNER}/${REPO}@production/dist/ips.min.js"  >/dev/null || true

echo "✔ released $VERSION — all sites on @production now serve it (allow a few minutes for edges)."
