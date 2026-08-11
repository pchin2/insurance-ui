// Header behavior: sticky-shrink on scroll + mobile menu toggle. Shared by all sites.
export function initHeader() {
  const header = document.querySelector(".ips-header");
  if (!header) return;

  const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = header.querySelector(".ips-header__toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
}
