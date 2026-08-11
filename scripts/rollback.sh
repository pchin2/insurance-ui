#!/usr/bin/env bash
# Instantly point ALL sites back to a known-good version. No per-site edits.
# Usage:  npm run rollback v1.0.0
set -euo pipefail

VERSION="${1:-}"
OWNER="${IPS_OWNER:-pchin2}"   # GitHub owner/org
REPO="insurance-ui"

if [ -z "$VERSION" ]; then echo "usage: npm run rollback vX.Y.Z (an existing good tag)"; exit 1; fi
if ! git rev-parse -q --verify "refs/tags/$VERSION" >/dev/null; then
  echo "✖ tag $VERSION does not exist. Available:"; git tag; exit 1
fi

echo "▶ moving production pointer -> $VERSION…"
git branch -f production "$VERSION"
git push -f origin production

echo "▶ purging CDN (@production)…"
curl -s "https://purge.jsdelivr.net/gh/${OWNER}/${REPO}@production/dist/ips.min.css" >/dev/null || true
curl -s "https://purge.jsdelivr.net/gh/${OWNER}/${REPO}@production/dist/ips.min.js"  >/dev/null || true

echo "✔ rolled back to $VERSION — all four sites revert within minutes. No WordPress edits."
