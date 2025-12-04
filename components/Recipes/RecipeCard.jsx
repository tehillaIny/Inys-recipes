import React from 'react';
import { Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function RecipeCard({ recipe }) {
  const defaultImage =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

  return (
    <Link href={`/recipe/${recipe.id}`} className="block">
  <div className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-0 shadow-md rounded-xl">
    {/* IMAGE */}
    <div className="relative h-48 overflow-hidden rounded-t-xl">
      <img
        src={recipe.imageUrl || defaultImage}
        alt={recipe.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => (e.currentTarget.src = defaultImage)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-3 right-3 left-3">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
          {recipe.name}
        </h3>
      </div>
    </div>

    {/* CONTENT */}
    <div className="p-4">
      {recipe.description && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {recipe.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
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

      <div className="flex items-center text-gray-400 text-xs">
        <Clock className="w-3.5 h-3.5 ml-1" />
        <span>
          {recipe.created_date
            ? format(new Date(recipe.created_date), "dd/MM/yyyy")
            : ""}
        </span>
      </div>
    </div>
  </div>
</Link>
  );
}