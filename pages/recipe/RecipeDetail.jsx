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
  BookOpen,
  StickyNote,
  X,
  Maximize2
} from "lucide-react";

export default function RecipeDetail() {
  const router = useRouter();
  const { id: recipeId } = router.query;

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // State for full-screen image
  const [isImageOpen, setIsImageOpen] = useState(false);

  const defaultImage = "/defualt_img.png";
  const oldUnsplashImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

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

    if (window.confirm('האם את בטוחה שברצונך למחוק את המתכון הזה?')) {
      setDeleting(true);
      try {
        await deleteDoc(doc(db, "recipes", recipeId));
        router.push('/AllRecipes');
      } catch (err) {
        console.error("שגיאה במחיקת המתכון:", err);
        alert("אירעה שגיאה במחיקה");
        setDeleting(false);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: recipe.name,
          text: recipe.description || recipe.name,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('הקישור הועתק ללוח!');
    }
  };

  const getDisplayImage = () => {
    if (!recipe?.imageUrl) return defaultImage;
    if (recipe.imageUrl === oldUnsplashImage) return defaultImage;
    if (recipe.imageUrl.includes("images.unsplash.com/photo-1546069901")) return defaultImage;
    return recipe.imageUrl;
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">המתכון לא נמצא</h2>
          <button
            onClick={() => router.push('/AllRecipes')}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors shadow-sm"
          >
            חזור לכל המתכונים
          </button>
        </div>
      </div>
    );
  }

  const iconButtonClass =
    "p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-95 flex items-center justify-center";

  return (
    <div className="min-h-screen bg-white pb-24 text-right" dir="rtl">

      {/* === Fullscreen Image Modal === */}
      {isImageOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsImageOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageOpen(false);
            }}
          >
            <X className="w-8 h-8" />
          </button>

          <img
            src={getDisplayImage()}
            alt={recipe.name}
            className="max-w-full max-h-[90vh] object-contain rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* === Hero Image === */}
      <div
        className="relative h-72 sm:h-96 group overflow-hidden cursor-zoom-in"
        onClick={() => setIsImageOpen(true)}
      >
        <img
          src={getDisplayImage()}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => (e.target.src = defaultImage)}
        />

        {/* Gradient overlay – must NOT block clicks */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Zoom icon hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white">
            <Maximize2 className="w-8 h-8" />
          </div>
        </div>

        {/* Top buttons */}
        <div
          className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => router.back()}
            className={`${iconButtonClass} text-gray-700`}
            title="חזור"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className={`${iconButtonClass} text-gray-700`}
              title="שתף"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push(`/EditRecipe?id=${recipeId}`)}
              className={`${iconButtonClass} text-blue-600 hover:text-blue-700 hover:bg-blue-50`}
              title="ערוך מתכון"
            >
              <Pencil className="w-5 h-5" />
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`${iconButtonClass} text-red-500 hover:text-red-600 hover:bg-red-50`}
              title="מחק מתכון"
            >
              {deleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Title + info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30 pointer-events-none">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg text-right leading-tight">
            {recipe.name}
          </h1>

          <div className="flex items-center gap-4 text-white/90 text-sm font-medium pointer-events-auto">
            <span className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-md">
              <Clock className="w-4 h-4" />
              {recipe.created_date
                ? format(new Date(recipe.created_date), "dd/MM/yyyy")
                : "-"}
            </span>

            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                מקור המתכון
              </a>
            )}
          </div>
        </div>
      </div>

      {/* === Content === */}
      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-start">
            {recipe.tags.map((tag, i) => (
              <Badge
                key={i}
                className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 px-3 py-1 text-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {recipe.description && (
          <div className="text-gray-600 text-lg leading-relaxed text-right">
            {recipe.description}
          </div>
        )}

        {/* Creation info */}
        <div className="text-gray-500 text-sm border-b border-gray-100 pb-4">
          <p>
            נוסף בתאריך:{" "}
            {recipe.created_date
              ? new Date(recipe.created_date).toLocaleDateString("he-IL")
              : "-"}
          </p>

          {recipe.createdBy && (
            <p>
              הועלה על ידי: <strong>{recipe.createdBy}</strong>
            </p>
          )}
        </div>

        {/* Ingredients */}
        {recipe.ingredients && (
          <section className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3 border-b border-amber-200 pb-2">
              <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center text-amber-800">
                <BookOpen className="w-5 h-5" />
              </div>
              מרכיבים
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients
                .split("\n")
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-right leading-relaxed font-medium">
                      {line}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* Method */}
        {recipe.method && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-5 text-right border-b border-gray-100 pb-2">
              אופן ההכנה
            </h2>
            <div className="space-y-6">
              {recipe.method
                .split("\n")
                .filter(Boolean)
                .map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 pt-1 leading-relaxed text-right text-lg">
                      {step}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {recipe.notes && (
          <section className="bg-yellow-50 border-r-4 border-yellow-400 rounded-lg p-5 mt-8 shadow-sm">
            <h2 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              הערות אישיות
            </h2>
            <p className="text-yellow-900/90 whitespace-pre-line leading-relaxed text-right">
              {recipe.notes}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
