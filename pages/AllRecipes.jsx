import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getRecipes, getTags } from '@/firebaseService';
import RecipeCard from '@/components/Recipes/RecipeCard';
import SearchAndFilter from '@/components/Recipes/SearchAndFilter';
import { Loader2 } from "lucide-react";
import CsvExportImport from '@/components/Recipes/CsvExportImport';
import { Scale } from "lucide-react";

export default function AllRecipes() {
  const router = useRouter();
  
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); 
  const [sortOrder, setSortOrder] = useState('newest');

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [recentRecipes, setRecentRecipes] = useState([]);

  useEffect(() => {
    const savedRecent = localStorage.getItem('inys_recent_recipes');
    if (savedRecent && recipes.length > 0) {
      const recentIds = JSON.parse(savedRecent);
      
      const orderedRecent = recentIds
        .map(id => recipes.find(r => r.id === id))
        .filter(Boolean);
        
      setRecentRecipes(orderedRecent);
    }
  }, [recipes, loading]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('inys_starred_recipes');
    if (savedFavorites) {
      try {
        setFavoriteIds(JSON.parse(savedFavorites));
      } catch(e) {
        console.error("Error parsing favorites", e);
      }
    }
  }, []);

  const toggleFavorite = (recipeId) => {
    let updatedFavorites;
    if (favoriteIds.includes(recipeId)) {
      updatedFavorites = favoriteIds.filter(id => id !== recipeId);
    } else {
      updatedFavorites = [...favoriteIds, recipeId];
    }
    setFavoriteIds(updatedFavorites);
    localStorage.setItem('inys_starred_recipes', JSON.stringify(updatedFavorites));
  };

  useEffect(() => {
    if (router.isReady) {
      if (router.query.tag) {
        setSelectedTags([router.query.tag]);
      } else {
        const savedQuery = sessionStorage.getItem('searchQuery');
        const savedTags = sessionStorage.getItem('selectedTags');
        const savedSort = sessionStorage.getItem('sortOrder');

        if (savedQuery) setSearchQuery(savedQuery);
        if (savedSort) setSortOrder(savedSort);
        if (savedTags) {
          try {
            setSelectedTags(JSON.parse(savedTags));
          } catch (e) {
            console.error("Error parsing tags from sessionStorage", e);
          }
        }
      }
    }
  }, [router.isReady, router.query.tag]);

  useEffect(() => {
    sessionStorage.setItem('searchQuery', searchQuery);
    sessionStorage.setItem('selectedTags', JSON.stringify(selectedTags));
    sessionStorage.setItem('sortOrder', sortOrder);
  }, [searchQuery, selectedTags, sortOrder]);

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
    const handleRouteChangeStart = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router]);

  useEffect(() => {
    if (!loading && filteredRecipes.length > 0) {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition, 10),
            behavior: 'instant' 
          });
          sessionStorage.removeItem('scrollPosition');
        }, 50); 
      }
    }
  }, [loading, filteredRecipes.length]);

  useEffect(() => {
    let result = [...recipes];

    if (showFavoritesOnly) {
      result = result.filter(recipe => favoriteIds.includes(recipe.id));
    }

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
  }, [searchQuery, selectedTags, sortOrder, recipes, showFavoritesOnly, favoriteIds]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-right" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-b from-amber-100 via-amber-50 to-white sticky top-0 z-40 border-b border-amber-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative flex-shrink-0 drop-shadow-md">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight drop-shadow-sm">
                המתכונים שלי
              </h1>
            </div>

            <button 
              onClick={() => router.push('/Conversions')}
              className="bg-white/80 hover:bg-white p-2.5 rounded-full shadow-sm border border-amber-200 text-amber-600 transition-all hover:scale-105 active:scale-95"
              title="טבלת המרות"
            >
              <Scale className="w-6 h-6" />
            </button>

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
          
          <div className="flex justify-start"> 
            <CsvExportImport recipes={recipes} onImportComplete={fetchData} />
          </div>

          {recentRecipes.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-500 pr-1">נצפו לאחרונה</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory mask-image">
              {recentRecipes.map(recipe => (
                <div 
                  key={`recent-${recipe.id}`} 
                  onClick={() => router.push(`/recipe/${recipe.id}`)}
                  className="w-28 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm cursor-pointer active:scale-95 transition-all snap-start"
                >
                  <div className="h-16 w-full rounded-xl bg-gray-100 overflow-hidden mb-1.5">
                    <img 
                      src={recipe.imageUrl?.split(',')[0].trim() || recipe.imageUrls?.[0] || '/defualt_img.jpg'} 
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xs font-bold text-gray-700 line-clamp-1 text-center">
                    {recipe.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
          
          <div className="flex justify-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm mx-auto max-w-xs">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all ${!showFavoritesOnly ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-amber-50'}`}
          >
            כל המתכונים
          </button>
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 ${showFavoritesOnly ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-amber-50'}`}
          >
            {showFavoritesOnly ? '⭐' : '☆'} מועדפים
          </button>
        </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map(recipe => (
                <RecipeCard
                key={recipe.id}
                recipe={recipe} 
                isFavorite={favoriteIds.includes(recipe.id)}
                onToggleFavorite={toggleFavorite}
              />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500">לא נמצאו מתכונים תואמים</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                    router.push('/AllRecipes', undefined, { shallow: true });
                  }}
                  className="mt-2 text-amber-600 hover:underline text-sm"
                >
                  נקה סינון
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }