import React, { useState, useEffect } from 'react';
import { getTags, addTag, uploadImage } from "@/firebaseService"; 
import { Plus, Loader2, Image as ImageIcon, UploadCloud, Link as LinkIcon, X } from "lucide-react";

export default function RecipeForm({ recipe, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
    ingredients: '',
    method: '',
    notes: '', 
    imageUrl: '',
    imageUrls: [], // <--- מערך תמונות חדש
    sourceUrl: '',
    createdBy: '' 
  });
  
  const [imageMode, setImageMode] = useState('upload'); 
  
  // ניהול תמונות מרובות
  const [existingImages, setExistingImages] = useState([]); // תמונות שכבר קיימות בשרת
  const [newImageFiles, setNewImageFiles] = useState([]);   // קבצים חדשים שהמשתמש בחר
  const [previewUrls, setPreviewUrls] = useState([]);       // תצוגה מקדימה לקבצים החדשים
  
  const [isUploading, setIsUploading] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (recipe) {
      // טעינת תמונות קיימות למערך
      const loadedImages = recipe.imageUrls?.length > 0 
        ? recipe.imageUrls 
        : (recipe.imageUrl ? [recipe.imageUrl] : []);

      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || '',
        method: recipe.method || '',
        notes: recipe.notes || '',
        imageUrl: recipe.imageUrl || '',
        imageUrls: loadedImages,
        sourceUrl: recipe.sourceUrl || '',
        createdBy: recipe.createdBy || '' 
      });
      
      setExistingImages(loadedImages);
      if (loadedImages.length > 0) setImageMode('upload');
    }
  }, [recipe]);

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

  // טיפול בבחירת מספר קבצים
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      setNewImageFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // ניקוי הזיכרון
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
    let finalImageUrls = [...existingImages];

    try {
      if (imageMode === 'upload' && newImageFiles.length > 0) {
        // העלאת כל התמונות במקביל ל-Cloudinary
        const uploadedUrls = await Promise.all(
          newImageFiles.map(file => uploadImage(file))
        );
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      } else if (imageMode === 'url' && formData.imageUrl) {
        // אם בחרנו במצב כתובת בודדת
        finalImageUrls = [formData.imageUrl];
      }

      onSave({ 
        ...formData, 
        imageUrls: finalImageUrls,
        imageUrl: finalImageUrls[0] || '' // תמונה ראשית עבור התצוגה בכרטיסיות (תאימות לאחור)
      });
    } catch (error) {
      console.error("Failed to save recipe:", error);
      alert("שגיאה בשמירת המתכון (אחת התמונות נכשלה)");
    } finally {
      setIsUploading(false);
    }
  };

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

      {/* נוסף על ידי */}
      <div>
        <label htmlFor="createdBy" className={labelClass}>נוסף על ידי (שם)</label>
        <input
          id="createdBy"
          type="text"
          value={formData.createdBy}
          onChange={(e) => handleChange('createdBy', e.target.value)}
          placeholder="הקלידי את שמך..."
          className={inputClass}
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

      {/* תמונות */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <label className={labelClass}>תמונות</label>
        <div className="flex gap-2 mb-4 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button
            type="button"
            onClick={() => setImageMode('upload')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              imageMode === 'upload' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            העלאה מקומית
          </button>
          <button
            type="button"
            onClick={() => setImageMode('url')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              imageMode === 'url' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            קישור אחד
          </button>
        </div>

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
               <div className="mt-3 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                 <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
               </div>
             )}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="file"
              multiple // <--- התוספת החשובה! מאפשרת בחירה של כמה קבצים
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
            
            {/* גריד להצגת התמונות שנבחרו/קיימות */}
            {(existingImages.length > 0 || previewUrls.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {/* תמונות ישנות (מהשרת) */}
                {existingImages.map((url, i) => (
                  <div key={`old-${i}`} className="relative h-24 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={url} alt="Saved" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* תמונות חדשות (תצוגה מקדימה) */}
                {previewUrls.map((url, i) => (
                   <div key={`new-${i}`} className="relative h-24 rounded-lg overflow-hidden border border-blue-200 shadow-sm group ring-2 ring-blue-100">
                     <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                     <button 
                       type="button"
                       onClick={() => removeNewImage(i)}
                       className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                     >
                       <X className="w-3.5 h-3.5" />
                     </button>
                     <div className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-white text-[10px] text-center py-0.5">חדש</div>
                   </div>
                ))}
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

      {/* הערות אישיות */}
      <div>
        <label htmlFor="notes" className={labelClass}>הערות אישיות</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="טיפים, שינויים שעשיתי, למי זה מתאים..."
          className={`${inputClass} h-24 bg-yellow-50/50 border-yellow-200 focus:ring-yellow-400`}
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
          {isUploading ? 'מעלה תמונות...' : 'שמור מתכון'}
        </button>
      </div>
    </form>
  );
}