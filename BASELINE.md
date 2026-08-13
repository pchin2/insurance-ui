# Baseline — verified live state

**As of:** 2026-08-11 · **Bundle version:** `v1.0.0` · **Status:** live and verified on all four sites.

This file records the exact, verified production state of the shared component system so we
have a known-good reference point before Step B (component convergence). Nothing here should
be changed casually — it's the baseline we roll back *to*.

## Production version & distribution

- **Source of truth:** `github.com/pchin2/insurance-ui` (public)
- **Released tag:** `v1.0.0` (commit `ef36fd0`) — the five Phase-1 components (header, footer,
  button, bubble, quote-cta) plus tokens and per-site brand layer.
- **Moving pointer:** the `production` branch points at `v1.0.0`. All four sites load `@production`.
- **CDN URLs every site loads:**
  - `https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.css`
  - `https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.js`
- **Universal action color:** amber `#F0A01E` (identical on all four sites).

## Per-site verified state

| Site | `data-ips-site` | Brand (config) | Phone | Quote path | Primary ramp (resolved live) | WPCode snippet ID |
|------|-----------------|----------------|-------|------------|------------------------------|-------------------|
| TheBurialInsurance.com | `tbi` | TheBurialInsurance.com | (866) 255-5775 | `/quote/` | navy `#11324F` | 3179 |
| GuaranteedLifeInsured.com | `gli` | GuaranteedLifeInsured.com | (215) 999-3168 | `/request-a-quote/` | evergreen `#124C3A` | 1119 |
| PlanWithPhil.com (`www.`) | `pwp` | PlanWithPhil.com | (646) 866-6990 | `/quote/` | charcoal `#262D34` | 501953 |
| LifeInsuranceHIV.com | `lih` | LifeInsuranceHIV.com | (866) 255-5775 | `/request-a-quote/` | teal `#0D4C57` | (added manually; ID not recorded) |

CTA labels in config: TBI "Get My Free Quote", GLI "Get a Quote", PWP "Get a Free Quote",
LIH "Get my free quote". Each value was read from that site's own live homepage — not copied.

## What "verified" means (checks run live via the browser on each homepage)

1. `document.documentElement[data-ips-site]` equals the site's key.
2. `window.IPS` is present (shared JS booted).
3. The `@production` **CSS and JS** are both loaded on the page.
4. `--ips-primary` resolves to the site's ramp; `--ips-cta` resolves to `#F0A01E`.
5. `window.IPS_CONFIG` holds the correct brand / phone / quoteUrl / ctaLabel.
6. Homepage renders unchanged (bundle is **inert** — no `.ips-*` components placed yet).

## WPCode integration (how each site loads the bundle)

Each site has ONE snippet: **WPCode → Code Snippets → "insurance-ui shared bundle (SITE)"**
- Type: **HTML Snippet** · Insert Method: **Auto Insert** · Location: **Site Wide Header** · Status: **Active**
- Snippet body (values differ per site — see table):

```html
<script>
  document.documentElement.setAttribute("data-ips-site", "SITE");   /* tbi | gli | pwp | lih */
  window.IPS_CONFIG = { brand: "…", phone: "…", quoteUrl: "…", ctaLabel: "…" };
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.css">
<script defer src="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.js"></script>
```

This is the **only** footprint on each site. Site-specific content, SEO, products, quote
funnel, and CRM routing are untouched and remain per-site.

**Caching:** installs were verified while logged in (bypasses page cache). To push the bundle
to already-cached anonymous pages immediately, run each site's **Purge All**; otherwise it
propagates as caches refresh, and any future release purges the CDN as part of the workflow.

## Rollback / recovery procedures

Ranked from least to most drastic — the first two need **no wp-admin**:

1. **Roll the whole system back a version (all four sites at once):**
   `npm run rollback v1.0.0` (or any earlier known-good tag). Moves `production` to that tag,
   pushes, purges the CDN. All four revert within minutes. No per-site edits.
2. **Freeze ONE site to an exact version (break-glass):** in that site's WPCode snippet,
   change `@production` → `@v1.0.0` in both URLs. That site pins to the exact bytes and ignores
   future `production` moves until you set it back.
3. **Disable the shared system on ONE site:** toggle that site's "insurance-ui shared bundle"
   snippet to **Inactive** in WPCode (IDs above). The site immediately stops loading the bundle.
4. **Full uninstall:** deactivate/delete the snippet on each of the four sites.

Because `v1.0.0` is an immutable tag, step 1 always has a known-good target to return to.

## Not done yet (Step B — a separate, reviewed change)

The bundle is **live but dormant**: it loads on every page but renders nothing, because no
page contains `.ips-*` markup yet. Step B begins rendering shared components (starting from the
canonical TBI header/footer), replacing each site's current markup with the shared components —
done per-component, per-site, with pixel-parity review before anything goes live. Until Step B,
every site looks exactly as it did before this baseline.
