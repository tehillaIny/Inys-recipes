import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RecipeForm from '@/components/recipes/RecipeForm';
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditRecipe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');
  const [saving, setSaving] = useState(false);

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const recipes = await base44.entities.Recipe.filter({ id: recipeId });
      return recipes[0];
    },
    enabled: !!recipeId,
  });

  const handleSave = async (formData) => {
    setSaving(true);
    
    // Create new tags if needed
    const existingTags = await base44.entities.Tag.list();
    const existingTagNames = existingTags.map(t => t.name);
    
    for (const tagName of formData.tags || []) {
      if (!existingTagNames.includes(tagName)) {
        await base44.entities.Tag.create({ name: tagName });
      }
    }
    
    await base44.entities.Recipe.update(recipeId, formData);
    queryClient.invalidateQueries(['recipes']);
    queryClient.invalidateQueries(['recipe', recipeId]);
    setSaving(false);
    navigate(createPageUrl("RecipeDetail") + `?id=${recipeId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">המתכון לא נמצא</h2>
          <Button onClick={() => navigate(createPageUrl("AllRecipes"))}>
            חזור לכל המתכונים
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-gray-600"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">עריכת מתכון</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <RecipeForm
            recipe={recipe}
            onSave={handleSave}
            onCancel={() => navigate(-1)}
            isLoading={saving}
          />
        </div>
      </main>
    </div>
  );
}