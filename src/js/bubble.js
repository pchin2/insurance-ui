// Mobile bubble behavior: slide in shortly after load, dismissible. Shared by all sites.
export function initBubble() {
  const bubble = document.querySelector(".ips-bubble");
  if (!bubble) return;

  const reveal = () => bubble.classList.add("is-visible");
  window.setTimeout(reveal, 600);

  const close = bubble.querySelector(".ips-bubble__close");
  if (close) {
    close.addEventListener("click", (e) => {
      e.preventDefault();
      bubble.classList.remove("is-visible");
    });
  }
}
