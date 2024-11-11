import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  webpack(config) {
    config.plugins.push(
      new webpack.ProvidePlugin({
        p5: 'p5', // This makes p5 globally available
      })
    );

    return config;
  },
};

export default nextConfig;


