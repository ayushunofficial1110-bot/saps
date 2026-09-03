import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { NoticesPage } from './pages/NoticesPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/erp/AdminDashboard';
import { TeacherDashboard } from './pages/erp/TeacherDashboard';
import { StudentDashboard } from './pages/erp/StudentDashboard';
import { User } from './types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatingAdmin, setImpersonatingAdmin] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Restore user session from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('saps_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      }
    } catch (e) {
      console.error('Failed to parse saved session', e);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('saps_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setImpersonatingAdmin(null);
    localStorage.removeItem('saps_user');
    setActiveTab('home');
  };

  const handleImpersonate = (targetUser: User, adminUser: User) => {
    setImpersonatingAdmin(adminUser);
    setCurrentUser(targetUser);
    setActiveTab('dashboard');
  };

  const handleExitImpersonation = () => {
    if (impersonatingAdmin) {
      setCurrentUser(impersonatingAdmin);
      setImpersonatingAdmin(null);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#F5B301] selection:text-[#0B1F4D]">
      {/* Impersonation Banner for Admin */}
      {impersonatingAdmin && currentUser && (
        <div className="bg-amber-500 text-[#0B1F4D] px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#0B1F4D]" />
            <span>
              Admin Impersonation Mode: Currently viewing as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="bg-[#0B1F4D] hover:bg-[#14327a] text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Dashboard</span>
          </button>
        </div>
      )}

      {/* Universal Top Navigation */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'erp-dashboard') {
            setActiveTab('dashboard');
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenLogin={() => {
              if (currentUser) {
                setActiveTab('dashboard');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'about' && <AboutPage />}

        {activeTab === 'facilities' && (
          <FacilitiesPage
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenLogin={() => {
              if (currentUser) {
                setActiveTab('dashboard');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'notices' && <NoticesPage />}

        {activeTab === 'gallery' && <GalleryPage />}

        {activeTab === 'contact' && <ContactPage />}

        {/* ERP Dashboards */}
        {activeTab === 'dashboard' && (
          <div>
            {!currentUser ? (
              <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-lg">
                <h2 className="text-xl font-bold text-[#0B1F4D]">Authentication Required</h2>
                <p className="text-xs text-slate-500">
                  Please log in with your Admin, Teacher, or Student credentials to access the ERP portal.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-[#0B1F4D] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#14327a] transition shadow"
                >
                  Open ERP Login
                </button>
              </div>
            ) : currentUser.role === 'admin' ? (
              <AdminDashboard
                currentUser={currentUser}
                onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
                onImpersonate={handleImpersonate}
              />
            ) : currentUser.role === 'teacher' ? (
              <TeacherDashboard
                currentUser={currentUser}
                onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
              />
            ) : (
              <StudentDashboard
                currentUser={currentUser}
                onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenLogin={() => {
          if (currentUser) {
            setActiveTab('dashboard');
          } else {
            setIsAuthModalOpen(true);
          }
        }}
      />

      {/* Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Change Password Modal (Simple, optional, accessible anytime) */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        currentUser={currentUser}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
