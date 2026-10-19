import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  Shield,
  Lock,
  Mail,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  X,
  Clock,
  Unlock,
  Stethoscope,
  Pill,
  Users,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, selectUser, login, verifyMFA, adminUnlockAccount } = useApp();

  const [activeTab, setActiveTab] = useState<'ROLES' | 'PASSWORD'>('ROLES');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT');
  const [email, setEmail] = useState('aarav.patel@care.in');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA'>('CREDENTIALS');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningBanner, setWarningBanner] = useState<string | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  // Sync email when role changes
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setWarningBanner(null);
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      setEmail(matchedUser.email);
    }
  };

  // Check lockout on email change or users update
  useEffect(() => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.lockedUntil && user.lockedUntil > Date.now()) {
      setLockoutTimer(Math.max(0, Math.floor((user.lockedUntil - Date.now()) / 1000)));
    } else {
      setLockoutTimer(null);
    }
  }, [email, users]);

  // Lockout countdown timer ticker
  useEffect(() => {
    if (lockoutTimer === null || lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  if (!isOpen) return null;

  const targetUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const failedAttempts = targetUser?.failedAttempts || 0;

  const handleQuickDemoLogin = (userId: string) => {
    selectUser(userId);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningBanner(null);

    const result = login(email, password, selectedRole);

    if (result.locked) {
      setErrorMessage(result.message || 'Account locked for 15 minutes.');
      if (targetUser?.lockedUntil) {
        setLockoutTimer(Math.floor((targetUser.lockedUntil - Date.now()) / 1000));
      }
      return;
    }

    if (!result.success) {
      setErrorMessage(result.message || 'Invalid credentials.');
      if (failedAttempts + 1 === 2) {
        setWarningBanner('⚠️ Warning (Attempt 2 of 3): 1 more failed attempt will lock this account for 15 minutes (DEF-01).');
      }
      return;
    }

    if (result.requiresMFA) {
      setStep('MFA');
    } else {
      onClose();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits.');
      return;
    }

    const success = verifyMFA(fullCode);
    if (success) {
      onClose();
    } else {
      setErrorMessage('Invalid MFA token. Enter 123456 or any 6 numbers.');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Indian Demo Users Grouped
  const patients = users.filter((u) => u.role === 'PATIENT');
  const doctors = users.filter((u) => u.role === 'DOCTOR');
  const receptionists = users.filter((u) => u.role === 'RECEPTIONIST');
  const pharmacists = users.filter((u) => u.role === 'PHARMACIST');
  const admins = users.filter((u) => u.role === 'ADMIN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-google-3 border border-google-border max-w-2xl w-full overflow-hidden relative">
        {/* Google 4-Color Accent Strip */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-google-blue"></div>
          <div className="flex-1 bg-google-red"></div>
          <div className="flex-1 bg-google-yellow"></div>
          <div className="flex-1 bg-google-green"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-google-gray hover:bg-google-surface hover:text-google-dark transition-colors"
          aria-label="Close auth modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-google-dark">Welcome to CareSync Health</h2>
            <p className="text-xs text-google-gray mt-1">
              Select your role or choose a demo profile to experience the portal instantly.
            </p>

            {/* Mode Switcher */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex p-1 bg-google-canvas rounded-full border border-google-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('ROLES')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'ROLES'
                      ? 'bg-google-blue text-white shadow-xs'
                      : 'text-google-gray hover:text-google-dark'
                  }`}
                >
                  Choose Role & Demo Profiles
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('PASSWORD')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'PASSWORD'
                      ? 'bg-google-blue text-white shadow-xs'
                      : 'text-google-gray hover:text-google-dark'
                  }`}
                >
                  Password Login & Lockout Test
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: Role Selection & 1-Click Indian Demo Profiles */}
          {activeTab === 'ROLES' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Patient Role Card */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        🧑‍💼
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-google-dark">Patient Access</h3>
                        <p className="text-[11px] text-google-gray">Book visits, review reports, join calls</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-blue-200/60">
                    {patients.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(pat.id)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-blue-100/60 border border-blue-200/60 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar name={pat.name} role="PATIENT" size="sm" />
                          <div>
                            <span className="font-bold text-google-dark block">{pat.name}</span>
                            <span className="text-[10px] text-google-gray">
                              {pat.id === 'usr_pat_1' ? 'Consent: Allowed' : 'Consent: Restricted'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-google-blue" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Doctor Role Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        🩺
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-google-dark">Doctor Console</h3>
                        <p className="text-[11px] text-google-gray">Conduct video visits & sign digital Rx</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-emerald-200/60">
                    {doctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(doc.id)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200/60 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar name={doc.name} role="DOCTOR" size="sm" />
                          <div>
                            <span className="font-bold text-google-dark block">{doc.name}</span>
                            <span className="text-[10px] text-google-gray truncate max-w-[140px] block">
                              {doc.specialization?.split('(')[0]}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-google-green" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Pharmacist Role Card */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                        💊
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-google-dark">Pharmacist Desk</h3>
                        <p className="text-[11px] text-google-gray">Scan QR, verify hash & dispense</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-amber-200/60">
                    {pharmacists.map((pharm) => (
                      <button
                        key={pharm.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(pharm.id)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200/60 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar name={pharm.name} role="PHARMACIST" size="sm" />
                          <div>
                            <span className="font-bold text-google-dark block">{pharm.name}</span>
                            <span className="text-[10px] text-google-gray">MedPlus & Jan Aushadhi</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Receptionist Role Card */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        📋
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-google-dark">Receptionist Desk</h3>
                        <p className="text-[11px] text-google-gray">OPD check-in & walk-in booking</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-purple-200/60">
                    {receptionists.map((rec) => (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(rec.id)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-purple-100/60 border border-purple-200/60 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar name={rec.name} role="RECEPTIONIST" size="sm" />
                          <div>
                            <span className="font-bold text-google-dark block">{rec.name}</span>
                            <span className="text-[10px] text-google-gray">Front Desk OPD</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Administrator Role Card */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                        🛡️
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-google-dark">System Admin</h3>
                        <p className="text-[11px] text-google-gray">Unlock accounts & inspect audit log</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-rose-200/60">
                    {admins.map((adm) => (
                      <button
                        key={adm.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(adm.id)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-rose-100/60 border border-rose-200/60 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar name={adm.name} role="ADMIN" size="sm" />
                          <div>
                            <span className="font-bold text-google-dark block">{adm.name}</span>
                            <span className="text-[10px] text-google-gray">Security Administrator</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-google-red" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Password Login & DEF-01 Lockout Test */}
          {activeTab === 'PASSWORD' && (
            <div>
              {/* Lockout Warning Banner */}
              {lockoutTimer !== null && lockoutTimer > 0 && (
                <div className="mb-4 p-4 rounded-2xl bg-google-red-light border border-google-red/30 text-google-red">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Account Temporarily Locked (DEF-01)</h4>
                      <p className="text-xs mt-1 text-red-700">
                        3 failed login attempts. Locked for 15 minutes.
                      </p>
                      <div className="flex items-center gap-2 mt-2 font-mono font-bold text-sm text-red-800">
                        <Clock className="w-4 h-4" />
                        <span>Remaining: {formatTimer(lockoutTimer)}</span>
                      </div>
                      {targetUser && (
                        <button
                          type="button"
                          onClick={() => {
                            adminUnlockAccount(targetUser.id);
                            setLockoutTimer(null);
                            setErrorMessage(null);
                            setWarningBanner(null);
                          }}
                          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-white text-google-red border border-google-red/40 rounded-full text-xs font-semibold hover:bg-red-50"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Reset Lock (Admin Bypass)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {warningBanner && !lockoutTimer && (
                <div className="mb-4 p-3 rounded-2xl bg-google-yellow-light border border-google-yellow/40 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-google-yellow" />
                  <span>{warningBanner}</span>
                </div>
              )}

              {errorMessage && !warningBanner && !lockoutTimer && (
                <div className="mb-4 p-3 rounded-2xl bg-google-red-light border border-google-red/30 text-google-red text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {step === 'CREDENTIALS' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Select Role */}
                  <div className="flex p-1 bg-google-canvas rounded-2xl border border-google-border">
                    {(['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          selectedRole === role
                            ? 'bg-white text-google-blue shadow-xs'
                            : 'text-google-gray hover:text-google-dark'
                        }`}
                      >
                        {role === 'PATIENT' ? 'Patient' : role === 'DOCTOR' ? 'Doctor' : role === 'PHARMACIST' ? 'Pharmacy' : 'Admin'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-google-gray mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={lockoutTimer !== null && lockoutTimer > 0}
                      className="w-full px-4 py-2.5 bg-google-canvas border border-google-border focus:border-google-blue rounded-2xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-semibold text-google-gray">Password</label>
                      <span className="text-[11px] text-google-gray">
                        Demo: <code className="bg-google-surface px-1 py-0.5 rounded font-mono">password123</code>
                      </span>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={lockoutTimer !== null && lockoutTimer > 0}
                      className="w-full px-4 py-2.5 bg-google-canvas border border-google-border focus:border-google-blue rounded-2xl text-xs outline-none"
                    />
                  </div>

                  <div className="flex justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setPassword('wrongpass')}
                      className="text-google-red hover:underline text-[11px]"
                    >
                      Enter Wrong Password (Test Lockout)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassword('password123')}
                      className="text-google-green hover:underline text-[11px]"
                    >
                      Enter Correct Password
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={lockoutTimer !== null && lockoutTimer > 0}
                    className="w-full py-3 bg-google-blue hover:bg-google-blue-hover text-white font-bold text-xs rounded-full shadow-sm"
                  >
                    Continue to Dashboard
                  </button>
                </form>
              ) : (
                /* Step 2: MFA */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <KeyRound className="w-5 h-5 text-google-blue mx-auto mb-1" />
                    <h4 className="text-xs font-bold text-google-dark">Enter 6-Digit OTP</h4>
                    <p className="text-[11px] text-google-gray mt-0.5">Demo hint: Enter 123456</p>
                  </div>

                  <div className="flex justify-center gap-2">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-input-${i}`}
                        type="text"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-10 h-11 text-center font-bold text-lg border border-google-border rounded-xl outline-none focus:border-google-blue"
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('CREDENTIALS')}
                      className="flex-1 py-2 border border-google-border text-google-gray text-xs font-bold rounded-full"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-google-green text-white text-xs font-bold rounded-full"
                    >
                      Verify & Log In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
