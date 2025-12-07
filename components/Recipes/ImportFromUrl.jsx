import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportFromUrl({ onImport, onCancel }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/scrape', {
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
      setError('לא הצלחנו לחלץ את המתכון מהקישור.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">ייבוא מתכון מהאינטרנט</h3>
          <p className="text-gray-500 text-sm mt-1">הדבק קישור למתכון ואנחנו נחלץ את הפרטים אוטומטית</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url" className="text-gray-700 font-medium">קישור למתכון</Label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="bg-white border-gray-200 focus:border-amber-400 pl-10"
              dir="ltr"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-2">
          <Button 
            onClick={handleImport}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            disabled={loading || !url.trim()}
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
          </Button>
          <Button variant="outline" onClick={onCancel}>
            ביטול
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
