import React, { useState, useEffect } from 'react';
import { User, Student, Teacher, Notice, FeeTransaction, WhatsAppLog, LoginSlip, UserRole } from '../../types';
import { PrintReceiptModal } from '../../components/PrintReceiptModal';
import { PrintLoginSlipsModal } from '../../components/PrintLoginSlipsModal';
import { AdminWebsiteCMS } from '../../components/AdminWebsiteCMS';
import * as XLSX from 'xlsx';
import {
  Users,
  GraduationCap,
  IndianRupee,
  CalendarCheck,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Bell,
  BookOpen,
  Server,
  RefreshCw,
  Eye,
  Printer,
  ChevronDown,
  Sparkles,
  UserCheck,
  LogIn,
  Key,
  Globe,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onOpenChangePassword: () => void;
  onImpersonate?: (targetUser: User, impersonatorAdmin: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenChangePassword,
  onImpersonate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers' | 'fees' | 'notices' | 'homework' | 'whatsapp' | 'website' | 'deployment'>('overview');

  // State Data
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>([]);
  const [whatsAppStatus, setWhatsAppStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [showCollectFeeModal, setShowCollectFeeModal] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<Student | null>(null);
  const [receiptModalTx, setReceiptModalTx] = useState<FeeTransaction | null>(null);
  const [receiptModalStudent, setReceiptModalStudent] = useState<Student | null>(null);

  // Login Slips Modal
  const [showLoginSlipsModal, setShowLoginSlipsModal] = useState(false);
  const [loginSlipsRole, setLoginSlipsRole] = useState<UserRole>('student');
  const [initialSlipsForPrint, setInitialSlipsForPrint] = useState<LoginSlip[]>([]);

  // Forms
  const [singleStudentForm, setSingleStudentForm] = useState({
    name: '',
    rollNo: '',
    class: '10',
    section: 'A',
    fatherName: '',
    motherName: '',
    parentWhatsApp: '+91 ',
    feesTotal: 18000,
    feesPaid: 0,
    address: '',
    dob: '2010-01-01',
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    qualification: 'M.Sc., B.Ed',
    assignedClass: '10',
    assignedSection: 'A',
    subjectSpecialization: 'Mathematics & Science',
  });

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'General' as const,
    targetRole: 'all' as const,
    isPinned: false,
  });

  const [feeCollectForm, setFeeCollectForm] = useState({
    amount: '',
    paymentMode: 'Cash' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque',
    paidBy: '',
    remarks: 'Tuition Fee Installment',
  });

  // Bulk Excel import states
  const [excelPreviewData, setExcelPreviewData] = useState<any[]>([]);
  const [bulkImportResult, setBulkImportResult] = useState<any>(null);
  const [bulkImporting, setBulkImporting] = useState(false);

  // Status message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, teachersRes, noticesRes, waRes] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/students').then((r) => r.json()),
        fetch('/api/teachers').then((r) => r.json()),
        fetch('/api/notices').then((r) => r.json()),
        fetch('/api/whatsapp/status').then((r) => r.json()),
      ]);

      setStats(statsRes);
      setStudents(studentsRes);
      setTeachers(teachersRes);
      setNotices(noticesRes);
      setWhatsAppStatus(waRes);
      setWhatsAppLogs(waRes.logs || []);
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Add Single Student
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleStudentForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');

      showToast(`Student ${data.student.name} added! Login ID: ${data.generatedCredentials.username}`);
      setShowAddStudentModal(false);
      setSingleStudentForm({
        name: '',
        rollNo: '',
        class: '10',
        section: 'A',
        fatherName: '',
        motherName: '',
        parentWhatsApp: '+91 ',
        feesTotal: 18000,
        feesPaid: 0,
        address: '',
        dob: '2010-01-01',
      });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Excel File Select for Bulk Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);
        setExcelPreviewData(data);
      } catch (err) {
        alert('Could not parse Excel file. Please ensure it matches the template.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Execute Bulk Import
  const handleExecuteBulkImport = async () => {
    if (excelPreviewData.length === 0) return;
    setBulkImporting(true);

    try {
      const res = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: excelPreviewData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk import failed');

      setBulkImportResult(data);
      showToast(`Successfully imported ${data.importedCount} student records with auto-generated logins!`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBulkImporting(false);
    }
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    window.open('/api/students-template', '_blank');
  };

  // Add Teacher
  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add teacher');

      showToast(`Teacher ${data.teacher.name} created! Assigned to Class ${data.teacher.assignedClass}-${data.teacher.assignedSection}`);
      setShowAddTeacherModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      showToast(`Student ${name} removed`);
      fetchData();
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove teacher "${name}"?`)) return;
    try {
      await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      showToast(`Teacher ${name} removed`);
      fetchData();
    } catch (err) {
      alert('Failed to delete teacher');
    }
  };

  // Admin Assisted Password Reset
  const handleAdminResetPassword = async (targetUserId: string, name: string) => {
    const defaultPassword = 'password123';
    if (!window.confirm(`Reset password for "${name}" to default "${defaultPassword}"?`)) return;

    try {
      const res = await fetch('/api/auth/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, defaultPassword }),
      });
      const data = await res.json();
      showToast(data.message || 'Password reset successfully');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  // Impersonate User (Student or Teacher)
  const handleImpersonateUser = async (target: {
    targetUserId?: string;
    targetStudentId?: string;
    targetTeacherId?: string;
    name: string;
    role: string;
  }) => {
    if (!confirm(`Are you sure you want to log in as ${target.name} (${target.role.toUpperCase()})?\n\nYou will enter Admin Mode with their full dashboard view. All actions will be logged.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          targetUserId: target.targetUserId,
          targetStudentId: target.targetStudentId,
          targetTeacherId: target.targetTeacherId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to switch user account');
      }

      if (onImpersonate) {
        onImpersonate(data.targetUser, data.impersonatorAdmin);
      }
    } catch (err: any) {
      alert(err.message || 'Unable to impersonate user');
    }
  };

  // Fee Collection
  const handleCollectFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForFee) return;

    try {
      const res = await fetch('/api/fees/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentForFee.studentId,
          amount: feeCollectForm.amount,
          paymentMode: feeCollectForm.paymentMode,
          paidBy: feeCollectForm.paidBy || selectedStudentForFee.fatherName,
          remarks: feeCollectForm.remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      setShowCollectFeeModal(false);
      setReceiptModalTx(data.transaction);
      setReceiptModalStudent(data.updatedStudent);
      showToast(`Payment of ₹${feeCollectForm.amount} recorded for ${selectedStudentForFee.name}!`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Notice
  const handleAddNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post notice');

      showToast('Circular published successfully!');
      setShowAddNoticeModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClassFilter === 'all' || s.class === selectedClassFilter;
    const matchSec = selectedSectionFilter === 'all' || s.section === selectedSectionFilter;
    const matchQ =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.includes(studentSearch) ||
      s.fatherName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.parentWhatsApp.includes(studentSearch);
    return matchClass && matchSec && matchQ;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in" id="admin-dashboard-root">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1F4D] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#F5B301] flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[#0B1F4D] text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="bg-[#F5B301] text-[#0B1F4D] text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-300">Official School ERP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
            {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300">
            Principal & Administrative Oversight • Total 10+ Classes • Auto WhatsApp Absence Alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-xs flex items-center gap-1 border border-white/10"
            title="Refresh ERP Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={onOpenChangePassword}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-amber-300/30"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Dashboard Nav Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" /> Overview & Stats
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'students' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> Students & Bulk Import
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'teachers' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Teachers & Classes
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'fees' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" /> Fees & Receipts
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'notices' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Circulars & Notices
        </button>

        {/* Future Homework Placeholder */}
        <button
          onClick={() => setActiveTab('homework')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'homework'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Homework</span>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">Future</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'whatsapp' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" /> Meta WhatsApp Cloud API
        </button>

        <button
          onClick={() => setActiveTab('website')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'website'
              ? 'bg-[#0B1F4D] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" /> Website Content & Gallery
        </button>

        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'deployment' ? 'bg-indigo-900 text-white' : 'text-indigo-700 hover:bg-indigo-50 font-semibold'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-indigo-400" /> Free Hosting & Setup Guide
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Total Students</span>
                <GraduationCap className="w-5 h-5 text-[#0B1F4D]" />
              </div>
              <div className="text-2xl font-extrabold text-[#0B1F4D]">{stats.totalStudents}</div>
              <div className="text-[11px] text-slate-500">Across 10 Classes (A & B Sections)</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Qualified Teachers</span>
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700">{stats.totalTeachers}</div>
              <div className="text-[11px] text-slate-500">Dedicated Section Mentors</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Fees Collected</span>
                <IndianRupee className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-[#0B1F4D]">
                ₹ {stats.totalFeesCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                {stats.collectionRate}% of ₹ {stats.totalFeesExpected.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Outstanding Due</span>
                <IndianRupee className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-extrabold text-red-600">
                ₹ {stats.totalFeesDue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500">Term 2 Balance Reminders Active</div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-6 rounded-3xl border border-blue-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-[#0B1F4D]">Quick Administrative Operations</h3>
              <p className="text-xs text-slate-600">Add new students manually or bulk import hundreds via Excel with auto logins.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="bg-[#0B1F4D] hover:bg-[#14327a] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Single Student
              </button>

              <button
                onClick={() => setShowBulkImportModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <FileSpreadsheet className="w-4 h-4" /> Bulk Excel Import
              </button>

              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="bg-white hover:bg-slate-100 text-[#0B1F4D] border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Teacher
              </button>
            </div>
          </div>

          {/* Recent Notices & WhatsApp status overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-[#0B1F4D] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  Active School Circulars ({notices.length})
                </h3>
                <button
                  onClick={() => setShowAddNoticeModal(true)}
                  className="text-xs text-[#0B1F4D] font-bold hover:underline"
                >
                  + Post Notice
                </button>
              </div>
              <div className="space-y-2.5">
                {notices.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  Meta WhatsApp Cloud API Status
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {whatsAppStatus?.mode || 'Active'}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg text-emerald-900 border border-emerald-200">
                  <span>Free Monthly Meta Allowance:</span>
                  <span className="font-bold">1,000 Free Conversations / Month</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-200">
                  <span>Total Dispatched Alerts in DB:</span>
                  <span className="font-bold">{whatsAppLogs.length} absence notifications</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-200">
                  <span>Message Format:</span>
                  <span className="font-mono text-[11px]">"Dear Parent, child marked ABSENT on..."</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENTS & BULK IMPORT TAB */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Action Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                Student Management ({students.length} Enrolled)
              </h2>
              <p className="text-xs text-slate-500">
                Single manual entry or 1-click bulk import via Excel. Auto-generates student login ID & password.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="admin-download-slips-btn"
                onClick={() => {
                  setLoginSlipsRole('student');
                  setInitialSlipsForPrint([]);
                  setShowLoginSlipsModal(true);
                }}
                className="bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow"
                title="Download / Print student login credential slips to distribute in class"
              >
                <Key className="w-4 h-4" /> Download Login Slips
              </button>

              <button
                id="admin-add-student-btn"
                onClick={() => setShowAddStudentModal(true)}
                className="bg-[#0B1F4D] hover:bg-[#14327a] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Single Student
              </button>

              <button
                id="admin-bulk-import-btn"
                onClick={() => setShowBulkImportModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <FileSpreadsheet className="w-4 h-4" /> Bulk Excel Import
              </button>

              <button
                onClick={handleDownloadTemplate}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
                title="Download Excel Template"
              >
                <Download className="w-4 h-4" /> Template .XLSX
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, roll no, father, phone..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0B1F4D]"
              />
            </div>

            <div>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none"
              >
                <option value="all">All Classes (1 to 12)</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Class {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none"
              >
                <option value="all">All Sections (A & B)</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F4D] text-white">
                <tr>
                  <th className="py-2.5 px-3">Roll & ID</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Class-Sec</th>
                  <th className="py-2.5 px-3">Father Name</th>
                  <th className="py-2.5 px-3">Parent WhatsApp</th>
                  <th className="py-2.5 px-3">Fees (Paid / Due)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50/50 transition">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#0B1F4D]">Roll {s.rollNo}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{s.studentId}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-blue-100 text-[#0B1F4D] font-bold px-2 py-0.5 rounded text-[11px]">
                          {s.class}-{s.section}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{s.fatherName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">{s.parentWhatsApp}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-700">₹ {s.feesPaid}</span>
                        <span className="text-slate-400"> / </span>
                        <span className={`font-bold ${s.feesDue > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          ₹ {s.feesDue} Due
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudentForFee(s);
                              setFeeCollectForm({
                                amount: String(s.feesDue > 0 ? s.feesDue : 6000),
                                paymentMode: 'Cash',
                                paidBy: s.fatherName,
                                remarks: 'Tuition Fee Installment',
                              });
                              setShowCollectFeeModal(true);
                            }}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2 py-1 rounded text-[10px]"
                            title="Collect Fee"
                          >
                            ₹ Pay
                          </button>

                          <button
                            onClick={() =>
                              handleImpersonateUser({
                                targetStudentId: s.studentId,
                                name: s.name,
                                role: 'student',
                              })
                            }
                            className="bg-blue-50 hover:bg-blue-100 text-[#0B1F4D] border border-blue-200 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition"
                            title="Login as this student (Admin Impersonation Mode)"
                          >
                            <LogIn className="w-3 h-3 text-blue-600" />
                            <span>Login As</span>
                          </button>

                          <button
                            onClick={() => {
                              setReceiptModalStudent(s);
                              setReceiptModalTx(null);
                            }}
                            className="p-1 text-slate-600 hover:text-[#0B1F4D]"
                            title="View / Print Fee Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleAdminResetPassword(s.studentId, s.name)}
                            className="p-1 text-slate-600 hover:text-amber-600"
                            title="Reset Student Password to 'password123'"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Remove Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                Qualified Class Teachers ({teachers.length})
              </h2>
              <p className="text-xs text-slate-500">
                Assign teachers to specific classes/sections for attendance and parent communications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLoginSlipsRole('teacher');
                  setInitialSlipsForPrint([]);
                  setShowLoginSlipsModal(true);
                }}
                className="bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow"
                title="Download / Print teacher login credential slips"
              >
                <Key className="w-4 h-4" /> Download Teacher Slips
              </button>

              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="bg-[#0B1F4D] hover:bg-[#14327a] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Teacher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <div key={t.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#0B1F4D] text-white px-2 py-0.5 rounded">
                    {t.teacherId}
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Class {t.assignedClass}-{t.assignedSection} Mentor
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-600">{t.qualification}</p>
                  <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                    Spec: {t.subjectSpecialization}
                  </p>
                </div>

                <div className="text-xs text-slate-500 space-y-1 border-t border-slate-200 pt-2 font-mono">
                  <p>📞 {t.phone}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleImpersonateUser({
                          targetTeacherId: t.teacherId,
                          name: t.name,
                          role: 'teacher',
                        })
                      }
                      className="bg-blue-50 hover:bg-blue-100 text-[#0B1F4D] border border-blue-200 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition"
                      title="Login as this teacher (Admin Impersonation Mode)"
                    >
                      <LogIn className="w-3 h-3 text-blue-600" />
                      <span>Login As</span>
                    </button>

                    <button
                      onClick={() => handleAdminResetPassword(t.id, t.name)}
                      className="text-amber-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <KeyRound className="w-3 h-3" /> Reset
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteTeacher(t.id, t.name)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove Teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FEES & RECEIPTS TAB */}
      {activeTab === 'fees' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                Fee Collection & Official Receipts
              </h2>
              <p className="text-xs text-slate-500">
                Track payments, issue official computerized receipts, and view fee defaulters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg">
                Total Collected: ₹ {stats?.totalFeesCollected?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F4D] text-white">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Total Annual</th>
                  <th className="py-2.5 px-3">Paid Amount</th>
                  <th className="py-2.5 px-3">Due Balance</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Collect / Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900">{s.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{s.studentId}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{s.class}-{s.section}</td>
                    <td className="py-2.5 px-3 font-mono">₹ {s.feesTotal.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">₹ {s.feesPaid.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-red-600">₹ {s.feesDue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          s.feesDue === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.feesPaid > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudentForFee(s);
                            setFeeCollectForm({
                              amount: String(s.feesDue > 0 ? s.feesDue : 6000),
                              paymentMode: 'Cash',
                              paidBy: s.fatherName,
                              remarks: 'Tuition Fee Payment',
                            });
                            setShowCollectFeeModal(true);
                          }}
                          className="bg-[#0B1F4D] text-white font-bold px-2.5 py-1 rounded text-[10px] hover:bg-[#14327a]"
                        >
                          Collect Fee
                        </button>
                        <button
                          onClick={() => {
                            setReceiptModalStudent(s);
                            setReceiptModalTx(null);
                          }}
                          className="bg-slate-100 text-slate-700 p-1 rounded hover:bg-slate-200"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. NOTICES TAB */}
      {activeTab === 'notices' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-black text-[#0B1F4D]">
                School Notice Board & Circulars ({notices.length})
              </h2>
              <p className="text-xs text-slate-500">
                Publish updates visible on the public website and student ERP.
              </p>
            </div>

            <button
              onClick={() => setShowAddNoticeModal(true)}
              className="bg-[#0B1F4D] hover:bg-[#14327a] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Create Notice
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-[#0B1F4D] font-bold px-2 py-0.5 rounded text-[10px]">
                      {n.category}
                    </span>
                    <span className="text-slate-400">{n.date}</span>
                    {n.isPinned && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Pinned
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{n.content}</p>
                </div>

                <button
                  onClick={async () => {
                    if (window.confirm('Delete this notice?')) {
                      await fetch(`/api/notices/${n.id}`, { method: 'DELETE' });
                      fetchData();
                    }
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. HOMEWORK PLACEHOLDER TAB */}
      {activeTab === 'homework' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Module Reserved For Future Expansion
          </span>
          <h2 className="text-2xl font-serif font-black text-[#0B1F4D]">
            Homework & Daily Assignment Module
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This module is reserved in the S.A. Public School codebase as per request. Once activated, teachers will be able to upload daily homework PDF files, chapter worksheets, and evaluate student submissions directly through this tab.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
            Status: <strong>Codebase Placeholder Ready</strong> • Ready to plug in schema & endpoints when needed.
          </div>
        </div>
      )}

      {/* 7. META WHATSAPP CLOUD API TAB */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded">
                Official Direct Meta Integration
              </span>
              <span className="text-xs text-slate-400">1,000 Free Messages / Month</span>
            </div>
            <h2 className="text-xl font-serif font-black text-[#0B1F4D] mt-1">
              Automated WhatsApp Absence Alerts
            </h2>
            <p className="text-xs text-slate-500">
              When teachers mark students absent, the system automatically sends a direct WhatsApp alert to the student's parent.
            </p>
          </div>

          {/* Credentials Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 block text-[10px]">Cloud API Gateway Mode</span>
              <span className="font-bold text-emerald-700">{whatsAppStatus?.mode || 'Active'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 block text-[10px]">Pre-Approved Template Name</span>
              <span className="font-mono font-bold text-slate-800">{whatsAppStatus?.templateName || 'student_absent_alert'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 block text-[10px]">Monthly Free Quota</span>
              <span className="font-bold text-blue-700">1,000 Free Conversations / Mo</span>
            </div>
          </div>

          {/* Test Sender */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-emerald-600" />
              Test WhatsApp Alert Trigger
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                id="test-wa-phone"
                defaultValue="+919876543210"
                placeholder="Parent WhatsApp (+91...)"
                className="px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs w-full sm:w-60 outline-none"
              />
              <button
                onClick={async () => {
                  const input = (document.getElementById('test-wa-phone') as HTMLInputElement)?.value;
                  const res = await fetch('/api/whatsapp/test-send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      studentName: 'Aarav Mishra',
                      parentPhone: input,
                      classInfo: '10-A',
                    }),
                  });
                  const data = await res.json();
                  showToast('Test WhatsApp message dispatched successfully!');
                  fetchData();
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap shadow"
              >
                Send Test Alert
              </button>
            </div>
          </div>

          {/* WhatsApp Logs Table */}
          <div>
            <h3 className="font-bold text-sm text-[#0B1F4D] mb-3">Live Dispatched Alerts Log</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3">Parent WhatsApp</th>
                    <th className="py-2 px-3">Message Content</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {whatsAppLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No alerts logged yet. Mark a student absent in Teacher Dashboard to test!
                      </td>
                    </tr>
                  ) : (
                    whatsAppLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2 px-3 font-semibold">{log.studentName} ({log.classInfo})</td>
                        <td className="py-2 px-3 font-mono">{log.parentPhone}</td>
                        <td className="py-2 px-3 text-slate-600 max-w-xs truncate">{log.message}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              log.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'simulated'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. WEBSITE CONTENT & GALLERY CMS TAB */}
      {activeTab === 'website' && <AdminWebsiteCMS />}

      {/* 9. FREE HOSTING & SETUP GUIDE TAB */}
      {activeTab === 'deployment' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <span className="bg-indigo-100 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
              100% Free Hosting (1-2 Years)
            </span>
            <h2 className="text-2xl font-serif font-black text-[#0B1F4D] mt-2">
              S.A. Public School Deployment & Architecture Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Follow these clear steps to run the frontend, backend, database, keepalive pinger, and Meta WhatsApp API completely free for 200-250 students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {/* Step 1: MongoDB Atlas Free Tier */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
                <span>MongoDB Atlas (Free M0 Cluster)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                1. Go to <strong>mongodb.com/cloud/atlas</strong> and create a free account. <br />
                2. Create a Free Shared Cluster (M0 Sandbox with 512MB storage — more than enough for 250 students). <br />
                3. Go to "Database Access" and create a database user (e.g. `saps_admin` with password). <br />
                4. Go to "Network Access" and add IP `0.0.0.0/0` (allow from anywhere). <br />
                5. Click "Connect" → "Drivers" and copy your connection string to `.env` as `MONGODB_URI`.
              </p>
            </div>

            {/* Step 2: Render Free Backend + Uptime Keepalive */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs">2</span>
                <span>Render Backend + Keep-Alive UptimeRobot</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                1. Go to <strong>render.com</strong> and create a new "Web Service" from your GitHub repo. <br />
                2. Set Build Command: `npm run build`, Start Command: `npm start`. <br />
                3. Add Environment Variables (`MONGODB_URI`, `JWT_SECRET`, Meta keys). <br />
                4. <strong>To prevent free tier sleeping:</strong> Go to <strong>uptimerobot.com</strong> (Free tier), create an HTTP monitor that pings `https://your-render-url.onrender.com/health` every 5 minutes. The backend will stay 100% awake!
              </p>
            </div>

            {/* Step 3: Vercel / Netlify Frontend */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs">3</span>
                <span>Vercel / Netlify (Free Frontend)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                1. Go to <strong>vercel.com</strong>, click "Add New Project" and import repo. <br />
                2. Framework Preset: Vite / React. <br />
                3. Add Environment Variable `VITE_API_URL` pointing to your Render backend URL (e.g. `https://saps-backend.onrender.com`). <br />
                4. Click "Deploy" for instant global CDN free hosting with HTTPS and custom domain support (`sapublicschool.edu.in`).
              </p>
            </div>

            {/* Step 4: Meta WhatsApp Cloud API (Free 1000/month) */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">4</span>
                <span>Meta WhatsApp Cloud API (Free Tier)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                1. Go to <strong>developers.facebook.com</strong> and create a Meta Business App. <br />
                2. Add the "WhatsApp" product to your app. Meta provides 1,000 free service conversation credits every month directly. <br />
                3. Go to "WhatsApp" → "Message Templates" and create a utility template named `student_absent_alert`: <br />
                <code className="text-[11px] bg-slate-200 p-1 rounded block my-1">
                  "Dear Parent, your child &#123;&#123;1&#125;&#125; of Class &#123;&#123;2&#125;&#125; was marked ABSENT on &#123;&#123;3&#125;&#125;. - S.A. Public School"
                </code>
                4. Once Meta approves the template, copy your `Phone Number ID` and `Access Token` to your backend `.env`.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Single Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1F4D] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Student</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Divyansh Singh"
                    value={singleStudentForm.name}
                    onChange={(e) => setSingleStudentForm({ ...singleStudentForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05"
                    value={singleStudentForm.rollNo}
                    onChange={(e) => setSingleStudentForm({ ...singleStudentForm, rollNo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Class *</label>
                  <select
                    value={singleStudentForm.class}
                    onChange={(e) => setSingleStudentForm({ ...singleStudentForm, class: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Section *</label>
                  <select
                    value={singleStudentForm.section}
                    onChange={(e) => setSingleStudentForm({ ...singleStudentForm, section: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Surendra Singh"
                    value={singleStudentForm.fatherName}
                    onChange={(e) => setSingleStudentForm({ ...singleStudentForm, fatherName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Parent WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98380 00000"
                    value={singleStudentForm.parentWhatsApp}
                    onChange={(e) => setSingleStudentForm({ ...singleStudentForm, parentWhatsApp: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Fees Details in same form */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-3">
                <h4 className="font-bold text-amber-900">Fee Structure for Student</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Total Annual Fees (₹)</label>
                    <input
                      type="number"
                      value={singleStudentForm.feesTotal}
                      onChange={(e) => setSingleStudentForm({ ...singleStudentForm, feesTotal: Number(e.target.value) })}
                      className="w-full p-2 bg-white border rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Initial Paid Amount (₹)</label>
                    <input
                      type="number"
                      value={singleStudentForm.feesPaid}
                      onChange={(e) => setSingleStudentForm({ ...singleStudentForm, feesPaid: Number(e.target.value) })}
                      className="w-full p-2 bg-white border rounded-lg outline-none font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1F4D] text-white rounded-lg font-bold hover:bg-[#14327a]"
                >
                  Save Student & Generate Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Bulk Excel Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Bulk Student Import via Excel (.xlsx / .csv)</h3>
              </div>
              <button onClick={() => setShowBulkImportModal(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Step 1: Download template */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">1. Download Blank Excel Template</p>
                  <p className="text-slate-500 text-[11px]">Includes columns: Name, Class, Section, Roll No, Father Name, Parent WhatsApp Number, Fees Total, Fees Paid, Fees Due.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              {/* Step 2: Upload filled file */}
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 bg-white hover:bg-slate-50 transition">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-800">2. Select or Drag & Drop Filled Excel File</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {/* Preview table */}
              {excelPreviewData.length > 0 && !bulkImportResult && (
                <div className="space-y-2">
                  <p className="font-bold text-slate-800">
                    Preview Data ({excelPreviewData.length} records ready to import):
                  </p>
                  <div className="overflow-x-auto max-h-48 border rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Class-Sec</th>
                          <th className="p-2">Roll</th>
                          <th className="p-2">Father</th>
                          <th className="p-2">Parent WhatsApp</th>
                          <th className="p-2">Fees Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {excelPreviewData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-semibold">{row['Name'] || row['name']}</td>
                            <td className="p-2">{row['Class'] || row['class']}-{row['Section'] || row['section'] || 'A'}</td>
                            <td className="p-2">{row['Roll No'] || row['rollNo']}</td>
                            <td className="p-2">{row['Father Name'] || row['fatherName']}</td>
                            <td className="p-2">{row['Parent WhatsApp Number'] || row['parentWhatsApp']}</td>
                            <td className="p-2 font-bold">₹ {row['Fees Total'] || 18000}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={handleExecuteBulkImport}
                    disabled={bulkImporting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition shadow flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{bulkImporting ? 'Importing & Creating Logins...' : `Import ${excelPreviewData.length} Students Now`}</span>
                  </button>
                </div>
              )}

              {/* Import Results & Credentials */}
              {bulkImportResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Import Completed Successfully ({bulkImportResult.importedCount} Students)</span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    All students have been created and assigned unique student IDs with default password: <code className="bg-emerald-200 px-1 py-0.5 rounded font-bold">student123</code> (forced password change enabled on first login).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        const slips: LoginSlip[] = (bulkImportResult.importedStudents || []).map((s: any) => ({
                          id: s.id,
                          name: s.name,
                          role: 'student' as const,
                          username: s.studentId,
                          temporaryPassword: 'student123',
                          class: s.class,
                          section: s.section,
                          rollNo: s.rollNo,
                          fatherName: s.fatherName,
                          mustChangePassword: true,
                        }));
                        setLoginSlipsRole('student');
                        setInitialSlipsForPrint(slips);
                        setShowLoginSlipsModal(true);
                      }}
                      className="bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow"
                    >
                      <Key className="w-4 h-4" /> Download / Print Login Slips
                    </button>

                    <button
                      onClick={() => {
                        setExcelPreviewData([]);
                        setBulkImportResult(null);
                        setShowBulkImportModal(false);
                      }}
                      className="bg-[#0B1F4D] text-white font-bold px-4 py-2 rounded-lg text-xs"
                    >
                      Done & Refresh Roster
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1F4D] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Teacher</h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddTeacherSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Sunita Pandey"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Assigned Class *</label>
                  <select
                    value={teacherForm.assignedClass}
                    onChange={(e) => setTeacherForm({ ...teacherForm, assignedClass: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Section *</label>
                  <select
                    value={teacherForm.assignedSection}
                    onChange={(e) => setTeacherForm({ ...teacherForm, assignedSection: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Qualification *</label>
                <input
                  type="text"
                  required
                  value={teacherForm.qualification}
                  onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="teacher@sapublicschool.edu.in"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1F4D] text-white rounded-lg font-bold hover:bg-[#14327a]"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Collect Fee Modal */}
      {showCollectFeeModal && selectedStudentForFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1F4D] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Fee Payment</h3>
                <p className="text-xs text-amber-300">{selectedStudentForFee.name} (Class {selectedStudentForFee.class}-{selectedStudentForFee.section})</p>
              </div>
              <button onClick={() => setShowCollectFeeModal(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCollectFeeSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-100 p-3 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Fees:</span>
                  <span className="font-bold">₹ {selectedStudentForFee.feesTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Already Paid:</span>
                  <span className="font-bold text-emerald-700">₹ {selectedStudentForFee.feesPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Due:</span>
                  <span className="font-bold text-red-600">₹ {selectedStudentForFee.feesDue}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={feeCollectForm.amount}
                  onChange={(e) => setFeeCollectForm({ ...feeCollectForm, amount: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg font-bold text-base text-[#0B1F4D] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Mode</label>
                <select
                  value={feeCollectForm.paymentMode}
                  onChange={(e) => setFeeCollectForm({ ...feeCollectForm, paymentMode: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                >
                  <option value="Cash">Cash (Counter)</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Paid By (Person Name)</label>
                <input
                  type="text"
                  value={feeCollectForm.paidBy}
                  onChange={(e) => setFeeCollectForm({ ...feeCollectForm, paidBy: e.target.value })}
                  placeholder="e.g. Father / Mother"
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCollectFeeModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  Record Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Notice Modal */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1F4D] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Create Notice / Circular</h3>
              <button onClick={() => setShowAddNoticeModal(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddNoticeSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 2 Examination Datesheet"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={noticeForm.category}
                  onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                >
                  <option value="Academic">Academic</option>
                  <option value="Exam">Exam Schedule</option>
                  <option value="Holiday">Holiday Declaration</option>
                  <option value="General">General Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Content Details *</label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Write notice circular body here..."
                  className="w-full p-2 bg-slate-50 border rounded-lg outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-notice"
                  checked={noticeForm.isPinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                />
                <label htmlFor="pin-notice" className="font-semibold text-slate-700">
                  Pin to top of website noticeboard
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1F4D] text-white rounded-lg font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Printable Modal */}
      <PrintReceiptModal
        isOpen={Boolean(receiptModalStudent || receiptModalTx)}
        onClose={() => {
          setReceiptModalStudent(null);
          setReceiptModalTx(null);
        }}
        transaction={receiptModalTx}
        student={receiptModalStudent}
      />

      {/* Printable Credential Slips Modal */}
      <PrintLoginSlipsModal
        isOpen={showLoginSlipsModal}
        onClose={() => {
          setShowLoginSlipsModal(false);
          setInitialSlipsForPrint([]);
        }}
        role={loginSlipsRole}
        initialSlips={initialSlipsForPrint.length > 0 ? initialSlipsForPrint : undefined}
      />
    </div>
  );
};
