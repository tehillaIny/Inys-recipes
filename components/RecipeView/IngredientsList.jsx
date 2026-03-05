import React, { useState } from 'react';
import { BookOpen, Scale, Droplet, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { processIngredientLine } from '@/utils/recipeConversions';

export default function IngredientsList({ ingredients, isChecklistMode }) {
  const [scaleFactor, setScaleFactor] = useState(1);
  const [convertMode, setConvertMode] = useState('original');
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());

  const toggleIngredient = (index) => {
    const newSet = new Set(checkedIngredients);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setCheckedIngredients(newSet);
  };

  if (!ingredients) return null;

  return (
    <section className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm transition-all text-right" dir="rtl">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 mb-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0"><BookOpen className="w-5 h-5" /></div> מרכיבים
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100 w-full sm:w-auto">
             {[0.5, 1, 2, 3].map(scale => (
               <button key={scale} onClick={() => setScaleFactor(scale)} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${scaleFactor === scale ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`} title={scale === 1 ? 'כמות מקורית' : `הכפל פי ${scale}`}>
                 {scale === 1 ? 'רגיל' : `x${scale}`}
               </button>
             ))}
          </div>
          <div className="flex items-center gap-1 bg-amber-50/50 p-1.5 rounded-xl border border-amber-100 w-full sm:w-auto">
             <button onClick={() => setConvertMode('original')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${convertMode === 'original' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-100'}`}>מקורי</button>
             <button onClick={() => setConvertMode('grams')} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${convertMode === 'grams' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-100'}`}><Scale className="w-3.5 h-3.5" /> לגרמים</button>
             <button onClick={() => setConvertMode('volume')} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${convertMode === 'volume' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-100'}`}><Droplet className="w-3.5 h-3.5" /> לכוסות</button>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {ingredients.split("\n").map(l => l.trim()).filter(Boolean).map((line, i) => {
          const isHeading = line.endsWith(':');
          if (isHeading) {
            return (
              <div key={`heading-${i}`} className="col-span-full mt-6 mb-2 first:mt-0">
                <h3 className="text-lg font-bold text-amber-700 bg-amber-50/50 inline-block px-3 py-1 rounded-lg border border-amber-100/50">{line}</h3>
              </div>
            );
          }

          const isChecked = checkedIngredients.has(i);
          const { text: scaledAndConvertedLine, isModified } = processIngredientLine(line, scaleFactor, convertMode);
          const needsWarning = scaleFactor !== 1 && !isModified;

          return (
            <li key={i} onClick={() => isChecklistMode && toggleIngredient(i)} className={`flex items-start gap-3 transition-all duration-200 ${isChecklistMode ? 'cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl' : ''}`}>
              {isChecklistMode ? (
                <div className="mt-1 flex-shrink-0 transition-transform active:scale-75">
                  {isChecked ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                </div>
              ) : (
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2.5 flex-shrink-0" />
              )}
              <span className={`text-right leading-relaxed font-medium transition-all duration-200 flex items-center flex-wrap ${isChecklistMode && isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                {needsWarning && (<span title="לא הוכפל אוטומטית" className="inline-flex items-center ml-2 text-orange-400/80 cursor-help"><AlertCircle className="w-4 h-4" /></span>)}
                {scaledAndConvertedLine}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}