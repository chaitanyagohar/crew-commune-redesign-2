// Interaction & scroll effects: cursor, draggable strip, service previews, marquee, reveals.
import { $, $$, FINE, REDUCED, gsap, ScrollTrigger, onStart } from "./util";
import { makeVideo } from "./media";
import { setStripDragged } from "./shell";

function initCursor(): void {
  const cur = $("#cur"), label = $("#curLabel");
  if (!cur || !label) return;
  if (!FINE || REDUCED) { cur.remove(); return; }
  let mx = -100, my = -100, x = -100, y = -100;
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; cur.classList.remove("is-off"); }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => cur.classList.add("is-off"));
  document.addEventListener("pointerover", (e) => {
    const el = (e.target as Element).closest?.<HTMLElement>("[data-cursor]");
    const lab = el?.dataset.cursor ?? "";
    cur.classList.toggle("is-label", !!lab); label.textContent = lab;
  });
  const follow = () => { x += (mx - x) * 0.2; y += (my - y) * 0.2; cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; requestAnimationFrame(follow); };
  follow();
}

function initStrip(): void {
  const strip = $("#strip");
  if (!strip) return;
  const prog = $("#stripProg");
  let sx = 0, vx = 0, dragging = false, startX = 0, startS = 0, lastPX = 0, lastT = 0, min = 0;
  const bounds = () => { min = Math.min(0, (strip.parentElement?.clientWidth ?? innerWidth) - strip.scrollWidth); };
  bounds(); addEventListener("resize", bounds, { passive: true });
  const apply = () => {
    strip.style.transform = `translate3d(${sx.toFixed(1)}px,0,0)`;
    if (prog) prog.style.transform = `scaleX(${(0.12 + 0.88 * (min ? sx / min : 0)).toFixed(3)})`;
    const sk = Math.max(-6, Math.min(6, vx * 0.25)).toFixed(2);
    for (const c of Array.from(strip.children) as HTMLElement[]) c.style.transform = `skewX(${sk}deg)`;
  };
  strip.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true; setStripDragged(false); startX = e.clientX; startS = sx; lastPX = e.clientX; lastT = performance.now(); vx = 0;
    strip.classList.add("is-drag");
  });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX; if (Math.abs(dx) > 6) setStripDragged(true);
    const now = performance.now(); vx = ((e.clientX - lastPX) / Math.max(1, now - lastT)) * 16; lastPX = e.clientX; lastT = now;
    sx = startS + dx; if (sx > 0) sx *= 0.35; if (sx < min) sx = min + (sx - min) * 0.35;
    apply();
  }, { passive: true });
  addEventListener("pointerup", () => { if (!dragging) return; dragging = false; strip.classList.remove("is-drag"); setTimeout(() => setStripDragged(false), 50); });
  const glide = () => {
    if (!dragging) {
      if (Math.abs(vx) > 0.05) { sx += vx; vx *= 0.93; } else vx = 0;
      if (sx > 0) { sx += -sx * 0.15; vx = 0; }
      if (sx < min) { sx += (min - sx) * 0.15; vx = 0; }
      apply();
    }
    requestAnimationFrame(glide);
  };
  glide();
  const step = (dir: number) => {
    const w = (strip.children[0] as HTMLElement).offsetWidth + 16; vx = 0;
    const o = { v: sx };
    gsap.to(o, { v: Math.max(min, Math.min(0, sx - dir * w * 1.5)), duration: 1, ease: "expo.out", onUpdate: () => { sx = o.v; apply(); } });
  };
  $("#stripPrev")?.addEventListener("click", () => step(-1));
  $("#stripNext")?.addEventListener("click", () => step(1));
}

function initPeek(): void {
  const peek = $("#peek"), fig = $("#peekFig"), plate = $("#peekPlate");
  const rows = $$("[data-peek]");
  if (!peek || !fig || !plate || !rows.length || !FINE) return;
  let px = 0, py = 0, tx = 0, ty = 0;
  rows.forEach((a) => {
    a.addEventListener("mouseenter", () => {
      peek.classList.add("is-on");
      const [t, l] = (a.dataset.peek ?? "|").split("|");
      const b = $("b", fig); if (b) b.textContent = t; plate.textContent = l ?? "";
      $$("img, video", fig).forEach((n) => { if (n instanceof HTMLVideoElement) n.pause(); n.remove(); });
      if (a.dataset.peekSrc) {
        const img = new Image(); img.alt = ""; img.src = a.dataset.peekSrc;
        img.onload = () => img.classList.add("is-in"); fig.appendChild(img);
      }
      const v = a.dataset.peekVid ? makeVideo(a.dataset.peekVid) : null;
      if (v) { fig.appendChild(v); v.preload = "auto"; v.play().catch(() => { /* blocked */ }); }
    });
    a.addEventListener("mouseleave", () => peek.classList.remove("is-on"));
  });
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const f = () => {
    px += (tx - px) * 0.12; py += (ty - py) * 0.12;
    peek.style.left = `${px.toFixed(1)}px`; peek.style.top = `${py.toFixed(1)}px`;
    peek.style.rotate = `${Math.max(-10, Math.min(10, (tx - px) * 0.05)).toFixed(2)}deg`;
    requestAnimationFrame(f);
  };
  f();
}

function initMarquee(): void {
  const m = $("#marq");
  if (!m) return;
  m.innerHTML = m.innerHTML.repeat(3);
  let x = 0, dir = 1, half = 0, last = scrollY;
  const measure = () => { half = m.scrollWidth / 3; };
  measure(); addEventListener("resize", measure, { passive: true });
  const loop = () => {
    const y = scrollY, dv = y - last; last = y; if (dv) dir = dv > 0 ? 1 : -1;
    const sp = REDUCED ? 0 : 0.6 + Math.min(18, Math.abs(dv) * 0.35);
    x -= sp * dir;
    if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
    m.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/* ---------- Text splitting ---------- */
function splitWords(el: HTMLElement): HTMLElement[] {
  const walk = (node: Node): DocumentFragment => {
    const out = document.createDocumentFragment();
    Array.from(node.childNodes).forEach((ch) => {
      if (ch.nodeType === Node.TEXT_NODE) {
        (ch.textContent ?? "").split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { out.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = "w";
          const i = document.createElement("span"); i.textContent = tok; w.appendChild(i); out.appendChild(w);
        });
      } else if (ch.nodeType === Node.ELEMENT_NODE) {
        const c = ch.cloneNode(false); c.appendChild(walk(ch)); out.appendChild(c);
      }
    });
    return out;
  };
  const frag = walk(el); el.textContent = ""; el.appendChild(frag);
  return $$(".w > span", el);
}
function splitChars(line: HTMLElement): HTMLElement[] {
  const parts: Array<{ text: string; cls?: string }> = [];
  line.childNodes.forEach((n) => parts.push({ text: n.textContent ?? "", cls: n instanceof HTMLElement ? n.className : undefined }));
  line.textContent = "";
  const inner = document.createElement("span"); inner.style.display = "inline-block";
  parts.forEach((p) => p.text.split("").forEach((ch) => {
    const s = document.createElement("span"); s.className = `c${p.cls ? " " + p.cls : ""}`; s.style.display = "inline-block";
    s.textContent = ch === " " ? " " : ch; inner.appendChild(s);
  }));
  line.appendChild(inner); line.style.overflow = "hidden"; line.style.paddingBottom = ".04em";
  return $$(".c", line);
}

function initReveals(): void {
  if (REDUCED) { $$(".wd").forEach((w) => (w.style.opacity = "1")); return; }
  const heroChars = $$("[data-hero] .ln").flatMap(splitChars);
  const titleWords = $$("[data-title]").flatMap(splitWords);
  const fades = $$("[data-fade]");
  if (heroChars.length) gsap.set(heroChars, { yPercent: 105 });
  if (titleWords.length) gsap.set(titleWords, { yPercent: 110 });
  if (fades.length) gsap.set(fades, { opacity: 0, y: 24 });
  onStart(() => {
    if (heroChars.length) gsap.to(heroChars, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.022 });
    if (titleWords.length) gsap.to(titleWords, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 });
    if (fades.length) gsap.to(fades, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.35 });
  });
  if ($(".hero")) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    tl.to(".hero__in", { yPercent: 18, ease: "none" }, 0).to("#heroReel", { scale: 1.12, ease: "none" }, 0);
  }
  // One-shot reveals use an IntersectionObserver + CSS transitions (no scroll listeners, no layout reads).
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -6% 0px" });
  $$("[data-split]").forEach((el) => {
    splitWords(el).forEach((w, i) => w.style.setProperty("--i", String(i)));
    io.observe(el);
  });
  const groups = new Map<Element, number>();
  $$(".card, .strip__item, .season, .principle, .svb, .step, .hl > div, .kit > div, .way, .tile, .insta__grid > a, .svl li").forEach((el) => {
    const parent = el.parentElement!;
    const i = groups.get(parent) ?? 0; groups.set(parent, i + 1);
    el.classList.add("rv"); el.style.setProperty("--d", `${Math.min(i, 6) * 70}ms`);
    io.observe(el);
  });
  const word = $(".foot__word");
  if (word) {
    $$("span", word).forEach((sp, i) => sp.style.setProperty("--i", String(i)));
    const wio = new IntersectionObserver((es) => { if (es[0].isIntersecting) { word.classList.add("in"); wio.disconnect(); } });
    wio.observe(word);
  }

  // Scrubbed effects stay on ScrollTrigger
  $$("[data-words]").forEach((el) => {
    const words = splitWords(el).map((sp) => sp.parentElement as HTMLElement);
    words.forEach((w) => w.classList.add("wd"));
    gsap.to(words, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
  });
  $$("[data-reveal]").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(18% 8% 18% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 30%", scrub: true } });
  });
  const mosaic = $(".mosaic");
  if (mosaic && innerWidth > 900) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: mosaic, start: "top bottom", end: "bottom top", scrub: true } });
    $$(".mosaic__col", mosaic).forEach((col) => {
      const sp = parseFloat(col.dataset.speed ?? "0.1");
      tl.fromTo(col, { yPercent: sp * -60 }, { yPercent: sp * 60, ease: "none" }, 0);
    });
  }
  if ($(".feat__title") && innerWidth > 1100) gsap.from(".feat__title span", { yPercent: 40, opacity: 0, stagger: 0.12, ease: "none", scrollTrigger: { trigger: ".feat", start: "top 85%", end: "top 30%", scrub: true } });
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise<void>((r) => addEventListener("load", () => r(), { once: true }));
  Promise.all([loaded, document.fonts?.ready]).then(() => ScrollTrigger.refresh());
}

/* ---------- Signature sections ---------- */
function initPillars(): void {
  const pp = $(".pp"), track = $("#ppTrack");
  if (!pp || !track || REDUCED) return;
  const dots = $$(".pp__dots i", pp);
  const panels = $$(".pp__panel", pp);
  gsap.matchMedia().add("(min-width: 1101px)", () => {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: pp, pin: ".pp__pin", start: "top top", end: () => `+=${dist()}`, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (st) => dots.forEach((d, i) => d.style.setProperty("--p", String(Math.max(0, Math.min(1, st.progress * panels.length - i))))),
      },
    });
    panels.forEach((panel) => {
      const bg = $(".pp__bg", panel), name = $(".pp__name", panel), copy = $(".pp__copy", panel);
      if (bg) { gsap.set(bg, { left: "-12%", right: "-12%" }); gsap.fromTo(bg, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left right", end: "right left", scrub: true } }); }
      if (name) gsap.from(name, { xPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 90%", end: "left 20%", scrub: true } });
      if (copy) gsap.from(copy, { y: 40, opacity: 0, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 60%", end: "left 10%", scrub: true } });
    });
    return () => { panels.forEach((p) => { const bg = $(".pp__bg", p); if (bg) gsap.set(bg, { clearProps: "left,right,transform" }); }); };
  });
}

function initManifesto(): void {
  if (REDUCED) return;
  $$(".mf__row").forEach((row) => {
    const f = $(".mf__f", row);
    if (f) gsap.fromTo(f, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: row, start: "top 85%", end: "top 35%", scrub: true } });
    gsap.from($$(".mf__copy > *", row), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 75%" } });
  });
}

export function initFx(): void {
  initPillars();
  initManifesto();
  initCursor();
  initStrip();
  initPeek();
  initMarquee();
  initReveals();
}
