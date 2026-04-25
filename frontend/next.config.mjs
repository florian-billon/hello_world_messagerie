/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.43"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
