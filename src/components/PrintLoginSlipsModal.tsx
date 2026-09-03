import React, { useState, useEffect, useCallback } from 'react';
import { LoginSlip, UserRole } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { X, Printer, Download, Search, Filter, ShieldCheck, Key, Scissors, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface PrintLoginSlipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlips?: LoginSlip[];
  role?: UserRole;
}

export const PrintLoginSlipsModal: React.FC<PrintLoginSlipsModalProps> = ({
  isOpen,
  onClose,
  initialSlips,
  role = 'student',
}) => {
  const [slips, setSlips] = useState<LoginSlip[]>(initialSlips || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  const fetchSlips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = role === 'teacher' ? '/api/admin/credentials/teachers' : '/api/admin/credentials/students';
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Failed to load credentials (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setSlips(data);
      } else {
        setSlips([]);
      }
    } catch (e: any) {
      console.error('Failed to load login slips', e);
      setError(e.message || 'Failed to load credential slips');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      if (initialSlips && initialSlips.length > 0) {
        setSlips(initialSlips);
        setLoading(false);
        setError(null);
      } else {
        fetchSlips();
      }
    }
  }, [isOpen, role, initialSlips?.length, fetchSlips]);

  if (!isOpen) return null;

  const filteredSlips = slips.filter((slip) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (slip.name && slip.name.toLowerCase().includes(q)) ||
      (slip.username && slip.username.toLowerCase().includes(q)) ||
      (slip.studentId && slip.studentId.toLowerCase().includes(q)) ||
      (slip.teacherId && slip.teacherId.toLowerCase().includes(q)) ||
      (slip.fatherName && slip.fatherName.toLowerCase().includes(q));

    const matchesClass = selectedClass === 'all' || slip.class === selectedClass;
    const matchesSection = selectedSection === 'all' || (slip.section && slip.section.toUpperCase() === selectedSection.toUpperCase());

    return matchesSearch && matchesClass && matchesSection;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header - Hidden in Print */}
        <div className="bg-[#0B1F4D] text-white p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-black flex items-center gap-2">
                Credential Distribution Slips ({filteredSlips.length})
              </h2>
              <p className="text-xs text-slate-300">
                Print and distribute first-time login slips to {role === 'teacher' ? 'Teachers' : 'Students in Class'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-slips-action-btn"
              onClick={handlePrint}
              className="bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls - Hidden in Print */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, ID, roll no, father name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === 'student' && (
              <>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  <option value="all">All Classes</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Class {i + 1}th
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  <option value="all">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </>
            )}

            <button
              onClick={fetchSlips}
              className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Slips Content / Print Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:p-0">
          {loading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-8 h-8 text-[#0B1F4D] animate-spin" />
              <p className="text-sm font-semibold">Generating & loading credential distribution slips...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-3 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-bold">{error}</p>
              <button
                onClick={fetchSlips}
                className="bg-[#0B1F4D] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredSlips.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No login slips match the selected criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              {filteredSlips.map((slip, index) => (
                <div
                  key={slip.id || index}
                  className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-4 relative shadow-sm print:shadow-none print:border-slate-400 print:break-inside-avoid print:p-3"
                >
                  {/* Scissors cut badge */}
                  <div className="absolute -top-2.5 right-4 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 print:text-[8px]">
                    <Scissors className="w-3 h-3" /> Cut Slip
                  </div>

                  {/* School Crest Header */}
                  <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2 mb-2.5">
                    <SchoolLogo size={34} />
                    <div>
                      <h4 className="font-serif font-black text-xs text-[#0B1F4D] leading-tight">
                        SWAMI ADGADANAND PUBLIC SCHOOL
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        ERP Portal Login Credential Slip
                      </p>
                    </div>
                  </div>

                  {/* Student / User Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Account Holder</span>
                      <span className="font-bold text-slate-900">{slip.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Class & Roll No</span>
                      <span className="font-bold text-[#0B1F4D]">
                        Class {slip.class || 'N/A'}-{slip.section || 'A'} | Roll: {slip.rollNo || '01'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Student / Staff ID</span>
                      <span className="font-mono font-bold text-slate-700">{slip.studentId || slip.teacherId || 'SAPS-2025'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Father's Name (Recovery)</span>
                      <span className="font-medium text-slate-800">{slip.fatherName || 'On Record'}</span>
                    </div>
                  </div>

                  {/* Boxed Credentials */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-xs flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[9px] text-amber-800 uppercase font-bold block">Username / Login ID</span>
                      <span className="font-mono font-black text-[#0B1F4D] text-sm select-all">{slip.username}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-amber-800 uppercase font-bold block">Default Password</span>
                      <span className="font-mono font-black text-emerald-800 text-sm select-all">
                        {slip.defaultPassword || slip.temporaryPassword || (slip.role === 'teacher' ? 'teacher123' : 'student123')}
                      </span>
                    </div>
                  </div>

                  {/* Instructions Footer */}
                  <div className="text-[9px] text-slate-500 leading-tight space-y-0.5 border-t border-slate-100 pt-1.5">
                    <p>• <strong>Step 1:</strong> Visit school ERP portal, select role <strong>{slip.role.toUpperCase()}</strong>, and enter above credentials.</p>
                    <p>• <strong>Step 2:</strong> You will be prompted to set your private password on first login.</p>
                    <p>• <strong>Help:</strong> Helpline: +91 9415754349 • Email: sapublicschool21@gmail.com</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info - Hidden in Print */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 print:hidden">
          Tip: Use standard Letter or A4 paper. These slips can be cut into physical cards to distribute to students.
        </div>
      </div>
    </div>
  );
};
