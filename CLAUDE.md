# Insurance UI — Shared Component System

Single source of truth for shared UI across Phillip Chin's four insurance sites.
All four run WordPress (Kadence + WPCode + RankMath) and load **one** hosted bundle
(`dist/ips.min.css` + `dist/ips.min.js`) served from this repo. Change a shared
component here once, and every site updates.

## The four sites

| Site | Focus | `data-ips-site` | Primary ramp |
|------|-------|-----------------|--------------|
| TheBurialInsurance.com (TBI) | Final expense / burial | `tbi` | Navy `#11324F` — **canonical design foundation** |
| GuaranteedLifeInsured.com (GLI) | Guaranteed-issue life | `gli` | Evergreen `#124C3A` |
| PlanWithPhil.com (PWP) | Life & disability brokerage | `pwp` | Charcoal-graphite `#262D34` |
| LifeInsuranceHIV.com (LIH) | Niche life insurance | `lih` | Deep teal `#0D4C57` |

They are four independent brands, businesses, and content libraries that share a
common visual and structural system. This repo owns the *shared* part only.

## THE RULE (non-negotiable)

**Shared components have exactly ONE authoritative implementation — here, in `src/`.
Do not independently recreate a shared component inside an individual site.**

If a site genuinely needs to differ, it does so through the per-site brand layer
(`sites/<site>.css`, driven by `data-ips-site`) or a documented, reviewed
site-level override — never by forking the component into that site's WPCode.

When asked to *"update &lt;component&gt; across all 4 sites"*: edit the ONE file in
`src/`, rebuild `dist/`, cut a release, purge the CDN. All four update. Never edit
four copies.

## Shared vs. site-specific

**SHARED (belongs in `src/`):** header/nav + sticky-shrink, footer, buttons
(including the universal amber CTA `#F0A01E`), typography scale, spacing scale,
cards, bubbles (including the mobile bubble), forms, quote-CTA band styling,
mobile/responsive breakpoints, animations, and the common content blocks
(Quick Answer, Key Takeaways, Qualification Meter, Pros/Cons, FAQ accordion,
Bottom Line, tables, chips, TOC/byline styling).

**SITE-SPECIFIC (stays OUT of `src/`):** brand color ramp, logo, copy/content,
products/carriers, SEO + schema + RankMath config, site-only pages, and the
quote-engine logic + CRM lead routing (the CTA *shell* is shared; the *destination*
and lead tags are per-site).

## Theming

- Set the theme with `data-ips-site` on `<html>`, **not** `<body>`. On `<body>`
  the semantic aliases keep resolving against `:root` and dark panels stay navy.
- The amber action color `#F0A01E` is **universal** across all four sites. Only
  the primary ramp differs per site.
- All shared CSS is scoped to `.ips-*` so nothing leaks into Kadence.

## Hard guardrails (things that break if ignored)

- **RankMath owns FAQ schema.** The FAQ accordion ships ZERO JSON-LD on purpose.
  Never hand-write a second `FAQPage`.
- **Don't duplicate auto-injected modules.** Hero, TOC, breadcrumbs, byline,
  compare module, and top/bottom CTA bands are auto-injected per site. Shared
  components must not re-render them; the in-body Quote CTA is **mid-article only**.
- **TBI:** never apply the `.bi-cta` class to a CTA — a site snippet strips it at render.
- **No emoji anywhere.** Use inline SVG icons (`currentColor`).
- **Audience is adults 55–85:** minimum 48px touch targets; body 18–19px / 1.7
  line-height / ~66ch measure; status is never conveyed by color alone (always
  color + icon + text label).

## No unreviewed visual change

Bringing existing styles into this system must **preserve each site's current
appearance**. Lift the current styles in first (keeping per-site overrides where
sites already differ), verify pixel-parity on the live render, and only then
converge any drifted sites — with explicit sign-off. A refactor must never
silently restyle a live site.

## Install (one-time, per site)

Each site loads the bundle via a single WPCode **Header** snippet that sets its
`data-ips-site` flag, defines `window.IPS_CONFIG` (brand, phone, quoteUrl,
ctaLabel — all per-site), and loads the bundle from a **version-pinned** URL:
`…@production/dist/ips.min.css?v=X.Y.Z` (and `…ips.min.js?v=X.Y.Z`). Claude cannot
reach wp-admin from a session, so Phillip or the Cowork team installs that one
snippet per site. New content flows from `@production` automatically; the `?v=`
query is what makes browsers pick up a new release immediately — see
**Bundle versioning & cache-busting** below.

## Bundle versioning & cache-busting (`?v=`)

jsDelivr serves the `@production` bundle with a **7-day browser cache**
(`Cache-Control: max-age=604800`). Pushing to `production` refreshes the CDN for
**new** visitors within minutes, but a returning visitor keeps their cached copy
for up to 7 days — so a component that relies on a **newly added** shared rule can
render stale/broken for that cohort until their browser cache expires.

The fix: each site's header snippet loads the bundle with a `?v=X.Y.Z` query
matching the current release. A new `?v=` is a new URL, so every browser —
including returning visitors — refetches immediately. Content still lives in one
place (`@production`); the `?v=` is a per-release cache-busting nudge.

**A release is therefore two moves, not one:**

1. **Ship the bundle** — edit `src/`, `npm run build`, commit, tag `vX.Y.Z`, push,
   move `production` to the tag, purge the jsDelivr CDN.
2. **Bump the cache-buster** — change `?v=` to the new version in **each site's
   header snippet** that must reflect the change immediately. One-number edit per
   site, done in wp-admin.

**Current per-site state:**

- **LIH** — header snippet pinned to `?v=1.0.1` (consumes the shared
  `.ips-footer--light`). Bump this on every release LIH must reflect.
- **TBI / GLI / PWP** — still load the unversioned `@production` URL. Fine for
  now: none of them consumes a newly added shared component yet, so there is
  nothing stale to bust. When a site starts consuming shared updates, add the
  same `?v=` to its header snippet at that point.

## Editing workflow for Claude

1. The change lives in `src/` only — one file.
2. `npm run build` regenerates `dist/ips.min.css` + `dist/ips.min.js`.
3. Commit, tag a release (`vX.Y.Z`), push, move `production` to the tag, purge the
   jsDelivr CDN cache.
4. Bump `?v=X.Y.Z` in each affected site's header snippet so returning visitors
   refetch immediately — see **Bundle versioning & cache-busting**.
5. Verify on the **live render** of each affected site (mobile + desktop) before
   calling it done.
