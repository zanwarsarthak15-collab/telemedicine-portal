import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import {
  Activity,
  Calendar,
  FileText,
  Shield,
  Video,
  Pill,
  LogOut,
  ChevronDown,
  User,
  Users,
  Search,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface NavbarProps {
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLoginModal }) => {
  const { currentUser, activeView, setActiveView, logout, setActiveConsultationId } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  if (!currentUser) return null;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'RECEPTIONIST':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PHARMACIST':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'ADMIN':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-300';
    }
  };

  return (
    <header className="bg-white border-b border-google-border sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveView('dashboard');
                setActiveConsultationId(null);
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-google-blue flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-google-dark">CareSync</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-google-blue-light text-google-blue">
                    Telehealth
                  </span>
                </div>
                <p className="text-[11px] text-google-gray hidden sm:block">Easy Remote Healthcare Portal</p>
              </div>
            </button>

            {/* Role-Specific Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {currentUser.role === 'PATIENT' && (
                <>
                  <button
                    onClick={() => {
                      setActiveView('dashboard');
                      setActiveConsultationId(null);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeView === 'dashboard'
                        ? 'bg-google-blue-light text-google-blue'
                        : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('records');
                      setActiveConsultationId(null);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeView === 'records'
                        ? 'bg-google-blue-light text-google-blue'
                        : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    My Medical Records
                  </button>
                </>
              )}

              {currentUser.role === 'DOCTOR' && (
                <>
                  <button
                    onClick={() => {
                      setActiveView('dashboard');
                      setActiveConsultationId(null);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeView === 'dashboard'
                        ? 'bg-emerald-50 text-google-green'
                        : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
                    }`}
                  >
                    Doctor Console
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('records');
                      setActiveConsultationId(null);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeView === 'records'
                        ? 'bg-emerald-50 text-google-green'
                        : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Patient Records
                  </button>
                </>
              )}

              {currentUser.role === 'RECEPTIONIST' && (
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setActiveConsultationId(null);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-purple-50 text-purple-700 flex items-center gap-1.5"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Front Desk OPD
                </button>
              )}

              {currentUser.role === 'PHARMACIST' && (
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setActiveConsultationId(null);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-800 flex items-center gap-1.5"
                >
                  <Pill className="w-3.5 h-3.5" />
                  Prescription Dispenser
                </button>
              )}

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setActiveConsultationId(null);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-google-red flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin & Audit Portal
                </button>
              )}
            </nav>
          </div>

          {/* Right: User Avatar + Switch Account + Sign Out */}
          <div className="flex items-center gap-2.5">
            {/* Quick Switch Account Modal button */}
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 text-xs font-bold text-google-blue hover:text-google-blue-hover px-3.5 py-2 rounded-full bg-google-blue-light/70 hover:bg-google-blue-light transition-all shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>

            {/* Direct Prominent Sign Out Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-bold text-google-red hover:bg-rose-50 px-3.5 py-2 rounded-full border border-rose-200 transition-all shadow-xs"
              title="Sign out of CareSync"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            {/* Profile Dropdown with clean UserAvatar (Initial avatar - never broken!) */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-google-border hover:bg-google-surface transition-colors"
                aria-label="User profile menu"
              >
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-google-dark block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-google-gray block uppercase font-medium">{currentUser.role}</span>
                </div>
                <UserAvatar name={currentUser.name} role={currentUser.role} size="md" />
                <ChevronDown className="w-3.5 h-3.5 text-google-gray pr-1" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-google-3 border border-google-border py-2 z-50 animate-fadeIn"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-5 py-3 border-b border-google-border bg-google-canvas/60">
                    <p className="text-sm font-bold text-google-dark">{currentUser.name}</p>
                    <p className="text-xs text-google-gray mt-0.5 font-mono truncate">{currentUser.email}</p>
                    <span
                      className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadgeStyle(
                        currentUser.role
                      )}`}
                    >
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={onOpenLoginModal}
                      className="w-full text-left px-4 py-2.5 text-xs text-google-dark hover:bg-google-surface flex items-center gap-2 font-medium"
                    >
                      <Users className="w-4 h-4 text-google-blue" />
                      Switch Demo Profile
                    </button>
                  </div>

                  <div className="border-t border-google-border pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-google-red hover:bg-google-red-light/50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
