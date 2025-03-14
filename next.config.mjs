/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    console.log('Rewrites initiated');
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "admin.cryptodance.app"
          }
        ],
        destination: "/admin/login",
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
