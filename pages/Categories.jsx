import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTags, getRecipes } from "@/firebaseService";
import { Loader2, Tag, ChevronLeft, Grid3X3, Sparkles } from "lucide-react";
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

  useEffect(() => {
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

    fetchData();
  }, []);

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">קטגוריות</h1>
              <p className="text-sm text-gray-500">{tags.length} קטגוריות</p>
            </div>
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
                  className="block"
                >
                  {/* החלפתי את ה-Card ב-div עם עיצוב דומה */}
                  <div className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 rounded-xl bg-white shadow-sm">
                    {/* פס צבע עליון */}
                    <div className={`h-2 bg-gradient-to-r ${getTagColor(index)}`} />
                    
                    {/* תוכן הכרטיס */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{tag.name}</h3>
                          <p className="text-sm text-gray-500">
                            {count} {count === 1 ? 'מתכון' : 'מתכונים'}
                          </p>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Popular Tags Section */}
        {tags.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              תגיות פופולריות
            </h2>
            <div className="flex flex-wrap gap-2">
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