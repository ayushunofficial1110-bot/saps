import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { User } from '../types';
import { useSiteContent } from '../context/SiteContentContext';
import {
  Phone,
  Mail,
  Clock,
  LogIn,
  LogOut,
  KeyRound,
  LayoutDashboard,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenChangePassword: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenChangePassword,
}) => {
  const { siteContent } = useSiteContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const phone = siteContent?.school?.phone || '+91 9415754349';
  const email = siteContent?.school?.email || 'sapublicschool21@gmail.com';
  const helpSpan = siteContent?.school?.helpSpanText || '24hr';

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'family', label: 'My School Family' },
    { id: 'facilities', label: 'Facilities & Transport' },
    { id: 'notices', label: 'Notice Board' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-slate-200" id="main-header">
      {/* Top Notification / Info Bar */}
      <div className="bg-[#0B1F4D] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 text-slate-200 hover:text-white transition"
            >
              <Phone className="w-3 h-3 text-[#00AEEF]" />
              <span>{phone}</span>
            </a>
            <span className="hidden sm:inline text-slate-400">|</span>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1 text-slate-200 hover:text-white transition"
            >
              <Mail className="w-3 h-3 text-[#00AEEF]" />
              <span>{email}</span>
            </a>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:flex items-center gap-1 text-amber-300 font-medium">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>{helpSpan}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <span className="bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-400/40 text-[11px]">
                Logged in as {currentUser.role.toUpperCase()}
              </span>
            ) : (
              <button
                id="header-erp-login-top-btn"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1 bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] font-bold px-2.5 py-0.5 rounded text-[11px] transition shadow-sm"
              >
                <LogIn className="w-3 h-3" />
                ERP Login Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left focus:outline-none flex items-center group"
          id="brand-logo-btn"
        >
          <SchoolLogo size={52} showText={true} />
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2" id="desktop-navigation">
          {navLinks.map((link) => (
            <button
              key={link.id}
              id={`nav-link-${link.id}`}
              onClick={() => handleNavClick(link.id)}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                currentTab === link.id
                  ? 'bg-blue-50 text-[#0B1F4D] border-b-2 border-[#0B1F4D]'
                  : 'text-slate-700 hover:text-[#0B1F4D] hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0B1F4D] px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium transition"
              >
                <div className="w-7 h-7 rounded-full bg-[#0B1F4D] text-amber-300 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-tight truncate max-w-[130px]">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role} {currentUser.assignedClass ? `(${currentUser.assignedClass}-${currentUser.assignedSection})` : ''}</div>
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-100 text-[#0B1F4D] rounded">
                      {currentUser.role} Portal
                    </span>
                  </div>

                  <button
                    id="menu-dashboard-link"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSelectTab('erp-dashboard');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#00AEEF]" />
                    Go to ERP Dashboard
                  </button>

                  <button
                    id="menu-change-pwd-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenChangePassword();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    Change Password
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    id="menu-logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-erp-login-btn"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold px-4 py-2 rounded-lg text-sm transition shadow-md hover:shadow-lg border border-[#F5B301]/40"
            >
              <GraduationCap className="w-4 h-4 text-[#F5B301]" />
              <span>ERP Portal</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-[#0B1F4D] hover:bg-slate-100 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-50 border-t border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-3 py-2.5 text-sm font-semibold rounded-lg ${
                currentTab === link.id ? 'bg-[#0B1F4D] text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {link.label}
            </button>
          ))}
          {currentUser && (
            <button
              onClick={() => handleNavClick('erp-dashboard')}
              className="w-full text-left px-3 py-2.5 text-sm font-bold text-blue-800 bg-blue-100 rounded-lg flex items-center gap-2 mt-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              ERP Dashboard ({currentUser.role})
            </button>
          )}
          <div className="pt-3 mt-2 border-t border-slate-200 text-xs space-y-2 text-slate-600 px-1">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 text-slate-700 hover:text-[#0B1F4D]"
            >
              <Phone className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
              <span>Helpline: <strong>{phone}</strong></span>
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-slate-700 hover:text-[#0B1F4D]"
            >
              <Mail className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
              <span>Email: <strong>{email}</strong></span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
