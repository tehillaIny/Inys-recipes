// pages/AddRecipe.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { addRecipe, getTags, addTag } from "@/firebaseService";
import ImportFromUrl from "@/components/Recipes/ImportFromUrl";
import RecipeForm from "@/components/Recipes/RecipeForm";
import { ChevronRight, PenLine, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type Tag = { id: string; name: string };
type Recipe = {
  id?: string;
  name: string;
  description?: string;
  tags?: string[];
  imageUrl?: string;
  created_date?: string;
  sourceUrl?: string;
  ingredients?: string;
  method?: string;
};

export default function AddRecipePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "import">("manual");
  const [importedData, setImportedData] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

useEffect(() => {
  const fetchTags = async () => {
    const tagsFromServer = await getTags(); 
    setAllTags(tagsFromServer);  
  };

  fetchTags();
}, []);

  const handleSave = async (formData: Recipe) => {
    setSaving(true);

    const existingTagNames = allTags.map((t) => t.name);
    for (const tagName of formData.tags || []) {
      if (!existingTagNames.includes(tagName)) {
        await addTag(tagName);
      }
    }

    await addRecipe(formData);
    setSaving(false);
    router.push("/AllRecipes");
  };

  const handleImport = (data: Recipe) => {
    setImportedData(data);
    setMode("manual");
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-600 bg-transparent p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">הוספת מתכון</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {!importedData && (
          <div className="mb-6 flex w-full bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-lg p-2 ${mode === "manual" ? "bg-white shadow-sm" : ""}`}
            >
              <PenLine className="w-4 h-4 ml-2 inline" />
              הזנה ידנית
            </button>
            <button
              onClick={() => setMode("import")}
              className={`flex-1 rounded-lg p-2 ${mode === "import" ? "bg-white shadow-sm" : ""}`}
            >
              <Link2 className="w-4 h-4 ml-2 inline" />
              ייבוא מקישור
            </button>
          </div>
        )}

        {mode === "import" && !importedData ? (
          <ImportFromUrl onImport={handleImport} onCancel={() => setMode("manual")} />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <RecipeForm
              recipe={importedData || undefined}
              onSave={handleSave}
              onCancel={() => router.back()}
              isLoading={saving}
            />

            {allTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <div key={tag.id} onClick={() => toggleTag(tag.name)}>
                    <Badge
                      className={`cursor-pointer px-2 py-1 text-sm ${
                        selectedTags.includes(tag.name)
                          ? "bg-amber-500 text-white"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
