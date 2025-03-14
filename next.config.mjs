/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",  // Matches any path under the admin subdomain
        has: [
          {
            type: "host",
            value: "admin.cryptodance.app"
          }
        ],
        destination: "https://cryptodance.app/admin"  // Redirect any path to cryptodance.app/admin
      },
      {
        source: "/",  // Explicitly handle the root of the admin subdomain
        has: [
          {
            type: "host",
            value: "admin.cryptodance.app"
          }
        ],
        destination: "https://cryptodance.app/admin"  // Redirect root to cryptodance.app/admin
      }
    ];
  }
};

export default nextConfig;
