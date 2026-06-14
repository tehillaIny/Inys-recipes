import React from 'react';
import { useRouter } from 'next/router';
import { getCategoryInfo } from '@/utils/categoryHelper';

export default function RecipeCard({ recipe, isFavorite, onToggleFavorite }) {
  const router = useRouter();
  
  let imageUrl = '/defualt_img.jpg';
  if (recipe.imageUrls && recipe.imageUrls.length > 0) {
    imageUrl = recipe.imageUrls[0];
  } else if (recipe.imageUrl) {
    imageUrl = recipe.imageUrl.split(',')[0].trim();
  }

  const optimizeImage = (url, width) => {
    if (!url || !url.includes('cloudinary.com') || url.includes('/upload/c_')) return url;
    return url.replace('/upload/', `/upload/c_fill,w_${width},q_auto,f_auto/`);
  };

  return (
    <div 
      onClick={() => router.push(`/recipe/${recipe.id}`)}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group flex flex-col h-full active:scale-[0.98]"
    >
      <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-gray-50">
        <img 
          src={optimizeImage(imageUrl, 400)} 
          alt={recipe.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = '/defualt_img.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.id);
            }}
            className="absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all"
          >
            <span className={`text-lg leading-none ${isFavorite ? 'text-amber-500' : 'text-gray-400'}`}>
              {isFavorite ? '⭐' : '☆'}
            </span>
          </button>
        )}

      </div>
      
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight mb-3 line-clamp-2">
          {recipe.name}
        </h3>
        
        <div className="mt-auto flex flex-wrap gap-1.5">
          {recipe.tags?.slice(0, 3).map((tag, i) => {
            const { Icon, badge } = getCategoryInfo(tag);
            return (
              <span key={i} className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border ${badge}`}>
                <Icon className="w-3 h-3" />
                {tag}
              </span>
            );
          })}
          {recipe.tags?.length > 3 && (
            <span className="flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">
              +{recipe.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}