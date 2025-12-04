import React, { useState, useMemo, useEffect } from 'react';
import RecipeCard from '@/components/recipes/RecipeCard';
import SearchAndFilter from '@/components/recipes/SearchAndFilter';
import CsvExportImport from '@/components/recipes/CsvExportImport';
import { Loader2, ChefHat, UtensilsCrossed } from "lucide-react";
import { getRecipes, getTags, addRecipe } from '@/firebaseService';

export default function AllRecipes() {
  // קבלת תגית מה-URL
  const urlParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const tagFromUrl = urlParams?.get('tag') || null;

  // State
  const [recipes, setRecipes] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState(tagFromUrl ? [tagFromUrl] : []);
  const [sortOrder, setSortOrder] = useState('newest');

  // ---------------------- Load Recipes + Tags ----------------------
  async function loadData() {
    setIsLoading(true);
    try {
      const [recipesData, tagsData] = await Promise.all([
        getRecipes(),
        getTags()
      ]);
      setRecipes(recipesData);
      setTags(tagsData);
    } catch (err) {
      console.error("❌ שגיאה בטעינת מתכונים או תגיות:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ---------------------- Filtering + Sorting ----------------------
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.ingredients?.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(r =>
        selectedTags.some(tag => r.tags?.includes(tag))
      );
    }

    // Sort
    switch (sortOrder) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'he'));
        break;
      default:
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return result;
  }, [recipes, searchQuery, selectedTags, sortOrder]);

  // ---------------------- CSV Import Handler ----------------------
  async function handleCsvImport(importedRecipes) {
    console.log("📦 קיבלתי מתכונים מה-CSV:", importedRecipes);

    if (!Array.isArray(importedRecipes)) {
      console.error("❌ importedRecipes לא מערך", importedRecipes);
      return;
    }

    let success = 0;
    let failed = 0;

    for (const recipe of importedRecipes) {
      try {
        await addRecipe({
          name: recipe.name ?? "",
          description: recipe.description ?? "",
          ingredients: recipe.ingredients ?? "",
          method: recipe.method ?? "",
          tags: recipe.tags ?? [],
          created_date: new Date().toISOString(),
          imageUrl: recipe.imageUrl ?? "",
          sourceUrl: recipe.sourceUrl ?? ""
        });
        console.log("✔ נשמר מתכון:", recipe.name);
        success++;
      } catch (err) {
        console.error("❌ שגיאה בשמירת מתכון:", recipe, err);
        failed++;
      }
    }

    console.log(`🏁 ייבוא CSV הסתיים — הצלחות: ${success}, כשלונות: ${failed}`);
    await loadData(); // טוען מחדש את כל המתכונים מה-Firestore
  }

  // ---------------------- Loading Indicator ----------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // ---------------------- Render ----------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">

          <div className="flex items-center justify-between mb-4">
            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">המתכונים שלי</h1>
                <p className="text-xs text-gray-500">{recipes.length} מתכונים</p>
              </div>
            </div>

            {/* CSV Import/Export */}
            <CsvExportImport recipes={recipes} onImport={handleCsvImport} />
          </div>

          {/* FILTER BAR */}
          <SearchAndFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={tags}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {recipes.length === 0 ? 'עדיין אין מתכונים' : 'לא נמצאו מתכונים'}
            </h3>
            <p className="text-gray-500 text-sm">
              {recipes.length === 0
                ? 'הוסף את המתכון הראשון שלך בלחיצה על כפתור ה-+'
                : 'נסה לשנות את החיפוש או הסינון'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
