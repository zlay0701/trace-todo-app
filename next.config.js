/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // svg-captcha loads a bundled .ttf font via __dirname at runtime.
    // Keep it external so the font path still resolves after bundling.
    serverComponentsExternalPackages: ['svg-captcha'],
  },
}

module.exports = nextConfig