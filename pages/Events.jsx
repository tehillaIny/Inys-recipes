import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Plus, Calendar as CalendarIcon, Trash2, ChevronLeft, Loader2 } from "lucide-react";

export default function Events() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '' });

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.name.trim()) return;

    try {
      await addDoc(collection(db, "events"), {
        name: newEvent.name.trim(),
        date: newEvent.date || new Date().toISOString().split('T')[0],
        items: [],
        created_at: new Date().toISOString()
      });
      setNewEvent({ name: '', date: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  const handleDeleteEvent = async (e, eventId) => {
    e.stopPropagation();
    if (window.confirm("האם את בטוחה שברצונך למחוק את האירוע כולו?")) {
      await deleteDoc(doc(db, "events", eventId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-right" dir="rtl">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm px-4 py-6">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">האירועים והארוחות שלי</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-amber-500 text-white p-2 rounded-full shadow-sm hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {showAddForm && (
          <form onSubmit={handleCreateEvent} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-in slide-in-from-top-2">
            <h3 className="font-bold text-gray-800">תכנון אירוע חדש</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="שם האירוע (למשל: ארוחת שבת חלבית, ראש השנה)"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 text-sm border border-transparent"
                required
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 text-sm border border-transparent text-right"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-amber-500 text-white py-2.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-amber-600 transition-colors">שמור אירוע</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-2xl text-sm font-medium">ביטול</button>
            </div>
          </form>
        )}

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => router.push(`/event/${event.id}`)}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg group-hover:text-amber-600 transition-colors">{event.name}</h2>
                    <p className="text-gray-400 text-xs mt-1">
                      {event.date ? new Date(event.date).toLocaleDateString("he-IL") : ""} • {event.items?.length || 0} מנות מתוכננות
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteEvent(e, event.id)}
                    className="p-2 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <CalendarIcon className="w-12 h-12 mx-auto stroke-[1.5] mb-2" />
            <p>אין עדיין אירועים מתוכננים</p>
          </div>
        )}
      </main>
    </div>
  );
}