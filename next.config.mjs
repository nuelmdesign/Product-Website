/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Project photography is large and warm-graded; AVIF first, WebP fallback.
    formats: ['image/avif', 'image/webp'],
    // Matches the image schedule in design/asset-brief.md (sheet C.01).
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920, 2560, 3200],
  },
};
export default nextConfig;
