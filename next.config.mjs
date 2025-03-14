/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "admin.cryptodance.app"
          }
        ],
        destination: "/admin/login"
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
