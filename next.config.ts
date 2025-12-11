import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // השורה הזו קריטית! היא אומרת לו לייצר קבצים סטטיים
  images: {
    unoptimized: true, // מונע בעיות עם תמונות בגרסה הסטטית
  },
};

export default nextConfig;