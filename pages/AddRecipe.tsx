import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { addRecipe, addTag } from '@/firebaseService';
import RecipeForm from '@/components/Recipes/RecipeForm';
import { ChevronRight } from "lucide-react";

export default function AddRecipe() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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
    <div className="min-h-screen bg-gray-50 pb-20 text-right" dir="rtl">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-900">הוספת מתכון חדש</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <RecipeForm
            recipe={null}
            onSave={handleSave}
            onCancel={() => router.back()}
            isLoading={saving}
          />
        </div>
      </main>
    </div>
  );
}