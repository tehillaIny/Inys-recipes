import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTags, getRecipes, deleteTag } from "@/firebaseService"; 
import { Loader2, Tag, ChevronLeft, Grid3X3, Sparkles, Trash2, RefreshCw } from "lucide-react"; 
import { Badge } from "@/components/ui/Badge";

const tagColors = [
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-violet-500',
  'from-cyan-400 to-sky-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-pink-500',
];

export default function Categories() {
  const [tags, setTags] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // פונקציית סנכרון (ייבוא מ-firebaseService אם קיימת, אחרת נשתמש בלוגיקה מקומית או נמחק)
  // לצורך הדוגמה השארתי את הכפתור, אבל אם מחקת את הפונקציה אפשר להסיר גם אותו.
  // כרגע הקוד מניח שאין צורך בפונקציה הזו יותר, אבל השארתי את ה-Layout של ההדר.

  const fetchData = async () => {
    try {
      const [tagsData, recipesData] = await Promise.all([
        getTags(),
        getRecipes()
      ]);
      setTags(tagsData);
      setRecipes(recipesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTag = async (e, tagId, tagName) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (confirm(`האם את בטוחה שברצונך למחוק את הקטגוריה "${tagName}"?`)) {
      try {
        await deleteTag(tagId);
        await fetchData(); 
      } catch (error) {
        console.error("Failed to delete tag:", error);
        alert("שגיאה במחיקת הקטגוריה");
      }
    }
  };

  const getRecipeCount = (tagName) => {
    if (!recipes) return 0;
    return recipes.filter(r => r.tags && r.tags.includes(tagName)).length;
  };

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* הוספתי flex-row-reverse כדי שהכותרת תהיה בימין והכפתור (אם יש) בשמאל */}
          <div className="flex items-center justify-between flex-row-reverse">
            
            {/* קבוצת הכותרת - הוספתי flex-row-reverse ויישור לימין */}
            <div className="flex items-center gap-3 flex-row-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-sm">
                <Grid3X3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">קטגוריות</h1>
                <p className="text-sm text-gray-500">{tags.length} קטגוריות</p>
              </div>
            </div>

            {/* כפתור סנכרון (אופציונלי - אם השארת אותו) */}
            {/* אם מחקת אותו, הדיב הזה יישאר ריק או שתוכלי למחוק אותו */}
            <div /> 
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {tags.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              עדיין אין קטגוריות
            </h3>
            <p className="text-gray-500 text-sm">
              הקטגוריות נוצרות אוטומטית כשמוסיפים תגיות למתכונים
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tags.map((tag, index) => {
              const count = getRecipeCount(tag.name);
              return (
                <Link
                  key={tag.id}
                  href={`/AllRecipes?tag=${encodeURIComponent(tag.name)}`}
                  className="block relative group"
                >
                  <div className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <div className={`h-2 bg-gradient-to-r ${getTagColor(index)}`} />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        
                        {/* צד שמאל: החץ */}
                        <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors shrink-0" />

                        {/* צד ימין: הטקסט מיושר לימין עם ריפוד מהכפתור */}
                        <div className="text-right flex-1 pl-2">
                          <h3 className="font-semibold text-gray-800 mb-1 leading-tight">{tag.name}</h3>
                          <p className="text-sm text-gray-500">
                            {count} {count === 1 ? 'מתכון' : 'מתכונים'}
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* כפתור מחיקה - נשאר בפינה השמאלית עליונה */}
                  <button
                    onClick={(e) => handleDeleteTag(e, tag.id, tag.name)}
                    className="absolute top-2 left-2 p-1.5 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all z-10 opacity-0 group-hover:opacity-100 sm:opacity-100"
                    title="מחק קטגוריה"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>
              );
            })}
          </div>
        )}

        {/* Popular Tags Section */}
        {tags.length > 0 && (
          <div className="mt-8">
            {/* כותרת מיושרת לימין */}
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-end gap-2">
              תגיות פופולריות
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h2>
            
            {/* רשימת תגיות מיושרת לימין */}
            <div className="flex flex-wrap gap-2 justify-end">
              {tags
                .map(tag => ({ ...tag, count: getRecipeCount(tag.name) }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map((tag, index) => (
                  <Link
                    key={tag.id}
                    href={`/AllRecipes?tag=${encodeURIComponent(tag.name)}`}
                  >
                    <Badge
                      className={`bg-gradient-to-r ${getTagColor(index)} text-white border-0 px-3 py-1.5 text-sm hover:opacity-90 transition-opacity cursor-pointer`}
                    >
                      {tag.name}
                      <span className="mr-1.5 bg-white/20 rounded-full px-1.5 text-xs">
                        {tag.count}
                      </span>
                    </Badge>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}