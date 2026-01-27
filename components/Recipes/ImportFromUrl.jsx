import React, { useState } from 'react';
import { Link2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { CapacitorHttp } from '@capacitor/core';

export default function ImportFromUrl({ onImport, onCancel }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    /*try {
      const res = await fetch('https://inys-recipes.vercel.app/api/scrape', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
});

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Scraping failed');

      // מחזיר לטופס העריכה
      onImport({
        name: data.name || '',
        description: '', // אפשר להשאיר ריק אם אין
        ingredients: (data.ingredients || []).join('\n'),
        method: (data.method || []).join('\n'),
        imageUrl: data.imageUrl || '',
        sourceUrl: url
      });

    } catch (err) {
      console.error(err);
            alert("ERROR DETAILS: " + err.message); 
      setError('לא הצלחנו לחלץ את המתכון מהקישור.');
    } finally {
      setLoading(false);
    }
  };*/

  try {
      const response = await CapacitorHttp.post({
        url: 'https://inys-recipes.vercel.app/api/scrape',
        headers: { 'Content-Type': 'application/json' },
        data: { url: url } // שמים לב: כאן זה data ולא body
      });

      // בדיקה אם השרת החזיר תשובה תקינה (200)
      if (response.status !== 200) {
          throw new Error(response.data.error || 'Scraping failed with status ' + response.status);
      }

      // ב-CapacitorHttp, המידע כבר מגיע מפורק בתוך .data
      const data = response.data;

      // מחזיר לטופס העריכה
      onImport({
        name: data.name || '',
        description: '', 
        ingredients: (data.ingredients || []).join('\n'),
        method: (data.method || []).join('\n'),
        imageUrl: data.imageUrl || '',
        sourceUrl: url
      });

    } catch (err) {
      console.error(err);
      alert("ERROR: " + (err.message || JSON.stringify(err))); 
      setError('לא הצלחנו לחלץ את המתכון מהקישור.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        {/* כותרת ואייקון */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">ייבוא מתכון מהאינטרנט</h3>
          <p className="text-gray-500 text-sm mt-1">הדבק קישור למתכון ואנחנו נחלץ את הפרטים אוטומטית</p>
        </div>

        {/* שדה קלט */}
        <div className="space-y-2">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            קישור למתכון
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Link2 className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 placeholder-gray-400"
              dir="ltr"
            />
          </div>
        </div>

        {/* הודעת שגיאה */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* כפתורים */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleImport}
            disabled={loading || !url.trim()}
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                מחלץ מתכון...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 ml-2" />
                ייבא מתכון
              </>
            )}
          </button>
          
          <button
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}