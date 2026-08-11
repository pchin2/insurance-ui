# Versioning & deployment — one pointer, all sites follow

The requirement: **one approved deployment → all four sites update automatically**, with the
ability to **instantly freeze/rollback to a known-good version without editing four WordPress
sites**. This is achieved with a single moving pointer.

## The model

```
   immutable releases (never change):   v1.0.0    v1.0.1    v1.1.0  ...
                                            \         |         /
                                             \        |        /
   moving pointer  ────────────────────────▶  production   (points at the approved release)
                                                   ▲
                                                   │  all four sites reference @production
                    ┌──────────────┬───────────────┼───────────────┬──────────────┐
                   TBI            GLI              LIH             PWP        (never edited)
```

- **`vX.Y.Z` tags** are immutable snapshots. Once cut, a tag's bytes never change, so jsDelivr
  can cache them permanently — fast and tamper-proof.
- **`production`** is a git branch used purely as a pointer. It always points at exactly one
  approved tag. Every site loads `…/insurance-ui@production/dist/…` and contains **no version
  number**.

## Normal deployment (all sites, one action)

```
npm run release v1.1.0
```
Builds → commits → tags `v1.1.0` → fast-forwards `production` to `v1.1.0` → pushes → purges the
CDN. Because every site reads `@production`, all four serve `v1.1.0` within minutes. No site is
touched.

## Rollback / freeze (all sites, one action)

```
npm run rollback v1.0.0
```
Moves `production` back to the known-good tag `v1.0.0`, pushes, purges. All four sites revert
within minutes. **No WordPress edits.** The bad release's tag still exists; nothing is lost — you
can roll forward again once fixed.

## Why not pin to `@1` or an exact version on each site?

- Pinning each site to `@v1.0.0` would force you to edit four snippets every deploy **and** every
  rollback — exactly what you don't want.
- `@production` moves the decision to one place (the branch pointer), so a single approved action
  fans out to all sites, in both directions.

## Emergency break-glass (optional, rarely needed)

If you ever need to freeze **one** site independently (e.g. quarantine LIH while you fix the
others), point just that site's snippet at an exact tag `@v1.0.0` instead of `@production`. It
then ignores production until you set it back. This is the *only* case that touches a site
snippet, and it's opt-in per site.

## Notes

- Propagation is "within minutes" because it depends on the CDN purge that the scripts run for
  you. Immutable tags are cached hard; the `@production` alias is purged on every deploy/rollback.
- Self-host alternative: if you prefer not to depend on jsDelivr, serve `dist/` from one of your
  domains behind a path you control (e.g. `/ips/production/…`) and repoint that path instead of the
  branch. The one-pointer principle is identical.
