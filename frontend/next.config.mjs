/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopack: {
      root: ".",
    },
  },
};

export default nextConfig;
