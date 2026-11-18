import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Tuition banner images are hosted on Unsplash (see public/data.json);
    // tutor avatars come from DiceBear (see public/data.json tutorAvatar).
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async redirects() {
    return [
      // Legacy routes → new spec routes
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/register", destination: "/sign-up", permanent: true },
      {
        source: "/update-profile",
        destination: "/dashboard/profile",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
