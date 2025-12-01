import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Grid3X3, Plus, Link2, PenLine } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
  const location = useLocation();
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
          <Link 
            to={createPageUrl("AllRecipes")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('AllRecipes') ? 'text-amber-600' : 'text-gray-500'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">כל המתכונים</span>
          </Link>

          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setAddMenuOpen(true)}
              className="absolute -top-6 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-7 h-7 text-white" />
            </button>
          </div>

          <Link 
            to={createPageUrl("Categories")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('Categories') ? 'text-amber-600' : 'text-gray-500'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">קטגוריות</span>
          </Link>
        </div>
      </nav>

      <Sheet open={addMenuOpen} onOpenChange={setAddMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center">הוספת מתכון</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-4 pb-4">
            <Link
              to={createPageUrl("AddRecipe")}
              onClick={() => setAddMenuOpen(false)}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                <PenLine className="w-7 h-7 text-amber-600" />
              </div>
              <span className="font-medium text-gray-800">הזנה ידנית</span>
              <span className="text-xs text-gray-500 mt-1">כתוב מתכון חדש</span>
            </Link>
            
            <Link
              to={createPageUrl("AddRecipe") + "?mode=import"}
              onClick={() => setAddMenuOpen(false)}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                <Link2 className="w-7 h-7 text-orange-500" />
              </div>
              <span className="font-medium text-gray-800">ייבוא מקישור</span>
              <span className="text-xs text-gray-500 mt-1">העתק מהאינטרנט</span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}