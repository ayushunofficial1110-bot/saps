import React, { useState, useEffect } from 'react';
import { SchoolLogo } from '../components/SchoolLogo';
import { Notice } from '../types';
import { useSiteContent } from '../context/SiteContentContext';
import {
  GraduationCap,
  Users,
  Bus,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Bell,
  Clock,
  ShieldCheck,
  Building2,
  HeartHandshake,
} from 'lucide-react';

interface HomePageProps {
  onSelectTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab, onOpenLogin }) => {
  const { siteContent } = useSiteContent();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    parentName: '',
    phone: '',
    studentName: '',
    seekingClass: '10',
  });

  useEffect(() => {
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data) => setNotices(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  const school = siteContent?.school;
  const principal = siteContent?.principal;
  const home = siteContent?.home;

  return (
    <div className="space-y-12 pb-12 animate-in fade-in" id="home-page-container">
      {/* 1. Hero Banner Section */}
      <section className="relative bg-gradient-to-r from-[#0B1F4D] via-[#102a6b] to-[#0B1F4D] text-white overflow-hidden shadow-xl">
        {/* Background Subtle Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#F5B301_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white leading-tight tracking-tight">
                {home?.heroTitle ? (
                  <span>{home.heroTitle}</span>
                ) : (
                  <>
                    SWAMI ADGADANAND <br />
                    <span className="text-[#F5B301]">PUBLIC SCHOOL</span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 font-sans leading-relaxed max-w-2xl">
                {home?.heroSubtitle ||
                  'Nurturing moral wisdom, scientific temperament, and academic excellence under the venerable inspiration of Param Pujya Swami Adgadanand Ji Maharaj.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-erp-btn"
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-2 bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] font-extrabold px-6 py-3.5 rounded-xl text-sm transition shadow-lg hover:shadow-xl transform active:scale-95"
                >
                  <GraduationCap className="w-5 h-5" />
                  Access ERP System (Login)
                </button>

                <button
                  id="hero-family-btn"
                  onClick={() => onSelectTab('family')}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-xl text-sm transition border border-white/20 backdrop-blur-sm"
                >
                  <HeartHandshake className="w-4 h-4 text-amber-300" />
                  <span>My School Family</span>
                </button>

                <button
                  id="hero-facilities-btn"
                  onClick={() => onSelectTab('facilities')}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-semibold transition underline"
                >
                  <span>Facilities & Vans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Core Features Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-700/60">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Qualified Class Teachers</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Safe School Van Fleet</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Absence Alerts</span>
                </div>
              </div>
            </div>

            {/* Right Col: School Seal Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md border-2 border-[#F5B301]/40 p-8 rounded-3xl text-center shadow-2xl relative w-full max-w-sm">
                <div className="absolute -top-3 right-6 bg-[#F5B301] text-[#0B1F4D] text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow">
                  ESTD. 2012
                </div>

                <div className="flex justify-center mb-4">
                  <SchoolLogo size={140} />
                </div>

                <h3 className="font-serif font-black text-xl text-white tracking-wide">
                  {school?.shortName || 'S.A. PUBLIC SCHOOL'}
                </h3>
                <p className="text-amber-300 font-bold text-xs mt-1">
                  {school?.motto || 'सा विद्या या विमुक्तये'}
                </p>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  "{school?.mottoTranslation || 'Knowledge is that which liberates.'}" Committed to holistic education for {school?.academicLevels || 'Classes 1st to 12th'}.
                </p>

                <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${(school?.phone || '+91 9415754349').replace(/\s+/g, '')}`}
                      className="hover:text-white transition flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-[#00AEEF]" />
                      <span>Helpline: <strong className="text-white">{school?.phone || '+91 9415754349'}</strong></span>
                    </a>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <strong className="text-amber-300">{school?.helpSpanText || '24hr'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Mail className="w-3 h-3 text-[#00AEEF] shrink-0" />
                    <a
                      href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`}
                      className="hover:text-amber-300 transition truncate"
                    >
                      Email: <strong>{school?.email || 'sapublicschool21@gmail.com'}</strong>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Notice Ticker / Breaking Circulars Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B1F4D] text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
            <Bell className="w-4 h-4 text-[#F5B301] animate-bounce" />
            <span>Latest News:</span>
          </div>

          <div className="overflow-hidden w-full text-xs text-slate-800 font-medium">
            <p className="truncate">
              {notices.length > 0 ? (
                <>
                  📢 <strong>{notices[0].title}:</strong> {notices[0].content}
                </>
              ) : (
                '📢 Academic Session 2025-26: Term Fee counter active • School Van Routes operational.'
              )}
            </p>
          </div>

          <button
            onClick={() => onSelectTab('notices')}
            className="text-xs font-bold text-[#0B1F4D] hover:underline shrink-0 flex items-center gap-1"
          >
            <span>View All Notices</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* 3. Quick Stats & Institutional Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B1F4D] flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1F4D]">{home?.statStudents || '250+'}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">Enrolled Students</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1F4D]">{home?.statPassRate || '100%'}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">Board Exam Pass Rate</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1F4D]">{home?.statTeachers || '15+'}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">Qualified Teachers</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#00AEEF] flex items-center justify-center mx-auto mb-3">
              <Bus className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1F4D]">{home?.statVans || '6'}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">Dedicated School Vans</div>
          </div>
        </div>
      </section>

      {/* 4. Principal Message from Management (Editable by Admin) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6" id="principal-message-section">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
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
                className="w-36 h-36 rounded-2xl object-cover shadow-md border-4 border-[#0B1F4D]/20 mb-3"
              />
              <h3 className="font-serif font-black text-lg text-[#0B1F4D]">
                {principal?.name || 'Mr. Rajesh Kumar Srivastav'}
              </h3>
              <p className="text-xs font-bold text-amber-600">
                {principal?.designation || 'Director of school'}
              </p>
              {principal?.qualification ? (
                <p className="text-[11px] text-slate-500 mt-1">
                  {principal.qualification}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-block text-xs font-bold text-[#0B1F4D] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md">
                {principal?.designation ? `${principal.designation}'s Desk Message` : "Director's Desk Message"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 leading-tight">
                {principal?.welcomeHeadline ||
                  'Empowering Rural & Suburban Youth with Modern Quality Education'}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {principal?.welcomeMessage ||
                  'Welcome to Swami Adgadanand Public School. We believe true education enlightens the mind while anchoring the spirit in moral character and self-discipline.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onSelectTab('about')}
                  className="text-xs font-bold text-[#0B1F4D] hover:text-[#102a6b] flex items-center gap-1.5 underline"
                >
                  <span>Read full history & blessings of S.A. Public School</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectTab('family')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Meet Our Faculty (My School Family)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Clean Facilities Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md">
            Core Facilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mt-2">
            Why Parents Trust S.A. Public School
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Focusing on what truly matters for your child's daily safety and academic success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facility 1: Well-qualified Class Teachers */}
          <div className="bg-gradient-to-br from-blue-50/80 to-white p-6 sm:p-8 rounded-3xl border border-blue-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-[#0B1F4D] text-[#F5B301] flex items-center justify-center shrink-0 shadow-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-[#0B1F4D]">
                Well-Qualified Class Teachers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every class has an assigned, certified mentor teacher who personally tracks student attendance, academic progression, doubts, and parent communication.
              </p>
              <ul className="text-xs text-slate-700 space-y-1 pt-2 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  1:20 Teacher-Student Ratio for individualized attention
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Special doubt clearance sessions before board examinations
                </li>
              </ul>
            </div>
          </div>

          {/* Facility 2: School Van / Transport */}
          <div className="bg-gradient-to-br from-amber-50/80 to-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-[#F5B301] text-[#0B1F4D] flex items-center justify-center shrink-0 shadow-md">
              <Bus className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-[#0B1F4D]">
                School Van / Transport Facility Available
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Reliable and secure school van fleet with verified drivers and dedicated conductors. Daily door-step pickup and drop service across city, village, and highway stops.
              </p>
              <ul className="text-xs text-slate-700 space-y-1 pt-2 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Punctual morning pickup & afternoon drop-off
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Direct driver-parent communication for route updates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Admission Inquiry & Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0B1F4D] text-white rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="bg-[#F5B301] text-[#0B1F4D] font-black text-xs px-3 py-1 rounded-full uppercase">
                Admissions Open 2025-2026
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                {home?.admissionBannerTitle || 'Admissions Open for Classes 1st to 12th'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {home?.admissionBannerSubtitle ||
                  'Enroll your child at Swami Adgadanand Public School for quality education, affordable fee structure, and dedicated academic guidance.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                <a
                  href={`tel:${(school?.phone || '+91 9415754349').replace(/\s+/g, '')}`}
                  className="flex items-center gap-1.5 text-amber-300 hover:text-white transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Helpline: <strong>{school?.phone || '+91 9415754349'}</strong></span>
                </a>
                <a
                  href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`}
                  className="flex items-center gap-1.5 text-sky-300 hover:text-white transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email: <strong>{school?.email || 'sapublicschool21@gmail.com'}</strong></span>
                </a>
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>{school?.helpSpanText || '24hr'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200">
                {inquirySubmitted ? (
                  <div className="text-center py-6 space-y-2 animate-in zoom-in">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-slate-900">Inquiry Received!</h4>
                    <p className="text-xs text-slate-500">
                      Our school admission counselor will contact you at {inquiryData.phone} shortly, or feel free to email us directly at <a href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`} className="text-blue-700 underline font-semibold">{school?.email || 'sapublicschool21@gmail.com'}</a>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <h4 className="font-bold text-sm text-[#0B1F4D] border-b pb-2">
                      Quick Admission Inquiry
                    </h4>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Parent / Guardian Name"
                        value={inquiryData.parentName}
                        onChange={(e) => setInquiryData({ ...inquiryData, parentName: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0B1F4D]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp / Phone Number"
                        value={inquiryData.phone}
                        onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0B1F4D]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Student Name"
                        value={inquiryData.studentName}
                        onChange={(e) => setInquiryData({ ...inquiryData, studentName: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0B1F4D]"
                      />
                      <select
                        value={inquiryData.seekingClass}
                        onChange={(e) => setInquiryData({ ...inquiryData, seekingClass: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0B1F4D]"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>
                            Class {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold py-2.5 rounded-lg text-xs transition shadow"
                    >
                      Submit Admission Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

