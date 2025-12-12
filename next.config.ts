import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: 'export',
  images: {
    unoptimized: true,
  },
};
module.exports = {
  output: 'export',
};

export default nextConfig;