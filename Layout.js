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
      
      {/* הלוגו - קבוע בפינה הימנית העליונה */}
      {/* מושך את הקובץ מתוך תיקיית public/logo.png */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none select-none">
        <img 
          src="/logo.png" 
          alt="Iny's Recipes Logo" 
          className="w-24 h-24 object-contain drop-shadow-md" 
        />
      </div>

      <main className="pb-20">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}