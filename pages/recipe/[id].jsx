import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/Badge";
import { processIngredientLine } from '@/utils/recipeConversions';
import { getCategoryInfo } from '@/utils/categoryHelper';

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
  Images,
  ListChecks, 
  CheckCircle2, 
  Circle,
  Scale,
  Droplet,
  AlertCircle,
  Play,
  Pause,
  BellRing
} from "lucide-react";

export default function RecipePage() {
  const router = useRouter();
  const { id: recipeId } = router.query;

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  const [scaleFactor, setScaleFactor] = useState(1);
  const [convertMode, setConvertMode] = useState('original'); 

  // --- סטייט לטיימר החכם ---
  const [timer, setTimer] = useState({ active: false, seconds: 0, label: '', isPaused: false });

  const defaultImage = "/defualt_img.jpg";

  useEffect(() => {
    if (!recipeId) return;
    setIsLoading(true);

    const unsubscribe = onSnapshot(doc(db, "recipes", recipeId), (docSnap) => {
      if (docSnap.exists()) setRecipe({ id: docSnap.id, ...docSnap.data() });
      else setRecipe(null);
      setIsLoading(false);
    }, (error) => {
      console.error("שגיאה בטעינת המתכון:", error);
      setRecipe(null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [recipeId]);

  // --- לוגיקת הטיימר ---
  useEffect(() => {
    let interval;
    if (timer.active && !timer.isPaused && timer.seconds > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds <= 1) {
            playAlarm(); // כשהטיימר מגיע לאפס
            return { ...prev, seconds: 0, isPaused: true };
          }
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.active, timer.isPaused, timer.seconds]);

  const playAlarm = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (time) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + time);
        osc.connect(ctx.destination);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.2);
      };
      playBeep(0); playBeep(0.4); playBeep(0.8);
    } catch(e) {}
  };

  const startTimer = (seconds, label) => {
    setTimer({ active: true, seconds, label, isPaused: false });
  };

  const formatTimerDisplay = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // פונקציה שהופכת טקסט זמנים לכפתור לחיץ - עם מנוע משודרג לעברית!
  const renderStepWithTimers = (stepText) => {
    // הנוסחה הזו חכמה: היא מחפשת מספר+זמן או מילים מיוחדות, ומתעלמת מאותיות חיבור (בכלמ"ש)
    const regex = /(^|[^א-ת])([משהוכלב]?-?)?(\d{1,3}\s*(?:דקות|דק'|שעות|שעה)|חצי שעה|שעה וחצי|שעתיים|שעה)(?=[^א-ת]|$)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(stepText)) !== null) {
      const prefix1 = match[1] || ''; // רווח או תחילת שורה
      const prefix2 = match[2] || ''; // אותיות חיבור (ב-, ל-, כ)
      const timeText = match[3]; // הזמן האמיתי
      
      const matchIndex = match.index + prefix1.length + prefix2.length;

      if (matchIndex > lastIndex) {
        parts.push(stepText.substring(lastIndex, matchIndex));
      }

      let seconds = 0;
      if (timeText === 'חצי שעה') seconds = 30 * 60;
      else if (timeText === 'שעה וחצי') seconds = 90 * 60;
      else if (timeText === 'שעתיים') seconds = 120 * 60;
      else if (timeText === 'שעה') seconds = 60 * 60;
      else {
        const numMatch = timeText.match(/(\d+)/);
        const num = numMatch ? parseInt(numMatch[1]) : 0;
        if (timeText.includes('שע')) seconds = num * 3600;
        else seconds = num * 60;
      }

      parts.push(
        <button
          key={match.index}
          onClick={(e) => { e.stopPropagation(); startTimer(seconds, timeText); }}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-1 bg-amber-100 text-amber-800 rounded-lg font-bold shadow-sm hover:bg-amber-200 transition-colors active:scale-95 border border-amber-200"
          title="הפעל טיימר"
        >
          <Clock className="w-3.5 h-3.5" />
          <span dir="rtl">{timeText}</span>
        </button>
      );
      lastIndex = matchIndex + timeText.length;
    }

    if (lastIndex < stepText.length) parts.push(stepText.substring(lastIndex));
    return parts.length > 0 ? parts : stepText;
  };

  const handleDelete = async () => {
    if (!recipeId) return;
    if (window.confirm('האם את בטוחה שברצונך למחוק את המתכון הזה?')) {
      setDeleting(true);
      try {
        await deleteDoc(doc(db, "recipes", recipeId));
        router.replace('/AllRecipes');
      } catch (err) {
        console.error("שגיאה במחיקה:", err);
        setDeleting(false);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && recipe) {
      await navigator.share({ title: recipe.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('הקישור הועתק ללוח!');
    }
  };

  const optimizeImage = (url, width, height, mode = 'fill') => {
    if (!url || !url.includes('cloudinary.com')) return url;
    if (url.includes('/upload/c_')) return url;
    const sizeParam = height ? `w_${width},h_${height}` : `w_${width}`;
    return url.replace('/upload/', `/upload/c_${mode},${sizeParam},q_auto,f_auto/`);
  };

  const getDisplayImage = (url) => (!url || url.includes("1546069901") ? defaultImage : url);

  const toggleIngredient = (index) => {
    const newSet = new Set(checkedIngredients);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setCheckedIngredients(newSet);
  };

  const toggleStep = (index) => {
    const newSet = new Set(checkedSteps);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setCheckedSteps(newSet);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>;
  if (!recipe) return <div className="min-h-screen flex items-center justify-center p-4 text-center"><div><h2 className="text-xl font-bold text-gray-800 mb-4">המתכון לא נמצא</h2><button onClick={() => router.replace('/AllRecipes')} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors shadow-sm">חזור לכל המתכונים</button></div></div>;

  let allImages = (recipe?.imageUrls?.length > 0 ? recipe.imageUrls : (recipe?.imageUrl ? recipe.imageUrl.split(',').map(s=>s.trim()) : [])).filter(Boolean);
  const iconButtonClass = "p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-95 flex items-center justify-center";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 text-right" dir="rtl">

      {/* מודל הטיימר המרחף בתחתית המסך */}
      {timer.active && (
        <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-700/50 flex items-center justify-between z-50 animate-in slide-in-from-bottom-8">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium tracking-wide">{timer.label}</span>
            <span className={`text-3xl font-mono font-black tracking-wider mt-1 ${timer.seconds === 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTimerDisplay(timer.seconds)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 border-r border-gray-700/50 pr-4 ml-1">
            <button 
              onClick={() => setTimer(prev => ({ ...prev, isPaused: !prev.isPaused }))} 
              className={`p-3 rounded-full transition-colors ${timer.seconds === 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {timer.seconds === 0 ? <BellRing className="w-6 h-6 animate-bounce" /> : (timer.isPaused ? <Play className="w-6 h-6 text-green-400 fill-current" /> : <Pause className="w-6 h-6 text-amber-400 fill-current" />)}
            </button>
            <button 
              onClick={() => setTimer({ active: false, seconds: 0, label: '', isPaused: false })} 
              className="p-3 bg-gray-800 rounded-full hover:bg-red-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* תצוגת ההדר */}
      <div className="relative h-72 sm:h-96 group overflow-hidden bg-gray-100">
        <div className="absolute inset-0 z-10"><img src={allImages.length > 0 ? optimizeImage(getDisplayImage(allImages[0]), 800, 600) : defaultImage} alt={recipe.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" /></div>
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 pointer-events-none">
          <button onClick={() => router.push('/AllRecipes')} className={`${iconButtonClass} pointer-events-auto text-gray-700`}><ChevronRight className="w-5 h-5" /></button>
          <div className="flex gap-3 pointer-events-auto">
            <button onClick={() => setIsChecklistMode(!isChecklistMode)} className={`${iconButtonClass} ${isChecklistMode ? 'text-amber-600 bg-amber-50 ring-2 ring-amber-400/20' : 'text-gray-700'}`}><ListChecks className="w-5 h-5" /></button>
            <button onClick={handleShare} className={`${iconButtonClass} text-gray-700`}><Share2 className="w-5 h-5" /></button>
            <button onClick={() => router.push(`/EditRecipe?id=${recipeId}`)} className={`${iconButtonClass} text-blue-600`}><Pencil className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30 pointer-events-none">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg text-right leading-tight">{recipe.name}</h1>
          <div className="flex items-center gap-4 text-white/90 text-sm font-medium pointer-events-auto">
            <span className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-md"><Clock className="w-4 h-4" />{recipe.created_date ? format(new Date(recipe.created_date), "dd/MM/yyyy") : "-"}</span>
            {recipe.sourceUrl && (<a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-md hover:bg-white/20"><ExternalLink className="w-4 h-4" />מקור המתכון</a>)}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        
        {isChecklistMode && (
          <div className="bg-amber-100 text-amber-800 p-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-2 shadow-sm"><ListChecks className="w-5 h-5" /> מצב בישול פעיל - לחצי על שורות כדי לסמן</div>
        )}

        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-start">
            {recipe.tags.map((tag, i) => {
              const { Icon, badge } = getCategoryInfo(tag);
              return (
              <span key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold border shadow-sm ${badge}`}>
                <Icon className="w-4 h-4" />
                {tag}
                </span>
                );
                })}
                </div>
              )}

        {recipe.description && (<div className="text-gray-600 text-lg leading-relaxed text-right">{recipe.description}</div>)}

        {/* מצרכים */}
        {recipe.ingredients && (
          <section className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm transition-all">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 mb-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0"><BookOpen className="w-5 h-5" /></div> מרכיבים
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                   {[0.5, 1, 2, 3].map(scale => (<button key={scale} onClick={() => setScaleFactor(scale)} className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${scaleFactor === scale ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>{scale === 1 ? 'רגיל' : `x${scale}`}</button>))}
                </div>
                <div className="flex items-center gap-1 bg-amber-50/50 p-1.5 rounded-xl border border-amber-100">
                   <button onClick={() => setConvertMode('original')} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${convertMode === 'original' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700'}`}>מקורי</button>
                   <button onClick={() => setConvertMode('grams')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${convertMode === 'grams' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700'}`}><Scale className="w-3.5 h-3.5" /> גרמים</button>
                   <button onClick={() => setConvertMode('volume')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${convertMode === 'volume' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700'}`}><Droplet className="w-3.5 h-3.5" /> כוסות</button>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {recipe.ingredients.split("\n").map(l => l.trim()).filter(Boolean).map((line, i) => {
                const isHeading = line.endsWith(':');
                if (isHeading) return (<div key={`heading-${i}`} className="col-span-full mt-6 mb-2 first:mt-0"><h3 className="text-lg font-bold text-amber-700 bg-amber-50/50 inline-block px-3 py-1 rounded-lg border border-amber-100/50">{line}</h3></div>);
                
                const isChecked = checkedIngredients.has(i);
                const { text: scaledLine, isModified } = processIngredientLine(line, scaleFactor, convertMode);
                
                return (
                  <li key={i} onClick={() => isChecklistMode && toggleIngredient(i)} className={`flex items-start gap-3 transition-all duration-200 ${isChecklistMode ? 'cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl' : ''}`}>
                    {isChecklistMode ? (<div className="mt-1 flex-shrink-0">{isChecked ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}</div>) : (<div className="w-2 h-2 bg-amber-400 rounded-full mt-2.5 flex-shrink-0" />)}
                    <span className={`text-right leading-relaxed font-medium transition-all duration-200 flex items-center flex-wrap ${isChecklistMode && isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {scaleFactor !== 1 && !isModified && (<span title="לא הוכפל אוטומטית" className="inline-flex items-center ml-2 text-orange-400/80"><AlertCircle className="w-4 h-4" /></span>)}
                      {scaledLine}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* אופן ההכנה */}
        {recipe.method && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-5 text-right border-b border-gray-100 pb-2">אופן ההכנה</h2>
            <div className="space-y-4">
              {(() => {
                let stepCounter = 0; 
                return recipe.method.split("\n").map(l => l.trim()).filter(Boolean).map((step, i) => {
                  if (step.endsWith(':')) return (<div key={`heading-${i}`} className="mt-6 mb-3 first:mt-0"><h3 className="text-lg font-bold text-amber-700 bg-amber-50/50 inline-block px-3 py-1 rounded-lg border border-amber-100/50">{step}</h3></div>);
                  
                  stepCounter++; 
                  const isChecked = checkedSteps.has(i);
                  
                  return (
                    <div key={i} onClick={() => isChecklistMode && toggleStep(i)} className={`flex gap-4 group transition-all duration-200 ${isChecklistMode ? 'cursor-pointer hover:bg-gray-50 p-3 -mx-3 rounded-xl border border-transparent hover:border-gray-100' : ''} ${isChecked && isChecklistMode ? 'opacity-50' : ''}`}>
                      {isChecklistMode ? (<div className="mt-1.5 flex-shrink-0 transition-transform active:scale-75">{isChecked ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-300" />}</div>) : (<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">{stepCounter}</div>)}
                      <p className={`text-gray-700 pt-1 leading-relaxed text-right text-lg transition-all duration-200 ${isChecklistMode && isChecked ? 'line-through' : ''}`}>
                        {renderStepWithTimers(step)}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}