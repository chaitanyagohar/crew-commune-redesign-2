import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import { STOCK, unsplash } from "./media";

const igFiles = import.meta.glob<{ default: ImageMetadata }>("/src/assets/instagram/*.{jpg,jpeg,png,webp,avif}", { eager: true });

/** Crew Commune photo for slot n, if one has been added. */
export function igPhoto(n: number): ImageMetadata | undefined {
  return Object.entries(igFiles).find(([p]) => new RegExp(`/ig${n}\\.[a-z]+$`, "i").test(p))?.[1].default;
}

/** How many Crew Commune photos exist (ig1, ig2 …). */
export const igCount = Object.keys(igFiles).filter((p) => /\/ig\d+\.[a-z]+$/i.test(p)).length;

/** A single optimised URL for a frame: Crew Commune photo if present, else stock. */
export async function photoUrl(ig: number | undefined, stock: string | undefined, width = 800): Promise<string> {
  const own = ig ? igPhoto(ig) : undefined;
  if (own) return (await getImage({ src: own, width: Math.min(width, own.width), format: "webp" })).src;
  return stock && STOCK[stock] ? unsplash(STOCK[stock], width) : "";
}
