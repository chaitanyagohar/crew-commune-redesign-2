// Crew Commune — single source of truth for brand facts, navigation and contact details.
// Edit here and every page, the footer, the SEO tags and the structured data update together.

export const SITE = {
  name: "Crew Commune",
  url: "https://crew-commune-redesign.vercel.app", // change to the final domain when it's live
  tagline: "Sports. People. Experiences.",
  mission: "Building communities that move.",
  pillars: ["Events", "Brands", "Athletes", "Wellness"] as const,
  description:
    "Crew Commune is a Pune sports and community company. We create sports events, partner with brands, work with athletes and champion wellness: building communities that move.",
  city: "Pune",
  region: "Maharashtra",
  country: "IN",
  geo: { lat: 18.5204, lng: 73.8567 },
  instagram: "https://www.instagram.com/crewcommune",
  handle: "@crewcommune",
  founder: { name: "Yash Raikar", url: "https://www.linkedin.com/in/yash-raikar-527362119/" },
  // Add these when available; they appear on the Contact page, footer and structured data.
  email: "" as string,
  phone: "" as string,
  whatsapp: "" as string,
  formEndpoint: "" as string, // e.g. "https://formspree.io/f/xxxxxxx" to receive enquiries by email
  locale: "en_IN",
} as const;

export type NavItem = { href: string; label: string; note: string };
export const NAV: NavItem[] = [
  { href: "/", label: "Home", note: "Start line" },
  { href: "/about", label: "About", note: "The crew" },
  { href: "/services", label: "What we do", note: "Events × Brands × Athletes × Wellness" },
  { href: "/events", label: "Events", note: "Udaan & more" },
  { href: "/gallery", label: "Gallery", note: "Race mornings" },
];
export const CONTACT_NAV: NavItem = { href: "/contact", label: "Contact", note: "Plan with us" };

// The four pillars from Crew Commune's own line: Events × Brands × Athletes × Wellness
export type Pillar = {
  id: string; name: string; tag: string; line: string; body: string; items: string[];
  stock: string; ig?: number; vid?: string; plate: [string, string]; tone: string;
};
export const PILLARS: Pillar[] = [
  {
    id: "events", name: "Events", tag: "Runs · Sports days · Leagues",
    line: "Sports events, planned and run end to end.",
    body: "Road runs from 3K to 21K, cause runs like the Udaan Nari Shakti Run, corporate sports days and tournaments. We handle the route, permissions, timing, safety and the finish-line party.",
    items: ["Road runs & marathons", "Cause & community runs", "Corporate sports days", "Tournaments & leagues"],
    stock: "run3", ig: 1, vid: "street", plate: ["3K–21K", "Events"], tone: "red",
  },
  {
    id: "brands", name: "Brands", tag: "Activations · Partnerships",
    line: "Put your brand where people move.",
    body: "Title and zone partnerships, expo stalls, sampling, branded race kits and content that puts brands in front of runners, families and fans on the day that matters.",
    items: ["Brand activations", "Title & zone partnerships", "Expo & sampling zones", "Branded kits & content"],
    stock: "crowd", ig: 5, vid: "football", plate: ["Expo", "Brands"], tone: "ink",
  },
  {
    id: "athletes", name: "Athletes", tag: "Athletes × Community",
    line: "Athletes and the community on one start line.",
    body: "Athlete-led runs, meet-ups and appearances that bring performance and people closer together, from first-time runners to podium finishers.",
    items: ["Athlete-led runs", "Meet-ups & appearances", "Pacers & clinics", "Community challenges"],
    stock: "run4", ig: 3, vid: "track", plate: ["KM 21", "Athletes"], tone: "maroon",
  },
  {
    id: "wellness", name: "Wellness", tag: "Beyond race day",
    line: "Moving together, every week, not just race day.",
    body: "Community runs, warm-up and recovery sessions, and workplace wellness programmes that keep people moving between the big events.",
    items: ["Community runs", "Warm-up & recovery sessions", "Workplace wellness", "Wellness partners at events"],
    stock: "run6", ig: 4, vid: "warmup", plate: ["06:00", "Wellness"], tone: "stone",
  },
];

// Udaan Nari Shakti Run 2.0 — facts from the public event listing
export const UDAAN = {
  name: "Udaan Nari Shakti Run 2.0",
  date: "2025-01-05",
  dateLabel: "Sun 05 Jan 2025",
  start: "2025-01-05T07:00:00+05:30",
  flagOff: "07:00 IST",
  area: "Aundh–Baner, Pune",
  presenter: "Poonam Vishal Vidhate",
  categories: [
    { km: "3K", label: "Saree Run", note: "Walk or run the 3K in a saree. Open to every woman, with no timing pressure.", frac: 0.3 },
    { km: "5K", label: "Timed", note: "A timed 5K for runners chasing a personal best. Timing certificate for every finisher.", frac: 0.5 },
    { km: "10K", label: "Timed", note: "The full 10K through Aundh–Baner. Timed, with prizes for category winners.", frac: 1 },
  ],
  kit: ["Dry-fit T-shirt", "Finisher medal", "Goody bag", "Timing certificate", "On-route hydration", "Medical support", "Post-run snacks", "Entertainment"],
};
