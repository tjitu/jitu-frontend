import type { NextConfig } from "next";

// Firebase Authentication serves its sign-in handler from <project>.firebaseapp.com. Proxying it
// under our own domain lets NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN be jituptn.com, so Google's sign-in
// screens show our domain instead of the firebaseapp.com one. Nothing changes until that variable
// is switched.
const FIREBASE_AUTH_HANDLER_ORIGIN =
  process.env.FIREBASE_AUTH_HANDLER_ORIGIN || "https://jitu-ptn-main-auth.firebaseapp.com";

// Content-Security-Policy, shipped as Report-Only first: browsers log violations to the console but
// block nothing, so a missed origin can't break login or payment. Once production browsing shows no
// violations (DevTools console, "[Report Only]"), rename the header key below to
// "Content-Security-Policy" to enforce it.
// 'unsafe-inline' stays for scripts/styles because Next.js emits inline bootstrap scripts and KaTeX
// output uses inline styles; moving to nonces would force every page to render dynamically.
const isDev = process.env.NODE_ENV !== "production";
const backendOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_BACKEND_URL ? new URL(process.env.NEXT_PUBLIC_BACKEND_URL).origin : "";
  } catch {
    return "";
  }
})();

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://app.midtrans.com https://app.sandbox.midtrans.com https://apis.google.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://res.cloudinary.com https://api.dicebear.com https://api.qrserver.com https://*.midtrans.com https://*.veritrans.co.id",
  "font-src 'self' data:",
  `connect-src 'self' ${backendOrigin} https://*.googleapis.com https://*.firebaseapp.com https://*.midtrans.com https://vitals.vercel-insights.com`.replace(/\s+/g, " "),
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.midtrans.com https://*.veritrans.co.id",
  "worker-src 'self' blob:",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.midtrans.com",
  "frame-ancestors 'self'",
].join("; ");

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN (not DENY): Firebase's sign-in iframe is served from our own origin
          // through the /__/auth rewrite below.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy-Report-Only", value: cspDirectives },
        ],
      },
    ];
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
