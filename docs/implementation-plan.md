# Implementation Plan — `insurance-ui` shared component system

For review **before any live change.** This covers the four things you asked to see:
repo structure, site-configuration structure, the deployment/CDN flow, and exactly what
gets added to each WordPress site — plus the rollback/versioning strategy and the
guarantees on modularity and site independence.

Nothing here has been applied to a live site. A working proof of concept is included
(`preview/index.html`) so you can see the pipeline before you approve it.

---

## 1. Repo structure

```
insurance-ui/                    ← the single source of truth (one GitHub repo)
├── CLAUDE.md                    ← the rules (one authoritative implementation, etc.)
├── README.md
├── package.json                 ← build script + esbuild (the only dev dependency)
├── build.mjs                    ← concat+minify CSS, bundle+minify JS, emit preview
│
├── src/                         ← AUTHORING. Shared components live here, once each.
│   ├── tokens/
│   │   ├── base.css             ← scale: spacing, type, radii, shadow, motion, 48px tap
│   │   └── semantic.css         ← aliases components use (--ips-primary, surfaces, ink…)
│   ├── core/
│   │   └── scope.css            ← .ips-* scoping + base type (nothing leaks into Kadence)
│   ├── components/              ← ONE file per component
│   │   ├── header.css           ├── bubble.css        (mobile bubble)
│   │   ├── footer.css           ├── quote-cta.css
│   │   └── button.css
│   ├── responsive/
│   │   └── breakpoints.css      ← shared mobile behavior (nav, bubble, stacking)
│   ├── js/
│   │   ├── site-config.js       ← reads data-ips-site + IPS_CONFIG, fills logo/phone/CTA
│   │   ├── header.js            ← sticky-shrink + mobile menu
│   │   ├── bubble.js            ← mobile bubble reveal/dismiss
│   │   └── index.js             ← entry point (bundled)
│   └── sites/                   ← per-site BRAND layer ONLY — never components
│       ├── tbi.css   ├── gli.css   ├── pwp.css   ├── lih.css
│
├── dist/                        ← BUILT output the sites load (generated; do not hand-edit)
│   ├── ips.min.css              (6.7 kb)
│   └── ips.min.js               (1.8 kb)
│
├── preview/
│   ├── _template.html           ← preview source
│   └── index.html               ← self-contained visual proof (generated)
└── docs/
    ├── implementation-plan.md   ← this file
    └── components/              ← one page per component (markup + variants + guardrails)
```

The rule that makes it work: **`src/components/` is identical for all four sites.
`src/sites/*.css` holds only the color ramp.** Everything else site-specific lives on
the site itself (section 2), never in this repo.

The POC ships five components — **header, mobile bubble, button, quote/CTA, footer** —
which together exercise the whole pipeline (shared CSS, shared JS, per-site config,
responsive behavior, and the build). The remaining components are added the same way.

---

## 2. Site-configuration structure

Each site is identified by **one attribute** and configured by **one small object**:

| Layer | Lives in | Controls | Example |
|-------|----------|----------|---------|
| `data-ips-site` | each site's WPCode snippet, on `<html>` | which brand ramp the shared CSS paints | `"tbi"` |
| `window.IPS_CONFIG` | each site's WPCode snippet | logo text, phone, CTA label, quote URL | see below |
| `src/sites/<site>.css` | this repo | the actual hex values for that ramp | `--ips-primary:#11324F` |

The colors are the only site value kept in the repo (they're design, not content/routing).
**Everything else — phone number, CTA wording, quote destination, CRM routing — lives on
the site**, so lead routing and content stay yours to change without touching the shared repo.

Config schema (what a site provides):

```js
window.IPS_CONFIG = {
  brand:    "The Burial Insurance",  // logo text (or omit and use an <img> logo)
  phone:    "1-800-000-0000",        // shown in header + derives a tel: link
  quoteUrl: "/quote/",               // where every shared CTA points on THIS site
  ctaLabel: "Get My Free Quote"      // button wording
};
```

Markup binds to it with data-attributes (already built into the components):
`data-ips-text="phone"` sets text; `data-ips-attr="href:quoteUrl"` sets a link. The shared
JS fills them in on load. Verified working in the POC: switching brand swaps ramp + logo +
CTA + phone with no code change.

---

## 3. Deployment / CDN flow

```
  edit src/component.css
        │
        ▼
  npm run build           →  dist/ips.min.css + dist/ips.min.js  (+ preview)
        │
        ▼
  git commit + tag  (e.g. v1.3.0)  →  git push
        │
        ▼
  jsDelivr serves the tag over CDN:
    https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.css
        │
        ▼
  purge.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/...   (refresh the CDN edge)
        │
        ▼
  ALL FOUR SITES — already linked to @1 — serve the new bundle. No per-site edits.
```

Sites reference the moving **`@production`** pointer, so the currently approved release reaches
all four after a cache purge — one action, no per-site edits. Full detail (deploy + rollback in
one place) is in `docs/versioning-and-deployment.md`. (If you'd rather not use jsDelivr, the same
two files can be hosted on one of your own domains behind a path you repoint — the flow is
identical; only the URL changes.)

---

## 4. Exactly what gets added to each WordPress site (one-time)

One **WPCode → Header** snippet per site. This is the entire footprint on the site.
It differs only in the `data-ips-site` value and the `IPS_CONFIG` values:

```html
<!-- insurance-ui — shared UI bundle. Set this site's identity + config, then load the bundle. -->
<script>
  document.documentElement.setAttribute("data-ips-site", "tbi");   /* tbi | gli | pwp | lih */
  window.IPS_CONFIG = {
    brand:    "The Burial Insurance",
    phone:    "1-800-000-0000",       /* ← your real number */
    quoteUrl: "/quote/",              /* ← this site's quote funnel */
    ctaLabel: "Get My Free Quote"
  };
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.css">
<script defer src="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.js"></script>
```

Per-site values to confirm before install (placeholders in the POC):

| Site | `data-ips-site` | phone | quoteUrl | ctaLabel |
|------|-----------------|-------|----------|----------|
| TheBurialInsurance.com | `tbi` | _confirm_ | _confirm_ | Get My Free Quote |
| GuaranteedLifeInsured.com | `gli` | _confirm_ | _confirm_ | Check My Eligibility |
| PlanWithPhil.com | `pwp` | _confirm_ | _confirm_ | Get My Quote |
| LifeInsuranceHIV.com | `lih` | _confirm_ | _confirm_ | See My Options |

Because a session can't reach wp-admin, **you or Cowork paste this once per site.** After
that, the site never needs editing to receive an update. The snippet is added *alongside*
each existing header — during Step A (lift-and-shift) the shared components reproduce each
site's current look, so adding it changes where the code lives, not how the page renders.

---

## 5. Rollback / versioning strategy

- **Semantic version tags.** Every release is a git tag: `v1.3.0` (feature), `v1.3.1` (fix).
  `CHANGELOG.md` records what changed.
- **Sites reference the moving `@production` pointer** — never a version number. The pointer
  lives in one place (a git branch), so one approved action fans out to all four.
- **Deploy (one action):** `npm run release v1.3.0` builds, tags, moves `production`, pushes,
  purges. All four update. Zero per-site edits.
- **Rollback (one action):** `npm run rollback v1.2.9` moves `production` back to a known-good
  tag, pushes, purges. All four revert within minutes. Zero per-site edits.
- **Preview before release.** `npm run build` regenerates `preview/index.html`; you eyeball
  the change across all four brands before it ever ships.
- **Break-glass (optional):** to freeze ONE site independently, point just that site's snippet
  at an exact tag (`@v1.2.9`) instead of `@production`. Opt-in, per site, rarely needed.

Full detail: `docs/versioning-and-deployment.md`.

You can always get back to a known-good state without breaking all four at once.

---

## 6. Modularity & site independence (your requirements #3 and #6)

**Modular:** one file per component in `src/components/`. "Update the mobile bubble across
all 4 sites" = edit `src/components/bubble.css`, `npm run build`, release, purge. One edit,
four sites, guaranteed identical — no switching between projects.

**Independent:** the shared bundle only ever styles `.ips-*` and only reads config the site
gives it. It never touches a site's content, pages, SEO, products, or quote logic. Each site
keeps full control because:
- brand, phone, CTA, and quote/CRM routing live in that site's own snippet, not the repo;
- a site can add its own CSS/snippets freely — nothing here overrides site scope;
- a site can pin to an older version, or remove the two lines entirely, and it simply stops
  receiving shared updates — no dependency lock-in.

Centralized where it helps (the shared look), isolated where it matters (each brand's
content and funnel).

---

## 7. What I need to proceed

1. **Your OK on this plan** (or edits).
2. **The GitHub owner/org name** to host `insurance-ui` under — it goes in the CDN URL.
3. **Confirm the per-site values** in the section 4 table (phone, quote URL) when convenient;
   not blocking — the repo works with placeholders until then.

On approval, Phase 1 is: create the repo, publish `v1` (these five components), and hand you
the one snippet for **one** site (LIH) to install and verify — before we extract the rest or
touch the other three. Still no changes to any live site until you approve that step.
