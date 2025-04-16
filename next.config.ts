import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "app.localhost:3000",
            },
          ],
          destination: "/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
