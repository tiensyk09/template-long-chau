/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable image optimization for static export (use <img> tags directly)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
