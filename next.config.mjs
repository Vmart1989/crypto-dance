/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

{
    "rewrites": [
      {
        "source": "/:path*",
        "has": [
          {
            "type": "host",
            "value": "admin.cryptodance.app"
          }
        ],
        "destination": "/admin/login"
      }
    ]
  }
