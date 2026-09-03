import React from 'react';
import { SchoolLogo } from '../components/SchoolLogo';
import { useSiteContent } from '../context/SiteContentContext';
import {
  History,
  Target,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { siteContent } = useSiteContent();

  const school = siteContent?.school;
  const principal = siteContent?.principal;
  const about = siteContent?.about;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in" id="about-page">
      {/* Header Banner */}
      <div className="bg-[#0B1F4D] text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-[#F5B301] text-[#0B1F4D] text-xs font-black px-3 py-1 rounded-full uppercase">
            About Our Institution
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-white">
            {school?.name || 'Swami Adgadanand Public School'}
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            {about?.headerSubtitle ||
              'A premier educational institution dedicated to delivering accessible, rigorous, and morally anchored education.'}
          </p>
        </div>
      </div>

      {/* History & Inspiration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-[#0B1F4D] font-bold text-sm">
            <History className="w-5 h-5 text-amber-500" />
            <span>OUR LEGACY & INSPIRATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 leading-tight">
            {about?.historyTitle || 'Inspired by Param Pujya Swami Adgadanand Ji Maharaj'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {about?.historyText ||
              `Swami Adgadanand Public School was founded with a profound spiritual and social mission: to bring world-class educational opportunity and moral discipline to students from both urban and rural backgrounds in Uttar Pradesh.`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-xs text-[#0B1F4D] block">Academic Curriculum</span>
              <span className="text-xs text-slate-600">{school?.academicLevels || 'Classes 1st to 12th'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-xs text-[#0B1F4D] block">Language Medium</span>
              <span className="text-xs text-slate-600">English & Hindi Medium Curriculum</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="bg-gradient-to-b from-amber-50 to-blue-50 p-6 rounded-3xl border-2 border-amber-200 shadow-md text-center max-w-sm w-full">
            <SchoolLogo size={130} />
            <h3 className="font-serif font-black text-lg text-[#0B1F4D] mt-4">
              {school?.shortName || 'S.A. Public School'} Seal
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {school?.motto || 'सा विद्या या विमुक्तये'} — "{school?.mottoTranslation || 'Knowledge is that which liberates.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0B1F4D] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#0B1F4D]">Our Vision</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {about?.vision ||
              'To be a benchmark educational institution that bridges traditional Indian cultural values with modern scientific thinking, empowering every student to excel in board examinations, competitive entrances, and civil life.'}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#0B1F4D]">Our Mission</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {about?.mission ||
              'To provide dedicated qualified class teachers, safe school van transportation, transparent fee structures, and personalized student attention that ensures no child is left behind.'}
          </p>
        </div>
      </div>

      {/* Principal's Desk Message (Editable by Admin) */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10" id="about-principal-desk">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 text-center">
            <img
              src={
                (principal?.photoUrl && !principal.photoUrl.includes('unsplash'))
                  ? (principal.photoUrl.includes('postimg.cc/wtNbyDxM')
                      ? 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg'
                      : principal.photoUrl)
                  : 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg'
              }
              alt={principal?.name || 'Mr. Rajesh Kumar Srivastav'}
              referrerPolicy="no-referrer"
              className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-[#0B1F4D]/20 shadow-md mb-3"
            />
            <h4 className="font-serif font-black text-lg text-[#0B1F4D]">
              {principal?.name || 'Mr. Rajesh Kumar Srivastav'}
            </h4>
            <p className="text-xs text-amber-700 font-bold">
              {principal?.designation || 'Director of school'}
            </p>
            {principal?.qualification ? (
              <p className="text-[11px] text-slate-500">
                {principal.qualification}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-8 space-y-3">
            <h3 className="font-serif font-bold text-2xl text-slate-900">
              Message from the {principal?.designation || 'Director'}'s Desk
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic whitespace-pre-line">
              "{principal?.welcomeMessage ||
                'Dear Parents and Students,\nAt Swami Adgadanand Public School, our constant endeavor is to create an environment where learning is joyful, disciplined, and transformative.'}"
            </p>
            <div className="pt-2">
              <span className="font-serif font-bold text-xs text-[#0B1F4D]">
                — {principal?.name || 'Mr. Rajesh Kumar Srivastav'}, {principal?.designation || 'Director of school'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
