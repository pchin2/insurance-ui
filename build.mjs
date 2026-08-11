// Build: concatenate + minify the shared CSS, bundle + minify the shared JS,
// and emit a self-contained preview page. One command -> the files every site loads.
import { build, transform } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const CSS_ORDER = [
  "src/tokens/base.css",
  "src/tokens/semantic.css",
  "src/core/scope.css",
  "src/components/button.css",
  "src/components/header.css",
  "src/components/footer.css",
  "src/components/bubble.css",
  "src/components/quote-cta.css",
  "src/responsive/breakpoints.css",
  // Per-site brand layer LAST so it overrides the shared defaults:
  "src/sites/tbi.css",
  "src/sites/gli.css",
  "src/sites/pwp.css",
  "src/sites/lih.css",
];

const VERSION = JSON.parse(await readFile("package.json", "utf8")).version;
await mkdir("dist", { recursive: true });

// ---- CSS ----
let cssRaw = `/*! insurance-ui v${VERSION} | shared UI bundle | do not edit dist directly */\n`;
for (const f of CSS_ORDER) cssRaw += `\n/* ${f} */\n` + (await readFile(f, "utf8"));
const css = (await transform(cssRaw, { loader: "css", minify: true })).code;
await writeFile("dist/ips.min.css", css);

// ---- JS ----
const jsOut = await build({
  entryPoints: ["src/js/index.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2018"],
  write: false,
  banner: { js: `/*! insurance-ui v${VERSION} */` },
});
const js = jsOut.outputFiles[0].text;
await writeFile("dist/ips.min.js", js);

// ---- Self-contained preview (inlines the built bundle) ----
let tpl = await readFile("preview/_template.html", "utf8");
tpl = tpl.replace("/*{{CSS}}*/", css).replace("//{{JS}}", js);
await writeFile("preview/index.html", tpl);

console.log(`built  css=${(css.length / 1024).toFixed(1)}kb  js=${(js.length / 1024).toFixed(1)}kb  v${VERSION}`);
