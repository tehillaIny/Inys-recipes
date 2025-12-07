// pages/recipe/[id].jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/Badge";
import {
  ChevronRight,
  Pencil,
  Trash2,
  Clock,
  ExternalLink,
  Loader2,
  Share2,
  BookOpen
} from "lucide-react";

export default function RecipeDetail() {
  const router = useRouter();
  const { id: recipeId } = router.query;

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!recipeId) return;

    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "recipes", recipeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() });
        } else {
          setRecipe(null);
        }
      } catch (err) {
        console.error("שגיאה בטעינת המתכון:", err);
        setRecipe(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleDelete = async () => {
    if (!recipeId) return;

    const confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את המתכון "${recipe.name}"? פעולה זו אינה ניתנת לביטול.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "recipes", recipeId));
      router.push('/AllRecipes');
    } catch (err) {
      console.error("שגיאה במחיקת המתכון:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && recipe) {
      await navigator.share({
        title: recipe.name,
        text: recipe.description || recipe.name,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">המתכון לא נמצא</h2>
          <button
            onClick={() => router.push('/AllRecipes')}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition"
          >
            חזור לכל המתכונים
          </button>
        </div>
      </div>
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-white pb-24 text-right" dir="rtl">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96">
        <img 
          src={recipe.imageUrl || defaultImage}
          alt={recipe.name}
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = defaultImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded"
            onClick={() => router.back()}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded"
              onClick={() => router.push(`/EditRecipe?id=${recipeId}`)}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded text-red-500 hover:text-red-600 flex items-center"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-right">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {recipe.name}
          </h1>
          <div className="flex items-center gap-4 text-white/80 text-sm justify-end">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.created_date ? format(new Date(recipe.created_date), 'dd/MM/yyyy') : '-'}
            </span>
            {recipe.sourceUrl && (
              <a 
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                מקור
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 text-right">
        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {recipe.tags.map((tag, i) => (
              <Badge 
                key={i}
                className="bg-amber-100 text-amber-800 hover:bg-amber-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 text-lg leading-relaxed text-right">
            {recipe.description}
          </p>
        )}

        {/* Ingredients */}
        {recipe.ingredients && (
          <section className="bg-amber-50 rounded-2xl p-5" dir="rtl">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex flex-row-reverse items-center gap-2 justify-end text-right">
              <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-amber-700" />
              </div>
              מרכיבים
            </h2>

            <div className="space-y-2">
              {recipe.ingredients.split('\n').filter(Boolean).map((line, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3"
                  style={{ direction: "rtl" }}
                >
                  {/* נקודה מימין */}
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" style={{ order: 0 }} />
                  {/* טקסט */}
                  <span className="text-gray-700 text-right w-full" style={{ order: 1 }}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Method */}
        {recipe.method && (
          <section className="text-right" dir="rtl">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex flex-row-reverse justify-end text-right">
              אופן הכנה
            </h2>

            <div className="space-y-4">
              {recipe.method.split('\n').filter(Boolean).map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4"
                  style={{ direction: "rtl" }}
                >
                  {/* מספר מימין */}
                  <div
                    className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500
                              rounded-full flex items-center justify-center
                              text-white font-bold text-sm flex-shrink-0"
                    style={{ order: 0 }}
                  >
                    {i + 1}
                  </div>
                  {/* טקסט */}
                  <p className="text-gray-700 leading-relaxed text-right w-full" style={{ order: 1 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}