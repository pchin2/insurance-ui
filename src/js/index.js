// Shared JS entry point — bundled to dist/ips.min.js.
import { resolveConfig, applyConfig } from "./site-config.js";
import { initHeader } from "./header.js";
import { initBubble } from "./bubble.js";
import { initCoverageCalc } from "./coverage-calc.js";

function boot() {
  const cfg = resolveConfig();
  applyConfig(cfg);
  initHeader();
  initBubble();
  initCoverageCalc();
  // Small public API (also lets the preview re-render when switching brands).
  window.IPS = {
    version: "0.1.0",
    config: cfg,
    resolveConfig,
    applyConfig,
    reload() {
      const next = resolveConfig();
      this.config = next;
      applyConfig(next);
    },
  };
}

if (document.readyState !== "loading") boot();
else document.addEventListener("DOMContentLoaded", boot);
