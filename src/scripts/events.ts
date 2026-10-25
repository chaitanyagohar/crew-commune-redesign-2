// Events page: race-category tabs redraw the route line.
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const path = document.getElementById("routePath") as SVGPathElement | null;
const dot = document.getElementById("routeDot");
const note = document.getElementById("catNote");
const km = document.getElementById("routeKm");
const panel = document.getElementById("routePanel");

if (path && dot && note && km && panel) {
  const len = path.getTotalLength();
  let now = 0.3, target = 0.3, anim = false;
  path.style.strokeDasharray = `${len} ${len}`;
  const draw = (f: number) => {
    path.style.strokeDashoffset = String(len * (1 - f));
    const p = path.getPointAtLength(len * f);
    dot.setAttribute("cx", p.x.toFixed(1)); dot.setAttribute("cy", p.y.toFixed(1));
  };
  const step = () => {
    now += (target - now) * (REDUCED ? 1 : 0.07); draw(now);
    if (Math.abs(target - now) > 0.001) requestAnimationFrame(step); else { now = target; draw(now); anim = false; }
  };
  const go = (f: number) => { target = f; if (!anim) { anim = true; requestAnimationFrame(step); } };
  draw(now);
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".cat"));
  const select = (i: number, focus = false) => {
    tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    if (focus) tabs[i].focus();
    note.textContent = tabs[i].dataset.note ?? "";
    km.textContent = tabs[i].dataset.km ?? "";
    panel.setAttribute("aria-labelledby", tabs[i].id);
    go(Number(tabs[i].dataset.frac ?? 1));
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % tabs.length, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); select((i + tabs.length - 1) % tabs.length, true); }
    });
  });
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); now = 0; draw(0); go(target); } }, { threshold: 0.5 });
  io.observe(panel);
}

export {};
