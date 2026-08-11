# insurance-ui

Single source of truth for the shared UI across four insurance sites:
**TheBurialInsurance.com (tbi)**, **GuaranteedLifeInsured.com (gli)**,
**PlanWithPhil.com (pwp)**, **LifeInsuranceHIV.com (lih)**.

Edit a shared component once → rebuild → all four sites update. Read `CLAUDE.md` for the rules.

## What's shared vs. per-site
- **Shared (`src/`)**: header/nav, footer, buttons, bubbles, forms, quote-CTA shell,
  typography, spacing, cards, responsive behavior, animations, content blocks.
- **Per-site (`src/sites/*.css` + each site's `IPS_CONFIG`)**: brand color ramp, logo,
  phone, CTA label, quote/CRM routing, copy, SEO. The amber CTA `#F0A01E` is universal.

## Build
```
npm install
npm run build     # -> dist/ips.min.css, dist/ips.min.js, preview/index.html
```

## How a site loads it (one-time, per site)
In the site's WPCode **Header** snippet — sites reference the moving `@production` pointer,
never a fixed version number:
```html
<script>
  document.documentElement.setAttribute("data-ips-site", "tbi"); /* tbi|gli|pwp|lih */
  window.IPS_CONFIG = {
    brand: "The Burial Insurance",
    phone: "1-800-000-0000",
    quoteUrl: "/quote/",
    ctaLabel: "Get My Free Quote"
  };
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.css">
<script defer src="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.js"></script>
```

## Versioning / rollback (the pointer lives in ONE place)
- Every release is an immutable git tag: `v1.0.0`, `v1.0.1`, …
- All sites reference a moving branch, **`@production`**, which points at the currently
  approved tag. Sites never contain a version number.
- **Deploy:** `npm run release v1.1.0` — builds, tags, moves `production` to the tag, pushes,
  purges the CDN. All four sites receive it. No per-site edits.
- **Rollback:** `npm run rollback v1.0.0` — moves `production` back to a known-good tag,
  pushes, purges. All four sites revert within minutes. No per-site edits.
See `docs/versioning-and-deployment.md` and `scripts/`.

## Layout
```
src/tokens/      scale (spacing, type, radii, motion) + semantic aliases
src/core/        .ips-* scoping + base type
src/components/  header, footer, button, bubble, quote-cta  (one file each)
src/responsive/  shared breakpoints
src/js/          site-config consumer + header/bubble behavior
src/sites/       per-site brand layer ONLY (color ramp)
dist/            built bundle the sites load (generated — do not edit)
preview/         self-contained visual proof (generated)
```
