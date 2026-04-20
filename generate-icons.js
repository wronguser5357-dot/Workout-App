#!/usr/bin/env node
// Generates PNG app icons — no external dependencies (pure Node.js + built-in zlib).
// Run from the project root: node generate-icons.js

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── PNG encoder ─────────────────────────────────────────────────────────────

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t   = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function encodePNG(width, height, rgbPixels) {
  // Build raw scanlines: filter byte (0x00 = None) + RGB rows
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 3)] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const base = y * (1 + width * 3) + 1 + x * 3;
      const src  = (y * width + x) * 3;
      raw[base]     = rgbPixels[src];
      raw[base + 1] = rgbPixels[src + 1];
      raw[base + 2] = rgbPixels[src + 2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type: RGB
  // compression, filter, interlace all 0

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing helpers ──────────────────────────────────────────────────────────

function makeCanvas(size, bgR, bgG, bgB) {
  const buf = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    buf[i * 3]     = bgR;
    buf[i * 3 + 1] = bgG;
    buf[i * 3 + 2] = bgB;
  }
  return buf;
}

function setPixel(buf, size, x, y, r, g, b) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 3;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
}

function fillRect(buf, size, x1, y1, x2, y2, r, g, b) {
  for (let y = Math.ceil(y1); y <= Math.floor(y2); y++)
    for (let x = Math.ceil(x1); x <= Math.floor(x2); x++)
      setPixel(buf, size, x, y, r, g, b);
}

function fillRoundRect(buf, size, x1, y1, x2, y2, radius, r, g, b) {
  for (let y = Math.ceil(y1); y <= Math.floor(y2); y++) {
    for (let x = Math.ceil(x1); x <= Math.floor(x2); x++) {
      let inside = true;
      if (x < x1 + radius && y < y1 + radius) inside = Math.hypot(x - (x1 + radius), y - (y1 + radius)) <= radius;
      else if (x > x2 - radius && y < y1 + radius) inside = Math.hypot(x - (x2 - radius), y - (y1 + radius)) <= radius;
      else if (x < x1 + radius && y > y2 - radius) inside = Math.hypot(x - (x1 + radius), y - (y2 - radius)) <= radius;
      else if (x > x2 - radius && y > y2 - radius) inside = Math.hypot(x - (x2 - radius), y - (y2 - radius)) <= radius;
      if (inside) setPixel(buf, size, x, y, r, g, b);
    }
  }
}

// ── Icon artwork ─────────────────────────────────────────────────────────────
// All coordinates are defined in a 512×512 reference space then scaled.

function drawIcon(size) {
  // Background: #478dff
  const buf = makeCanvas(size, 71, 141, 255);
  const sc  = size / 512; // scale factor

  function p(n) { return n * sc; }

  const W = 255, GG = 255, B = 255; // white

  // Barbell side view:
  //   plates  (tallest)  at edges
  //   collars (medium)   inboard of plates
  //   bar     (thinnest) connecting collars

  // Bar
  fillRect(buf, size, p(152), p(236), p(360), p(276), W, GG, B);

  // Left collar
  fillRect(buf, size, p(110), p(190), p(152), p(322), W, GG, B);
  // Right collar
  fillRect(buf, size, p(360), p(190), p(402), p(322), W, GG, B);

  // Left plate
  fillRoundRect(buf, size, p(66), p(148), p(110), p(364), p(8 * sc), W, GG, B);
  // Right plate
  fillRoundRect(buf, size, p(402), p(148), p(446), p(364), p(8 * sc), W, GG, B);

  return buf;
}

// ── Generate files ───────────────────────────────────────────────────────────

const OUT = path.join(__dirname, 'src', 'assets', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const targets = [
  { file: 'icon-192.png',        size: 192 },
  { file: 'icon-512.png',        size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of targets) {
  const pixels = drawIcon(size);
  const png    = encodePNG(size, size, pixels);
  fs.writeFileSync(path.join(OUT, file), png);
  console.log(`✓  ${file}  (${size}×${size})`);
}

console.log('\nIcons written to src/assets/icons/');
