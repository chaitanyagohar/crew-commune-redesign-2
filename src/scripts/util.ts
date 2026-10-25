import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel as string) as T | null;
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel as string));

export const session = {
  get: (k: string): string | null => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string): void => { try { sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
  del: (k: string): void => { try { sessionStorage.removeItem(k); } catch { /* storage blocked */ } },
};

/* ---- "race start" hook: runs once the intro or page transition hands over ---- */
let started = false;
const queue: Array<() => void> = [];
export function onStart(fn: () => void): void { if (started) fn(); else queue.push(fn); }
export function start(): void {
  if (started) return;
  started = true;
  queue.forEach((f) => { try { f(); } catch (e) { console.warn(e); } });
}

/* ---- Smooth scroll ---- */
export let lenis: Lenis | null = null;
if (!REDUCED) {
  try {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } catch { lenis = null; }
}
export function lock(on: boolean): void {
  document.body.classList.toggle("is-locked", on);
  if (lenis) { if (on) lenis.stop(); else lenis.start(); }
}
export function scrollToTarget(target: HTMLElement | number, opts: { offset?: number; duration?: number; immediate?: boolean } = {}): void {
  if (lenis) { lenis.scrollTo(target, { offset: -10, ...opts }); return; }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: REDUCED ? "auto" : "smooth" });
  else target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
}
