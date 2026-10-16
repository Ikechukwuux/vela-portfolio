/**
 * Pure-Node PNG generator — no external dependencies.
 * Renders a Merlot square with a clean "V" letterform in Seafoam White.
 * Uses a hand-crafted bezier "V" geometry so no font rendering is needed.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Colour constants ──────────────────────────────────────────────────────────
const MERLOT   = { r: 0x58, g: 0x11, b: 0x1A };
const SEAFOAM  = { r: 0xF7, g: 0xF9, b: 0xFA };

// ── PNG writer ────────────────────────────────────────────────────────────────
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t   = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function makePng(pixels, w, h) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0; // 8-bit RGB

  // Build raw scanlines (filter byte 0 per row)
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0; // filter None
    for (let x = 0; x < w; x++) {
      const pi = (y * w + x) * 3;
      const ri = y * (1 + w * 3) + 1 + x * 3;
      raw[ri]   = pixels[pi];
      raw[ri+1] = pixels[pi+1];
      raw[ri+2] = pixels[pi+2];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Pixel renderer ────────────────────────────────────────────────────────────
/**
 * Render a "V" monogram at given size.
 * The "V" is defined as two thick diagonal strokes meeting at a bottom point.
 */
function renderV(size) {
  const pixels = Buffer.alloc(size * size * 3);

  // Fill background with Merlot
  for (let i = 0; i < size * size; i++) {
    pixels[i*3]   = MERLOT.r;
    pixels[i*3+1] = MERLOT.g;
    pixels[i*3+2] = MERLOT.b;
  }

  // V geometry — defined as two line segments, anti-aliased
  // Coordinates are in normalised 0-1 space
  const pad   = 0.185;  // horizontal padding from edge
  const top   = 0.175;  // top y of V serifs
  const bot   = 0.820;  // bottom y of V point
  const mid   = 0.500;  // x of bottom point

  // Left stroke: top-left → bottom-centre
  const lx0 = pad,       ly0 = top;
  const lx1 = mid,       ly1 = bot;
  // Right stroke: top-right → bottom-centre
  const rx0 = 1 - pad,   ry0 = top;
  const rx1 = mid,       ry1 = bot;

  // Stroke half-width in normalised space (thicker at top, thinner at bottom — Cormorant feel)
  // We use a single stroke width for simplicity
  const strokeW = size * 0.085; // ~8.5% of canvas width

  function distToSegment(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const lenSq = dx*dx + dy*dy;
    let t = ((px - x0)*dx + (py - y0)*dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const nx = x0 + t*dx, ny = y0 + t*dy;
    return Math.hypot(px - nx, py - ny);
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Normalise to canvas coords
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;

      // Distance to left and right strokes (in pixels)
      const dL = distToSegment(nx, ny, lx0, ly0, lx1, ly1) * size;
      const dR = distToSegment(nx, ny, rx0, ry0, rx1, ry1) * size;
      const d  = Math.min(dL, dR);

      // Anti-alias band: 1.2px
      const alpha = Math.max(0, Math.min(1, (strokeW - d + 0.6) / 1.2));

      if (alpha > 0) {
        const i = (y * size + x) * 3;
        pixels[i]   = Math.round(MERLOT.r + (SEAFOAM.r - MERLOT.r) * alpha);
        pixels[i+1] = Math.round(MERLOT.g + (SEAFOAM.g - MERLOT.g) * alpha);
        pixels[i+2] = Math.round(MERLOT.b + (SEAFOAM.b - MERLOT.b) * alpha);
      }
    }
  }

  return pixels;
}

// ── Generate ──────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'assets');

[
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
].forEach(({ name, size }) => {
  const pixels = renderV(size);
  const png    = makePng(pixels, size, size);
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`✓ Generated ${name} (${size}×${size})`);
});
