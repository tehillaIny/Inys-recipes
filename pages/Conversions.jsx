import React from 'react';
import { useRouter } from 'next/router';
import { 
  ChevronRight, 
  Scale, 
  Wheat, 
  Droplet, 
  TestTube2, 
  Cookie, 
  RefreshCw,
  Maximize,
  Minimize
} from "lucide-react";

export default function Conversions() {
  const router = useRouter();

  const conversionData = [
    {
      title: "חומרי בסיס (לפי 1 כוס / כף)",
      icon: <Wheat className="w-5 h-5 text-amber-600" />,
      items: [
        { name: "קמח לבן (1 כוס)", amount: "140 גרם", extra: "1 כף = 10 גרם" },
        { name: "קמח מלא (1 כוס)", amount: "125 גרם", extra: "1 כף = 8 גרם" },
        { name: "קורנפלור / קקאו (1 כוס)", amount: "140 גרם", extra: "1 כף = 10 גרם" },
        { name: "סולת (1 כוס)", amount: "200 גרם", extra: "1 כף = 10 גרם" },
        { name: "אבקת סוכר (1 כוס)", amount: "120 גרם", extra: "1 כף = 8 גרם" },
        { name: "סוכר לבן / דמררה (1 כוס)", amount: "200 גרם", extra: "1 כף = 10 גרם" },
        { name: "סוכר חום כהה דחוס (1 כוס)", amount: "240 גרם", extra: "1 כף = 15 גרם" },
        { name: "מלח (1 כף)", amount: "20 גרם", extra: "1 כפית = 5 גרם" },
      ]
    },
    {
      title: "חומרי התפחה וייצוב",
      icon: <TestTube2 className="w-5 h-5 text-blue-500" />,
      items: [
        { name: "אבקת אפייה (1 כפית)", amount: "5 גרם" },
        { name: "סודה לשתייה (1 כפית)", amount: "5 גרם" },
        { name: "שמרים יבשים (1 כפית)", amount: "5 גרם" },
        { name: "אבקת ג'לטין (1 שקית)", amount: "14 גרם", extra: "1 כפית = 5 גרם" },
        { name: "פקטין (1 כפית)", amount: "5 גרם" },
      ]
    },
    {
      title: "יבשים ותבלינים (לפי 1 כוס)",
      icon: <Cookie className="w-5 h-5 text-orange-500" />,
      items: [
        { name: "פרג טחון", amount: "100 גרם" },
        { name: "שקדים / אגוזים טחונים", amount: "100 גרם" },
        { name: "שיבולת שועל", amount: "100 גרם" },
        { name: "קוקוס טחון", amount: "100 גרם" },
        { name: "קינמון טחון (1 כף)", amount: "10 גרם", extra: "1 כפית = 5 גרם" },
      ]
    },
    {
      title: "נוזלים, סירופים ורטבים (לפי 1 כוס)",
      icon: <Droplet className="w-5 h-5 text-cyan-500" />,
      items: [
        { name: "דבש / סילאן", amount: "360 גרם", extra: "1 כף = 20 גרם" },
        { name: "סירופ תירס / גלוקוזה", amount: "360 גרם", extra: "1 כף = 20 גרם" },
        { name: "מייפל אמיתי", amount: "240 גרם" },
        { name: "שמן", amount: "200 גרם" },
        { name: "שמנת מתוקה", amount: "250 מ\"ל" },
        { name: "חלב", amount: "240 מ\"ל", extra: "1 כף = 15 מ\"ל" },
        { name: "מים", amount: "240 מ\"ל", extra: "1 כף = 15 מ\"ל" },
        { name: "מיץ תפוזים / לימון", amount: "240 מ\"ל", extra: "1 כף = 15 מ\"ל" },
      ]
    },
    {
      title: "ממרחים ותוספות (לפי 1 כוס)",
      icon: <Cookie className="w-5 h-5 text-pink-500" />,
      items: [
        { name: "ריבת חלב", amount: "400 גרם" },
        { name: "ריבה", amount: "330 גרם" },
        { name: "חמאת בוטנים", amount: "250 גרם" },
        { name: "ממרח שוקולד", amount: "280 גרם" },
        { name: "טחינה גולמית", amount: "240 גרם" },
        { name: "פירות יער קפואים", amount: "125 גרם" },
        { name: "שוקולד צ'יפס", amount: "200 גרם" },
        { name: "קרם / חלב קוקוס (1 פחית)", amount: "400 גרם" },
        { name: "חלב מרוכז ממותק (1 פחית)", amount: "398 גרם" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500" />
            <h1 className="font-bold text-xl text-gray-900">טבלת המרות</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        
        {/* קוביית שמרים מודגשת */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-5 shadow-sm border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">המרת שמרים</h3>
              <p className="text-sm text-amber-800 font-medium">יבשים לטריים</p>
            </div>
          </div>
          <div className="bg-white/80 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="block text-sm text-gray-600">1 גרם יבשים =</span>
            <span className="block font-bold text-amber-700 text-lg">3 גרם טריים</span>
          </div>
        </div>

        {/* רשימת ההמרות הכללית */}
        {conversionData.map((category, idx) => (
          <section key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              {category.icon}
              <h2 className="font-bold text-gray-800 text-lg">{category.title}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="pl-4">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    {item.extra && (
                      <p className="text-sm text-gray-500 mt-0.5">{item.extra}</p>
                    )}
                  </div>
                  <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap shrink-0">
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* המרת תבניות */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">המרת מידות תבניות</h2>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* הגדלה */}
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                הגדלת מתכונים
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between text-sm">
                  <span className="text-gray-700">מ-22 ס"מ ל-24 ס"מ</span>
                  <span className="font-bold text-green-700">+20%</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-700">מ-22 ס"מ ל-26 ס"מ</span>
                  <span className="font-bold text-green-700">+40%</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-700">מ-22 ס"מ ל-28 ס"מ</span>
                  <span className="font-bold text-green-700">+60%</span>
                </li>
              </ul>
            </div>

            {/* הקטנה */}
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-1.5">
                <Minimize className="w-4 h-4" />
                הקטנת מתכונים
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between text-sm">
                  <span className="text-gray-700">מ-26 ס"מ ל-24 ס"מ</span>
                  <span className="font-bold text-red-700">-15%</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-700">מ-26 ס"מ ל-22 ס"מ</span>
                  <span className="font-bold text-red-700">-30%</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-700">מ-28 ס"מ ל-22 ס"מ</span>
                  <span className="font-bold text-red-700">-40%</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}