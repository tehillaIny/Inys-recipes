import React, { useState, useRef } from 'react';
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export default function ImageRecipeImport({ onImport, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
        
        if (!apiKey) throw new Error("MISSING_KEY");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
              },
              required: ["title", "ingredients", "instructions"]
            }
          }
        });

        const prompt = `
          תפקידך לחלץ מתכון מלא מתמונה בעברית. אל תפספס שום פרט!
          
          1. שם המתכון: חלץ את הכותרת בעברית. (אם אין, המצא שם הגיוני בעברית).
          2. מצרכים: חלץ את כל רשימת המצרכים בעברית. כל שורה היא פריט נפרד.
          3. אופן ההכנה: חלץ את כל שלבי ההכנה בעברית במלואם. כל שלב הוא פריט נפרד.
          
          חובה להחזיר את כל הטקסטים בעברית בלבד!
        `;

        const imagePart = { inlineData: { data: base64Data, mimeType: file.type } };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let parsedData;
        try {
          parsedData = JSON.parse(cleanJsonString);
        } catch (err) {
          throw new Error("JSON_PARSE_ERROR");
        }

        if (parsedData.error) {
          setErrorMsg(parsedData.error);
        } else {
          const formattedData = {
            name: parsedData.title || "",
            
            ingredients: Array.isArray(parsedData.ingredients) 
              ? parsedData.ingredients.join('\n') 
              : parsedData.ingredients || "",
              
            method: Array.isArray(parsedData.instructions) 
              ? parsedData.instructions.join('\n\n') 
              : parsedData.instructions || ""
          };

          alert("✨ חילוץ המתכון הושלם!\n\nשים/י לב: מכיוון שהנתונים חולצו על ידי בינה מלאכותית, ייתכנו טעויות בחילוץ. \nיש לבדוק את אמינות התוצאות בטופס לפני השמירה.");

          onImport(formattedData); 
        }

      } catch (err) {
        console.error("Gemini Error:", err);
        setErrorMsg("אופס, משהו השתבש בפיענוח. נסי תמונה ברורה יותר.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 pt-2">
        <h2 className="text-xl font-bold text-gray-900">ייבוא מתכון מתמונה</h2>
      </div>

      <div 
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`mx-4 border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
          loading ? 'border-gray-200 bg-gray-50' : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50'
        }`}
      >
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} disabled={loading} />
        
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-amber-500">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-bold">מחלץ מתכון</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <Camera className="w-8 h-8 text-amber-500" />
            </div>
            <p className="font-bold text-gray-700">לחצי לבחירת תמונה</p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mx-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm text-center font-medium border border-red-100">
          {errorMsg}
        </div>
      )}

      <div className="px-4 pb-2">
        <button type="button" onClick={onCancel} className="w-full py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200">
          ביטול
        </button>
      </div>
    </div>
  );
}