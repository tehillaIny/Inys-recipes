import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addRecipe, addTag } from '@/firebaseService';
import RecipeForm from '@/components/Recipes/RecipeForm';
import ImportFromUrl from '@/components/Recipes/ImportFromUrl';
import { ChevronRight, Link as LinkIcon, PenLine } from "lucide-react";

export default function AddRecipe() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('manual'); 
  const [initialData, setInitialData] = useState(null); // זיכרון לשמירת המתכון שיובא

  useEffect(() => {
    if (router.isReady && router.query.mode === 'import') {
      setMode('import');
    }
  }, [router.isReady, router.query.mode]);

  const handleSave = async (formData: any) => {
    setSaving(true);
    try {
      if (formData.tags && formData.tags.length > 0) {
        for (const tag of formData.tags) {
          await addTag(tag);
        }
      }
      await addRecipe(formData);
      router.replace('/AllRecipes');
    } catch (error) {
      console.error("Failed to add recipe:", error);
      alert("שגיאה בהוספת המתכון");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 text-right" dir="rtl">
      
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-xl text-gray-900">הוספת מתכון חדש</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6 mt-2">
        
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
           <button
             onClick={() => setMode('manual')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
               mode === 'manual' 
                 ? 'bg-amber-500 text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50'
             }`}
           >
             <PenLine className="w-4 h-4" />
             הזנה ידנית
           </button>
           <button
             onClick={() => setMode('import')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
               mode === 'import' 
                 ? 'bg-amber-500 text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50'
             }`}
           >
             <LinkIcon className="w-4 h-4" />
             ייבוא מקישור
           </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          {mode === 'manual' ? (
            <RecipeForm
              recipe={initialData} 
              onSave={handleSave}
              onCancel={() => router.back()}
              isLoading={saving}
            />
          ) : (
            <ImportFromUrl 
              onImport={(data: any) => {
                setInitialData(data);
                setMode('manual'); 
              }}
              onCancel={() => setMode('manual')}
            />
          )}
        </div>
        
      </main>
    </div>
  );
}