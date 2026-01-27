import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
/*module.exports = {
  output: 'export',
};*/


export default nextConfig;

