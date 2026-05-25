import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { getRecipes } from '@/firebaseService';
import { 
  ChevronRight, Loader2, Plus, Trash2, Share2, Check, ListPlus, AlignRight, 
  Pencil, Link2, Link2Off, BookOpen, Search, X 
} from "lucide-react";

// פונקציה חכמה שנותנת צבע קבוע לכל שם
const getAssigneeColor = (name) => {
  if (!name) return 'bg-gray-100 text-gray-500';
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
    'bg-indigo-100 text-indigo-700',
    'bg-rose-100 text-rose-700'
  ];
  
  // המרת השם למספר קבוע (Hash) כדי שהצבע תמיד יישאר זהה לאותו אדם
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function EventDetail() {
  const router = useRouter();
  const { id: eventId } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // מאגר המתכונים לטובת חיפוש וקישור
  const [allRecipes, setAllRecipes] = useState([]);

  // מצבי טופס והדבקה
  const [inputMode, setInputMode] = useState('single');
  const [itemTitle, setItemTitle] = useState('');
  const [itemSection, setItemSection] = useState('');
  const [itemAssigned, setItemAssigned] = useState('');
  const [bulkText, setBulkText] = useState('');

  // מצבי עריכה
  const [editingItemId, setEditingItemId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editAssigned, setEditAssigned] = useState('');

  // מצב לחלונית הקישור למתכון
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingItem, setLinkingItem] = useState(null);
  const [recipeSearch, setRecipeSearch] = useState('');

  // שליפת פרטי האירוע
  useEffect(() => {
    if (!eventId) return;
    const unsubscribe = onSnapshot(doc(db, "events", eventId), (docSnap) => {
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() });
      } else {
        setEvent(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [eventId]);

  // שליפת כל המתכונים פעם אחת כשהעמוד נטען (עבור החיפוש החכם)
  useEffect(() => {
    getRecipes().then(setAllRecipes).catch(console.error);
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    const newItem = {
      id: 'item_' + Date.now(),
      title: itemTitle.trim(),
      section: itemSection.trim() || 'כללי',
      assignedTo: itemAssigned.trim() || '',
      isReady: false,
      recipeId: null
    };

    const updatedItems = [...(event.items || []), newItem];
    await updateDoc(doc(db, "events", eventId), { items: updatedItems });

    setItemTitle('');
    setItemAssigned('');
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    const newItems = lines.map((line, index) => ({
      id: 'item_' + Date.now() + '_' + index,
      title: line,
      section: 'כללי',
      assignedTo: '',
      isReady: false,
      recipeId: null
    }));

    const updatedItems = [...(event.items || []), ...newItems];
    await updateDoc(doc(db, "events", eventId), { items: updatedItems });

    setBulkText('');
    setInputMode('single');
  };

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditSection(item.section === 'כללי' ? '' : (item.section || ''));
    setEditAssigned(item.assignedTo || '');
  };

  const handleSaveEdit = async (itemId) => {
    if (!editTitle.trim()) return;
    const updatedItems = event.items.map(item => 
      item.id === itemId 
        ? { ...item, title: editTitle.trim(), section: editSection.trim() || 'כללי', assignedTo: editAssigned.trim() } 
        : item
    );
    await updateDoc(doc(db, "events", eventId), { items: updatedItems });
    setEditingItemId(null);
  };

  const handleToggleReady = async (itemId) => {
    const updatedItems = event.items.map(item => item.id === itemId ? { ...item, isReady: !item.isReady } : item);
    await updateDoc(doc(db, "events", eventId), { items: updatedItems });
  };

  const handleDeleteItem = async (itemId) => {
    const updatedItems = event.items.filter(item => item.id !== itemId);
    await updateDoc(doc(db, "events", eventId), { items: updatedItems });
  };

  // ---- פונקציות לניהול הקישור למתכונים ----
  const openLinkModal = (item) => {
    setLinkingItem(item);
    setRecipeSearch(item.title);
    setLinkModalOpen(true);
  };

  const handleLinkRecipe = async (recipeId) => {
    const updatedItems = event.items.map(item => item.id === linkingItem.id ? { ...item, recipeId } : item);
    await updateDoc(doc(db, "events", eventId), { items: updatedItems });
    setLinkModalOpen(false);
    setLinkingItem(null);
  };

  const handleUnlinkRecipe = async (itemId) => {
    const updatedItems = event.items.map(item => item.id === itemId ? { ...item, recipeId: null } : item);
    await updateDoc(doc(db, "events", eventId), { items: updatedItems });
  };

  const getRecipeImage = (recipe) => {
    if (recipe.imageUrls && recipe.imageUrls.length > 0) return recipe.imageUrls[0];
    if (recipe.imageUrl) return recipe.imageUrl.split(',')[0].trim();
    return '/defualt_img.jpg';
  };
  // ------------------------------------------

  const getGroupedItems = () => {
    if (!event || !event.items) return {};
    return event.items.reduce((groups, item) => {
      const section = item.section || 'כללי';
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
      return groups;
    }, {});
  };

  // החזרנו את "כללי" שיהיה תמיד כאופציה להשלמה אוטומטית
  const getUniqueSections = () => {
    if (!event || !event.items) return ['כללי'];
    const sections = event.items.map(item => item.section).filter(Boolean);
    const unique = [...new Set(sections)];
    if (!unique.includes('כללי')) {
      unique.unshift('כללי');
    }
    return unique;
  };

  const handleShareToWhatsApp = () => {
    if (!event) return;
    const grouped = getGroupedItems();
    let text = `*📋 תפריט מתוכנן: ${event.name}* \n`;
    if (event.date) text += `📅 תאריך: ${new Date(event.date).toLocaleDateString("he-IL")}\n`;
    text += `------------------------------------\n\n`;

    Object.keys(grouped).forEach(section => {
      text += `*🔹 ${section}*\n`;
      grouped[section].forEach(item => {
        const check = item.isReady ? '✅' : '⬜';
        const who = item.assignedTo ? ` (${item.assignedTo})` : '';
        text += `${check} ${item.title}${who}\n`;
      });
      text += `\n`;
    });

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">האירוע לא נמצא</div>;

  const groupedItems = getGroupedItems();
  const uniqueSections = getUniqueSections();

  const filteredRecipes = allRecipes.filter(r => r.name?.toLowerCase().includes(recipeSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-right" dir="rtl">
      
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setLinkModalOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="font-bold text-gray-800 text-sm">קישור מתכון ל-"{linkingItem?.title}"</h3>
              <button onClick={() => setLinkModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="חיפוש מתכון באפליקציה..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => handleLinkRecipe(recipe.id)}
                      className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-amber-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 shadow-sm">
                        <img src={getRecipeImage(recipe)} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="font-medium text-sm text-gray-800 truncate group-hover:text-amber-700">{recipe.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    לא נמצא מתכון בשם הזה
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => router.push(`/AddRecipe?title=${encodeURIComponent(recipeSearch)}`)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl font-bold text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> הוסף כמתכון חדש לאפליקציה
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <datalist id="event-sections">
        {uniqueSections.map(sec => <option key={sec} value={sec} />)}
      </datalist>

      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm pt-6 pb-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/Events')} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900">{event.name}</h1>
              {event.date && <p className="text-gray-400 text-xs mt-0.5">{new Date(event.date).toLocaleDateString("he-IL")}</p>}
            </div>
          </div>
          <button 
            onClick={handleShareToWhatsApp}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4" /> שיתוף לווטסאפ
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button type="button" onClick={() => setInputMode('single')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${inputMode === 'single' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}>
              <Plus className="w-4 h-4" /> פריט בודד
            </button>
            <button type="button" onClick={() => setInputMode('bulk')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${inputMode === 'bulk' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}>
              <AlignRight className="w-4 h-4" /> הדבקת רשימה
            </button>
          </div>

          <div className="p-4">
            {inputMode === 'single' ? (
              <form onSubmit={handleAddItem} className="space-y-3">
                <input type="text" placeholder="מה מכינים? (למשל: פשטידת פטריות)" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium border border-transparent" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" list="event-sections" placeholder="קבוצה (אופציונלי)" value={itemSection} onChange={(e) => setItemSection(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 text-xs border border-transparent" />
                  <input type="text" placeholder="מי מכין? (אופציונלי)" value={itemAssigned} onChange={(e) => setItemAssigned(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 text-xs border border-transparent" />
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-2xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1">הוסף פריט</button>
              </form>
            ) : (
              <form onSubmit={handleBulkAdd} className="space-y-3">
                <textarea placeholder="הדביקי כאן את הרשימה (כל שורה תהפוך לפריט נפרד)..." value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={5} className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium border border-transparent resize-none leading-relaxed" required />
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-2xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1"><ListPlus className="w-4 h-4" /> הוסף את כל הרשימה לתפריט</button>
              </form>
            )}
          </div>
        </div>

        {Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-6">
            {Object.keys(groupedItems).map(sectionName => (
              <div key={sectionName} className="space-y-2">
                <h3 className="font-extrabold text-amber-800 text-sm bg-amber-50/70 inline-block px-3 py-1 rounded-xl border border-amber-100/50">
                  {sectionName}
                </h3>
                
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                  {groupedItems[sectionName].map(item => (
                    <div key={item.id} className={`flex flex-col p-4 transition-colors ${item.isReady ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}>
                      {editingItemId === item.id ? (
                        <div className="space-y-2.5 w-full" onClick={(e) => e.stopPropagation()}>
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all" placeholder="שם המנה" required />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" list="event-sections" value={editSection} onChange={(e) => setEditSection(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all" placeholder="קבוצה" />
                            <input type="text" value={editAssigned} onChange={(e) => setEditAssigned(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all" placeholder="מי מכין?" />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => handleSaveEdit(item.id)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"><Check className="w-3.5 h-3.5" /> שמור שינויים</button>
                            <button type="button" onClick={() => setEditingItemId(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors">ביטול</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full gap-2">
                          
                          <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none" onClick={() => handleToggleReady(item.id)}>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${item.isReady ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 bg-white'}`}>
                              {item.isReady && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            
                            <div className="flex-1 min-w-0 flex items-center flex-wrap gap-2">
                              <p className={`font-medium text-sm text-gray-800 transition-all truncate ${item.isReady ? 'line-through text-gray-400' : ''}`}>
                                {item.title}
                              </p>
                              
                              {/* תגית צבעונית לשם המכין */}
                              {item.assignedTo && (
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[100px] ${getAssigneeColor(item.assignedTo)}`}>
                                  👤 {item.assignedTo}
                                </span>
                              )}

                              {item.recipeId && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/recipe/${item.recipeId}`); }}
                                  className="text-amber-600 bg-amber-100/70 p-1.5 rounded-lg hover:bg-amber-200 transition-colors shrink-0 shadow-sm"
                                  title="צפה במתכון המקושר"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            {!item.recipeId ? (
                              <button type="button" onClick={(e) => { e.stopPropagation(); openLinkModal(item); }} className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors" title="קשר למתכון מתוך האפליקציה">
                                <Link2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleUnlinkRecipe(item.id); }} className="p-2 text-amber-500 hover:text-red-500 bg-amber-50 hover:bg-red-50 rounded-full transition-colors" title="הסר קישור למתכון">
                                <Link2Off className="w-4 h-4" />
                              </button>
                            )}

                            <button type="button" onClick={(e) => { e.stopPropagation(); startEditing(item); }} className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="ערוך פריט">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0" title="מחק פריט">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            התפריט ריק. הוסיפי מנה או הדביקי רשימה כדי להתחיל.
          </div>
        )}
      </main>
    </div>
  );
}