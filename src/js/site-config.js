// Site configuration consumer.
// Each SITE supplies its own values via window.IPS_CONFIG in its WPCode snippet
// (phone, quote URL, CTA label, logo). That keeps site-specific content + lead
// routing ON the site, not in the shared repo. These defaults are fallbacks only.
const DEFAULTS = {
  tbi: { brand: "The Burial Insurance", quoteUrl: "/quote/", ctaLabel: "Get My Free Quote" },
  gli: { brand: "Guaranteed Life Insured", quoteUrl: "/quote/", ctaLabel: "Check My Eligibility" },
  pwp: { brand: "Plan With Phil", quoteUrl: "/quote/", ctaLabel: "Get My Quote" },
  lih: { brand: "Life Insurance & HIV", quoteUrl: "/quote/", ctaLabel: "See My Options" },
};

export function resolveConfig() {
  const site = document.documentElement.getAttribute("data-ips-site") || "tbi";
  const provided = window.IPS_CONFIG || {};
  const cfg = Object.assign({ site }, DEFAULTS[site] || {}, provided);
  // Derive tel: href from a phone number if one was supplied.
  if (cfg.phone && !cfg.phoneHref) cfg.phoneHref = "tel:" + String(cfg.phone).replace(/[^0-9+]/g, "");
  return cfg;
}

// Wire config into markup:
//   [data-ips-text="phone"]           -> element text set to cfg.phone
//   [data-ips-attr="href:quoteUrl"]   -> element href set to cfg.quoteUrl
export function applyConfig(cfg) {
  document.querySelectorAll("[data-ips-text]").forEach((el) => {
    const key = el.getAttribute("data-ips-text");
    if (cfg[key] != null) el.textContent = cfg[key];
  });
  document.querySelectorAll("[data-ips-attr]").forEach((el) => {
    el.getAttribute("data-ips-attr").split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s && s.trim());
      if (attr && key && cfg[key] != null) el.setAttribute(attr, cfg[key]);
    });
  });
}
