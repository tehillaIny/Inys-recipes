import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function MethodSteps({ method, isChecklistMode, startTimer }) {
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  const toggleStep = (index) => {
    const newSet = new Set(checkedSteps);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setCheckedSteps(newSet);
  };

  const renderStepWithTimers = (stepText) => {
    const regex = /(^|[^א-ת])([משהוכלב]?-?)?(\d{1,3}\s*(?:דקות|דק'|שעות|שעה)|חצי שעה|שעה וחצי|שעתיים|שעה)(?=[^א-ת]|$)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(stepText)) !== null) {
      const prefix1 = match[1] || ''; 
      const prefix2 = match[2] || ''; 
      const timeText = match[3]; 
      const matchIndex = match.index + prefix1.length + prefix2.length;

      if (matchIndex > lastIndex) parts.push(stepText.substring(lastIndex, matchIndex));

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

  if (!method) return null;

  return (
    <section className="text-right" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-5 border-b border-gray-100 pb-2">אופן ההכנה</h2>
      <div className="space-y-4">
        {(() => {
          let stepCounter = 0; 
          return method.split("\n").map(l => l.trim()).filter(Boolean).map((step, i) => {
            const isHeading = step.endsWith(':');
            
            if (isHeading) {
              return (
                <div key={`heading-${i}`} className="mt-6 mb-3 first:mt-0">
                  <h3 className="text-lg font-bold text-amber-700 bg-amber-50/50 inline-block px-3 py-1 rounded-lg border border-amber-100/50">{step}</h3>
                </div>
              );
            }

            stepCounter++; 
            const isChecked = checkedSteps.has(i);
            
            return (
              <div key={i} onClick={() => isChecklistMode && toggleStep(i)} className={`flex gap-4 group transition-all duration-200 ${isChecklistMode ? 'cursor-pointer hover:bg-gray-50 p-3 -mx-3 rounded-xl border border-transparent hover:border-gray-100' : ''} ${isChecked && isChecklistMode ? 'opacity-50' : ''}`}>
                {isChecklistMode ? (
                  <div className="mt-1.5 flex-shrink-0 transition-transform active:scale-75">
                    {isChecked ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                    {stepCounter}
                  </div>
                )}
                <p className={`text-gray-700 pt-1 leading-relaxed text-lg transition-all duration-200 ${isChecklistMode && isChecked ? 'line-through' : ''}`}>
                  {renderStepWithTimers(step)}
                </p>
              </div>
            );
          });
        })()}
      </div>
    </section>
  );
}