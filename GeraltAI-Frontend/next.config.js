/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  images:{
    domains:['127.0.0.1']
  }
}

module.exports = nextConfig
