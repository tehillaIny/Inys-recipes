import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ התיקון החכם:
  // אם אנחנו ב-Vercel (יש משתנה סביבה כזה) -> תהיה שרת רגיל (undefined) כדי שה-API יעבוד.
  // אחרת (במחשב שלך כשאת בונה לאנדרואיד) -> תעשה export לקבצים סטטיים.
  output: process.env.VERCEL ? undefined : 'export',

  images: {
    unoptimized: true,
  },
};

export default nextConfig;