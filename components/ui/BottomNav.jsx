import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { BookOpen, Grid3X3, Plus, Link2, PenLine } from "lucide-react";

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
            onClick={() => navigate("/all-recipes")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/all-recipes') ? 'text-amber-600' : 'text-gray-500'
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
            onClick={() => navigate("/categories")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/categories') ? 'text-amber-600' : 'text-gray-500'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">קטגוריות</span>
          </button>
        </div>
      </nav>

      {addMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setAddMenuOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/add-recipe")}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                <PenLine className="w-7 h-7 text-amber-600" />
              </div>
              <span className="font-medium text-gray-800">הזנה ידנית</span>
              <span className="text-xs text-gray-500 mt-1">כתוב מתכון חדש</span>
            </button>
            
            <button
              onClick={() => navigate("/add-recipe?mode=import")}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                <Link2 className="w-7 h-7 text-orange-500" />
              </div>
              <span className="font-medium text-gray-800">ייבוא מקישור</span>
              <span className="text-xs text-gray-500 mt-1">העתק מהאינטרנט</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
