/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const beUrl = process.env.BE_URL ?? "http://localhost:3001"
    return [
      {
        source: "/api/be/:path*",
        destination: `${beUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
