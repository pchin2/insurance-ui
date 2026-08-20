// Shared Coverage Calculator engine — ONE engine, many question sets.
// The markup drives everything via data-attributes, so the same code powers the
// final-expense set (TBI) and the life-needs/DIME set (LIH/PWP). The CTA label +
// destination come from the per-site IPS_CONFIG (wired by site-config.js), so each
// site keeps its own copy and conversion path.
//
// Markup contract (all optional except a container):
//   <section class="ips-cc" data-ips-cc data-cc-base="10000"> ... </section>
//   Choice group:   <div data-cc-choice="svc"><button data-cc-v="9000" aria-pressed="true">…</button>…</div>
//   Multiplier grp: <div data-cc-mult="inc"><button data-cc-v="10" aria-pressed="true">…</button>…</div>
//   Slider (add):   <input type="range" data-cc-key="mort">
//   Slider (sub):   <input type="range" data-cc-key="save" data-cc-op="sub">
//   Live value out: <span data-cc-out="mort"></span>
//   Breakdown cell: <span data-cc-bd="mort"></span>   (use data-cc-bd="base" for the baseline)
//   Multiplier note:<span data-cc-note="inc"></span>  ("$60,000 × 10 yrs")
//   Total:          <span data-cc-total></span>       (repeat with data-cc-total in the breakdown)

function money(n) { return "$" + Math.round(n).toLocaleString(); }

function setupCalc(root) {
  const base = +(root.getAttribute("data-cc-base") || 0);
  const mults = {};        // key -> current multiplier (from a data-cc-mult group)
  const choices = {};      // key -> current chosen amount (from a data-cc-choice group)

  root.querySelectorAll("[data-cc-mult]").forEach((group) => {
    const key = group.getAttribute("data-cc-mult");
    const btns = [...group.querySelectorAll("button")];
    const sel = group.querySelector('button[aria-pressed="true"]') || btns[0];
    mults[key] = sel ? +sel.getAttribute("data-cc-v") : 1;
    group.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      btns.forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      mults[key] = +b.getAttribute("data-cc-v"); recalc();
    });
  });

  root.querySelectorAll("[data-cc-choice]").forEach((group) => {
    const key = group.getAttribute("data-cc-choice");
    const btns = [...group.querySelectorAll("button")];
    const sel = group.querySelector('button[aria-pressed="true"]') || btns[0];
    choices[key] = sel ? +sel.getAttribute("data-cc-v") : 0;
    group.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      btns.forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      choices[key] = +b.getAttribute("data-cc-v"); recalc();
    });
  });

  const sliders = [...root.querySelectorAll('input[type="range"][data-cc-key]')];
  sliders.forEach((s) => s.addEventListener("input", recalc));

  function recalc() {
    const parts = {}; // key -> signed dollar amount for the breakdown
    if (base) parts.base = base;

    Object.keys(choices).forEach((k) => { parts[k] = choices[k] * (mults[k] || 1); });

    sliders.forEach((s) => {
      const k = s.getAttribute("data-cc-key");
      const sub = s.getAttribute("data-cc-op") === "sub";
      const raw = +s.value;
      const v = raw * (mults[k] || 1);
      const out = root.querySelector('[data-cc-out="' + k + '"]');
      if (out) out.textContent = money(raw);
      parts[k] = sub ? -v : v;
    });

    let total = 0;
    Object.keys(parts).forEach((k) => { total += parts[k]; });
    total = Math.max(0, total);

    Object.keys(parts).forEach((k) => {
      const bd = root.querySelector('[data-cc-bd="' + k + '"]');
      if (bd) { const v = parts[k]; bd.textContent = (v < 0 ? "− " : "") + money(Math.abs(v)); }
    });

    root.querySelectorAll("[data-cc-note]").forEach((n) => {
      const key = n.getAttribute("data-cc-note");
      const s = root.querySelector('input[data-cc-key="' + key + '"]');
      if (s && mults[key]) n.textContent = "(" + money(+s.value) + " × " + mults[key] + " yrs)";
    });

    root.querySelectorAll("[data-cc-total]").forEach((t) => { t.textContent = money(total); });
  }

  recalc();
}

export function initCoverageCalc() {
  document.querySelectorAll("[data-ips-cc]").forEach(setupCalc);
}
