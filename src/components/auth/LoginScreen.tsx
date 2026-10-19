import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  Activity,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Stethoscope,
  ClipboardList,
  Shield,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  KeyRound,
  X,
  UserPlus,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, selectUser, registerPatient, users, adminUnlockAccount } = useApp();

  // Mode: 'LOGIN' or 'REGISTER'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Selected Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT');

  // Login form state
  const [identifier, setIdentifier] = useState('aarav.patel@care.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Patient Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('1996-05-12');
  const [regGender, setRegGender] = useState('Female');
  const [regBloodGroup, setRegBloodGroup] = useState('B+');
  const [regPassword, setRegPassword] = useState('password123');
  const [regError, setRegError] = useState<string | null>(null);

  // Role info configuration
  const roleConfig = {
    PATIENT: {
      title: 'Patient',
      description: 'Book consultations, view prescriptions & manage health records',
      icon: User,
      idPlaceholder: 'e.g. aarav.patel@care.in, usr_pat_1, or 9820144520',
      idLabel: 'Patient ID, Registered Mobile, or Email',
      badgeColor: 'bg-blue-50 text-google-blue border-blue-200',
      defaultDemo: {
        name: 'Aarav Patel',
        id: 'usr_pat_1',
        email: 'aarav.patel@care.in',
      },
    },
    DOCTOR: {
      title: 'Doctor',
      description: 'Manage OPD schedule, attend teleconsultations & issue digital Rx',
      icon: Stethoscope,
      idPlaceholder: 'e.g. dr.rajesh@apollo.med or usr_doc_1',
      idLabel: 'Doctor Registration ID or Hospital Email',
      badgeColor: 'bg-emerald-50 text-google-green border-emerald-300',
      defaultDemo: {
        name: 'Dr. Rajesh Sharma, MD',
        id: 'usr_doc_1',
        email: 'dr.rajesh@apollo.med',
      },
    },
    RECEPTIONIST: {
      title: 'Receptionist',
      description: 'Front-desk OPD, check-in arriving patients & schedule walk-in visits',
      icon: ClipboardList,
      idPlaceholder: 'e.g. pooja.reception@care.in or usr_rec_1',
      idLabel: 'Staff ID or Front-Desk Email',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      defaultDemo: {
        name: 'Pooja Sharma',
        id: 'usr_rec_1',
        email: 'pooja.reception@care.in',
      },
    },
    ADMIN: {
      title: 'Administrator',
      description: 'Manage RBAC accounts, review immutable audit logs & inspect health metrics',
      icon: Shield,
      idPlaceholder: 'e.g. neha.gupta@health.gov.in or usr_admin_1',
      idLabel: 'Admin ID or Official Email',
      badgeColor: 'bg-rose-50 text-google-red border-rose-200',
      defaultDemo: {
        name: 'Neha Gupta',
        id: 'usr_admin_1',
        email: 'neha.gupta@health.gov.in',
      },
    },
    PHARMACIST: {
      title: 'Pharmacist',
      description: 'Prescription lookup, digital signature verification & medicine fulfillment',
      icon: Activity,
      idPlaceholder: 'e.g. vikram@medplus.rx or usr_pharm_1',
      idLabel: 'Pharmacist License ID or Email',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-300',
      defaultDemo: {
        name: 'Vikram Malhotra',
        id: 'usr_pharm_1',
        email: 'vikram@medplus.rx',
      },
    },
  };

  // Sync default identifier when role card is switched
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setLockoutRemaining(null);

    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setIdentifier(targetUser.email);
    } else {
      setIdentifier(roleConfig[role].defaultDemo.email);
    }
  };

  // Live countdown timer for locked accounts
  useEffect(() => {
    if (lockoutRemaining === null || lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Handle standard Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = login(identifier, password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
        if (res.locked && res.remainingMinutes) {
          setLockoutRemaining(res.remainingMinutes * 60);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Patient Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError('Please complete all required fields (Name, Email, Mobile).');
      return;
    }

    const res = registerPatient({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      gender: regGender,
      dob: regDob,
      bloodGroup: regBloodGroup,
    });

    if (!res.success) {
      setRegError(res.message || 'Registration failed.');
    }
  };

  // Quick 1-click Demo Logins
  const handleDemoQuickLogin = (role: UserRole, userId: string) => {
    setSelectedRole(role);
    selectUser(userId);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between text-google-dark">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-google-border py-4 px-6 sm:px-12 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-google-blue flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-google-dark">CareSync</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-google-blue-light text-google-blue">
                  Practo-Style Telehealth
                </span>
              </div>
              <p className="text-[11px] text-google-gray">Smart Healthcare Appointment & OPD Portal</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-google-gray">
            <span className="flex items-center gap-1 text-google-green font-medium">
              <ShieldCheck className="w-4 h-4" />
              HIPAA Compliant
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-google-blue font-medium">
              <Lock className="w-4 h-4" />
              256-bit TLS 1.3
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Login / Registration Form */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-google-card border border-google-border p-6 sm:p-10">
          {/* Header Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-google-blue-light text-google-blue mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-google-dark tracking-tight">
              Welcome to CareSync
            </h1>
            <p className="text-sm text-google-gray mt-1 max-w-md mx-auto">
              Your healthcare, appointments, and care management in one simple place.
            </p>

            {/* Auth Mode Switcher (Login vs Patient Register) */}
            <div className="mt-6 flex items-center justify-center">
              <div className="inline-flex p-1 bg-google-canvas rounded-full border border-google-border">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setErrorMessage(null);
                  }}
                  className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${
                    authMode === 'LOGIN'
                      ? 'bg-white text-google-blue shadow-xs'
                      : 'text-google-gray hover:text-google-dark'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setSelectedRole('PATIENT');
                    setRegError(null);
                  }}
                  className={`px-6 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    authMode === 'REGISTER'
                      ? 'bg-white text-google-blue shadow-xs'
                      : 'text-google-gray hover:text-google-dark'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  New Patient Registration
                </button>
              </div>
            </div>
          </div>

          {/* ======================= MODE 1: LOGIN ======================= */}
          {authMode === 'LOGIN' && (
            <div>
              {/* Step 1: Role Selection Cards */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-google-dark uppercase tracking-wider mb-2.5">
                  1. Select Your Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'] as UserRole[]).map((role) => {
                    const cfg = roleConfig[role];
                    const Icon = cfg.icon;
                    const isSelected = selectedRole === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(role)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'border-google-blue bg-blue-50/70 text-google-blue ring-2 ring-google-blue/20 shadow-xs'
                            : 'border-google-border bg-white text-google-gray hover:border-google-blue/40 hover:bg-google-canvas'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-google-blue text-white' : 'bg-google-canvas text-google-gray'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold block">{cfg.title}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-google-gray mt-2 text-center">
                  {roleConfig[selectedRole].description}
                </p>
              </div>

              {/* Error & Lockout Banner */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-google-red flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-google-red">{errorMessage}</p>
                    {lockoutRemaining !== null && lockoutRemaining > 0 && (
                      <div className="mt-2 flex items-center gap-2 font-mono text-google-red font-bold">
                        <Clock className="w-4 h-4" />
                        <span>
                          Time remaining: {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* ID or Email Field */}
                <div>
                  <label className="block text-xs font-bold text-google-dark mb-1.5">
                    {roleConfig[selectedRole].idLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={roleConfig[selectedRole].idPlaceholder}
                      className="w-full px-4 py-3 bg-google-canvas border border-google-border rounded-2xl text-xs sm:text-sm outline-none focus:border-google-blue focus:bg-white transition-all text-google-dark"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-google-dark">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-xs text-google-blue hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (e.g. password123)"
                      className="w-full px-4 py-3 pr-11 bg-google-canvas border border-google-border rounded-2xl text-xs sm:text-sm outline-none focus:border-google-blue focus:bg-white transition-all text-google-dark"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-google-gray hover:text-google-dark"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-google-blue rounded border-google-border focus:ring-google-blue"
                    />
                    <span className="text-xs text-google-gray">Remember me on this browser</span>
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-full bg-google-blue hover:bg-google-blue-hover text-white text-sm font-bold shadow-sm hover:shadow-google transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <span>Sign In as {roleConfig[selectedRole].title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ======================= MODE 2: PATIENT REGISTRATION ======================= */}
          {authMode === 'REGISTER' && (
            <div>
              <div className="mb-4 p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-google-blue flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>Instant registration for Aarav, Priya, or new family members.</span>
              </div>

              {regError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-google-red flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-google-dark mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Sarthak Sharma, Sunita Devi"
                    className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-google-dark mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. patient@care.in"
                      className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-google-dark mb-1">Mobile Number (+91)</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-google-dark mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full px-3 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-google-dark mb-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full px-3 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-google-dark mb-1">Blood Group</label>
                    <select
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      className="w-full px-3 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-google-dark mb-1">Create Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter password (minimum 6 characters)"
                    className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full bg-google-green hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register & Open Patient Portal</span>
                </button>
              </form>
            </div>
          )}

          {/* ======================= 3. DEMO PROFILES SECTION ======================= */}
          <div className="mt-8 pt-6 border-t border-google-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-google-dark uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-google-blue" />
                Quick 1-Click Demo Profiles (Indian Healthcare Roster)
              </span>
              <span className="text-[10px] text-google-gray">For Evaluation & Testing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Demo 1: Patient */}
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('PATIENT', 'usr_pat_1')}
                className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar name="Aarav Patel" role="PATIENT" size="sm" />
                  <div>
                    <span className="text-xs font-bold text-google-dark block group-hover:text-google-blue">
                      Aarav Patel
                    </span>
                    <span className="text-[11px] text-google-gray">Patient • Book Visits</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-google-blue text-white">
                  Login &rarr;
                </span>
              </button>

              {/* Demo 2: Doctor */}
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('DOCTOR', 'usr_doc_1')}
                className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar name="Dr. Rajesh Sharma" role="DOCTOR" size="sm" />
                  <div>
                    <span className="text-xs font-bold text-google-dark block group-hover:text-google-green">
                      Dr. Rajesh Sharma
                    </span>
                    <span className="text-[11px] text-google-gray">Doctor • Cardiology OPD</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-google-green text-white">
                  Login &rarr;
                </span>
              </button>

              {/* Demo 3: Receptionist */}
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('RECEPTIONIST', 'usr_rec_1')}
                className="p-3 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar name="Pooja Sharma" role="RECEPTIONIST" size="sm" />
                  <div>
                    <span className="text-xs font-bold text-google-dark block group-hover:text-purple-700">
                      Pooja Sharma
                    </span>
                    <span className="text-[11px] text-google-gray">Receptionist • OPD Desk</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-700 text-white">
                  Login &rarr;
                </span>
              </button>

              {/* Demo 4: Admin */}
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('ADMIN', 'usr_admin_1')}
                className="p-3 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar name="Neha Gupta" role="ADMIN" size="sm" />
                  <div>
                    <span className="text-xs font-bold text-google-dark block group-hover:text-google-red">
                      Neha Gupta
                    </span>
                    <span className="text-[11px] text-google-gray">Admin • RBAC & Audit</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-google-red text-white">
                  Login &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-google-3 border border-google-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-google-blue" />
                <h3 className="text-base font-bold text-google-dark">Forgot Password</h3>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 rounded-full hover:bg-google-surface text-google-gray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-google-gray leading-relaxed mb-4">
              For security, CareSync demo accounts can authenticate using the standard passkey{' '}
              <span className="font-mono font-bold text-google-dark bg-google-canvas px-1.5 py-0.5 rounded border">
                password123
              </span>{' '}
              or the user&apos;s first name (e.g.{' '}
              <span className="font-mono font-bold text-google-dark">aarav</span>,{' '}
              <span className="font-mono font-bold text-google-dark">rajesh</span>,{' '}
              <span className="font-mono font-bold text-google-dark">pooja</span>,{' '}
              <span className="font-mono font-bold text-google-dark">neha</span>).
            </p>

            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-google-blue mb-4">
              <span className="font-semibold block mb-0.5">Need Account Lockout Unlocked?</span>
              <span>
                If your account is locked out for 15 minutes due to 3 failed attempts (DEF-01), log in with the Admin
                account (Neha Gupta) to unlock it with 1 click.
              </span>
            </div>

            <button
              onClick={() => {
                setPassword('password123');
                setShowForgotPasswordModal(false);
              }}
              className="w-full py-2.5 rounded-full bg-google-blue text-white text-xs font-bold hover:bg-google-blue-hover transition-all"
            >
              Fill Demo Password (&quot;password123&quot;) & Close
            </button>
          </div>
        </div>
      )}

      {/* 5. Minimalist Footer */}
      <footer className="py-4 text-center text-xs text-google-gray border-t border-google-border bg-white">
        <p>CareSync Telehealth Portal • Built with Practo-Simplicity & HIPAA Certified Architecture</p>
      </footer>
    </div>
  );
};
