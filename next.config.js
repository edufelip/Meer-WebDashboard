/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  },
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080";
    return [
      // Special-case: admin store detail hits the public store endpoint
      {
        source: "/api/dashboard/stores/:id",
        destination: `${apiBase}/stores/:id`
      },
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
