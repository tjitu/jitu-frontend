import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  experimental: {
    optimizePackageImports: ["lucide-react", "chart.js", "react-chartjs-2", "katex"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return {
      // Run this proxy only after Next.js has tried every local route handler,
      // including dynamic handlers such as /api/proxy/tryout/[id].
      fallback: [
        {
          source: "/api/proxy/:path*",
          destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
