import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { addRecipe, uploadImage, getRecipes, addTag } from "@/firebaseService"; 
import { Download, Upload, Loader2, Image as ImageIcon, FileText, X, Check } from "lucide-react";

export default function CsvExportImport({ onImportSuccess }) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState("");
  
  const [selectedCsv, setSelectedCsv] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  
  const csvInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  // --- לוגיקת ייצוא (Export) ---
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const recipes = await getRecipes();
      
      const csvData = recipes.map(r => ({
        name: r.name,
        description: r.description,
        tags: Array.isArray(r.tags) ? r.tags.join(';') : r.tags,
        Ingredients: r.ingredients,
        instructions: r.method,
        notes: r.notes || '',
        pic_link: r.imageUrl,
        source_link: r.sourceUrl
      }));

      const csvString = Papa.unparse(csvData);
      
      const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `recipes_backup_${new Date().toLocaleDateString("he-IL").replace(/\./g, "-")}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("שגיאה בייצוא המתכונים");
    } finally {
      setIsExporting(false);
    }
  };

  // --- לוגיקת בחירת קבצים ---
  const handleCsvSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedCsv(e.target.files[0]);
    }
  };

  const handleImagesSelect = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const closeModals = () => {
    setShowImportModal(false);
    setSelectedCsv(null);
    setSelectedImages([]);
    setProgress("");
  };

  // --- לוגיקת הייבוא החכמה (Import) ---
  const handleStartImport = () => {
    if (!selectedCsv) return;

    setIsImporting(true);
    setProgress("קורא את קובץ הנתונים...");

    Papa.parse(selectedCsv, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: async (results) => {
        const recipes = results.data;
        let successCount = 0;
        let errorsCount = 0;

        for (let i = 0; i < recipes.length; i++) {
          const row = recipes[i];
          if (!row.name && !row.Ingredients) continue;

          setProgress(`מעבד מתכון ${i + 1} מתוך ${recipes.length}: ${row.name || 'ללא שם'}`);

          try {
            let finalImageUrl = '';

            if (row.pic_link && row.pic_link.trim() !== '') {
              const originalPath = row.pic_link;
              const filename = originalPath.split(/[/\\]/).pop();

              const matchingFile = selectedImages.find(file => file.name === filename);

              if (matchingFile) {
                finalImageUrl = await uploadImage(matchingFile);
              } else if (row.pic_link.startsWith('http')) {
                 finalImageUrl = row.pic_link;
              }
            }

            const tagsList = (row.tags || '').split(/[;,]/).map(t => t.trim()).filter(Boolean);

            const recipeData = {
              name: row.name || 'מתכון ללא שם',
              description: row.description || '',
              ingredients: row.Ingredients || '',
              method: row.instructions || '',
              notes: row.notes || '',
              imageUrl: finalImageUrl,
              sourceUrl: row.source_link || '',
              tags: tagsList,
              createdAt: new Date()
            };

            await addRecipe(recipeData);
            
            if (tagsList.length > 0) {
              for (const tagName of tagsList) {
                await addTag(tagName);
              }
            }

            successCount++;

          } catch (error) {
            console.error(`Error importing recipe ${row.name}:`, error);
            errorsCount++;
          }
        }

        setIsImporting(false);
        alert(`הייבוא הסתיים!\n✅ ${successCount} מתכונים נוספו בהצלחה`);
        closeModals();
        if (onImportSuccess) onImportSuccess();
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        setIsImporting(false);
        alert("שגיאה בקריאת הקובץ");
      }
    });
  };

  return (
    <>
      <div className="flex gap-2 mb-4 justify-end">
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-white border border-gray-200 text-gray-600 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm text-xs font-medium"
        >
          <Upload className="w-3.5 h-3.5 text-amber-600" />
          ייבוא
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-white border border-gray-200 text-gray-600 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm text-xs font-medium"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
          ) : (
            <Download className="w-3.5 h-3.5 text-green-600" />
          )}
          ייצוא CSV
        </button>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">ייבוא מתכונים משולב</h3>
              <button onClick={closeModals} className="p-1 hover:bg-white rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-sm text-gray-500 mb-2">
                כדי לייבא מתכונים עם תמונות, בחרי את קובץ ה-CSV ואת תיקיית התמונות. המערכת תחבר ביניהם אוטומטית.
              </p>

              <div className={`p-3 rounded-xl border-2 transition-colors ${selectedCsv ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-green-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold text-gray-700">1. קובץ נתונים (CSV)</label>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  ref={csvInputRef}
                  onChange={handleCsvSelect}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white file:text-green-700 hover:file:bg-green-50"
                />
              </div>

              <div className={`p-3 rounded-xl border-2 transition-colors ${selectedImages.length > 0 ? 'border-blue-100 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold text-gray-700">2. תמונות (סמני את כולן)</label>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={imagesInputRef}
                  onChange={handleImagesSelect}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white file:text-blue-700 hover:file:bg-blue-50"
                />
                {selectedImages.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> נבחרו {selectedImages.length} קבצים
                  </p>
                )}
              </div>

              <button
                onClick={handleStartImport}
                disabled={isImporting || !selectedCsv}
                className="w-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    {progress || "מעבד נתונים..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 ml-2" />
                    התחל ייבוא
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}