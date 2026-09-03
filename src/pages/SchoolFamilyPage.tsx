import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';
import { useSiteContent } from '../context/SiteContentContext';
import {
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  Search,
  Award,
  Users,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

interface SchoolFamilyPageProps {
  onContactClick?: () => void;
}

export const SchoolFamilyPage: React.FC<SchoolFamilyPageProps> = ({ onContactClick }) => {
  const { siteContent } = useSiteContent();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch teachers', err);
    } finally {
      setLoading(false);
    }
  };

  const schoolName = siteContent?.school?.name || 'Swami Adgadanand Public School';
  const principalName = siteContent?.principal?.name || 'Mr. Rajesh Kumar Srivastav';

  // Get unique subjects for filter
  const allSubjects = Array.from(
    new Set(teachers.map((t) => t.subjectSpecialization).filter(Boolean))
  );

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjectSpecialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.bio && t.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      filterSubject === 'all' || t.subjectSpecialization === filterSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16" id="school-family-page-container">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0B1F4D] via-[#122A63] to-[#1E3A8A] text-white py-14 px-4 sm:px-6 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5B301_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 font-bold px-3 py-1 rounded-full text-xs mb-4 border border-amber-400/30">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
            <span>Dedicated Mentors & Faculty</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight text-white mb-4">
            My School Family
          </h1>

          <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Meet the passionate educators and mentors shaping the intellect, values, and character of every student at {schoolName}.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-5 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-teachers-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teacher by name or subject..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Subject:</span>
              <button
                onClick={() => setFilterSubject('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  filterSubject === 'all'
                    ? 'bg-[#0B1F4D] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Subjects ({teachers.length})
              </button>
              {allSubjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setFilterSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    filterSubject === subj
                      ? 'bg-[#0B1F4D] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-12 bg-slate-100 rounded mb-2"></div>
              </div>
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No teachers found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search keywords or clear the subject filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSubject('all');
              }}
              className="mt-4 px-4 py-2 bg-[#0B1F4D] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="teachers-grid">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                id={`teacher-card-${teacher.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Top Accent Strip */}
                <div className="h-2.5 bg-gradient-to-r from-[#0B1F4D] via-[#00AEEF] to-[#F5B301]"></div>

                <div className="p-6 flex-1 flex flex-col items-center text-center">
                  {/* Photo with golden aura on hover */}
                  <div className="relative mb-4">
                    <img
                      src={
                        teacher.photoUrl ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={teacher.name}
                      onError={(e) => {
                        // Fallback avatar if external image fails
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                      }}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md border-4 border-white ring-2 ring-slate-100 group-hover:ring-amber-400 transition-all duration-300"
                    />
                    <div className="absolute -bottom-2 bg-gradient-to-r from-[#0B1F4D] to-[#1E3A8A] text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow border border-amber-400/40">
                      Class {teacher.assignedClass}-{teacher.assignedSection} Mentor
                    </div>
                  </div>

                  {/* Teacher Name */}
                  <h3 className="text-lg sm:text-xl font-black font-serif text-slate-900 leading-snug mt-2 group-hover:text-[#0B1F4D] transition-colors">
                    {teacher.name}
                  </h3>

                  {/* Subject Badge */}
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                    <BookOpen className="w-3.5 h-3.5 text-[#00AEEF]" />
                    <span>{teacher.subjectSpecialization}</span>
                  </div>

                  {/* Qualification */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                    <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{teacher.qualification}</span>
                  </div>

                  {/* Bio / Quote if available */}
                  {teacher.bio && (
                    <p className="mt-3.5 text-xs text-slate-500 italic leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 w-full text-left">
                      "{teacher.bio}"
                    </p>
                  )}

                  {/* Contact / Email */}
                  <div className="mt-auto pt-4 w-full border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                      {teacher.teacherId}
                    </span>
                    {teacher.phone ? (
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{teacher.phone}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>Faculty Member</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Principal & Mentorship Note */}
        <div className="mt-14 bg-white rounded-2xl border border-amber-200/80 shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-2 border-amber-400 shadow">
            <img
              src={
                (siteContent?.principal?.photoUrl && !siteContent.principal.photoUrl.includes('unsplash'))
                  ? (siteContent.principal.photoUrl.includes('postimg.cc/wtNbyDxM')
                      ? 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg'
                      : siteContent.principal.photoUrl)
                  : 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg'
              }
              alt={principalName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{siteContent?.principal?.designation || 'Director'}'s Guidance</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              Guided under the visionary leadership of {principalName} ({siteContent?.principal?.designation || 'Director of school'})
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              "Our dedicated faculty members work tirelessly to ensure every student in our rural and suburban region achieves their highest academic potential while cultivating strong moral and cultural roots."
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2.5 text-xs text-slate-600">
              <a
                href={`tel:${(siteContent?.school?.phone || '+91 9415754349').replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 hover:text-[#0B1F4D] font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Helpline: {siteContent?.school?.phone || '+91 9415754349'}</span>
              </a>
              <span className="hidden sm:inline text-slate-300">|</span>
              <a
                href={`mailto:${siteContent?.school?.email || 'sapublicschool21@gmail.com'}`}
                className="flex items-center gap-1.5 hover:text-[#0B1F4D] font-semibold text-blue-700 hover:underline"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email: {siteContent?.school?.email || 'sapublicschool21@gmail.com'}</span>
              </a>
            </div>
          </div>
          {onContactClick && (
            <button
              onClick={onContactClick}
              className="shrink-0 px-5 py-2.5 bg-[#0B1F4D] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow"
            >
              Contact School Office
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
