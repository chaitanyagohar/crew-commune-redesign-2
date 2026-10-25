// Gallery: category filters and an accessible lightbox with swipe support.
import { ScrollTrigger } from "./util";
import { attachVideo, settleImages } from "./media";

const tiles = Array.from(document.querySelectorAll<HTMLButtonElement>(".tile"));
const filters = Array.from(document.querySelectorAll<HTMLButtonElement>(".filter"));
const lb = document.getElementById("lb");
const stage = document.getElementById("lbStage");
const count = document.getElementById("lbCount");
const capEl = document.getElementById("lbCap");
const closeBtn = document.getElementById("lbClose");
const prev = document.getElementById("lbPrev");
const next = document.getElementById("lbNext");

if (tiles.length && lb && stage && count && capEl && closeBtn && prev && next) {
  filters.forEach((f) => f.addEventListener("click", () => {
    const cat = f.dataset.filter;
    filters.forEach((o) => o.setAttribute("aria-pressed", String(o === f)));
    tiles.forEach((t) => t.classList.toggle("is-out", cat !== "all" && t.dataset.cat !== cat));
    ScrollTrigger.refresh();
  }));

  let idx = 0;
  let opener: HTMLElement | null = null;
  const visible = () => tiles.filter((t) => !t.classList.contains("is-out"));
  const show = (i: number) => {
    const list = visible();
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    const fig = list[idx].querySelector<HTMLElement>(".m");
    if (!fig) return;
    const box = document.createElement("div");
    box.className = "m";
    box.dataset.tone = fig.dataset.tone ?? "ink";
    if (fig.dataset.vid) box.dataset.vid = fig.dataset.vid;
    fig.querySelectorAll(".plate, picture, img").forEach((n) => {
      if (n.tagName === "IMG" && n.parentElement?.tagName === "PICTURE") return;
      const c = n.cloneNode(true) as HTMLElement;
      c.querySelectorAll("img").forEach((im) => { im.loading = "eager"; im.sizes = "100vw"; });
      if (c.tagName === "IMG") { (c as HTMLImageElement).loading = "eager"; (c as HTMLImageElement).sizes = "100vw"; }
      box.appendChild(c);
    });
    stage.replaceChildren(box);
    settleImages(stage);
    attachVideo(box);
    const cap = fig.querySelector(".cap");
    count.textContent = `${idx + 1} / ${list.length}`;
    capEl.textContent = `${cap?.textContent ?? ""}${fig.getAttribute("aria-label") ? " — " + fig.getAttribute("aria-label") : ""}`;
  };
  const open = (t: HTMLElement) => {
    opener = t; lb.hidden = false; show(visible().indexOf(t as HTMLButtonElement));
    requestAnimationFrame(() => lb.classList.add("is-open"));
    document.body.classList.add("is-locked"); closeBtn.focus();
  };
  const close = () => {
    lb.classList.remove("is-open"); document.body.classList.remove("is-locked");
    setTimeout(() => { lb.hidden = true; stage.querySelector("video")?.pause(); stage.replaceChildren(); }, 400);
    opener?.focus({ preventScroll: true });
  };
  tiles.forEach((t) => t.addEventListener("click", () => open(t)));
  closeBtn.addEventListener("click", close);
  prev.addEventListener("click", () => show(idx - 1));
  next.addEventListener("click", () => show(idx + 1));
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "Tab") {
      const f = [closeBtn, prev, next];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[2].focus(); }
      else if (!e.shiftKey && i === 2) { e.preventDefault(); f[0].focus(); }
    }
  });
  let sx: number | null = null;
  lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
}
