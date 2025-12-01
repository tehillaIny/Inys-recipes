import React, { useState, useRef } from 'react';
import { Download, Upload, Loader2, CheckCircle } from "lucide-react";

export default function CsvExportImport({ recipes, onImportComplete }) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [importResult, setImportResult] = useState({ success: 0, failed: 0 });
  const fileInputRef = useRef(null);

  // ---------------------- EXPORT CSV ----------------------
  const exportToCsv = async () => {
    setExporting(true);
    
    const headers = [
      'שם',
      'תיאור',
      'תגיות',
      'מרכיבים',
      'אופן הכנה',
      'קישור תמונה',
      'קישור מקור'
    ];

    const rows = recipes.map(r => [
      r.name || '',
      r.description || '',
      (r.tags || []).join('; '),
      (r.ingredients || '').replace(/\n/g, ' | '),
      (r.method || '').replace(/\n/g, ' | '),
      r.imageUrl || '',
      r.sourceUrl || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row =>
        row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `מתכונים_${new Date().toLocaleDateString('he-IL')}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    setExporting(false);
  };

  // ---------------------- IMPORT CSV ----------------------
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        setImporting(false);
        return;
      }

      let success = 0;
      let failed = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          if (values.length < 1 || !values[0]) continue;

          const recipe = {
            name: values[0] || '',
            description: values[1] || '',
            tags: (values[2] || '').split(';').map(t => t.trim()).filter(Boolean),
            ingredients: (values[3] || '').replace(/ \| /g, '\n'),
            method: (values[4] || '').replace(/ \| /g, '\n'),
            imageUrl: values[5] || '',
            sourceUrl: values[6] || ''
          };

          // צריכה להיות לך פונקציה כזאת בצד של Firestore
          await addRecipe(recipe);

          success++;
        } catch {
          failed++;
        }
      }

      setImportResult({ success, failed });
      setShowResult(true);
      setImporting(false);

      if (fileInputRef.current) fileInputRef.current.value = '';
      onImportComplete();
    };

    reader.readAsText(file);
  };

  // ---------------------- CSV PARSER ----------------------
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  // ---------------------- UI ----------------------
  return (
    <>
      {/* Buttons */}
      <div className="flex gap-2">
        {/* EXPORT */}
        <button
          onClick={exportToCsv}
          disabled={exporting || recipes.length === 0}
          className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="w-3 h-3 ml-1 animate-spin" />
          ) : (
            <Download className="w-3 h-3 ml-1" />
          )}
          ייצוא CSV
        </button>

        {/* IMPORT */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? (
            <Loader2 className="w-3 h-3 ml-1 animate-spin" />
          ) : (
            <Upload className="w-3 h-3 ml-1" />
          )}
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

      {/* ---------------------- MANUAL MODAL ---------------------- */}
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
