import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTags, addTag, deleteTag } from '@/firebaseService';
import { ChevronRight, Loader2, Search, Settings2, Trash2, Plus } from "lucide-react";
import { getCategoryInfo } from '@/utils/categoryHelper';

export default function Categories() {
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const loadTags = async () => {
    setLoading(true);
    const data = await getTags();
    setTags(data);
    setLoading(false);
  };

  useEffect(() => { loadTags(); }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await addTag(newCategory.trim());
      setNewCategory("");
      loadTags();
    } catch (err) { console.error(err); }
  };

  const handleDeleteCategory = async (e, tagId) => {
    e.stopPropagation();
    if(window.confirm('האם את בטוחה שברצונך למחוק את הקטגוריה הזו?')) {
       await deleteTag(tagId);
       loadTags();
    }
  };

  const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 text-right" dir="rtl">
      <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] pt-6 pb-4">
        <div className="max-w-lg mx-auto px-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 -mr-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600"><ChevronRight className="w-6 h-6" /></button>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">קטגוריות</h1>
            </div>
            <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              <Settings2 className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="חיפוש קטגוריה..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-3.5 pl-12 pr-5 bg-gray-50 border border-gray-100 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white text-sm font-medium transition-all text-right" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        {filteredTags.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredTags.map(tag => {
              const { Icon, card } = getCategoryInfo(tag.name);
              return (
                <div key={tag.id} onClick={() => !isEditing && router.push(`/AllRecipes?tag=${encodeURIComponent(tag.name)}`)} className={`relative overflow-hidden group rounded-3xl p-5 border ${card} shadow-sm transition-all duration-300 ${!isEditing ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}>
                  {isEditing && (
                    <button onClick={(e) => handleDeleteCategory(e, tag.id)} className="absolute top-2 left-2 p-2 bg-white/80 hover:bg-red-50 text-red-500 rounded-full shadow-sm transition-colors z-20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="absolute -left-4 -top-4 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform duration-500"><Icon className="w-24 h-24" /></div>
                  <div className="flex flex-col items-center text-center gap-3 relative z-10 mt-2">
                    <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm"><Icon className="w-8 h-8 opacity-80" /></div>
                    <span className="font-bold text-lg">{tag.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center"><Search className="w-8 h-8 text-gray-300 mb-2" /><p className="text-gray-500">לא נמצאו קטגוריות</p></div>
        )}

        {isEditing && (
          <form onSubmit={handleAddCategory} className="mt-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-2">
            <input type="text" placeholder="שם קטגוריה חדשה..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 bg-gray-50 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 border border-transparent" />
            <button type="submit" disabled={!newCategory.trim()} className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white p-3 rounded-2xl transition-colors"><Plus className="w-6 h-6" /></button>
          </form>
        )}
      </main>
    </div>
  );
}