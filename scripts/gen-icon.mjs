/* Generates public/icons/icon-512.png (leaf app icon) with pure Node — no deps. */
import zlib from "node:zlib";
import fs from "node:fs";

const S = 512;

/* ---------- tiny PNG encoder ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function savePng(path, w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path, png);
}

/* ---------- draw ---------- */
const px = Buffer.alloc(S * S * 4);
const BG = [18, 22, 30, 255]; // #12161E
const GREEN = [32, 201, 138];
const cx0 = S / 2, cy0 = S / 2;

// leaf: intersection of two offset circles (vesica), rotated
const LEAF_A = 0.34, R = 0.26;
const masked = new Uint8Array(S * S);
const minX = [];
for (let y = 0; y < S; y++) {
  let first = -1, last = -1;
  for (let x = 0; x < S; x++) {
    const dx = (x - cx0) / S, dy = (y - cy0) / S;
    const rx = dx * Math.cos(-0.6) - dy * Math.sin(-0.6);
    const ry = dx * Math.sin(-0.6) + dy * Math.cos(-0.6);
    const in1 = (rx + LEAF_A) * (rx + LEAF_A) + ry * ry <= R * R;
    const in2 = (rx - LEAF_A) * (rx - LEAF_A) + ry * ry <= R * R;
    if (in1 && in2) {
      masked[y * S + x] = 1;
      if (first < 0) first = x;
      last = x;
    }
  }
  minX[y] = [first, last];
}

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    let c = BG;
    // soft green ambient glow behind the leaf
    const dx = (x - cx0) / S, dy = (y - cy0) / S;
    const d = Math.hypot(dx, dy);
    const glow = Math.max(0, 1 - d / 0.46) ** 2 * 0.35;
    c = [
      Math.round(BG[0] + (GREEN[0] - BG[0]) * glow * 0.55),
      Math.round(BG[1] + (GREEN[1] - BG[1]) * glow * 0.55),
      Math.round(BG[2] + (GREEN[2] - BG[2]) * glow * 0.55),
      255,
    ];
    if (masked[y * S + x]) {
      // vertical shading across the leaf width for a gentle gradient
      const [f, l] = minX[y];
      const t = (x - f) / Math.max(1, l - f);
      const shade = 0.72 + 0.28 * Math.abs(t - 0.5) * 2;
      c = [GREEN[0] * shade, GREEN[1] * shade, GREEN[2] * shade, 255];
      // midrib vein in dark
      const rx = dx * Math.cos(-0.6) - dy * Math.sin(-0.6);
      const ry = dx * Math.sin(-0.6) + dy * Math.cos(-0.6);
      if (Math.abs(ry + 0.105 * rx + 0.075) < 0.014 && Math.abs(rx) < 0.24) {
        c = [10, 66, 46, 220];
      }
    }
    px[i] = Math.round(c[0]);
    px[i + 1] = Math.round(c[1]);
    px[i + 2] = Math.round(c[2]);
    px[i + 3] = c[3];
  }
}

savePng("public/icons/icon-512.png", S, S, px);
console.log("icon written");
