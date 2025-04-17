/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
    ],
  },
  // Middleware configuration
  experimental: {
    middleware: {
      // Set the runtime for middleware to nodejs
      runtime: "nodejs",
    },
  },
};

export default nextConfig;
