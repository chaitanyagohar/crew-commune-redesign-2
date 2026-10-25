import { VIDEO, HERO_REEL } from "../data/media";
import { $, $$, REDUCED, onStart } from "./util";

/** Fade server-rendered photos in once loaded; drop any that fail so the plate shows. */
export function settleImages(root: ParentNode = document): void {
  $$<HTMLImageElement>(".m img", root).forEach((img) => {
    const fig = img.closest(".m");
    const done = () => { img.classList.add("is-in"); fig?.classList.add("has-media"); };
    const fail = () => (img.parentElement?.tagName === "PICTURE" ? img.parentElement : img).remove();
    if (img.complete) { if (img.naturalWidth) done(); else fail(); }
    else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", fail, { once: true }); }
  });
}

export function makeVideo(key: string): HTMLVideoElement | null {
  const srcs = VIDEO[key];
  if (!srcs?.length || REDUCED) return null;
  const v = document.createElement("video");
  v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = "none";
  v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
  srcs.forEach((u) => { const s = document.createElement("source"); s.src = u; s.type = "video/mp4"; v.appendChild(s); });
  v.addEventListener("playing", () => v.classList.add("is-in"));
  return v;
}

const playSafe = (v: HTMLVideoElement) => { const p = v.play(); if (p) p.catch(() => { /* autoplay blocked */ }); };

/** Videos only load when their frame scrolls into view, and pause when it leaves. */
const vidIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const v = (e.target as HTMLElement & { __vid?: HTMLVideoElement }).__vid;
    if (!v) return;
    if (e.isIntersecting) { if (v.preload === "none") { v.preload = "auto"; v.load(); } playSafe(v); }
    else v.pause();
  });
}, { rootMargin: "150px" });

export function attachVideo(fig: HTMLElement): void {
  const key = fig.dataset.vid;
  if (!key || (fig as HTMLElement & { __vid?: HTMLVideoElement }).__vid) return;
  const v = makeVideo(key);
  if (!v) return;
  fig.insertBefore(v, $(".cap", fig));
  (fig as HTMLElement & { __vid?: HTMLVideoElement }).__vid = v;
  vidIO.observe(fig);
}

export function initMedia(): void {
  settleImages();
  $$(".m[data-vid]").forEach(attachVideo);

  // Live race clocks
  const clocks = $$("[data-raceclock]");
  if (clocks.length) {
    const t0 = performance.now();
    setInterval(() => {
      const s = (performance.now() - t0) / 1000;
      const t = `${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(Math.floor(s) % 60).padStart(2, "0")}.${String(Math.floor((s % 1) * 100)).padStart(2, "0")}`;
      clocks.forEach((c) => (c.textContent = t));
    }, REDUCED ? 1000 : 60);
  }

  // Home hero reel: real sports clips crossfading every few seconds
  const reel = $("#heroReel");
  if (!reel) return;
  const vids: HTMLVideoElement[] = [];
  HERO_REEL.forEach((k) => { const v = makeVideo(k); if (v) { v.loop = false; v.className = "hero__vid"; reel.appendChild(v); vids.push(v); } });
  const tick = $("#heroTick"), tN = $("#heroTickN"), tT = $("#heroTickT"), bar = $("#heroTickBar");
  if (!vids.length) { if (tick) tick.hidden = true; return; }
  if (tT) tT.textContent = String(vids.length).padStart(2, "0");
  const CLIP = 6500;
  let idx = -1, clipStart = 0;
  const show = (i: number) => {
    idx = i % vids.length;
    const v = vids[idx];
    if (v.preload === "none") { v.preload = "auto"; v.load(); }
    try { v.currentTime = 0; } catch { /* not seekable yet */ }
    playSafe(v);
    vids.forEach((x) => x.classList.toggle("is-on", x === v));
    const nxt = vids[(idx + 1) % vids.length];
    if (nxt !== v && nxt.preload === "none") { nxt.preload = "auto"; nxt.load(); }
    if (tN) tN.textContent = String(idx + 1).padStart(2, "0");
    clipStart = performance.now();
  };
  onStart(() => show(0));
  const loop = (now: number) => {
    if (idx >= 0) {
      const v = vids[idx], el = now - clipStart, ready = v.classList.contains("is-in");
      if (bar) bar.style.transform = `scaleX(${Math.min(1, el / CLIP).toFixed(3)})`;
      if ((ready && el > CLIP) || v.ended || (!ready && el > 4000)) { v.pause(); show(idx + 1); }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  document.addEventListener("visibilitychange", () => {
    if (idx < 0) return;
    if (document.hidden) vids[idx].pause(); else playSafe(vids[idx]);
  });
}
