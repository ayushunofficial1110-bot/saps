import React, { useState, useEffect } from 'react';
import { User, Student, AttendanceRecord, FeeTransaction, Notice } from '../../types';
import { PrintReceiptModal } from '../../components/PrintReceiptModal';
import {
  GraduationCap,
  CalendarCheck,
  IndianRupee,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ShieldCheck,
  User as UserIcon,
  Bell,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  onOpenChangePassword: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onOpenChangePassword,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'notices' | 'password'>('overview');
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<FeeTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inline password change state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const studentId = currentUser.studentId || 'SAPS-2025-1001';

  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true);
      try {
        const [studentRes, attRes, feesRes, notRes] = await Promise.all([
          fetch(`/api/students/${studentId}`).then((r) => r.json()),
          fetch(`/api/attendance?studentId=${studentId}`).then((r) => r.json()),
          fetch(`/api/fees/student/${studentId}`).then((r) => r.json()),
          fetch('/api/notices').then((r) => r.json()),
        ]);

        setStudent(studentRes);
        setAttendance(attRes);
        setTransactions(feesRes.transactions || []);
        setNotices(notRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [studentId]);

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

  // Attendance stats
  const totalDays = attendance.length || 20;
  const presentDays = attendance.filter((a) => a.status === 'present').length || 18;
  const absentDays = attendance.filter((a) => a.status === 'absent').length || 2;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 90;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in" id="student-dashboard-root">
      {/* Student Banner */}
      <div className="bg-[#0B1F4D] text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="bg-[#F5B301] text-[#0B1F4D] text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
              Student Portal
            </span>
            <span className="text-xs text-slate-300">Academic Session 2025-26</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
            {student?.name || currentUser.name}
          </h1>
          <p className="text-xs text-slate-300">
            Class {student?.class || '10'} - Section {student?.section || 'A'} • Roll No: {student?.rollNo || '01'} • Student ID: {student?.studentId || studentId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTxForReceipt(transactions[0] || null);
              setShowReceiptModal(true);
            }}
            className="px-3.5 py-2 bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Latest Fee Receipt</span>
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

      {/* Nav Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" /> Student Profile & Summary
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'attendance' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" /> Attendance Record ({attendancePct}%)
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'fees' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" /> Fee Balance & Receipts
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notices' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> School Notices ({notices.length})
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

      {/* 1. OVERVIEW / PROFILE TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Attendance Overall</span>
              <div className="text-2xl font-extrabold text-emerald-700">{attendancePct}%</div>
              <p className="text-[11px] text-slate-500">Minimum attendance required: 75%</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Fees Paid</span>
              <div className="text-2xl font-extrabold text-[#0B1F4D]">
                ₹ {(student?.feesPaid || 12000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold">Of Annual ₹ {(student?.feesTotal || 18000).toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Outstanding Due</span>
              <div className="text-2xl font-extrabold text-red-600">
                ₹ {(student?.feesDue || 6000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">Term 2 Fee Installment</p>
            </div>
          </div>

          {/* Student Detailed Bio Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#0B1F4D] border-b pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Student Profile & Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{student?.name || 'Aarav Kumar Mishra'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Student ERP ID / System Login</span>
                <span className="font-mono font-bold text-[#0B1F4D]">{student?.studentId || studentId}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Class & Section</span>
                <span className="font-bold text-[#0B1F4D]">Class {student?.class || '10'} - Section {student?.section || 'A'} (Roll {student?.rollNo || '01'})</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Father's Name</span>
                <span className="font-bold text-slate-800">{student?.fatherName || 'Sri Ramesh Mishra'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Mother's Name</span>
                <span className="font-bold text-slate-800">{student?.motherName || 'Smt. Geeta Mishra'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Parent WhatsApp Number</span>
                <span className="font-mono font-bold text-emerald-700">{student?.parentWhatsApp || '+91 98380 11223'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 md:col-span-2">
                <span className="text-slate-400 block text-[10px]">Residential Address & Van Route Stop</span>
                <span className="font-medium text-slate-800">{student?.address || 'House No 42, Near Temple, Phulpur Market, UP'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                <span className="font-medium text-slate-800">{student?.dob || '2010-04-15'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                Daily Attendance Register
              </h2>
              <p className="text-xs text-slate-500">
                Live attendance records marked by your designated class teacher.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg">
                Present: {presentDays} Days
              </span>
              <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-lg">
                Absent: {absentDays} Days
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F4D] text-white">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Marked By</th>
                  <th className="py-2.5 px-3">Remarks / WhatsApp Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No attendance records found yet.
                    </td>
                  </tr>
                ) : (
                  attendance.map((rec) => (
                    <tr key={rec.id} className={rec.status === 'absent' ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rec.date}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Class Teacher</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {rec.status === 'absent'
                          ? 'Absence Alert sent to parent WhatsApp'
                          : rec.remarks || 'Regular Attendance'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FEES TAB */}
      {activeTab === 'fees' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                Fee Account & Transaction History
              </h2>
              <p className="text-xs text-slate-500">
                Official records of composite tuition, lab, exam, and transport fees.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedTxForReceipt(transactions[0] || null);
                setShowReceiptModal(true);
              }}
              className="bg-[#0B1F4D] hover:bg-[#14327a] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5 text-[#F5B301]" />
              <span>Print Official Fee Receipt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-1">
              <span className="text-slate-400">Total Annual Fee</span>
              <p className="text-lg font-bold text-slate-900">₹ {(student?.feesTotal || 18000).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-emerald-700">Total Amount Paid</span>
              <p className="text-lg font-bold text-emerald-800">₹ {(student?.feesPaid || 12000).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-1">
              <span className="text-red-700">Remaining Balance Due</span>
              <p className="text-lg font-bold text-red-800">₹ {(student?.feesDue || 6000).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <h3 className="font-bold text-sm text-[#0B1F4D]">Past Payments & Receipts</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F4D] text-white">
                <tr>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Payment Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Paid By</th>
                  <th className="py-2.5 px-3 text-right">Print Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0B1F4D]">{tx.receiptNo}</td>
                      <td className="py-2.5 px-3 font-mono">{tx.paymentDate}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">₹ {tx.amount.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3">{tx.paymentMode}</td>
                      <td className="py-2.5 px-3">{tx.paidBy}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTxForReceipt(tx);
                            setShowReceiptModal(true);
                          }}
                          className="text-[#0B1F4D] hover:underline font-bold flex items-center gap-1 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" /> View / Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. NOTICES TAB */}
      {activeTab === 'notices' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
              Circulars & Official Notices ({notices.length})
            </h2>
            <p className="text-xs text-slate-500">
              Exam dates, holiday notices, and important academic announcements.
            </p>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-100 text-[#0B1F4D] font-bold px-2 py-0.5 rounded text-[10px]">
                    {n.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">{n.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h3>
                <p className="text-slate-600 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CHANGE PASSWORD TAB (Simple, optional, plain language) */}
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
                  You can change your password anytime. If you wish to keep your default password (student123), you don't need to change anything.
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

          <form onSubmit={handleInlineChangePassword} className="space-y-4" id="student-change-password-form">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter your old password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="e.g. student123 or current password"
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

      {/* Printable Receipt Modal */}
      <PrintReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        transaction={selectedTxForReceipt}
        student={student}
      />
    </div>
  );
};
