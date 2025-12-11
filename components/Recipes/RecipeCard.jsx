import React from 'react';
import { Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { deleteRecipe } from "@/firebaseService";

export default function RecipeCard({ recipe }) {
  const defaultImage = "/defualt_img.jpg";

  const handleDelete = async (e) => {
    e.preventDefault(); 
    if (confirm("האם את בטוחה שברצונך למחוק את המתכון?")) {
      await deleteRecipe(recipe.id);
      window.location.reload(); 
    }
  };

  return (
    <Link href={`/recipe/${recipe.id}`} className="block">
      <div className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-0 shadow-md rounded-xl h-full flex flex-col">
        {/* IMAGE */}
        <div className="relative h-48 overflow-hidden rounded-t-xl shrink-0">
          <img
            src={recipe.imageUrl || defaultImage}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => (e.currentTarget.src = defaultImage)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-3 left-3 text-right">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
              {recipe.name}
            </h3>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col flex-1 text-right">
          {recipe.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3 text-right">
              {recipe.description}
            </p>
          )}

          {/* תגיות */}
          <div className="flex flex-wrap gap-1.5 mb-3 justify-start">
            {recipe.tags?.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {recipe.tags?.length > 3 && (
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>

          {/* תחתית הכרטיס - תאריך ויוצר */}
          <div className="mt-auto pt-3 border-t border-gray-50 text-xs text-gray-400 flex justify-between items-center">
            <span>
              {recipe.created_date 
                ? new Date(recipe.created_date).toLocaleDateString('he-IL') 
                : ''}
            </span>
            {recipe.createdBy && (
              <span className="font-medium text-gray-500">
                מאת: {recipe.createdBy}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}