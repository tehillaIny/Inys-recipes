import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { BookOpen, Grid3X3, Plus, Link2, PenLine, Camera } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const isActive = (path) => router.pathname.includes(path);

  const navigate = (path) => {
    setAddMenuOpen(false);
    router.push(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
          <button
            onClick={() => navigate("/AllRecipes")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/AllRecipes') ? 'text-amber-600' : 'text-gray-500'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">כל המתכונים</span>
          </button>

          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setAddMenuOpen(true)}
              className="absolute -top-6 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-7 h-7 text-white" />
            </button>
          </div>

          <button
            onClick={() => navigate("/Categories")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/Categories') ? 'text-amber-600' : 'text-gray-500'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">קטגוריות</span>
          </button>
        </div>
      </nav>

      {/* התפריט הקופץ */}
      {addMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setAddMenuOpen(false)}>
          {/* התיקון כאן: הוספנו pb-24 כדי לדחוף את הכפתורים אל מעל פס הניווט התחתון! */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 pb-24 grid grid-cols-3 gap-2">
            
            <button
              onClick={() => navigate("/AddRecipe")}
              className="flex flex-col items-center justify-center py-4 px-1 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-2 group-hover:shadow-md transition-shadow shrink-0">
                <PenLine className="w-6 h-6 text-amber-600" />
              </div>
              <span className="font-bold text-gray-800 text-[11px] sm:text-sm text-center leading-tight">הזנה<br/>ידנית</span>
            </button>
            
            <button
              onClick={() => navigate("/AddRecipe?mode=import")}
              className="flex flex-col items-center justify-center py-4 px-1 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-2 group-hover:shadow-md transition-shadow shrink-0">
                <Link2 className="w-6 h-6 text-orange-500" />
              </div>
              <span className="font-bold text-gray-800 text-[11px] sm:text-sm text-center leading-tight">ייבוא<br/>מקישור</span>
            </button>

            <button
              onClick={() => navigate("/AddRecipe?mode=image")}
              className="flex flex-col items-center justify-center py-4 px-1 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-2 group-hover:shadow-md transition-shadow shrink-0">
                <Camera className="w-6 h-6 text-amber-500" />
              </div>
              <span className="font-bold text-gray-800 text-[11px] sm:text-sm text-center leading-tight">ייבוא<br/>מתמונה</span>
            </button>

          </div>
        </div>
      )}
    </>
  );
}