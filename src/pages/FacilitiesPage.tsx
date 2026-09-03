import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import {
  GraduationCap,
  Bus,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
} from 'lucide-react';

interface FacilitiesPageProps {
  onSelectTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = ({ onSelectTab, onOpenLogin }) => {
  const { siteContent } = useSiteContent();

  const school = siteContent?.school;
  const facilities = siteContent?.facilities || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in" id="facilities-page">
      {/* Header */}
      <div className="bg-[#0B1F4D] text-white p-8 rounded-3xl text-center space-y-3 shadow-md">
        <span className="bg-[#F5B301] text-[#0B1F4D] text-xs font-bold px-3 py-1 rounded-full uppercase">
          Key Amenities
        </span>
        <h1 className="text-3xl font-serif font-black">School Facilities</h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto">
          {school?.name || 'Swami Adgadanand Public School'} focuses on foundational student welfare: expert educators in every classroom and reliable, safe transport across all local routes.
        </p>
      </div>

      {/* Primary Facility 1: Well-qualified Class Teachers */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0B1F4D] flex items-center justify-center shrink-0 border border-blue-200">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-blue-100 text-[#0B1F4D] px-2.5 py-0.5 rounded">
                Academic Quality
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-700 font-semibold">100% Certified Faculty</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#0B1F4D]">
              Well-Qualified Class Teachers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every section at {school?.shortName || 'S.A. Public School'} is mentored by a well-qualified, dedicated class teacher who holds relevant post-graduate (M.Sc / M.A.) and professional B.Ed qualifications from recognized state universities.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Personal Student Attention
                </p>
                <p className="text-[11px] text-slate-600">
                  Teachers monitor daily attendance, evaluate weekly tests, and address doubts individually.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Board Examination Preparation
                </p>
                <p className="text-[11px] text-slate-600">
                  Experienced subject specialists preparing students for Class 10 & 12 board examinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Facility 2: School Van / Transport Facility Available */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Bus className="w-9 h-9" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
                Transportation Service
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-700 font-semibold">Safe & Verified Drivers</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#0B1F4D]">
              School Van / Transport Facility Available
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We provide convenient and secure school van and transport services covering all prominent sectors, towns, villages, and rural roads surrounding the school campus.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Doorstep & Designated Stops
                </p>
                <p className="text-[11px] text-slate-600">
                  Fixed morning pickup and afternoon drop schedules ensuring child safety and punctuality.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Parent Coordination
                </p>
                <p className="text-[11px] text-slate-600">
                  Direct transport in-charge hotline for real-time route inquiries and updates.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 mt-3">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#0B1F4D]">
                <a
                  href={`tel:${(school?.phone || '+91 9415754349').replace(/\s+/g, '')}`}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="w-4 h-4 text-[#00AEEF]" />
                  <span>Transport Hotline: <strong>{school?.phone || '+91 9415754349'}</strong></span>
                </a>
                <span className="hidden sm:inline text-blue-300">|</span>
                <a
                  href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`}
                  className="flex items-center gap-1.5 hover:underline text-blue-900 font-medium"
                >
                  <Mail className="w-4 h-4 text-[#00AEEF]" />
                  <span>Email: <strong>{school?.email || 'sapublicschool21@gmail.com'}</strong></span>
                </a>
              </div>
              <button
                onClick={() => onSelectTab('contact')}
                className="text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#14327a] px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                Inquire Route
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Facilities if configured by Admin */}
      {facilities.length > 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Additional Campus Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facilities.slice(2).map((fac) => (
              <div key={fac.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{fac.badge || 'Campus Feature'}</span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#0B1F4D]">{fac.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{fac.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
