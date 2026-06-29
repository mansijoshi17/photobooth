// Design-space dimensions for every strip (2in x 6in ratio = 1:3).
// All slot / decoration coordinates below are in this space and get scaled at render time.
export const STRIP_W = 300;
export const STRIP_H = 900;

const S = "/stickers/";

// 3-photo slot layout
const SLOTS_3 = [
  { x: 26, y: 64, w: 248, h: 185 },
  { x: 26, y: 277, w: 248, h: 185 },
  { x: 26, y: 490, w: 248, h: 185 },
];

// 4-photo slot layout
const SLOTS_4 = [
  { x: 26, y: 52, w: 248, h: 160 },
  { x: 26, y: 228, w: 248, h: 160 },
  { x: 26, y: 404, w: 248, h: 160 },
  { x: 26, y: 580, w: 248, h: 160 },
];

export const TEMPLATES = [
  {
    id: "cherry-red",
    name: "Cherry Red",
    cta: "Pick Cherry 🍒",
    accent: "#8a2b2b",
    bg: { type: "gingham", color: "#a23030", base: "#fbeee9", cell: 9 },
    panel: { x: 16, y: 52, w: 268, h: 636, r: 16, color: "#7d1b1b", dots: "#f4e3d8", dotCell: 20 },
    matColor: "#ffffff",
    photoBorder: "#ffffff",
    slots: SLOTS_3,
    decorations: [
      { src: S + "satin-bow.png", x: 150, y: 36, size: 72 },
      { src: S + "hibiscus.png", x: 44, y: 60, size: 52, rot: -0.25 },
      { src: S + "cherries.png", x: 252, y: 262, size: 76, rot: 0.12 },
      { src: S + "hibiscus.png", x: 250, y: 660, size: 50, rot: 0.2 },
      { src: S + "gingham-bow.png", x: 150, y: 702, size: 86 },
    ],
    palette: [
      S + "satin-bow.png",
      S + "gingham-bow.png",
      S + "hibiscus.png",
      S + "cherries.png",
      S + "swirl-red.svg",
      S + "cherry.svg",
    ],
    title: { text: "Cherry", x: 150, y: 762, size: 46, color: "#8a2b2b", font: '"Dancing Script", cursive', weight: "700" },
  },
  {
    id: "pink-sweetie",
    name: "Sweetie",
    cta: "Choose Sweetie 🎀",
    accent: "#e06ea0",
    bg: { type: "stripes", color: "#fad3e4", base: "#fff4f9", cell: 12 },
    panel: { x: 16, y: 40, w: 268, h: 712, r: 18, color: "#fbe2ee", dots: null },
    matColor: "#ffffff",
    photoBorder: "#f4bdd6",
    slots: SLOTS_4,
    decorations: [
      { src: S + "pinkclip.png", x: 150, y: 30, size: 46 },
      { src: S + "star.png", x: 256, y: 66, size: 40, rot: 0.15 },
      { src: S + "pinkflower.png", x: 44, y: 214, size: 50, rot: -0.15 },
      { src: S + "star.png", x: 256, y: 248, size: 30, rot: -0.1 },
      { src: S + "pinkcamera.png", x: 255, y: 392, size: 58, rot: 0.1 },
      { src: S + "pinkstamp.png", x: 46, y: 572, size: 46, rot: -0.1 },
      { src: S + "button.png", x: 58, y: 662, size: 30 },
      { src: S + "pinkbow.png", x: 150, y: 770, size: 80 },
    ],
    palette: [
      S + "pinkbow.png",
      S + "pinkclip.png",
      S + "pinkflower.png",
      S + "pinkstamp.png",
      S + "pinkcamera.png",
      S + "star.png",
      S + "button.png",
    ],
    title: { text: "Sweetie", x: 150, y: 816, size: 40, color: "#e06ea0", font: '"Dancing Script", cursive', weight: "700" },
  },
  {
    id: "matcha",
    name: "Matcha",
    cta: "Sip Matcha 🍵",
    accent: "#5f8a3a",
    bg: { type: "polka", base: "#bcd89a", dot: "#ffffff", cell: 26 },
    matColor: "#ffffff",
    photoBorder: "#a7cd7d",
    slots: SLOTS_3,
    decorations: [
      { src: S + "matcha-blossom.png", x: 46, y: 58, size: 48, rot: -0.15 },
      { src: S + "matcha-whisk.png", x: 256, y: 62, size: 46, rot: 0.2 },
      { src: S + "matcha-flowers.png", x: 44, y: 262, size: 44 },
      { src: S + "matcha-cup.png", x: 260, y: 272, size: 40, rot: 0.05 },
      { src: S + "matcha-strawberry.png", x: 46, y: 478, size: 42, rot: -0.1 },
      { src: S + "matcha-iced.png", x: 258, y: 486, size: 42 },
      { src: S + "matcha-mug.png", x: 150, y: 712, size: 64 },
    ],
    palette: [
      S + "matcha-mug.png",
      S + "matcha-cup.png",
      S + "matcha-iced.png",
      S + "matcha-whisk.png",
      S + "matcha-blossom.png",
      S + "matcha-flowers.png",
      S + "matcha-strawberry.png",
    ],
    title: { text: "Matcha", x: 150, y: 808, size: 40, color: "#4f7d2f", font: '"Dancing Script", cursive', weight: "700" },
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
