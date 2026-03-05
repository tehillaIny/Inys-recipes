import React from 'react';
import { Flame, Fish, Droplet, Cookie, IceCream, Pizza, Croissant, Soup, Leaf, Carrot, Coffee, UtensilsCrossed } from "lucide-react";

export const getCategoryInfo = (tagName) => {
  const t = (tagName || '').toLowerCase();
  
  if (t.includes('בשר') || t.includes('בקר') || t.includes('טחון') || t.includes('אסאדו') || t.includes('עוף') || t.includes('שניצל') || t.includes('פרגית') || t.includes('חזה')) 
    return { Icon: Flame, badge: 'bg-red-50 text-red-700 border-red-200', card: 'bg-gradient-to-br from-rose-50 to-red-100 border-red-200 text-red-800' };
    
  if (t.includes('דג') || t.includes('סלמון') || t.includes('אמנון') || t.includes('מושט')) 
    return { Icon: Fish, badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', card: 'bg-gradient-to-br from-cyan-50 to-blue-100 border-cyan-200 text-cyan-800' };
    
  if (t.includes('חלבי') || t.includes('גבינ') || t.includes('חמאה') || t.includes('שמנת') || t.includes('מוקרם')) 
    return { Icon: Droplet, badge: 'bg-blue-50 text-blue-700 border-blue-200', card: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 text-blue-800' };
    
  if (t.includes('עוגה') || t.includes('עוגות') || t.includes('מאפינס') || t.includes('בראוניז') || t.includes('פאי') || t.includes('עוגיות') || t.includes('ביסקוויט') || t.includes('אלפחורס')) 
    return { Icon: Cookie, badge: 'bg-pink-50 text-pink-700 border-pink-200', card: 'bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200 text-pink-800' };
    
  if (t.includes('גליד') || t.includes('ארטיק') || t.includes('סורבה') || t.includes('קינוח') || t.includes('מתוק') || t.includes('שוקולד') || t.includes('ממתק')) 
    return { Icon: IceCream, badge: 'bg-purple-50 text-purple-700 border-purple-200', card: 'bg-gradient-to-br from-fuchsia-50 to-purple-100 border-fuchsia-200 text-fuchsia-800' };

  if (t.includes('פשטיד') || t.includes('קיש') || t.includes('פיצה')) 
    return { Icon: Pizza, badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', card: 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200 text-yellow-800' };
      
  if (t.includes('לחם') || t.includes('חלה') || t.includes('פיתה') || t.includes('מאפ') || t.includes('בצק')) 
    return { Icon: Croissant, badge: 'bg-orange-50 text-orange-700 border-orange-200', card: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-800' };

  if (t.includes('מרק') || t.includes('נזיד') || t.includes('חמין')) 
    return { Icon: Soup, badge: 'bg-amber-50 text-amber-700 border-amber-200', card: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 text-amber-800' };
      
  if (t.includes('סלט')) 
    return { Icon: Leaf, badge: 'bg-lime-50 text-lime-700 border-lime-200', card: 'bg-gradient-to-br from-lime-50 to-green-100 border-lime-200 text-lime-800' };
      
  if (t.includes('ירק') || t.includes('טבעוני') || t.includes('בריא') || t.includes('תוספת')) 
    return { Icon: Carrot, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', card: 'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200 text-emerald-800' };

  if (t.includes('בוקר') || t.includes('ביצי') || t.includes('חבית') || t.includes('שקשוקה') || t.includes('שתי') || t.includes('קפה') || t.includes('משקה')) 
    return { Icon: Coffee, badge: 'bg-stone-50 text-stone-700 border-stone-200', card: 'bg-gradient-to-br from-stone-50 to-neutral-200 border-stone-200 text-stone-800' };

  // ברירת מחדל
  return { Icon: UtensilsCrossed, badge: 'bg-gray-50 text-gray-700 border-gray-200', card: 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 text-gray-700' };
};