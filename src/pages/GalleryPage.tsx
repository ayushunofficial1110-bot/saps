import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { useSiteContent } from '../context/SiteContentContext';
import {
  Image as ImageIcon,
  ZoomIn,
  X,
  Calendar,
  ExternalLink,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { siteContent } = useSiteContent();
  const galleryConfig = siteContent?.gallery;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [zoomItem, setZoomItem] = useState<GalleryItem | null>(null);
  const [showChannelInfoModal, setShowChannelInfoModal] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => setItems(data || []))
      .catch(() => {});
  }, []);

  const categories = ['all', 'Campus', 'Classrooms', 'Transport', 'Sports', 'Events'];

  const filtered = items.filter(
    (item) => selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleOpenChannel = () => {
    const url = galleryConfig?.moreMediaUrl?.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setShowChannelInfoModal(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in" id="gallery-page">
      {/* Header */}
      <div className="bg-[#0B1F4D] text-white p-8 sm:p-10 rounded-3xl text-center space-y-3 shadow-md border-b-4 border-[#F5B301]">
        <div className="inline-flex items-center gap-2 bg-[#F5B301] text-[#0B1F4D] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Highlights & Media</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight">
          Campus & Event Gallery
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
          A handpicked visual glimpse of academic sessions, sports meets, cultural celebrations, and campus life at Swami Adgadanand Public School.
        </p>
      </div>

      {/* Prominent Section / Banner: View More Photos & Videos */}
      <div
        className="bg-gradient-to-r from-[#0B1F4D] via-[#14327A] to-[#0B1F4D] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-amber-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        id="more-media-banner"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-[#F5B301] text-[#0B1F4D] text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Full Media Archive</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
            {galleryConfig?.bannerTitle || 'View More Photos & Videos'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {galleryConfig?.bannerSubtitle ||
              'Follow our official channel for daily campus highlights, annual day celebrations, sports meet clips, and live event updates.'}
          </p>
        </div>

        <button
          onClick={handleOpenChannel}
          className="bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl hover:shadow-2xl transition duration-150 flex items-center gap-2.5 shrink-0 active:scale-95"
          id="btn-open-media-channel"
        >
          <span>{galleryConfig?.buttonText || 'Open Official Media Channel'}</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Curated Showcase ({filtered.length})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-[#0B1F4D] text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Highlights' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Curated 2-6 Photos Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
          No photos found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setZoomItem(item)}
              className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition duration-200 flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <ZoomIn className="w-8 h-8" />
                </div>
                <span className="absolute top-3 right-3 bg-[#0B1F4D]/85 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                  {item.category}
                </span>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0B1F4D] transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {item.date}
                  </span>
                  <span className="text-[#0B1F4D] font-bold text-xs flex items-center gap-1 group-hover:text-amber-600 transition">
                    View Photo
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Secondary Prompt */}
      <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="font-bold text-xs sm:text-sm text-slate-800">
            Looking for complete video coverage or high-resolution albums?
          </h4>
          <p className="text-xs text-slate-500">
            All extended recordings and photo streams are updated on our external channel link.
          </p>
        </div>
        <button
          onClick={handleOpenChannel}
          className="px-5 py-2.5 bg-[#0B1F4D] hover:bg-[#14327A] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow"
        >
          <span>Explore External Channel</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>

      {/* Channel Link Unset Informative Modal */}
      {showChannelInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-100 text-[#0B1F4D] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Info className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif font-black text-lg text-[#0B1F4D]">
                Official Media Channel
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The school administration is currently setting up the official channel link (WhatsApp Channel / Telegram / Drive). Please check back shortly or contact the school office.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 border">
              <em>Administrators can configure this link anytime from the ERP <strong>Website Content & Gallery</strong> section.</em>
            </div>
            <button
              onClick={() => setShowChannelInfoModal(false)}
              className="w-full py-2.5 bg-[#0B1F4D] text-white rounded-xl font-bold text-xs hover:bg-[#14327A] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setZoomItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black text-white p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomItem.imageUrl}
              alt={zoomItem.title}
              className="w-full max-h-[65vh] object-cover"
            />
            <div className="p-6 sm:p-8 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-[#0B1F4D] text-white font-bold text-xs px-3 py-0.5 rounded-full">
                  {zoomItem.category}
                </span>
                <span className="text-xs text-slate-500">{zoomItem.date}</span>
              </div>
              <h3 className="font-serif font-black text-xl sm:text-2xl text-slate-900">
                {zoomItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {zoomItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

