// Crew Commune — shared client script for every page (bundled and minified by Astro/Vite).
import { initMedia } from "./media";
import { initShell } from "./shell";
import { initFx } from "./fx";

initMedia();
initShell();   // intro / page transition first, so the cover is up before anything heavy runs

// Scroll choreography is set up while the intro or page curtain is still covering the screen,
// in idle time, so it never blocks the first paint.
const fx = () => initFx();
if ("requestIdleCallback" in window) requestIdleCallback(fx, { timeout: 350 });
else setTimeout(fx, 1);
