import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { useSiteContent } from '../context/SiteContentContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Users,
} from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenLogin }) => {
  const { siteContent } = useSiteContent();
  const school = siteContent?.school;

  return (
    <footer className="bg-[#0B1F4D] text-slate-300 pt-12 pb-6 border-t-4 border-[#F5B301]" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SchoolLogo size={54} />
              <div>
                <h3 className="text-white font-serif font-black text-base tracking-wide leading-tight">
                  {school?.name?.toUpperCase() || 'SWAMI ADGADANAND PUBLIC SCHOOL'}
                </h3>
                <p className="text-amber-400 text-xs font-bold">
                  {school?.shortName || 'PUBLIC SCHOOL'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {school?.description ||
                'Inspired by the holy ideals and divine wisdom of Param Pujya Swami Adgadanand Ji Maharaj, providing value-based, holistic education with strong academic foundations for students of Uttar Pradesh.'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-amber-300 font-semibold">
              <Clock className="w-4 h-4 text-[#F5B301]" />
              <span>{school?.helpSpanText || '24hr Assistance & Helpline'}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#F5B301] rounded-full"></span>
              School Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('about')}
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  About School & Legacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('school-family')}
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  My School Family (Teachers)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('facilities')}
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  Qualified Teachers & Transport
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('notices')}
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  Notice Board & Circulars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('gallery')}
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  Photo Gallery & Campus
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLogin}
                  className="text-amber-300 font-bold hover:underline transition flex items-center gap-1.5 pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  ERP Login (Admin/Teacher/Student)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Highlights */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00AEEF] rounded-full"></span>
              Key Highlights
            </h4>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <p className="font-semibold text-white">Experienced Class Teachers</p>
                <p className="text-slate-400 text-[11px]">Dedicated mentors assigned per section for personal care.</p>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <p className="font-semibold text-white">School Van & Safe Transport</p>
                <p className="text-slate-400 text-[11px]">Reliable fleet covering city and suburban rural routes.</p>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <p className="font-semibold text-white">Daily WhatsApp Absence Alerts</p>
                <p className="text-slate-400 text-[11px]">Instant automated notification to parent WhatsApp numbers.</p>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Campus Address
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">
                  {school?.address ||
                    `Swami Adgadanand Public School Campus,\nMain Highway Road, Phulpur / Varanasi Sector,\nUttar Pradesh - 221002, India`}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${(school?.phone || '+91 9415754349').replace(/\s+/g, '')}`} className="hover:underline">
                  {school?.phone || '+91 9415754349'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`} className="hover:underline text-slate-200">
                  {school?.email || 'sapublicschool21@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-amber-300 font-semibold">{school?.helpSpanText || '24hr Helpline'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} {school?.name || 'Swami Adgadanand Public School'} ({school?.shortName || 'SAPS'}). All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Meta WhatsApp Cloud API Integrated</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{school?.motto || 'सा विद्या या विमुक्तये'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
