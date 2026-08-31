import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/conference/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/#about",
        permanent: true,
      },
      {
        source: "/about-us/",
        destination: "/#about",
        permanent: true,
      },
      {
        source: "/schedule",
        destination: "/#program",
        permanent: true,
      },
      {
        source: "/schedule/",
        destination: "/#program",
        permanent: true,
      },
    ];
  },
  async headers() {
    const baseline = securityHeaders();
    return [
      {
        source: "/:path*",
        headers: baseline,
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/auth/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
