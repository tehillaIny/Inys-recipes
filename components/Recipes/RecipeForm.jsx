import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from '@/api/base44Client';
import { X, Plus, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const tags = await base44.entities.Tag.list();
    setAllTags(tags);
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
    if (newTag.trim() && !allTags.find(t => t.name === newTag.trim())) {
      await base44.entities.Tag.create({ name: newTag.trim() });
      await loadTags();
      handleChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    } else if (newTag.trim()) {
      toggleTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange('imageUrl', file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700 font-medium">שם המתכון *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="למשל: עוגת שוקולד"
          className="bg-white border-gray-200 focus:border-amber-400"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700 font-medium">תיאור קצר</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="תיאור קצר של המתכון..."
          className="bg-white border-gray-200 focus:border-amber-400 h-20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">תגיות</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {allTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={formData.tags.includes(tag.name) ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                formData.tags.includes(tag.name) 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : 'hover:bg-amber-50 hover:border-amber-300'
              }`}
              onClick={() => toggleTag(tag.name)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="הוסף תגית חדשה..."
            className="bg-white border-gray-200 focus:border-amber-400"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
          />
          <Button type="button" variant="outline" onClick={addNewTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">תמונה</Label>
        <div className="flex gap-3 items-start">
          {formData.imageUrl ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={formData.imageUrl} 
                alt="תמונת מתכון"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleChange('imageUrl', '')}
                className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">העלאת תמונה</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
          <div className="flex-1">
            <Input
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="או הדבק קישור לתמונה..."
              className="bg-white border-gray-200 focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ingredients" className="text-gray-700 font-medium">מרכיבים</Label>
        <Textarea
          id="ingredients"
          value={formData.ingredients}
          onChange={(e) => handleChange('ingredients', e.target.value)}
          placeholder="כתוב כל מרכיב בשורה נפרדת..."
          className="bg-white border-gray-200 focus:border-amber-400 h-40 font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="method" className="text-gray-700 font-medium">אופן הכנה</Label>
        <Textarea
          id="method"
          value={formData.method}
          onChange={(e) => handleChange('method', e.target.value)}
          placeholder="כתוב את שלבי ההכנה..."
          className="bg-white border-gray-200 focus:border-amber-400 h-48"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl" className="text-gray-700 font-medium">קישור למקור (אופציונלי)</Label>
        <Input
          id="sourceUrl"
          type="url"
          value={formData.sourceUrl}
          onChange={(e) => handleChange('sourceUrl', e.target.value)}
          placeholder="https://..."
          className="bg-white border-gray-200 focus:border-amber-400"
          dir="ltr"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          disabled={isLoading || !formData.name.trim()}
        >
          {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          {recipe ? 'עדכן מתכון' : 'שמור מתכון'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            ביטול
          </Button>
        )}
      </div>
    </form>
  );
}  