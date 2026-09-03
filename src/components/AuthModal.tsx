import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { SchoolLogo } from './SchoolLogo';
import {
  X,
  LogIn,
  Shield,
  UserCheck,
  GraduationCap,
  Lock,
  User as UserIcon,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Calendar,
  Users,
  KeyRound,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: User) => void;
  onSuccess?: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSuccess,
}) => {
  const [modalMode, setModalMode] = useState<'login' | 'forgot-password'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password (Student/Teacher Identity verification)
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotFatherName, setForgotFatherName] = useState('');
  const [forgotDob, setForgotDob] = useState('');
  const [verifiedResetToken, setVerifiedResetToken] = useState<string | null>(null);
  const [verifiedUserName, setVerifiedUserName] = useState<string | null>(null);
  const [newSelfPassword, setNewSelfPassword] = useState('');
  const [confirmSelfPassword, setConfirmSelfPassword] = useState('');
  const [selfResetSuccess, setSelfResetSuccess] = useState(false);

  // Admin Forgot Password (Security Question)
  const [adminSecurityQuestion, setAdminSecurityQuestion] = useState<string>("What is your favorite teacher's name?");
  const [adminSecurityAnswer, setAdminSecurityAnswer] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminResetSuccess, setAdminResetSuccess] = useState(false);

  // Reset form whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setModalMode('login');
      setSelectedRole(null);
      setUsername('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setLoading(false);
      setVerifiedResetToken(null);
      setVerifiedUserName(null);
      setSelfResetSuccess(false);
      setAdminResetSuccess(false);
      setForgotFatherName('');
      setForgotDob('');
      setAdminSecurityAnswer('');
    }
  }, [isOpen]);

  // Fetch admin security question if needed
  useEffect(() => {
    if (modalMode === 'forgot-password' && selectedRole === 'admin') {
      fetch('/api/auth/admin-security-question')
        .then((res) => res.json())
        .then((data) => {
          if (data.question) {
            setAdminSecurityQuestion(data.question);
          }
        })
        .catch((e) => console.error('Failed to fetch admin security question', e));
    }
  }, [modalMode, selectedRole]);

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select your role (Admin, Teacher, or Student) before proceeding.');
      return;
    }

    if (!username.trim() || !password) {
      setError('Please enter both your username/ID and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials and try again.');
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      } else if (onSuccess) {
        onSuccess(data.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to connect to school server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Self-Service Verify Identity (Students & Teachers)
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select whether you are a Student or Teacher.');
      return;
    }

    if (!forgotUsername.trim() || !forgotFatherName.trim() || !forgotDob) {
      setError("Please fill in Username/ID, Father's Name, and Date of Birth.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername.trim(),
          role: selectedRole,
          fatherName: forgotFatherName.trim(),
          dob: forgotDob,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Identity verification failed.');
      }

      setVerifiedResetToken(data.resetToken);
      setVerifiedUserName(data.name);
    } catch (err: any) {
      setError(err.message || 'Verification error. Please check your entered details.');
    } finally {
      setLoading(false);
    }
  };

  // Self-Service Reset Password Submit (Students & Teachers)
  const handleSelfResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newSelfPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newSelfPassword !== confirmSelfPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername.trim(),
          resetToken: verifiedResetToken,
          newPassword: newSelfPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSelfResetSuccess(true);
      setTimeout(() => {
        setModalMode('login');
        setUsername(forgotUsername.trim());
        setPassword('');
        setVerifiedResetToken(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error occurred while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  // Admin Security Question Reset
  const handleAdminResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminSecurityAnswer.trim()) {
      setError('Please provide your secret security answer.');
      return;
    }

    if (adminNewPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          securityAnswer: adminSecurityAnswer.trim(),
          newPassword: adminNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset Admin password.');
      }

      setAdminResetSuccess(true);
      setTimeout(() => {
        setModalMode('login');
        setUsername('admin');
        setPassword('');
        setSelectedRole('admin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your answer.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'School Administration / Principal';
      case 'teacher':
        return 'Faculty / Class Teacher Portal';
      case 'student':
        return 'Student & Parent Academic Portal';
    }
  };

  const getUsernamePlaceholder = (role: UserRole | null) => {
    switch (role) {
      case 'admin':
        return 'Enter administrator username (e.g. admin)';
      case 'teacher':
        return 'Enter teacher username / employee ID';
      case 'student':
        return 'Enter student ID (e.g. s_saps1001 or SAPS-2025-1001)';
      default:
        return 'Select a role above first';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div
        id="auth-modal-container"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] overflow-y-auto"
      >
        {/* Header with Official School Crest */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 relative text-center">
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {modalMode === 'forgot-password' && (
            <button
              onClick={() => {
                setModalMode('login');
                setError(null);
              }}
              className="absolute top-4 left-4 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          )}

          <div className="flex justify-center mb-2">
            <SchoolLogo size={52} />
          </div>
          <h2 className="text-lg font-serif font-black tracking-wide text-white">
            {modalMode === 'login' ? 'ERP PORTAL LOGIN' : 'SELF-SERVICE PASSWORD RECOVERY'}
          </h2>
          <p className="text-[#F5B301] text-xs font-bold mt-0.5">
            Swami Adgadanand Public School
          </p>
          <p className="text-slate-300 text-[10px]">
            Academic Management & Communication System
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Step 1: Role Selector (Available in both modes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              {!selectedRole && (
                <span className="text-[11px] font-semibold text-amber-600 animate-pulse">
                  Step 1: Choose Role
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Admin Button */}
              <button
                type="button"
                id="role-tab-admin"
                onClick={() => handleRoleSelect('admin')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition ${
                    selectedRole === 'admin'
                      ? 'bg-amber-400 text-[#0B1F4D]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <span>Admin</span>
                <span
                  className={`text-[9px] font-normal mt-0.5 ${
                    selectedRole === 'admin' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Principal / Office
                </span>
              </button>

              {/* Teacher Button */}
              <button
                type="button"
                id="role-tab-teacher"
                onClick={() => handleRoleSelect('teacher')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'teacher'
                    ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition ${
                    selectedRole === 'teacher'
                      ? 'bg-amber-400 text-[#0B1F4D]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <span>Teacher</span>
                <span
                  className={`text-[9px] font-normal mt-0.5 ${
                    selectedRole === 'teacher' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Class Mentor
                </span>
              </button>

              {/* Student Button */}
              <button
                type="button"
                id="role-tab-student"
                onClick={() => handleRoleSelect('student')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'student'
                    ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition ${
                    selectedRole === 'student'
                      ? 'bg-amber-400 text-[#0B1F4D]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>Student</span>
                <span
                  className={`text-[9px] font-normal mt-0.5 ${
                    selectedRole === 'student' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Student / Parent
                </span>
              </button>
            </div>

            {selectedRole && (
              <div className="mt-1 text-center">
                <span className="inline-block text-[11px] font-bold text-[#0B1F4D] bg-blue-50 px-3 py-0.5 rounded-full border border-blue-200">
                  Selected Role: <span className="text-[#0B1F4D]">{getRoleTitle(selectedRole)}</span>
                </span>
              </div>
            )}
          </div>

          {/* ===================== MODE 1: LOGIN FORM ===================== */}
          {modalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" id="auth-login-form">
              {error && (
                <div
                  id="auth-error-alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2.5 animate-in shake"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username / System ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-username-input"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={getUsernamePlaceholder(selectedRole)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('forgot-password');
                      setError(null);
                      if (username) {
                        setForgotUsername(username);
                      }
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter confidential password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#F5B301]" />
                    <span>
                      {selectedRole
                        ? `Log in to ${selectedRole.toUpperCase()} Portal`
                        : 'Select Role & Log In'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===================== MODE 2: FORGOT PASSWORD (STUDENT / TEACHER) ===================== */}
          {modalMode === 'forgot-password' && selectedRole !== 'admin' && (
            <div className="space-y-4">
              {selfResetSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-center space-y-2 animate-in zoom-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Password Reset Successfully!</h4>
                  <p className="text-xs text-emerald-700">
                    Your password has been updated. Redirecting you to the login screen...
                  </p>
                </div>
              ) : !verifiedResetToken ? (
                /* Step 1: Database Verification by Father's Name & DOB */
                <form onSubmit={handleVerifyIdentity} className="space-y-3.5">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                      <Shield className="w-3.5 h-3.5" /> Self-Service Database Verification
                    </p>
                    Enter your Registered Username/ID, Father's Name, and Date of Birth on school file to verify your identity.
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 animate-in shake">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username / Student ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        placeholder="e.g. s_saps1001 or t_msharma"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Father's Name (As in School Record) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={forgotFatherName}
                        onChange={(e) => setForgotFatherName(e.target.value)}
                        placeholder="e.g. Sri Ramesh Mishra"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth (DOB) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={forgotDob}
                        onChange={(e) => setForgotDob(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                  >
                    {loading ? 'Verifying with School Database...' : 'Verify Identity & Continue'}
                  </button>
                </form>
              ) : (
                /* Step 2: Set New Password */
                <form onSubmit={handleSelfResetSubmit} className="space-y-3.5 animate-in fade-in">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Identity Verified: {verifiedUserName}
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Please enter your new private password below.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Password (Min. 6 chars) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newSelfPassword}
                      onChange={(e) => setNewSelfPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmSelfPassword}
                      onChange={(e) => setConfirmSelfPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] font-black py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password & Go to Login'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ===================== MODE 3: FORGOT PASSWORD (ADMIN VIA SECURITY QUESTION) ===================== */}
          {modalMode === 'forgot-password' && selectedRole === 'admin' && (
            <div className="space-y-4">
              {adminResetSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-center space-y-2 animate-in zoom-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Admin Password Reset Successfully!</h4>
                  <p className="text-xs text-emerald-700">
                    Administrator credentials updated. Redirecting to login...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAdminResetSubmit} className="space-y-3.5">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-[#0B1F4D] leading-relaxed">
                    <p className="font-bold flex items-center gap-1 text-[#0B1F4D] mb-0.5">
                      <Shield className="w-3.5 h-3.5 text-[#00AEEF]" /> Administrator Security Verification
                    </p>
                    Please answer the security question configured during school system setup to reset your Admin password.
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 animate-in shake">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                      Personal Security Question
                    </span>
                    <p className="text-xs font-bold text-slate-900">{adminSecurityQuestion}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Security Answer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminSecurityAnswer}
                      onChange={(e) => setAdminSecurityAnswer(e.target.value)}
                      placeholder="Enter the secret answer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Admin Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="Enter new administrator password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Admin Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="Re-type new administrator password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:bg-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                  >
                    {loading ? 'Verifying & Updating...' : 'Reset Admin Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="pt-2 text-center border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>Official School Portal</span>
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="tel:+919415754349" className="hover:text-blue-700 font-medium">Helpline: +91 9415754349</a>
              <span>•</span>
              <a href="mailto:sapublicschool21@gmail.com" className="text-blue-700 hover:underline font-medium">
                sapublicschool21@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
