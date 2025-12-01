import React from 'react';
import BottomNav from '@/components/ui/BottomNav';

export default function Layout({ children }) {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        :root {
          --font-sans: 'Heebo', 'Inter', system-ui, sans-serif;
        }
        
        body {
          font-family: var(--font-sans);
        }
        
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* RTL fixes */
        input, textarea {
          text-align: right;
        }
        
        input[dir="ltr"], textarea[dir="ltr"] {
          text-align: left;
        }
      `}</style>
      
      <main className="pb-20">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}