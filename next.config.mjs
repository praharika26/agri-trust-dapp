/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Basic fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };
    
    // Ignore problematic test dependencies and modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'tap': false,
      'tape': false,
      'desm': false,
      'fastbench': false,
      'pino-elasticsearch': false,
      'why-is-node-running': false,
    };
    
    // Add module rules to exclude test and benchmark files
    config.module.rules.push(
      {
        test: /node_modules.*\/test\/.*\.(js|mjs|ts|tsx)$/,
        use: 'null-loader'
      },
      {
        test: /node_modules.*\/bench\.(js|mjs|ts|tsx)$/,
        use: 'null-loader'
      },
      {
        test: /node_modules.*\.test\.(js|mjs|ts|tsx)$/,
        use: 'null-loader'
      }
    );
    
    // Comprehensive ignore patterns
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(tap|tape|desm|fastbench|pino-elasticsearch)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\.test\.(js|mjs|ts|tsx)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /bench\.js$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /create-and-exit\.js$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /close-on-gc\.js$/,
      })
    );
    
    return config;
  },
}

export default nextConfig
