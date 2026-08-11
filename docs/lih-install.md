# Phase 1 install — LifeInsuranceHIV.com ONLY

This is the single WPCode snippet for LIH, a line-by-line explanation of what it does, and a
written confirmation that it does **not** touch your SEO, forms, tracking, CRM, or quote funnel.
Nothing here is installed until you say go. The other three sites get nothing in Phase 1.

`OWNER` in the URLs is filled in once you give me the GitHub account/org name.

---

## The snippet (WPCode → Header, LIH only)

```html
<!-- insurance-ui — shared UI bundle (LifeInsuranceHIV) -->
<script>
  document.documentElement.setAttribute("data-ips-site", "lih");
  window.IPS_CONFIG = {
    brand:    "Life Insurance & HIV",   /* ← confirm exact brand/logo text */
    phone:    "1-800-000-0000",         /* ← confirm real number */
    quoteUrl: "/quote/",                /* ← confirm this site's quote path */
    ctaLabel: "See My Options"
  };
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.css">
<script defer src="https://cdn.jsdelivr.net/gh/pchin2/insurance-ui@production/dist/ips.min.js"></script>
```

## What each line does

| Line | What it does | What it CANNOT do |
|------|--------------|-------------------|
| `setAttribute("data-ips-site","lih")` | Adds one attribute to `<html>` so the shared CSS knows which color ramp to use. | It sets an attribute; it changes no content, no other attributes, no existing markup. |
| `window.IPS_CONFIG = {…}` | Defines one namespaced global object the shared JS reads for logo/phone/CTA/quote link. | It's a plain data object under a unique name. It doesn't run, fetch, or hook anything. |
| `<link … ips.min.css>` | Loads the shared stylesheet. Its rules only match `.ips-*` classes and define `--ips-*` CSS variables. | It has **no** global/tag selectors (verified: 59/59 selectors scoped), so it cannot restyle your existing pages. |
| `<script defer … ips.min.js>` | After the page parses, wires behavior onto `.ips-*` elements only (sticky header, mobile bubble) and fills `IPS_CONFIG` values into `data-ips-*` placeholders. | It selects only `.ips-*` / `[data-ips-*]` nodes. If none exist on a page, it does nothing. |

## Isolation confirmation (your explicit checklist)

- **SEO / schema (RankMath):** the bundle injects **zero** `<meta>`, `<title>`, canonical, or
  JSON-LD. The FAQ component intentionally ships no `FAQPage` schema. RankMath remains the only
  source of schema. → *Untouched.*
- **Forms:** the JS never selects `form`, `input`, or `submit`, and adds no submit handlers.
  → *Untouched.*
- **Tracking (GA/GTM/Meta):** no analytics code, no `dataLayer`/`gtag`/`fbq` calls. It only
  defines `window.IPS` and `window.IPS_CONFIG` (unique names, no collision). → *Untouched.*
- **CRM integrations:** no network requests of any kind. The bundle is CSS + a few DOM listeners.
  → *Untouched.*
- **Quote funnel:** the shared CTA is a styled link whose `href` is your `quoteUrl`. It does not
  wrap, replace, intercept, or submit your quoter. Your funnel and CRM tags stay entirely yours.
  → *Untouched.*

**Key safety property:** on install, the bundle is **inert until you add `.ips-*` markup.**
Loading it sitewide only defines CSS variables and a data object — your current LIH pages render
exactly as they do now. Visible change happens only where you deliberately place an IPS component.

## Load / performance

- CSS ≈ 6.7 kb, JS ≈ 1.8 kb, both from a CDN; the JS is `defer` (non-blocking). No jQuery.
- Works with LiteSpeed caching (static assets are cacheable). If a Content-Security-Policy is set,
  allow `cdn.jsdelivr.net` for `style-src`/`script-src`.

## Phase 1 verification (what "looks and behaves correctly" means)

1. Add the snippet to LIH (Header). Load the site — confirm **nothing changed** (inert check).
2. On a **draft/hidden test page**, paste the test block below. Confirm:
   - it renders in LIH teal `#0D4C57`, amber CTA, correct logo/phone/CTA text;
   - the CTA link points at your `quoteUrl`;
   - on a phone width, the mobile bubble slides in and dismisses;
   - no browser console errors;
   - the rest of the page (header, quoter, forms) is unaffected.
3. Report back. Then we decide on the other three — and on extracting LIH's real header/footer
   via lift-and-shift.

### Safe test block (paste on a draft page)

```html
<div class="ips-scope">
  <div class="ips-quote-cta">
    <div class="ips-quote-cta__copy">
      <h3>See what you'd qualify for</h3>
      <p>No medical exam to get an estimate.</p>
    </div>
    <div class="ips-quote-cta__actions">
      <a class="ips-btn ips-btn--cta" data-ips-text="ctaLabel" data-ips-attr="href:quoteUrl" href="#">See My Options</a>
    </div>
  </div>
</div>
<a class="ips-bubble" data-ips-attr="href:quoteUrl" href="#">
  <span class="ips-bubble__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M21 11.5a8.4 8.4 0 0 1-11.3 7.9L3 21l1.6-6.7A8.4 8.4 0 1 1 21 11.5z"/></svg></span>
  <span class="ips-bubble__text">Questions? <small data-ips-text="ctaLabel">See My Options</small></span>
  <button class="ips-bubble__close" type="button" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
</a>
```
