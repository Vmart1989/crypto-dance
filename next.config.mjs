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
    }
  };
  
  export default nextConfig;
  