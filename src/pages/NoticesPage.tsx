import React, { useState, useEffect } from 'react';
import { Notice } from '../types';
import {
  Bell,
  Search,
  Calendar,
  Tag,
  Pin,
  FileText,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data) => {
        setNotices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', 'Exam', 'Academic', 'Holiday', 'General'];

  const filteredNotices = notices.filter((n) => {
    const matchCategory = selectedCategory === 'all' || n.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in" id="notices-page">
      {/* Page Header */}
      <div className="bg-[#0B1F4D] text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-left">
          <span className="bg-[#F5B301] text-[#0B1F4D] text-xs font-bold px-3 py-1 rounded-full uppercase">
            Official Circulars & News
          </span>
          <h1 className="text-3xl font-serif font-black">School Notice Board</h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Stay updated with examination schedules, holiday declarations, fee reminders, and academic circulars.
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#F5B301] shrink-0 border border-white/20">
          <Bell className="w-8 h-8" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0B1F4D] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Notices' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0B1F4D]"
          />
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading official circulars...</div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">No notices found matching your criteria.</p>
          <p className="text-xs text-slate-500">Try changing the category or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-2xl p-6 border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                notice.isPinned ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                      notice.category === 'Exam'
                        ? 'bg-purple-100 text-purple-800'
                        : notice.category === 'Holiday'
                        ? 'bg-rose-100 text-rose-800'
                        : notice.category === 'Academic'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {notice.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notice.date}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Issued by: <strong>{notice.author || 'Administration'}</strong></span>
                <span className="text-[#0B1F4D] font-semibold flex items-center gap-1">
                  SAPS Official
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
