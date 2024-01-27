const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
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
      {
        protocol: "https",
        hostname: "r2.openroleplay.ai",
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
        source: "/star",
        destination:
          "https://github.com/open-roleplay-ai/openroleplay.ai/stargazers",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/open-roleplay-ai/openroleplay.ai",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/bM5zzMEtdW",
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

module.exports = withMDX(nextConfig);
