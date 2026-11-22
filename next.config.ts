import type { NextConfig } from "next";

// Firebase Authentication serves its sign-in handler from <project>.firebaseapp.com. Proxying it
// under our own domain lets NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN be jituptn.com, so Google's sign-in
// screens show our domain instead of the firebaseapp.com one. Nothing changes until that variable
// is switched.
const FIREBASE_AUTH_HANDLER_ORIGIN =
  process.env.FIREBASE_AUTH_HANDLER_ORIGIN || "https://jitu-ptn-main-auth.firebaseapp.com";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  experimental: {
    agentUpgrade: "security",
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
      beforeFiles: [
        { source: "/__/auth/:path*", destination: `${FIREBASE_AUTH_HANDLER_ORIGIN}/__/auth/:path*` },
        { source: "/__/firebase/:path*", destination: `${FIREBASE_AUTH_HANDLER_ORIGIN}/__/firebase/:path*` },
      ],
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
