import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecipes, getTags } from '@/firebaseService';
import RecipeCard from '@/components/Recipes/RecipeCard';
import SearchAndFilter from '@/components/Recipes/SearchAndFilter';
import { Plus, Loader2 } from "lucide-react";
import CsvExportImport from '@/components/Recipes/CsvExportImport';

export default function AllRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); 
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesData, tagsData] = await Promise.all([
        getRecipes(),
        getTags()
      ]);
      
      setRecipes(recipesData);
      setFilteredRecipes(recipesData);
      setAllTags(tagsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...recipes];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(recipe => 
        recipe.name?.toLowerCase().includes(lowerQuery) ||
        recipe.description?.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter(recipe => 
        selectedTags.every(tag => recipe.tags?.includes(tag))
      );
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.created_date || 0) - new Date(a.created_date || 0);
        case 'oldest':
          return new Date(a.created_date || 0) - new Date(b.created_date || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    setFilteredRecipes(result);
  }, [searchQuery, selectedTags, sortOrder, recipes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 relative flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">המתכונים שלי</h1>
          </div>

          <SearchAndFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        <CsvExportImport recipes={recipes} onImportComplete={fetchData} />

        {/* השינוי כאן: grid-cols-2 במקום grid-cols-1 */}
        <div className="grid grid-cols-2 gap-4">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500">לא נמצאו מתכונים תואמים</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags([]);
                }}
                className="mt-2 text-amber-600 hover:underline text-sm"
              >
                נקה סינון
              </button>
            </div>
          )}
        </div>
      </main>

      <Link 
        href="/AddRecipe"
        className="fixed bottom-24 left-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50"
      >
        <Plus className="w-8 h-8" />
      </Link>
    </div>
  );
}