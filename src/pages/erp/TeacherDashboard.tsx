import React, { useState, useEffect } from 'react';
import { User, Student, AttendanceRecord, AttendanceStatus } from '../../types';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Check,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Search,
  BookOpen,
  ShieldCheck,
  Phone,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: User;
  onOpenChangePassword: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onOpenChangePassword,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'password'>('attendance');
  const [teacherData, setTeacherData] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline password change state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const assignedClass = currentUser.assignedClass || '10';
  const assignedSection = currentUser.assignedSection || 'A';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get students for this class & section
      const studentsRes = await fetch(`/api/students?class=${assignedClass}&section=${assignedSection}`);
      const studentsData: Student[] = await studentsRes.json();
      setStudents(studentsData);

      // 2. Check if attendance already exists for this date
      const attRes = await fetch(`/api/attendance?class=${assignedClass}&section=${assignedSection}&date=${attendanceDate}`);
      const attData: AttendanceRecord[] = await attRes.json();

      const newMap: Record<string, AttendanceStatus> = {};
      const newRemarks: Record<string, string> = {};

      studentsData.forEach((s) => {
        const found = attData.find((a) => a.studentId === s.studentId);
        newMap[s.studentId] = found ? found.status : 'present';
        newRemarks[s.studentId] = found?.remarks || '';
      });

      setAttendanceMap(newMap);
      setRemarksMap(newRemarks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [attendanceDate, assignedClass, assignedSection]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      newMap[s.studentId] = 'present';
    });
    setAttendanceMap(newMap);
    showToast('All students marked Present');
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        studentName: s.name,
        rollNo: s.rollNo,
        class: s.class,
        section: s.section,
        parentWhatsApp: s.parentWhatsApp,
        status: attendanceMap[s.studentId] || 'present',
        remarks: remarksMap[s.studentId] || '',
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceDate,
          class: assignedClass,
          section: assignedSection,
          markedBy: currentUser.name,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');

      const absentCount = records.filter((r) => r.status === 'absent').length;
      if (absentCount > 0) {
        showToast(`Attendance saved! Dispatched WhatsApp absence alerts to ${absentCount} parent(s) via Meta API.`);
      } else {
        showToast('Attendance saved successfully. 100% presence recorded!');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInlineChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'Please enter at least 6 characters for your new password.' });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'New passwords do not match. Please re-enter them carefully.' });
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: oldPass,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPassMsg({ type: 'success', text: 'Password updated successfully! You can now use your new password next time you log in.' });
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message || 'Could not change password. Please check your old password.' });
    } finally {
      setPassLoading(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in" id="teacher-dashboard-root">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1F4D] text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Teacher Banner */}
      <div className="bg-[#0B1F4D] text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="bg-[#F5B301] text-[#0B1F4D] text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
              Class Teacher Portal
            </span>
            <span className="text-xs text-amber-300 font-bold">
              Assigned: Class {assignedClass} - Section {assignedSection}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
            {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300">
            Daily Attendance Register • WhatsApp Absence Dispatch • Class Roster ({students.length} Students)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-xs flex items-center gap-1 border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-amber-300/30"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'attendance' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Mark Daily Attendance
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'students' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Class {assignedClass}-{assignedSection} Roster ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'password' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Change Password
        </button>
      </div>

      {/* 1. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Attendance Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0B1F4D] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                  Present: {presentCount}
                </span>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-lg">
                  Absent: {absentCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition"
              >
                Mark All Present
              </button>

              <button
                id="save-attendance-btn"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="bg-[#0B1F4D] hover:bg-[#14327a] text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#F5B301]" />
                <span>{saving ? 'Saving & Alerting...' : 'Save & Dispatch WhatsApp'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Alert Notice Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-950">
            <Send className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Automated Parent WhatsApp Dispatch Active</p>
              <p className="text-[11px] text-emerald-800">
                Any student marked <strong className="text-red-700 font-bold">Absent</strong> will trigger an immediate WhatsApp attendance alert to their registered parent mobile number.
              </p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F4D] text-white">
                <tr>
                  <th className="py-2.5 px-3">Roll</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Parent Phone</th>
                  <th className="py-2.5 px-3 text-center">Attendance Status</th>
                  <th className="py-2.5 px-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => {
                  const status = attendanceMap[student.studentId] || 'present';
                  return (
                    <tr
                      key={student.id}
                      className={
                        status === 'absent'
                          ? 'bg-red-50/60'
                          : status === 'late'
                          ? 'bg-amber-50/40'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="py-3 px-3 font-bold text-[#0B1F4D]">Roll {student.rollNo}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{student.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{student.studentId}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{student.parentWhatsApp}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            P (Present)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              status === 'absent'
                                ? 'bg-red-600 text-white shadow ring-2 ring-red-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            A (Absent)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'late')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              status === 'late'
                                ? 'bg-amber-500 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="e.g. Sick leave / late bus"
                          value={remarksMap[student.studentId] || ''}
                          onChange={(e) =>
                            setRemarksMap({ ...remarksMap, [student.studentId]: e.target.value })
                          }
                          className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CLASS ROSTER TAB */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                Class {assignedClass} - Section {assignedSection} Student Directory
              </h2>
              <p className="text-xs text-slate-500">
                Class student registry and directory under your mentorship.
              </p>
            </div>
            <span className="bg-blue-100 text-[#0B1F4D] text-xs font-bold px-3 py-1 rounded-full">
              {students.length} Students
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((s) => (
              <div key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B1F4D] bg-white px-2 py-0.5 rounded border">
                    Roll {s.rollNo}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{s.studentId}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                  <p className="text-slate-500 text-[11px]">Father: {s.fatherName}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {s.parentWhatsApp}
                  </span>
                  <span className={`font-bold ${s.feesDue === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {s.feesDue === 0 ? 'Fees Clear' : `₹ ${s.feesDue} Due`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CHANGE PASSWORD TAB (Simple, optional, plain language) */}
      {activeTab === 'password' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-xl">
          <div className="border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                  Change Password / पासवर्ड बदलें
                </h2>
                <p className="text-xs text-slate-500">
                  You can change your password anytime. If you wish to keep your default password (teacher123), you don't need to change anything.
                </p>
              </div>
            </div>
          </div>

          {passMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                passMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {passMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleInlineChangePassword} className="space-y-4" id="teacher-change-password-form">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter your old password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="e.g. teacher123 or current password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B1F4D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter your new password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter your new password (minimum 6 characters)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B1F4D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Re-enter your new password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Enter new password again to confirm"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B1F4D] outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Keep it simple and easy for you to remember.
              </p>
              <button
                type="submit"
                disabled={passLoading}
                className="px-6 py-2.5 bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
              >
                {passLoading ? 'Saving...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
