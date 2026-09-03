import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { GalleryItem } from '../types';
import {
  Globe,
  Image as ImageIcon,
  UserCheck,
  Building2,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const AdminWebsiteCMS: React.FC = () => {
  const { siteContent, updateSiteContent, refreshSiteContent } = useSiteContent();

  // Active sub-tab
  const [subTab, setSubTab] = useState<'gallery' | 'principal' | 'identity'>('gallery');

  // Gallery items state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoForm, setNewPhotoForm] = useState({
    title: '',
    category: 'Campus' as const,
    imageUrl: '',
    description: '',
  });

  // Local form state for SiteContent sections
  const [galleryChannelForm, setGalleryChannelForm] = useState({
    moreMediaUrl: siteContent?.gallery?.moreMediaUrl || '',
    bannerTitle: siteContent?.gallery?.bannerTitle || 'View More Photos & Videos',
    bannerSubtitle:
      siteContent?.gallery?.bannerSubtitle ||
      'Follow our official channel for daily campus highlights, annual day celebrations, sports meet clips, and live event updates.',
    buttonText: siteContent?.gallery?.buttonText || 'Open Official Media Channel',
  });

  const [principalForm, setPrincipalForm] = useState({
    name: siteContent?.principal?.name || '',
    designation: siteContent?.principal?.designation || '',
    qualification: siteContent?.principal?.qualification || '',
    photoUrl: siteContent?.principal?.photoUrl || '',
    welcomeHeadline: siteContent?.principal?.welcomeHeadline || '',
    welcomeMessage: siteContent?.principal?.welcomeMessage || '',
  });

  const [identityForm, setIdentityForm] = useState({
    name: siteContent?.school?.name || '',
    shortName: siteContent?.school?.shortName || '',
    motto: siteContent?.school?.motto || '',
    mottoTranslation: siteContent?.school?.mottoTranslation || '',
    logoUrl: siteContent?.school?.logoUrl || 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg',
    phone: siteContent?.school?.phone || '',
    email: siteContent?.school?.email || '',
    address: siteContent?.school?.address || '',
    helpSpanText: siteContent?.school?.helpSpanText || '24hr',
    admissionBannerTitle: siteContent?.home?.admissionBannerTitle || '',
    admissionBannerSubtitle: siteContent?.home?.admissionBannerSubtitle || '',
  });

  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Synchronize when siteContent loads or changes
  useEffect(() => {
    if (siteContent) {
      setGalleryChannelForm({
        moreMediaUrl: siteContent.gallery?.moreMediaUrl || '',
        bannerTitle: siteContent.gallery?.bannerTitle || 'View More Photos & Videos',
        bannerSubtitle:
          siteContent.gallery?.bannerSubtitle ||
          'Follow our official channel for daily campus highlights, annual day celebrations, sports meet clips, and live event updates.',
        buttonText: siteContent.gallery?.buttonText || 'Open Official Media Channel',
      });

      setPrincipalForm({
        name: siteContent.principal?.name || '',
        designation: siteContent.principal?.designation || '',
        qualification: siteContent.principal?.qualification || '',
        photoUrl: siteContent.principal?.photoUrl || '',
        welcomeHeadline: siteContent.principal?.welcomeHeadline || '',
        welcomeMessage: siteContent.principal?.welcomeMessage || '',
      });

      setIdentityForm({
        name: siteContent.school?.name || '',
        shortName: siteContent.school?.shortName || '',
        motto: siteContent.school?.motto || '',
        mottoTranslation: siteContent.school?.mottoTranslation || '',
        logoUrl: siteContent.school?.logoUrl || 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg',
        phone: siteContent.school?.phone || '',
        email: siteContent.school?.email || '',
        address: siteContent.school?.address || '',
        helpSpanText: siteContent.school?.helpSpanText || '24hr',
        admissionBannerTitle: siteContent.home?.admissionBannerTitle || '',
        admissionBannerSubtitle: siteContent.home?.admissionBannerSubtitle || '',
      });
    }
  }, [siteContent]);

  // Fetch gallery items
  const fetchGallery = async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data || []);
      }
    } catch (err) {
      console.error('Failed to load gallery items', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Save Gallery & Channel Settings
  const handleSaveGallerySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateSiteContent({
      gallery: galleryChannelForm,
    });
    setSaving(false);
    if (success) {
      showToast('Gallery & Media Channel settings updated successfully!');
    } else {
      alert('Failed to save settings. Please try again.');
    }
  };

  // Save Principal Info
  const handleSavePrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const resolvedPhoto = principalForm.photoUrl.includes('postimg.cc/wtNbyDxM')
      ? 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg'
      : principalForm.photoUrl.trim();

    const success = await updateSiteContent({
      principal: {
        ...siteContent.principal,
        ...principalForm,
        photoUrl: resolvedPhoto,
      },
    });
    setSaving(false);
    if (success) {
      showToast("Director / Principal profile updated successfully!");
    } else {
      alert('Failed to save info.');
    }
  };

  // Save School Identity & Contact
  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const resolvedLogo = identityForm.logoUrl.includes('postimg.cc/sBLgnd51')
      ? 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg'
      : identityForm.logoUrl.trim();

    const success = await updateSiteContent({
      school: {
        ...siteContent.school,
        name: identityForm.name,
        shortName: identityForm.shortName,
        motto: identityForm.motto,
        mottoTranslation: identityForm.mottoTranslation,
        logoUrl: resolvedLogo,
        phone: identityForm.phone,
        email: identityForm.email,
        address: identityForm.address,
        helpSpanText: identityForm.helpSpanText,
      },
      home: {
        ...siteContent.home,
        admissionBannerTitle: identityForm.admissionBannerTitle,
        admissionBannerSubtitle: identityForm.admissionBannerSubtitle,
      },
    });
    setSaving(false);
    if (success) {
      showToast('School identity and contact details updated!');
    } else {
      alert('Failed to save identity info.');
    }
  };

  // Add Curated Photo to Gallery
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoForm.title || !newPhotoForm.imageUrl) {
      alert('Please fill in title and image URL');
      return;
    }

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhotoForm),
      });

      if (res.ok) {
        setShowAddPhotoModal(false);
        setNewPhotoForm({
          title: '',
          category: 'Campus',
          imageUrl: '',
          description: '',
        });
        showToast('Curated photo added to Gallery!');
        fetchGallery();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add photo');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding photo');
    }
  };

  // Delete Photo from Gallery
  const handleDeletePhoto = async (id: string, title: string) => {
    if (!window.confirm(`Remove "${title}" from the curated gallery?`)) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Photo removed from Gallery.');
        fetchGallery();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="admin-website-cms">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1F4D] text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-[#F5B301] flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0B1F4D] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
              CMS Panel
            </span>
            <span className="text-xs text-slate-500">Live Website Content & Media Channel</span>
          </div>
          <h2 className="text-xl font-serif font-black text-[#0B1F4D] mt-1">
            Website Content & Gallery Management
          </h2>
          <p className="text-xs text-slate-500">
            Edit public portal details, external media channel links, principal info, and curate 2–6 featured photos.
          </p>
        </div>

        {/* Sub-navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setSubTab('gallery')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'gallery'
                ? 'bg-[#0B1F4D] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0B1F4D]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gallery & External Channel</span>
          </button>
          <button
            onClick={() => setSubTab('principal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'principal'
                ? 'bg-[#0B1F4D] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0B1F4D]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Principal's Desk</span>
          </button>
          <button
            onClick={() => setSubTab('identity')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'identity'
                ? 'bg-[#0B1F4D] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0B1F4D]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>School Info & Contacts</span>
          </button>
        </div>
      </div>

      {/* 1. GALLERY & EXTERNAL MEDIA CHANNEL TAB */}
      {subTab === 'gallery' && (
        <div className="space-y-6">
          {/* External Channel Banner Settings Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                  External Media Link
                </span>
                <span className="text-xs text-slate-500">"View More Photos & Videos" Action</span>
              </div>
              <h3 className="text-lg font-serif font-black text-[#0B1F4D] mt-1">
                External Channel Link (WhatsApp Channel / Telegram / Drive)
              </h3>
              <p className="text-xs text-slate-500">
                Configure the destination URL for the prominent "View more photos & videos" button. Leave empty for now if you will add the link later.
              </p>
            </div>

            <form onSubmit={handleSaveGallerySettings} className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-amber-700" />
                  <span>External Channel URL (e.g. WhatsApp Channel link, Telegram link, or Google Drive folder)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://whatsapp.com/channel/... (or leave blank for now)"
                  value={galleryChannelForm.moreMediaUrl}
                  onChange={(e) =>
                    setGalleryChannelForm({ ...galleryChannelForm, moreMediaUrl: e.target.value })
                  }
                  className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#0B1F4D]"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  💡 <strong>Tip:</strong> If left empty, visitors clicking the button on the Gallery page will see an informative note that the official channel will be linked soon. Once you paste your WhatsApp or Telegram channel link here and click Save, the button will directly take visitors there in a new tab.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Heading</label>
                  <input
                    type="text"
                    value={galleryChannelForm.bannerTitle}
                    onChange={(e) =>
                      setGalleryChannelForm({ ...galleryChannelForm, bannerTitle: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={galleryChannelForm.buttonText}
                    onChange={(e) =>
                      setGalleryChannelForm({ ...galleryChannelForm, buttonText: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={galleryChannelForm.bannerSubtitle}
                  onChange={(e) =>
                    setGalleryChannelForm({ ...galleryChannelForm, bannerSubtitle: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0B1F4D] hover:bg-[#14327a] text-white rounded-xl font-bold transition flex items-center gap-2 shadow"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{saving ? 'Saving...' : 'Save Gallery Channel Settings'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Curated 2-6 Photos List */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-[#0B1F4D] text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                    Curated Showcase
                  </span>
                  <span className="text-xs text-slate-500">2–6 Handpicked Highlights</span>
                </div>
                <h3 className="text-lg font-serif font-black text-[#0B1F4D] mt-1">
                  Admin-Managed Gallery Selection
                </h3>
                <p className="text-xs text-slate-500">
                  Keep a curated selection of 2–6 clean photos for fast page loading. All other photos will be explored via the external channel.
                </p>
              </div>

              <button
                onClick={() => setShowAddPhotoModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Curated Photo</span>
              </button>
            </div>

            {loadingGallery ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading gallery photos...</div>
            ) : galleryItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No photos in the curated selection. Click "Add Curated Photo" above to add 2–6 photos.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative aspect-video bg-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#0B1F4D]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDeletePhoto(item.id, item.title)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-90 group-hover:opacity-100 transition shadow"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.description || 'No description'}</p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t flex justify-between items-center">
                        <span>{item.date}</span>
                        <span className="text-emerald-700 font-semibold">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PRINCIPAL'S DESK TAB */}
      {subTab === 'principal' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b pb-4">
            <h3 className="text-lg font-serif font-black text-[#0B1F4D]">
              Principal's Profile & Welcome Message
            </h3>
            <p className="text-xs text-slate-500">
              Update the principal's name, qualifications, headline, and message shown on the Home and About pages.
            </p>
          </div>

          <form onSubmit={handleSavePrincipal} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Principal's Full Name *</label>
                <input
                  type="text"
                  required
                  value={principalForm.name}
                  onChange={(e) => setPrincipalForm({ ...principalForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={principalForm.designation}
                  onChange={(e) =>
                    setPrincipalForm({ ...principalForm, designation: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Qualifications & Education (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave blank if not required"
                  value={principalForm.qualification}
                  onChange={(e) =>
                    setPrincipalForm({ ...principalForm, qualification: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
                <p className="text-[11px] text-slate-400 mt-1">Leave empty if you don't wish to display qualifications.</p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Director / Principal Photo URL</label>
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      principalForm.photoUrl?.includes('postimg.cc/wtNbyDxM')
                        ? 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg'
                        : principalForm.photoUrl || 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg'
                    }
                    alt="Photo Preview"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-amber-300 shrink-0 shadow-sm"
                  />
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="https://postimg.cc/wtNbyDxM or direct link"
                      value={principalForm.photoUrl}
                      onChange={(e) =>
                        setPrincipalForm({ ...principalForm, photoUrl: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D] text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPrincipalForm({
                      ...principalForm,
                      photoUrl: 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg',
                    })
                  }
                  className="text-[11px] text-blue-700 hover:underline font-semibold mt-1 inline-block"
                >
                  Reset to Official Director Photo
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Welcome Headline</label>
              <input
                type="text"
                value={principalForm.welcomeHeadline}
                onChange={(e) =>
                  setPrincipalForm({ ...principalForm, welcomeHeadline: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Principal's Desk Message (Home & About Page)</label>
              <textarea
                rows={4}
                value={principalForm.welcomeMessage}
                onChange={(e) =>
                  setPrincipalForm({ ...principalForm, welcomeMessage: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0B1F4D] hover:bg-[#14327a] text-white rounded-xl font-bold transition flex items-center gap-2 shadow"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>{saving ? 'Saving...' : "Save Principal's Info"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. SCHOOL IDENTITY & CONTACT TAB */}
      {subTab === 'identity' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b pb-4">
            <h3 className="text-lg font-serif font-black text-[#0B1F4D]">
              School Identity & Contact Info
            </h3>
            <p className="text-xs text-slate-500">
              Manage school titles, motto, official helpline, address, and admission announcements.
            </p>
          </div>

          <form onSubmit={handleSaveIdentity} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">School Full Name *</label>
                <input
                  type="text"
                  required
                  value={identityForm.name}
                  onChange={(e) => setIdentityForm({ ...identityForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Name *</label>
                <input
                  type="text"
                  required
                  value={identityForm.shortName}
                  onChange={(e) => setIdentityForm({ ...identityForm, shortName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sanskrit Motto</label>
                <input
                  type="text"
                  value={identityForm.motto}
                  onChange={(e) => setIdentityForm({ ...identityForm, motto: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Motto Meaning / Translation</label>
                <input
                  type="text"
                  value={identityForm.mottoTranslation}
                  onChange={(e) =>
                    setIdentityForm({ ...identityForm, mottoTranslation: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Helpline Phone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={identityForm.phone}
                  onChange={(e) => setIdentityForm({ ...identityForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={identityForm.email}
                  onChange={(e) => setIdentityForm({ ...identityForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Help Availability Text</label>
                <input
                  type="text"
                  value={identityForm.helpSpanText}
                  onChange={(e) =>
                    setIdentityForm({ ...identityForm, helpSpanText: e.target.value })
                  }
                  placeholder="e.g. 24hr"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
                />
              </div>
            </div>

            {/* School Logo URL & Live Preview */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <label className="block font-bold text-slate-900 mb-1 text-sm">
                Official School Logo Image (URL)
              </label>
              <p className="text-xs text-slate-600 mb-2.5">
                Displays on the navigation bar, school portal, receipts, and credential slips. Supports PostImage links or direct image URLs.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={
                      identityForm.logoUrl.includes('postimg.cc/sBLgnd51')
                        ? 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg'
                        : identityForm.logoUrl || 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg'
                    }
                    alt="School Logo Preview"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 bg-white shadow-sm"
                  />
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  <input
                    type="url"
                    value={identityForm.logoUrl}
                    onChange={(e) => setIdentityForm({ ...identityForm, logoUrl: e.target.value })}
                    placeholder="https://postimg.cc/sBLgnd51 or direct .jpg/.png link"
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono outline-none focus:border-[#0B1F4D]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setIdentityForm({
                          ...identityForm,
                          logoUrl: 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg',
                        })
                      }
                      className="text-[11px] text-blue-700 hover:underline font-semibold"
                    >
                      Reset to Official PostImage Logo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Campus Physical Address *</label>
              <textarea
                rows={2}
                required
                value={identityForm.address}
                onChange={(e) => setIdentityForm({ ...identityForm, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-[#0B1F4D]"
              ></textarea>
            </div>

            <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
              <h4 className="font-bold text-slate-900">Admission Open Announcement Banner</h4>
              <div className="space-y-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Banner Title</label>
                  <input
                    type="text"
                    value={identityForm.admissionBannerTitle}
                    onChange={(e) =>
                      setIdentityForm({ ...identityForm, admissionBannerTitle: e.target.value })
                    }
                    className="w-full p-2 bg-white border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Banner Subtitle</label>
                  <input
                    type="text"
                    value={identityForm.admissionBannerSubtitle}
                    onChange={(e) =>
                      setIdentityForm({ ...identityForm, admissionBannerSubtitle: e.target.value })
                    }
                    className="w-full p-2 bg-white border rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0B1F4D] hover:bg-[#14327a] text-white rounded-xl font-bold transition flex items-center gap-2 shadow"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>{saving ? 'Saving...' : 'Save Identity & Contacts'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Photo Modal */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1F4D] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Add Photo to Curated Gallery</h3>
              <button
                onClick={() => setShowAddPhotoModal(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddPhotoSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2025"
                  value={newPhotoForm.title}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={newPhotoForm.category}
                  onChange={(e) =>
                    setNewPhotoForm({ ...newPhotoForm, category: e.target.value as any })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none"
                >
                  <option value="Campus">Campus</option>
                  <option value="Classrooms">Classrooms</option>
                  <option value="Transport">Transport</option>
                  <option value="Sports">Sports</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL (Unsplash / Hosted URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPhotoForm.imageUrl}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Caption</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the event or facility..."
                  value={newPhotoForm.description}
                  onChange={(e) =>
                    setNewPhotoForm({ ...newPhotoForm, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1F4D] text-white rounded-lg font-bold hover:bg-[#14327a]"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
