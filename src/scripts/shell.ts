// Intro loader, page transitions, navbar and menu.
import { $, $$, FINE, REDUCED, gsap, lock, onStart, scrollToTarget, session, start } from "./util";

const intro = $("#intro");
const shift = $("#shift");
const shiftLabel = $("#shiftLabel");
const hide = (el: HTMLElement | null) => el?.classList.add("is-off");
let menuOpen = false;
let stripDragged = false;
export const setStripDragged = (v: boolean) => { stripDragged = v; };

/* ---------- Intro: a race-day counter whose frame grows into the page ---------- */
function runIntro(full: boolean): void {
  hide(shift); lock(true);
  const wrap = $("#introWrap")!, frame = $("#introFrame")!, tag = $("#introTag")!, count = $("#introCount")!, bar = $("#introBar")!, hint = $("#introHint")!;
  if (!FINE) hint.textContent = "Tap to sprint";
  const slides = $$(".m", $("#introSlides")!);
  const labelOf = (f: HTMLElement) => `${$("b", f)?.textContent ?? ""} — ${$(".plate > span", f)?.textContent ?? ""}`;
  let si = 0, lastSwap = 0, swapEvery = full ? 320 : 160;
  const vw = innerWidth, vh = innerHeight, fw = frame.offsetWidth, fh = frame.offsetHeight;
  const cx = (vw - fw) / 2, cy = (vh - fh) / 2 - vh * 0.04;
  let x = cx, y = cy, tx = cx, ty = cy;
  wrap.style.transform = `translate(${x}px,${y}px)`;
  let progress = 0, sprint = 0, done = false;
  const t0 = performance.now(), minMs = full ? 1800 : 700;
  const onMove = (e: PointerEvent) => {
    tx = Math.max(16, Math.min(vw - fw - 16, e.clientX - fw / 2));
    ty = Math.max(70, Math.min(vh - fh - 120, e.clientY - fh / 2));
  };
  const onTap = () => { sprint = 1; progress = Math.min(99, progress + 7); swapEvery = 90; };
  if (FINE) addEventListener("pointermove", onMove);
  intro!.addEventListener("pointerdown", onTap);

  const loop = (now: number) => {
    if (done) return;
    const el = now - t0;
    const target = Math.min(100, (el / minMs) * 100);
    progress += Math.max(0, target - progress) * 0.08 + 0.12 + sprint * 0.5;
    sprint *= 0.92; if (sprint < 0.05) swapEvery = full ? 320 : 160;
    if (el < minMs * 0.9) progress = Math.min(progress, 99.4);
    if (progress >= 100) progress = 100;
    count.textContent = String(Math.floor(progress)).padStart(3, "0");
    bar.style.transform = `scaleX(${(progress / 100).toFixed(3)})`;
    if (now - lastSwap > swapEvery && slides.length) {
      lastSwap = now; si = (si + 1) % slides.length;
      slides.forEach((f, i) => f.classList.toggle("is-on", i === si));
      tag.textContent = labelOf(slides[si]);
    }
    const nx = x + (tx - x) * 0.09, ny = y + (ty - y) * 0.09;
    const rot = Math.max(-8, Math.min(8, (nx - x) * 0.6));
    x = nx; y = ny;
    wrap.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
    if (progress >= 100) { finish(); return; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  function finish() {
    done = true; session.set("crewSeen", "1");
    removeEventListener("pointermove", onMove);
    count.textContent = "100";
    slides.forEach((f, i) => f.classList.toggle("is-on", i === 0));
    tag.textContent = "07:00 — Flag-off";
    const isHome = !!$("#heroReel");
    // Grow the frame with a clip-path (no per-frame layout): make it full-screen once,
    // clipped to where it currently sits, then open the clip.
    const r = frame.getBoundingClientRect();
    const clipFrom = `inset(${r.top.toFixed(1)}px ${(innerWidth - r.right).toFixed(1)}px ${(innerHeight - r.bottom).toFixed(1)}px ${r.left.toFixed(1)}px)`;
    wrap.style.transform = "none";
    Object.assign(frame.style, { position: "fixed", left: "0", top: "0", width: "100vw", height: "100vh", clipPath: clipFrom });
    const tl = gsap.timeline({ onComplete: () => hide(intro) });
    tl.to(tag, { opacity: 0, duration: 0.3 })
      .to([".intro__top", ".intro__bot"], { opacity: 0, y: 20, duration: 0.5, ease: "power2.in" }, 0)
      .to(frame, { clipPath: "inset(0px 0px 0px 0px)", duration: 1.1, ease: "expo.inOut" }, 0.1)
      .add(() => { lock(false); start(); }, isHome ? 1.05 : 1.2);
    if (isHome) tl.to(intro, { opacity: 0, duration: 0.6 }, 1.0);
    else tl.to(intro, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, 1.2);
  }
}

function runArrive(label: string): void {
  hide(intro);
  if (shiftLabel) shiftLabel.innerHTML = `${label}<span>.</span>`;
  gsap.set(shift, { yPercent: 0 });
  gsap.to(shift, { yPercent: -100, duration: 0.9, ease: "expo.inOut", delay: 0.15, onComplete: () => { hide(shift); gsap.set(shift, { clearProps: "transform" }); } });
  setTimeout(start, 450);
}

export function initShell(): void {
  intro?.style.setProperty("animation", "none");
  shift?.style.setProperty("animation", "none");
  const arrivedFrom = session.get("crewNav"); session.del("crewNav");
  const firstVisit = !session.get("crewSeen");
  if (!intro) start();
  else if (REDUCED) { hide(intro); hide(shift); session.set("crewSeen", "1"); start(); }
  else if (arrivedFrom) runArrive(arrivedFrom);
  else runIntro(firstVisit);

  /* ---------- Leaving: the page-shift curtain ---------- */
  const norm = (p: string) => p.replace(/\.html$/, "").replace(/\/index$/, "/").replace(/(.)\/$/, "$1") || "/";
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.("a");
    if (!a) return;
    if (a.closest(".strip__track") && stripDragged) { e.preventDefault(); return; }
    const href = a.getAttribute("href") ?? "";
    if (href.startsWith("#")) {
      const t = href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (t) { e.preventDefault(); closeMenu(); scrollToTarget(t, { offset: -80 }); }
      return;
    }
    if (a.target === "_blank" || a.hasAttribute("download") || /^(mailto|tel|sms|javascript):/i.test(href)) return;
    let url: URL;
    try { url = new URL(href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    if (norm(url.pathname) === norm(location.pathname)) {
      e.preventDefault(); closeMenu();
      const el = url.hash ? document.getElementById(url.hash.slice(1)) : null;
      scrollToTarget(el ?? 0, { offset: -80 });
      return;
    }
    if (REDUCED || !shift) return;
    e.preventDefault();
    const label = a.dataset.label ?? a.textContent?.trim().split("\n")[0] ?? "";
    session.set("crewNav", label);
    if (shiftLabel) shiftLabel.innerHTML = `${label}<span>.</span>`;
    shift.classList.remove("is-off");
    gsap.fromTo(shift, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: "expo.inOut", onComplete: () => { location.href = url.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { hide(shift); hide(intro); lock(false); closeMenu(); } });
  if (location.hash) onStart(() => { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => scrollToTarget(el, { offset: -80, immediate: true }), 60); });

  initNav();
}

/* ---------- Navbar ---------- */
const nav = $("#nav")!;
const burger = $<HTMLButtonElement>("#burger");
const menu = $("#menu");
const burgerTxt = $("#burgerTxt");

function closeMenu(): void {
  if (!menuOpen || !menu || !burger || !burgerTxt) return;
  menuOpen = false; menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burgerTxt.textContent = "Menu";
  lock(false); navUpdate();
}
function openMenu(): void {
  if (!menu || !burger || !burgerTxt) return;
  menuOpen = true; menu.classList.add("is-open"); burger.setAttribute("aria-expanded", "true"); burgerTxt.textContent = "Close";
  nav.setAttribute("data-tone", "dark"); nav.classList.remove("is-hidden", "is-filled"); lock(true);
  setTimeout(() => $("a", menu)?.focus({ preventScroll: true }), 400);
}

let lastY = 0;
const toneEls = () => $$('[data-tone="dark"], [data-tone="light"]').filter((el) => el !== nav);
let tones = toneEls();
function navUpdate(): void {
  const y = scrollY, probe = nav.offsetHeight / 2;
  let tone = "light";
  for (const el of tones) { const r = el.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) tone = el.dataset.tone ?? tone; }
  if (!menuOpen) nav.setAttribute("data-tone", tone);
  nav.classList.toggle("is-filled", y > 40 && !menuOpen);
  if (!menuOpen) {
    if (y > 200 && y > lastY + 4) nav.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 200) nav.classList.remove("is-hidden");
  }
  lastY = y;
}

function initNav(): void {
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; navUpdate(); }); } }, { passive: true });
  addEventListener("resize", () => { tones = toneEls(); navUpdate(); if (innerWidth > 920) closeMenu(); }, { passive: true });
  navUpdate();
  burger?.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener("keydown", (e) => {
    if (!menuOpen || !burger || !menu) return;
    if (e.key === "Escape") { closeMenu(); burger.focus(); }
    if (e.key === "Tab") {
      const f: HTMLElement[] = [burger, ...$$("a", menu)];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Live Pune time
  const pt = $("#puneTime");
  if (pt) {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => (pt.textContent = fmt.format(new Date()));
    tick(); setInterval(tick, 15000);
  }
  // Copy buttons, back to top, replay intro
  $$<HTMLButtonElement>("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const txt = b.dataset.copy ?? "", orig = b.textContent;
    const ok = () => { b.textContent = "Copied"; setTimeout(() => (b.textContent = orig), 1600); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(ok, () => (b.textContent = txt));
    else b.textContent = txt;
  }));
  $("#toTop")?.addEventListener("click", () => scrollToTarget(0, { duration: 2 }));
  $("#replay")?.addEventListener("click", () => { session.del("crewSeen"); session.del("crewNav"); scrollTo(0, 0); location.reload(); });
}
