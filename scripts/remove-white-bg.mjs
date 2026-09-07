/**
 * remove-white-bg.mjs
 * Flood-fills white background from all 4 edges → transparent PNG.
 * Keeps internal whites (e.g., product highlights) intact.
 */
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import path from 'path';

const INPUT_DIR  = 'D:/store/public/collections';
const THRESHOLD  = 230; // pixels above this RGB value (all 3 channels) are "white"

const FILES = [
  'textiles_sm1.jpg',
  'textiles_sm2.jpg',
  'textiles_sm3.jpg',
  'textiles_sm4.jpg',
  'leather_sm1.jpg',
  'leather_sm2.jpg',
  'leather_sm3.jpg',
  'leather_sm4.jpg',
  'metalcraft_sm1.jpg',
  'metalcraft_sm2.jpg',
  'metalcraft_sm3.jpg',
  'metalcraft_sm4.jpg',
  'homedecor_sm1.jpg',
  'homedecor_sm2.jpg',
];

async function removeWhiteBg(filename) {
  const inputPath  = path.join(INPUT_DIR, filename);
  const outputPath = path.join(INPUT_DIR, filename.replace(/\.jpg$/i, '.png'));

  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const px = new Uint8Array(data.buffer);

  const isWhite = (idx4) => {
    return px[idx4]     > THRESHOLD &&
           px[idx4 + 1] > THRESHOLD &&
           px[idx4 + 2] > THRESHOLD;
  };

  // ── BFS flood fill from all 4 edges ────────────────────────────────────
  const visited = new Uint8Array(width * height);
  // Use a typed-array ring buffer instead of array.shift() for O(n) performance
  const queueBuf = new Int32Array(width * height * 2);
  let qHead = 0, qTail = 0;

  const enqueue = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const flat = y * width + x;
    if (visited[flat]) return;
    if (!isWhite(flat * 4)) return;
    visited[flat] = 1;
    queueBuf[qTail++] = x;
    queueBuf[qTail++] = y;
  };

  // Seed from top + bottom rows
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  // Seed from left + right columns
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  // BFS
  while (qHead < qTail) {
    const x = queueBuf[qHead++];
    const y = queueBuf[qHead++];
    px[y * width * 4 + x * 4 + 3] = 0; // alpha → 0 (transparent)
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  await sharp(Buffer.from(px), { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);

  process.stdout.write(`  ✓  ${filename} → ${path.basename(outputPath)}\n`);
}

console.log('\n🖼  Removing white backgrounds...\n');
for (const f of FILES) {
  await removeWhiteBg(f);
}
console.log('\n✅  All done! PNG files saved to public/collections/\n');
