import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown, Check } from "lucide-react";

export default function SearchAndFilter({
  searchQuery = "",
  setSearchQuery = () => {},
  selectedTags = [],
  setSelectedTags = () => {},
  allTags = [],
  sortOrder = "newest",
  setSortOrder = () => {},
}) {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* שורת חיפוש וכפתורים */}
      <div className="flex gap-2 relative items-center">
        
        {/* חיפוש (סגנון Pill מודרני) */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש מתכון..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-12 pr-5 bg-white border border-gray-100 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm font-medium placeholder:text-gray-400 transition-all text-right"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* כפתור סינון עגול */}
        <button
          onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
          className={`w-12 h-12 flex items-center justify-center rounded-full shadow-sm transition-all flex-shrink-0 ${
            selectedTags?.length > 0 || filterOpen
              ? "bg-amber-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {selectedTags?.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {selectedTags.length}
            </span>
          )}
        </button>

        {/* כפתור מיון עגול */}
        <div className="relative">
          <button
            onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-sm transition-all flex-shrink-0 ${
              sortOpen
                ? "bg-amber-100 text-amber-700"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>

          {/* תפריט מיון קופץ (Dropdown) מעוצב */}
          {sortOpen && (
            <div className="absolute left-0 mt-3 bg-white shadow-xl border border-gray-100 rounded-2xl w-48 z-50 text-right overflow-hidden py-2 animate-in slide-in-from-top-2">
              {[
                { id: 'newest', label: 'החדשים ביותר' },
                { id: 'oldest', label: 'הישנים ביותר' },
                { id: 'name', label: 'לפי שם (א-ת)' }
              ].map(option => (
                <button
                  key={option.id}
                  className={`w-full px-4 py-3 text-right text-sm font-medium flex items-center justify-between hover:bg-amber-50 transition-colors ${sortOrder === option.id ? 'text-amber-600 bg-amber-50/50' : 'text-gray-700'}`}
                  onClick={() => {
                    setSortOrder(option.id);
                    setSortOpen(false);
                  }}
                >
                  {option.label}
                  {sortOrder === option.id && <Check className="w-4 h-4 text-amber-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* פאנל סינון (מגירה נפתחת) */}
      {filterOpen && (
        <div className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 text-right animate-in slide-in-from-top-2 z-40 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">סינון לפי קטגוריות</h3>
            {selectedTags?.length > 0 && (
              <button
                className="text-amber-600 hover:text-amber-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
                onClick={clearFilters}
              >
                נקה הכל
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2.5 justify-start max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {allTags?.map((tag) => (
              <span
                key={tag.id}
                className={`cursor-pointer transition-all rounded-xl px-3.5 py-2 text-sm font-medium flex items-center gap-1.5 select-none ${
                  selectedTags?.includes(tag.name)
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]"
                    : "bg-gray-50 text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-100"
                }`}
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* תגיות נבחרות (Pills) מתחת לחיפוש */}
      {!filterOpen && selectedTags?.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-start pt-1">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-amber-100/80 text-amber-800 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-amber-200 transition-colors"
              onClick={() => toggleTag(tag)}
            >
              <X className="w-3.5 h-3.5 opacity-70" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}