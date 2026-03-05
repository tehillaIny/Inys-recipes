import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTags } from '@/firebaseService';
import { 
  ChevronRight, 
  Loader2, 
  Search, 
  Flame, 
  Droplet, 
  Wheat, 
  Leaf, 
  Utensils, 
  ChefHat
} from "lucide-react";

export default function Categories() {
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTags() {
      const data = await getTags();
      setTags(data);
      setLoading(false);
    }
    loadTags();
  }, []);

  // מנגנון חכם שמצמיד אייקון וצבע רקע לכל קטגוריה לפי המילה שלה
  const getCategoryStyle = (tagName) => {
    const t = tagName.toLowerCase();
    
    if (t.includes('בשר') || t.includes('עוף') || t.includes('שניצל') || t.includes('דג')) 
      return { icon: <Flame className="w-8 h-8 opacity-80" />, color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800' };
    
    if (t.includes('חלבי') || t.includes('גבינ') || t.includes('חלב')) 
      return { icon: <Droplet className="w-8 h-8 opacity-80" />, color: 'bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 text-blue-800' };
    
    if (t.includes('עוג') || t.includes('קינוח') || t.includes('מתוק')) 
      return { icon: <ChefHat className="w-8 h-8 opacity-80" />, color: 'bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200 text-pink-800' };
    
    if (t.includes('סלט') || t.includes('בריא') || t.includes('טבעוני') || t.includes('ירק')) 
      return { icon: <Leaf className="w-8 h-8 opacity-80" />, color: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 text-green-800' };
    
    if (t.includes('לחם') || t.includes('מאפ') || t.includes('בצק') || t.includes('פיצה')) 
      return { icon: <Wheat className="w-8 h-8 opacity-80" />, color: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 text-amber-800' };

    // עיצוב ברירת מחדל
    return { icon: <Utensils className="w-8 h-8 opacity-80" />, color: 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 text-gray-700' };
  };

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 text-right" dir="rtl">
      
      {/* הדר כמו בעמוד הראשי */}
      <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] pt-6 pb-4">
        <div className="max-w-lg mx-auto px-5">
          <div className="flex items-center gap-3 mb-5">
            <button 
              onClick={() => router.back()}
              className="p-2 -mr-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              חיפוש לפי קטגוריות
            </h1>
          </div>

          {/* שורת חיפוש פנימית לקטגוריות */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="איזו קטגוריה בא לך?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3.5 pl-12 pr-5 bg-gray-50 border border-gray-100 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white text-sm font-medium placeholder:text-gray-400 transition-all text-right"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        {filteredTags.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredTags.map(tag => {
              const style = getCategoryStyle(tag.name);
              return (
                <div
                  key={tag.id}
                  onClick={() => router.push(`/AllRecipes?tag=${encodeURIComponent(tag.name)}`)}
                  className={`relative overflow-hidden cursor-pointer group rounded-3xl p-5 border ${style.color} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="absolute -left-4 -top-4 opacity-10 transform -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500">
                    <div className="w-24 h-24">{style.icon}</div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center gap-3 relative z-10 mt-2">
                    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm">
                      {style.icon}
                    </div>
                    <span className="font-bold text-lg">{tag.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">לא נמצאו קטגוריות</h3>
            <p className="text-gray-500 text-sm">נסי לחפש מילה אחרת</p>
          </div>
        )}
      </main>
    </div>
  );
}