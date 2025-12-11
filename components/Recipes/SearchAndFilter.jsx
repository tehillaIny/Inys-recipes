import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  allTags,
  sortOrder,
  setSortOrder,
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
    <div className="space-y-3" dir="rtl">
      <div className="flex gap-2 relative">
        {/* חיפוש */}
        <div className="relative flex-1">
          {/* אייקון חיפוש - בצד שמאל */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          
          <input
            type="text"
            placeholder="חיפוש מתכונים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // pl-10 נותן מקום לאייקון משמאל, pr-4 נותן ריפוד להתחלת כתיבה מימין
            className="pl-10 pr-4 bg-white border border-gray-200 rounded focus:border-amber-400 focus:ring-amber-400 w-full text-right"
          />
        </div>

        {/* כפתורי סינון ומיון (יופיעו משמאל לחיפוש ב-RTL) */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`border border-gray-200 rounded p-2 ${
            selectedTags.length > 0
              ? "bg-amber-50 border-amber-300"
              : ""
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="border border-gray-200 rounded p-2"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* תפריט מיון */}
          {sortOpen && (
            <div className="absolute left-0 mt-2 bg-white shadow-md border rounded w-36 z-20 text-right">
              <button
                className="w-full px-3 py-2 hover:bg-gray-100 text-right"
                onClick={() => {
                  setSortOrder("newest");
                  setSortOpen(false);
                }}
              >
                החדשים ביותר
              </button>
              <button
                className="w-full px-3 py-2 hover:bg-gray-100 text-right"
                onClick={() => {
                  setSortOrder("oldest");
                  setSortOpen(false);
                }}
              >
                הישנים ביותר
              </button>
              <button
                className="w-full px-3 py-2 hover:bg-gray-100 text-right"
                onClick={() => {
                  setSortOrder("name");
                  setSortOpen(false);
                }}
              >
                לפי שם (א-ת)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* חלון סינון */}
      {filterOpen && (
        <div className="border p-4 rounded bg-white shadow-sm text-right">
          <div className="flex flex-wrap gap-2 justify-start">
            {allTags.map((tag) => (
              <span
                key={tag.id}
                className={`cursor-pointer transition-all rounded px-2 py-1 text-sm border ${
                  selectedTags.includes(tag.name)
                    ? "bg-amber-500 text-white border-amber-600"
                    : "border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                }`}
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </span>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <button
              className="mt-4 text-gray-500 flex items-center gap-1 text-sm mr-auto" // mr-auto דוחף לשמאל
              onClick={clearFilters}
            >
              <X className="w-4 h-4" />
              נקה סינון
            </button>
          )}
        </div>
      )}

      {/* תגיות שנבחרו - מיושרות לימין */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-start">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 rounded px-2 py-1 text-sm flex items-center gap-1 cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              <X className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}