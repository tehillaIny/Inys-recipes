import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { updateRecipe, addTag } from '@/firebaseService';
import RecipeForm from '@/components/Recipes/RecipeForm';
import { Loader2, ChevronRight } from "lucide-react";

export default function EditRecipe() {
  const router = useRouter();
  const { id } = router.query; 
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (formData.tags && formData.tags.length > 0) {
        for (const tag of formData.tags) {
          await addTag(tag);
        }
      }

      await updateRecipe(id, formData);
      
      // התיקון לבעיית הלחיצה הכפולה על "חזור"! 
      // במקום לדחוף שוב את עמוד המתכון ולהעמיס על ההיסטוריה, פשוט חוזרים צעד אחד אחורה.
      router.back();
      
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