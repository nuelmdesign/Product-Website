import sharp from 'sharp';
import { stat } from 'node:fs/promises';
// The shader uploads the hero via new Image(), bypassing next/image entirely.
// A 2.5MB PNG there would wreck LCP, so ship a downscaled JPEG for that use.
await sharp('public/images/pavilion-exterior-dusk.png')
  .resize(1600, null, { withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/images/derived/hero-texture.jpg');
console.log('hero-texture.jpg', Math.round((await stat('public/images/derived/hero-texture.jpg')).size/1024) + 'KB');
