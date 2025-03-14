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
            destination: "/admin/:path*"
          }
        ];
      }
    };
    


export default nextConfig;


