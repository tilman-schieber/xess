// scripts/generate-icons.js
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/icons/icon.svg');
const svgBuffer = readFileSync(svgPath);

const targets = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const { size, name } of targets) {
  const outPath = resolve(__dirname, '../public/icons/', name);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`Generated ${name} (${size}x${size})`);
}
