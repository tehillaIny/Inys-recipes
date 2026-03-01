// not user anymmore, but keeping for reference

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/Badge";

import {
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Clock,
  ExternalLink,
  Loader2,
  Share2,
  BookOpen,
  StickyNote,
  X,
  Maximize2,
  Images
} from "lucide-react";

export default function RecipeDetail() {
  const router = useRouter();
  const { id: recipeId } = router.query;

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const defaultImage = "/defualt_img.jpg";
  const oldUnsplashImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

  // מאזין למתכון בזמן אמת (פותר את הבעיה אחרי עריכה)
  useEffect(() => {
    if (!recipeId) return;
    setIsLoading(true);

    const unsubscribe = onSnapshot(doc(db, "recipes", recipeId), (docSnap) => {
      if (docSnap.exists()) {
        setRecipe({ id: docSnap.id, ...docSnap.data() });
      } else {
        setRecipe(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("שגיאה בטעינת המתכון:", error);
      setRecipe(null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [recipeId]);

  const handleDelete = async () => {
    if (!recipeId) return;
    if (window.confirm('האם את בטוחה שברצונך למחוק את המתכון הזה?')) {
      setDeleting(true);
      try {
        await deleteDoc(doc(db, "recipes", recipeId));
        router.replace('/AllRecipes'); // החלפה נקייה בעת מחיקה
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

  const getDisplayImage = (url) => {
    if (!url) return defaultImage;
    if (url === oldUnsplashImage) return defaultImage;
    if (url.includes("images.unsplash.com/photo-1546069901")) return defaultImage;
    return url;
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
            onClick={() => router.replace('/AllRecipes')}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors shadow-sm"
          >
            חזור לכל המתכונים
          </button>
        </div>
      </div>
    );
  }

  // חילוץ חכם של התמונות - מטפל גם במקרה שהן נשמרו כטקסט מופרד בפסיקים (באקסל)
  let allImages = [];
  if (recipe?.imageUrls && Array.isArray(recipe.imageUrls) && recipe.imageUrls.length > 0) {
    allImages = recipe.imageUrls;
  } else if (recipe?.imageUrl) {
    if (recipe.imageUrl.includes(',')) {
      allImages = recipe.imageUrl.split(',').map(s => s.trim());
    } else {
      allImages = [recipe.imageUrl];
    }
  }
  // מנקה כפילויות וכתובות ריקות
  allImages = [...new Set(allImages.filter(Boolean))];

  // פונקציות דפדוף (מונעות פתיחה בטעות של התמונה למסך מלא כשלוחצים עליהן)
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const iconButtonClass = "p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-95 flex items-center justify-center";

  return (
    <div className="min-h-screen bg-white pb-24 text-right" dir="rtl">

      {/* === מודל מסך מלא עם דפדוף (Z-Index גבוה במיוחד) === */}
      {isImageOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsImageOpen(false)}
        >
          {/* כפתור סגירה */}
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer z-[110]"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageOpen(false);
            }}
          >
            <X className="w-8 h-8" />
          </button>

          {allImages.length > 1 && (
            <>
              {/* חצי דפדוף גדולים במסך מלא */}
              <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-10 pointer-events-none z-[105]">
                 <button onClick={prevImage} className="bg-white/10 hover:bg-white/30 text-white p-3 sm:p-4 rounded-full pointer-events-auto transition-transform hover:scale-110">
                   <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12" />
                 </button>
                 <button onClick={nextImage} className="bg-white/10 hover:bg-white/30 text-white p-3 sm:p-4 rounded-full pointer-events-auto transition-transform hover:scale-110">
                   <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12" />
                 </button>
              </div>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium bg-black/70 px-4 py-2 rounded-full z-[105]">
                {currentImageIndex + 1} מתוך {allImages.length}
              </div>
            </>
          )}

          <img
            src={getDisplayImage(allImages[currentImageIndex])}
            alt={`תמונה ${currentImageIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-md relative z-[100]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* === הדר התמונה (הקרוסלה הראשית) מופרד לשכבות === */}
      <div className="relative h-72 sm:h-96 group overflow-hidden bg-gray-100">
        
        {/* שכבה 1: התמונה עצמה (לחיצה עליה מגדילה) */}
        <div 
          className="absolute inset-0 cursor-zoom-in z-10"
          onClick={() => setIsImageOpen(true)}
        >
          <img
            src={allImages.length > 0 ? getDisplayImage(allImages[currentImageIndex]) : defaultImage}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-500"
            onError={(e) => (e.target.src = defaultImage)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white">
              <Maximize2 className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* שכבה 2: חצי דפדוף (רק אם יש יותר מתמונה אחת) */}
        {allImages.length > 1 && (
           <div className="absolute inset-0 pointer-events-none z-20">
             {/* כיתוב תמונות עליון */}
             <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                תמונה {currentImageIndex + 1} מתוך {allImages.length}
             </div>

             {/* חץ ימינה */}
             <button 
               onClick={prevImage} 
               className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto bg-white/90 hover:bg-white text-amber-600 p-3 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 border border-amber-100"
             >
               <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
             </button>
             
             {/* חץ שמאלה */}
             <button 
               onClick={nextImage} 
               className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-auto bg-white/90 hover:bg-white text-amber-600 p-3 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 border border-amber-100"
             >
               <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
             </button>
             
             {/* נקודות למטה */}
             <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-amber-400 w-5' : 'bg-white/50 w-1.5'}`} 
                  />
                ))}
             </div>
           </div>
        )}

        {/* שכבה 3: כפתורים עליונים (חזור, שיתוף, עריכה, מחיקה) */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 pointer-events-none">
          {/* כפתור חזור שתמיד לוקח לעמוד הראשי בלחיצה אחת! */}
          <button
            onClick={() => router.push('/AllRecipes')}
            className={`${iconButtonClass} pointer-events-auto text-gray-700`}
            title="חזור לכל המתכונים"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex gap-3 pointer-events-auto">
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

        {/* שכבה 4: טקסט כותרת */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30 pointer-events-none">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg text-right leading-tight">
            {recipe.name}
          </h1>

          <div className="flex items-center gap-4 text-white/90 text-sm font-medium pointer-events-auto">
            <span className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-md">
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
                className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                מקור המתכון
              </a>
            )}
          </div>
        </div>
      </div>

      {/* === תוכן המתכון === */}
      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">

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

        {recipe.description && (
          <div className="text-gray-600 text-lg leading-relaxed text-right">
            {recipe.description}
          </div>
        )}

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

        {allImages.length > 1 && (
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Images className="w-5 h-5 text-amber-500" />
               כל התמונות
            </h2>
            <div className="flex flex-wrap gap-3 pb-4">
              {allImages.map((imgUrl, i) => (
                <div 
                  key={i} 
                  className={`w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-sm cursor-pointer group relative border-2 transition-colors ${i === currentImageIndex ? 'border-amber-400' : 'border-gray-100'}`}
                  onClick={() => { setCurrentImageIndex(i); setIsImageOpen(true); }}
                >
                  <img
                    src={getDisplayImage(imgUrl)}
                    alt={`${recipe.name} - ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => (e.target.src = defaultImage)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}

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