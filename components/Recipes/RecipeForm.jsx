import React, { useState, useEffect } from 'react';
import { getTags, addTag } from "@/firebaseService";
import { Plus, Loader2, Image as ImageIcon } from "lucide-react";

export default function RecipeForm({ recipe, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
    ingredients: '',
    method: '',
    imageUrl: '',
    sourceUrl: ''
  });
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  // טעינת נתונים בעריכה
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || '',
        method: recipe.method || '',
        imageUrl: recipe.imageUrl || '',
        sourceUrl: recipe.sourceUrl || ''
      });
    }
  }, [recipe]);

  // טעינת תגיות
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await getTags();
      setAllTags(tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagName) => {
    if (formData.tags.includes(tagName)) {
      handleChange('tags', formData.tags.filter(t => t !== tagName));
    } else {
      handleChange('tags', [...formData.tags, tagName]);
    }
  };

  const addNewTag = async () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !allTags.find(t => t.name === trimmedTag)) {
      try {
        await addTag(trimmedTag);
        await loadTags();
        handleChange('tags', [...formData.tags, trimmedTag]);
        setNewTag('');
      } catch (error) {
        console.error("Error adding tag:", error);
      }
    } else if (trimmedTag) {
      toggleTag(trimmedTag);
      setNewTag('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  // מחלקות עיצוב משותפות (Tailwind)
  const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const buttonBaseClass = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-1 rounded-lg">
      
      {/* שם המתכון */}
      <div>
        <label htmlFor="name" className={labelClass}>שם המתכון *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="למשל: עוגת שוקולד"
          className={inputClass}
          required
        />
      </div>

      {/* תיאור קצר */}
      <div>
        <label htmlFor="description" className={labelClass}>תיאור קצר</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="תיאור קצר של המתכון..."
          className={`${inputClass} h-20 resize-none`}
        />
      </div>

      {/* תגיות */}
      <div>
        <label className={labelClass}>תגיות</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {allTags.map((tag) => {
            const isSelected = formData.tags.includes(tag.name);
            return (
              <span
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className={`cursor-pointer inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors select-none ${
                  isSelected 
                    ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                }`}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="הוסף תגית חדשה..."
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
          />
          <button 
            type="button" 
            onClick={addNewTag}
            className="flex items-center justify-center px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            title="הוסף תגית"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* תמונה (URL) */}
      <div>
        <label htmlFor="imageUrl" className={labelClass}>תמונה (URL)</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ImageIcon className="w-4 h-4 text-gray-400" />
          </div>
          <input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={`${inputClass} pl-10`}
            dir="ltr"
          />
        </div>
      </div>

      {/* רכיבים */}
      <div>
        <label htmlFor="ingredients" className={labelClass}>רכיבים</label>
        <textarea
          id="ingredients"
          value={formData.ingredients}
          onChange={(e) => handleChange('ingredients', e.target.value)}
          placeholder="רשימת רכיבים..."
          className={`${inputClass} h-32`}
        />
      </div>

      {/* הוראות הכנה */}
      <div>
        <label htmlFor="method" className={labelClass}>הוראות הכנה</label>
        <textarea
          id="method"
          value={formData.method}
          onChange={(e) => handleChange('method', e.target.value)}
          placeholder="שלבי ההכנה..."
          className={`${inputClass} h-32`}
        />
      </div>
      
      {/* קישור למקור */}
      <div>
        <label htmlFor="sourceUrl" className={labelClass}>קישור למקור</label>
        <input
          id="sourceUrl"
          type="url"
          value={formData.sourceUrl}
          onChange={(e) => handleChange('sourceUrl', e.target.value)}
          placeholder="https://..."
          className={inputClass}
          dir="ltr"
        />
      </div>

      {/* כפתורים - ביטול ושמירה */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <button 
          type="button" 
          onClick={onCancel}
          className={`${buttonBaseClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
        >
          ביטול
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className={`${buttonBaseClass} flex items-center bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
          שמור מתכון
        </button>
      </div>
    </form>
  );
}