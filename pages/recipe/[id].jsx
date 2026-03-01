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
  Images,
  ListChecks, 
  CheckCircle2, 
  Circle,
  Calculator // נוסף אייקון למחשבון (למרות שכפתורי המכפלות יעשו את העבודה)
} from "lucide-react";

export default function RecipePage() {
  const router = useRouter();
  const { id: recipeId } = router.query;

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- סטייט למצב צ'קליסט ---
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  // --- סטייט למחשבון כמויות (מכפיל) ---
  const [scaleFactor, setScaleFactor] = useState(1);

  const defaultImage = "/defualt_img.jpg";
  const oldUnsplashImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

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
        router.replace('/AllRecipes');
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

  // --- פונקציות תיוג צ'קליסט ---
  const toggleIngredient = (index) => {
    const newSet = new Set(checkedIngredients);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setCheckedIngredients(newSet);
  };

  const toggleStep = (index) => {
    const newSet = new Set(checkedSteps);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setCheckedSteps(newSet);
  };

  // --- פונקציה חכמה להכפלת כמויות במצרכים ---
  const scaleIngredient = (line, scale) => {
    if (scale === 1) return line;

    let replaced = false; // מוודא שנכפיל רק את המספר הראשון בשורה כדי לא להרוס (למשל "תבנית 24")
    
    return line.replace(/(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)/, (match) => {
      if (replaced) return match;
      replaced = true;

      let num = 0;
      // זיהוי שברים (כמו 1/2 או 1 1/2)
      if (match.includes('/')) {
        const parts = match.trim().split(/\s+/);
        if (parts.length === 2) {
          const [whole, frac] = parts;
          const [n, d] = frac.split('/');
          num = parseInt(whole) + parseInt(n) / parseInt(d);
        } else {
          const [n, d] = match.split('/');
          num = parseInt(n) / parseInt(d);
        }
      } else {
        // זיהוי מספר רגיל או עשרוני
        num = parseFloat(match);
      }

      const scaledNum = num * scale;
      
      // המרה חזרה למספר יפה או שבר
      const formatNumber = (n) => {
        if (Number.isInteger(n)) return n.toString();
        
        const whole = Math.floor(n);
        const fraction = n - whole;
        const f = Math.round(fraction * 100) / 100; // עיגול קל
        
        let fracStr = '';
        if (f === 0.5) fracStr = '1/2';
        else if (f === 0.25) fracStr = '1/4';
        else if (f === 0.75) fracStr = '3/4';
        else if (f === 0.33) fracStr = '1/3';
        else if (f === 0.67) fracStr = '2/3';
        else fracStr = f.toString().substring(1); // במקרה של שבר לא מוכר, יציג .x
        
        if (whole === 0) return fracStr;
        if (fracStr.includes('/')) return `${whole} ${fracStr}`;
        return `${whole}${fracStr}`;
      };

      return formatNumber(scaledNum);
    });
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
  allImages = allImages.filter(Boolean);

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

      {/* === מודל מסך מלא עם דפדוף === */}
      {isImageOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsImageOpen(false)}
        >
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

      {/* === הדר התמונה (הקרוסלה הראשית) === */}
      <div className="relative h-72 sm:h-96 group overflow-hidden bg-gray-100">
        
        <div className="absolute inset-0 cursor-zoom-in z-10" onClick={() => setIsImageOpen(true)}>
          <img
            src={allImages.length > 0 ? getDisplayImage(allImages[currentImageIndex]) : defaultImage}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-500"
            onError={(e) => (e.target.src = defaultImage)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>

        {allImages.length > 1 && (
           <div className="absolute inset-0 pointer-events-none z-20">
             <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                תמונה {currentImageIndex + 1} מתוך {allImages.length}
             </div>
             <button onClick={prevImage} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto bg-white/90 hover:bg-white text-amber-600 p-3 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 border border-amber-100">
               <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
             </button>
             <button onClick={nextImage} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-auto bg-white/90 hover:bg-white text-amber-600 p-3 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 border border-amber-100">
               <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
             </button>
             <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-amber-400 w-5' : 'bg-white/50 w-1.5'}`} />
                ))}
             </div>
           </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 pointer-events-none">
          <button
            onClick={() => router.push('/AllRecipes')}
            className={`${iconButtonClass} pointer-events-auto text-gray-700`}
            title="חזור לכל המתכונים"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex gap-3 pointer-events-auto">
            {/* כפתור מצב צ'קליסט */}
            <button
              onClick={() => setIsChecklistMode(!isChecklistMode)}
              className={`${iconButtonClass} ${isChecklistMode ? 'text-amber-600 bg-amber-50 border-amber-200 ring-2 ring-amber-400/20' : 'text-gray-700'}`}
              title="מצב צ'קליסט"
            >
              <ListChecks className="w-5 h-5" />
            </button>

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
              {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

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

        {/* בר התרעה כשמצב צ'קליסט דלוק */}
        {isChecklistMode && (
          <div className="bg-amber-100 text-amber-800 p-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <ListChecks className="w-5 h-5" />
            מצב צ'קליסט פעיל - לחצי על שורות כדי לסמן אותן
          </div>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-start">
            {recipe.tags.map((tag, i) => (
              <Badge key={i} className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 px-3 py-1 text-sm">
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
            {recipe.created_date ? new Date(recipe.created_date).toLocaleDateString("he-IL") : "-"}
          </p>
          {recipe.createdBy && (
            <p>הועלה על ידי: <strong>{recipe.createdBy}</strong></p>
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

        {/* Ingredients */}
        {recipe.ingredients && (
          <section className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
            
            {/* כותרת ומחשבון כמויות */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 pb-4 mb-5 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center text-amber-800 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                מרכיבים
              </h2>
              
              {/* כפתורי הכפלת כמויות */}
              <div className="flex items-center gap-1 bg-white/60 p-1.5 rounded-lg border border-amber-200 shadow-sm self-start">
                 {[0.5, 1, 2, 3].map(scale => (
                   <button 
                     key={scale}
                     onClick={() => setScaleFactor(scale)}
                     className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${scaleFactor === scale ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-100'}`}
                     title={scale === 1 ? 'כמות מקורית' : `הכפל פי ${scale}`}
                   >
                     {scale === 1 ? 'רגיל' : `x${scale}`}
                   </button>
                 ))}
              </div>
            </div>

            <ul className="space-y-3">
              {recipe.ingredients.split("\n").filter(Boolean).map((line, i) => {
                const isChecked = checkedIngredients.has(i);
                // שליחה לפונקציית המכפיל אם המשתמש בחר להכפיל או לחלק
                const scaledLine = scaleFactor === 1 ? line : scaleIngredient(line, scaleFactor);

                return (
                  <li 
                    key={i} 
                    onClick={() => isChecklistMode && toggleIngredient(i)}
                    className={`flex items-start gap-3 transition-all duration-200 ${isChecklistMode ? 'cursor-pointer hover:bg-amber-100/50 p-2 -mx-2 rounded-lg' : ''}`}
                  >
                    {isChecklistMode ? (
                      <div className="mt-1 flex-shrink-0 transition-transform active:scale-75">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    ) : (
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                    )}
                    
                    <span className={`text-right leading-relaxed font-medium transition-all duration-200 ${
                      isChecklistMode && isChecked ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      {scaledLine}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Method */}
        {recipe.method && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-5 text-right border-b border-gray-100 pb-2">
              אופן ההכנה
            </h2>
            <div className="space-y-4">
              {recipe.method.split("\n").filter(Boolean).map((step, i) => {
                const isChecked = checkedSteps.has(i);
                return (
                  <div 
                    key={i} 
                    onClick={() => isChecklistMode && toggleStep(i)}
                    className={`flex gap-4 group transition-all duration-200 ${isChecklistMode ? 'cursor-pointer hover:bg-gray-50 p-3 -mx-3 rounded-xl border border-transparent hover:border-gray-100' : ''} ${isChecked && isChecklistMode ? 'opacity-50' : ''}`}
                  >
                    {isChecklistMode ? (
                      <div className="mt-1.5 flex-shrink-0 transition-transform active:scale-75">
                        {isChecked ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                    )}
                    
                    <p className={`text-gray-700 pt-1 leading-relaxed text-right text-lg transition-all duration-200 ${
                      isChecklistMode && isChecked ? 'line-through' : ''
                    }`}>
                      {step}
                    </p>
                  </div>
                );
              })}
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