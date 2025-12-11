import React, { useState, useRef } from 'react';
import { Download, Upload, Loader2, CheckCircle } from "lucide-react";
import { addRecipe, addTag } from "@/firebaseService"; // הוספנו את addTag
import Papa from "papaparse";

export default function CsvExportImport({ recipes, onImportComplete = () => {} }) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [importResult, setImportResult] = useState({ success: 0, failed: 0 });
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ---------------------- EXPORT CSV ----------------------
  const exportToCsv = async () => {
    if (!recipes || recipes.length === 0) return;

    setExporting(true);
    const headers = ['name','description','tags','Ingredients','instructions','pic_link','source_link'];

    const rows = recipes.map(r => [
      r.name || '',
      r.description || '',
      (r.tags || []).join(';'), // שיניתי למפריד נקודה-פסיק רגיל ללא רווח לנוחות
      (r.ingredients || '').replace(/\n/g, ' | '),
      (r.method || '').replace(/\n/g, ' | '),
      r.imageUrl || '',
      r.sourceUrl || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `מתכונים_${new Date().toLocaleDateString('he-IL').replace(/\./g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExporting(false);
  };

  // ---------------------- IMPORT CSV ----------------------
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📁 handleFileSelect — קובץ נבחר", file);
    setImporting(true);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        console.log(`📄 זוהו ${data.length} שורות ב-CSV`);

        let success = 0;
        let failed = 0;

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          
          // חילוץ התגיות למערך
          const tagsList = (row.tags || '').split(/[;,]/).map(t => t.trim()).filter(Boolean);

          const recipe = {
            name: row.name || '',
            description: row.description || '',
            tags: tagsList,
            ingredients: (row.Ingredients || '').replace(/ \| /g, '\n'),
            method: (row.instructions || '').replace(/ \| /g, '\n'),
            imageUrl: row.pic_link || '',
            sourceUrl: row.source_link || '',
            created_date: new Date().toISOString(),
          };

          try {
            // 1. שמירת המתכון
            await addRecipe(recipe);
            
            // 2. תיקון: שמירת התגיות ברשימה הכללית (אם לא קיימות)
            if (tagsList.length > 0) {
              for (const tagName of tagsList) {
                await addTag(tagName); 
              }
            }

            success++;
            console.log("✔ מתכון נשמר:", recipe.name);
          } catch (err) {
            failed++;
            console.error("❌ שגיאה בשמירת מתכון:", recipe, err);
          } finally {
            setProgress(i + 1);
          }
        }

        console.log(`🏁 הייבוא הסתיים. הצלחות: ${success}, כשלונות: ${failed}`);
        setImportResult({ success, failed });
        setShowResult(true);
        setImporting(false);
        setProgress(0);

        if (fileInputRef.current) fileInputRef.current.value = '';
        if (typeof onImportComplete === "function") onImportComplete();
      },
      error: (err) => {
        console.error("❌ שגיאה בקריאת CSV:", err);
        setImporting(false);
      }
    });
  };

  // ---------------------- UI ----------------------
  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={exportToCsv}
          disabled={exporting || !recipes || recipes.length === 0}
          className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? <Loader2 className="w-3 h-3 ml-1 animate-spin" /> : <Download className="w-3 h-3 ml-1" />}
          ייצוא CSV
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? <Loader2 className="w-3 h-3 ml-1 animate-spin" /> : <Upload className="w-3 h-3 ml-1" />}
          ייבוא CSV
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {importing && (
        <div className="text-xs mt-2 text-gray-600">
          טוען CSV... {progress}/{recipes?.length || "?"} שורות
        </div>
      )}

      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 text-xl font-semibold">
              <CheckCircle className="w-6 h-6 text-green-500" />
              הייבוא הושלם
            </div>
            <div className="text-lg mt-4">
              יובאו {importResult.success} מתכונים בהצלחה
            </div>
            {importResult.failed > 0 && (
              <div className="text-sm text-red-600 mt-2">
                {importResult.failed} שורות נכשלו
              </div>
            )}
            <button
              onClick={() => setShowResult(false)}
              className="mt-6 border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </>
  );
}