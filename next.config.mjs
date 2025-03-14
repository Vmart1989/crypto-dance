/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    console.log('Rewrites initiated');
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "admin.cryptodance.app"
          }
        ],
        destination: "cryptodance.app/admin",
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
