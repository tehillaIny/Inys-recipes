import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { updateRecipe, addTag } from '@/firebaseService';
import RecipeForm from '@/components/Recipes/RecipeForm';
import { Loader2, ChevronRight } from "lucide-react";

export default function EditRecipe() {
  const router = useRouter();
  const { id } = router.query; // קבלת ה-ID מהכתובת
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // טעינת המתכון הקיים
  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("המתכון לא נמצא");
          router.push('/AllRecipes');
        }
      } catch (error) {
        console.error("שגיאה בטעינת המתכון:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, router]);

  // שמירת השינויים
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      // 1. הוספת תגיות חדשות אם יש
      if (formData.tags && formData.tags.length > 0) {
        for (const tag of formData.tags) {
          await addTag(tag);
        }
      }

      // 2. עדכון המתכון
      await updateRecipe(id, formData);
      
      // 3. חזרה לדף המתכון
      router.push(`/recipe/${id}`);
    } catch (error) {
      console.error("Failed to update recipe:", error);
      alert("שגיאה בעדכון המתכון");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-900">עריכת מתכון</h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <RecipeForm
            recipe={recipe}
            onSave={handleSave}
            onCancel={() => router.back()}
            isLoading={saving}
          />
        </div>
      </main>
    </div>
  );
}