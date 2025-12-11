import React, { useState, useEffect } from 'react';
import { getTags, addTag, uploadImage } from "@/firebaseService"; // הוספנו את uploadImage
import { Plus, Loader2, Image as ImageIcon, UploadCloud, Link as LinkIcon, X } from "lucide-react";

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
  
  // מצבים חדשים לניהול התמונה
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
      // אם יש תמונה קיימת, נציג אותה
      if (recipe.imageUrl) {
        setImageMode('url'); 
      }
    }
  }, [recipe]);

  useEffect(() => {
    loadTags();
  }, []);

  // יצירת תצוגה מקדימה כשבוחרים קובץ
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url); // ניקוי זיכרון
    }
  }, [imageFile]);

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsUploading(true);
    let finalImageUrl = formData.imageUrl;

    try {
      // אם המשתמש בחר להעלות קובץ ויש קובץ
      if (imageMode === 'upload' && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      } 
      // אם המשתמש ניקה את השדה במצב קישור
      else if (imageMode === 'url' && !formData.imageUrl) {
          finalImageUrl = '';
      }

      onSave({ ...formData, imageUrl: finalImageUrl });
    } catch (error) {
      console.error("Failed to save recipe:", error);
      alert("שגיאה בשמירת המתכון (אולי הבעיה בהעלאת התמונה?)");
    } finally {
      setIsUploading(false);
    }
  };

  // מחלקות עיצוב משותפות
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

      {/* תמונה - אזור משודרג */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <label className={labelClass}>תמונה</label>
        
        {/* טאבים לבחירה */}
        <div className="flex gap-2 mb-3 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button
            type="button"
            onClick={() => setImageMode('url')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              imageMode === 'url' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            קישור
          </button>
          <button
            type="button"
            onClick={() => setImageMode('upload')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              imageMode === 'upload' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            העלאה
          </button>
        </div>

        {/* תוכן בהתאם לבחירה */}
        {imageMode === 'url' ? (
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ImageIcon className="w-4 h-4 text-gray-400" />
             </div>
             <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={`${inputClass} pl-10`}
                dir="ltr"
             />
             {formData.imageUrl && (
               <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                 <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
               </div>
             )}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
            {previewUrl && (
               <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                 <img src={previewUrl} alt="File Preview" className="w-full h-full object-cover" />
                 <button 
                   type="button"
                   onClick={() => { setImageFile(null); setPreviewUrl(''); }}
                   className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-gray-600 hover:text-red-500"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
            )}
          </div>
        )}
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
          >
            <Plus className="w-4 h-4" />
          </button>
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
          disabled={isLoading || isUploading}
          className={`${buttonBaseClass} flex items-center bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {(isLoading || isUploading) ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
          {isUploading ? 'מעלה תמונה...' : 'שמור מתכון'}
        </button>
      </div>
    </form>
  );
}