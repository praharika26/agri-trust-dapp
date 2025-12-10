/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    loaders: {
      // Ignore test and non-code files
      ".test.ts": ["ignore-loader"],
      ".test.tsx": ["ignore-loader"],
      ".test.js": ["ignore-loader"],
      "LICENSE": ["ignore-loader"],
      ".md": ["ignore-loader"],
      ".zip": ["ignore-loader"],
      ".yml": ["ignore-loader"],
      ".yaml": ["ignore-loader"],
      ".sh": ["ignore-loader"],
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
}

export default nextConfig
