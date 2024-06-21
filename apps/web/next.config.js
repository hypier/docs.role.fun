const withMDX = require("@next/mdx")();
const withPWA = require("next-pwa")({
  dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  images: {
    domains: ['d.byte.im','r.byte.im'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d.byte.im",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "r.byte.im",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/crystals",
        permanent: true,
      },

      {
        source: "/content-rules",
        destination: "/safety",
        permanent: true,
      },
    ];
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

module.exports = withPWA(withMDX(nextConfig));
