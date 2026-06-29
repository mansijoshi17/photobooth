import { STRIP_W, STRIP_H } from "./templates";

// --- small drawing helpers ---------------------------------------------------

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draw an image cropped "cover" style into a box.
function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const br = w / h;
  let sw, sh, sx, sy;
  if (ir > br) {
    sh = img.height;
    sw = sh * br;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / br;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function cloud(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 7);
  ctx.arc(cx + r, cy + r * 0.2, r * 0.8, 0, 7);
  ctx.arc(cx - r, cy + r * 0.2, r * 0.75, 0, 7);
  ctx.arc(cx + r * 0.2, cy + r * 0.45, r * 0.9, 0, 7);
  ctx.fill();
}

// The cute sky + hills placeholder shown in empty photo slots.
function drawScenery(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#bfe6fb");
  g.addColorStop(1, "#eaf8ff");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#9ccb6a";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.3, y + h + h * 0.2, w * 0.75, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7fb851";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.85, y + h + h * 0.3, w * 0.7, h * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  cloud(ctx, x + w * 0.26, y + h * 0.26, w * 0.15);
  cloud(ctx, x + w * 0.72, y + h * 0.18, w * 0.12);
}

// --- background patterns -----------------------------------------------------

function clipStrip(ctx) {
  roundRect(ctx, 0, 0, STRIP_W, STRIP_H, 18);
  ctx.clip();
}

function drawGingham(ctx, color, base, cell) {
  ctx.save();
  clipStrip(ctx);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < STRIP_W; i += cell * 2) ctx.fillRect(i, 0, cell, STRIP_H);
  for (let j = 0; j < STRIP_H; j += cell * 2) ctx.fillRect(0, j, STRIP_W, cell);
  ctx.restore();
}

function drawGrid(ctx, color, base, cell) {
  ctx.save();
  clipStrip(ctx);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, cell * 0.08);
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let i = 0; i <= STRIP_W; i += cell) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, STRIP_H);
  }
  for (let j = 0; j <= STRIP_H; j += cell) {
    ctx.moveTo(0, j);
    ctx.lineTo(STRIP_W, j);
  }
  ctx.stroke();
  ctx.restore();
}

function drawStripes(ctx, base, stripe, band) {
  ctx.save();
  clipStrip(ctx);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);
  ctx.fillStyle = stripe;
  for (let o = -STRIP_H; o < STRIP_W; o += band * 2) {
    ctx.beginPath();
    ctx.moveTo(o, 0);
    ctx.lineTo(o + band, 0);
    ctx.lineTo(o + band + STRIP_H, STRIP_H);
    ctx.lineTo(o + STRIP_H, STRIP_H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawPolka(ctx, base, dot, cell) {
  ctx.save();
  clipStrip(ctx);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);
  ctx.fillStyle = dot;
  let row = 0;
  for (let j = 0; j < STRIP_H + cell; j += cell) {
    const off = row % 2 ? cell / 2 : 0;
    for (let i = -cell; i < STRIP_W + cell; i += cell) {
      ctx.beginPath();
      ctx.arc(i + off, j, cell * 0.15, 0, 7);
      ctx.fill();
    }
    row++;
  }
  ctx.restore();
}

// optional colored frame panel behind the photo column (e.g. Cherry Red's dotted mat)
function drawPanel(ctx, p) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = p.color;
  roundRect(ctx, p.x, p.y, p.w, p.h, p.r || 16);
  ctx.fill();
  ctx.restore();

  if (p.dots) {
    ctx.save();
    roundRect(ctx, p.x, p.y, p.w, p.h, p.r || 16);
    ctx.clip();
    ctx.fillStyle = p.dots;
    const cell = p.dotCell || 20;
    let row = 0;
    for (let j = p.y; j < p.y + p.h + cell; j += cell) {
      const off = row % 2 ? cell / 2 : 0;
      for (let i = p.x - cell; i < p.x + p.w + cell; i += cell) {
        ctx.beginPath();
        ctx.arc(i + off, j, 2.2, 0, 7);
        ctx.fill();
      }
      row++;
    }
    ctx.restore();
  }
}

// --- stickers ----------------------------------------------------------------

const stickerCache = {};
function loadSticker(src) {
  if (!stickerCache[src]) stickerCache[src] = loadImage(src).catch(() => null);
  return stickerCache[src];
}

// --- fonts -------------------------------------------------------------------

let fontsPromise;
function ensureFonts() {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    if (typeof document === "undefined" || !document.fonts) return;
    try {
      await Promise.all([
        document.fonts.load('700 40px "Dancing Script"'),
        document.fonts.load('700 22px "Quicksand"'),
      ]);
      await document.fonts.ready;
    } catch (e) {
      /* fall back to system fonts */
    }
  })();
  return fontsPromise;
}

// --- main renderer -----------------------------------------------------------

export async function renderStrip(canvas, t, photos = [], opts = {}) {
  const scale = opts.scale || 3;
  await ensureFonts();

  canvas.width = STRIP_W * scale;
  canvas.height = STRIP_H * scale;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, STRIP_W, STRIP_H);

  // background pattern
  const b = t.bg;
  if (b.type === "gingham") drawGingham(ctx, b.color, b.base, b.cell);
  else if (b.type === "grid") drawGrid(ctx, b.color, b.base, b.cell);
  else if (b.type === "stripes") drawStripes(ctx, b.base, b.color, b.cell);
  else drawPolka(ctx, b.base, b.dot, b.cell);

  // optional frame panel behind the photos
  if (t.panel) drawPanel(ctx, t.panel);

  // preload photos
  const imgs = await Promise.all(
    t.slots.map((_, i) => (photos[i] ? loadImage(photos[i]).catch(() => null) : null))
  );

  // photo slots
  t.slots.forEach((s, i) => {
    // white mat with soft shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = t.matColor || "#fff";
    roundRect(ctx, s.x - 7, s.y - 7, s.w + 14, s.h + 14, 10);
    ctx.fill();
    ctx.restore();

    // photo or scenery placeholder, clipped to the opening
    ctx.save();
    roundRect(ctx, s.x, s.y, s.w, s.h, 7);
    ctx.clip();
    if (imgs[i]) drawCover(ctx, imgs[i], s.x, s.y, s.w, s.h);
    else drawScenery(ctx, s.x, s.y, s.w, s.h);
    ctx.restore();

    // thin colored frame
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = t.photoBorder || "#fff";
    roundRect(ctx, s.x, s.y, s.w, s.h, 7);
    ctx.stroke();
  });

  // sticker decorations
  const decos = t.decorations || [];
  const stickers = await Promise.all(decos.map((d) => loadSticker(d.src)));
  decos.forEach((d, i) => {
    const img = stickers[i];
    if (!img) return;
    const w = d.size;
    const h = d.size * (img.height / img.width || 1);
    ctx.save();
    ctx.translate(d.x, d.y);
    if (d.rot) ctx.rotate(d.rot);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  });

  // title / date
  if (t.title) {
    const ti = t.title;
    ctx.save();
    ctx.fillStyle = ti.color;
    ctx.font = `${ti.italic ? "italic " : ""}${ti.weight || "700"} ${ti.size}px ${ti.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ti.text, ti.x, ti.y);
    ctx.restore();
  }

  ctx.restore();
}
