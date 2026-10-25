// Third-party media used at key places.
// Photos: Unsplash (Unsplash licence — free for commercial use, no attribution required).
// Video: Mixkit (Mixkit Stock Video Free License — free for commercial use, no attribution required).
// Crew Commune's own photos live in src/assets/instagram/ (ig1.jpg, ig2.jpg …) and always win
// over these stock photos wherever a frame names an Instagram slot.

const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const STOCK: Record<string, string> = {
  run1: U("1452626038306-9aae5e071dd3"),   // people running on a road
  run2: U("1552674605-db6ffd4facb5"),      // three women running, silhouette
  run3: U("1590333748338-d629e4564ad9"),   // runners on asphalt
  run4: U("1759674861540-afed9f86f94a"),   // runners in motion during a race
  run5: U("1744868646521-2620c945a1fe"),   // runners sprint down a street
  run6: U("1480179087180-d9f0ec044897"),   // woman running
  shoes: U("1571008887538-b36bb32f4571"),  // running shoes
  finish: U("1632650312771-52c324fb4d83"), // inflatable finish arch
  crowd: U("1524646349956-1590eacfa324"),  // spectators at a marathon
  group: U("1667791274080-49884d1f5f5c"),  // group photo after a run
  pack: U("1719299246416-b4c069be9caf"),   // group running a marathon
  pack2: U("1760315972424-1637530daead"),  // runners in a marathon
  mono: U("1519703936-c4a3b3eb88e4"),      // black-and-white marathon
  cricket: U("1542185546-4e89f5fd0e04"),   // cricket bat
  stadium: U("1730739628981-6537b299aea3"),// cricket stadium crowd
  badminton: U("1696250530563-70f39e532e10"),
  football: U("1780548545759-434981c7c46e"),
  hockey: U("1644556481721-25ccba035f5a"),
};

/** Responsive Unsplash URL (imgix serves AVIF/WebP automatically with auto=format). */
export const unsplash = (base: string, w: number, q = 70) => `${base}?auto=format&fit=crop&w=${w}&q=${q}`;
export const unsplashSrcset = (base: string, widths = [480, 800, 1200, 1600]) =>
  widths.map((w) => `${unsplash(base, w)} ${w}w`).join(", ");

const MX = (id: number) => [
  `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
  `https://assets.mixkit.co/videos/${id}/${id}-360.mp4`,
];

export const VIDEO: Record<string, string[]> = {
  hero: MX(46004),      // athletes racing along a track, high-five
  street: MX(40881),    // man and woman jogging together on the street
  bridge: MX(40766),    // man jogging on a pedestrian bridge
  aerial: MX(33369),    // woman jogging down a road, seen from the air
  track: MX(46004),
  trackprep: MX(585),   // woman preparing to run on a track
  hurdles: MX(586),     // athlete jumping hurdles
  warmup: MX(583),      // warm-up exercises
  laces: MX(15059),     // tying sneakers before running
  woman: MX(47764),     // young woman running outdoors
  park: MX(46322),      // young woman running in the park
  football: MX(43499),  // goal play in a soccer game
  football2: MX(43483), // one-on-one in a soccer game
  basketball: MX(44448),// basketball player shooting
};

/** Clips the home hero cycles through. */
export const HERO_REEL = ["hero", "aerial", "street", "football"];
