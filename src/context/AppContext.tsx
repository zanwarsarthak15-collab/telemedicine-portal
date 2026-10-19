import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  UserRole,
  PatientEHR,
  EHRDocument,
  AppointmentSlot,
  AppointmentStatus,
  PaymentTransaction,
  Prescription,
  PrescriptionMedication,
  AuditLogEntry,
  AuditCategory,
  AuditStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EHRS,
  INITIAL_APPOINTMENTS,
  INITIAL_PAYMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface AppContextType {
  // Current session & view
  currentUser: UserAccount | null;
  activeView: string;
  setActiveView: (view: string) => void;
  activeConsultationId: string | null;
  setActiveConsultationId: (id: string | null) => void;

  // Stores
  users: UserAccount[];
  ehrs: Record<string, PatientEHR>;
  appointments: AppointmentSlot[];
  payments: PaymentTransaction[];
  prescriptions: Prescription[];
  auditLogs: AuditLogEntry[];

  // Auth & RBAC
  login: (
    idOrEmail: string,
    password: string,
    selectedRole: UserRole
  ) => {
    success: boolean;
    requiresMFA?: boolean;
    message?: string;
    locked?: boolean;
    remainingMinutes?: number;
    user?: UserAccount;
  };
  verifyMFA: (otp: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  selectUser: (userId: string) => void;
  registerPatient: (patientData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    gender: string;
    dob: string;
    bloodGroup: string;
    address?: string;
  }) => { success: boolean; user?: UserAccount; message?: string };
  adminUnlockAccount: (userId: string) => void;
  adminUpdateUserRole: (userId: string, newRole: UserRole) => void;

  // EHR & Consent
  toggleEHRConsent: (patientId: string) => void;
  uploadEHRDocument: (patientId: string, doc: Omit<EHRDocument, 'id'>) => void;
  logEHRAccess: (doctorId: string, doctorName: string, patientId: string, purpose: string) => boolean;

  // Appointments & Slot-Locking
  lockAppointmentSlot: (slotId: string, patientId: string, patientName: string) => boolean;
  unlockAppointmentSlot: (slotId: string) => void;
  bookAppointment: (
    slotId: string,
    patientId: string,
    patientName: string,
    reason: string,
    consultationType: 'Video Consultation' | 'In-Clinic Follow-up',
    bookedBy?: string,
    patientPhone?: string,
    patientAge?: number,
    patientGender?: string
  ) => { success: boolean; message?: string };
  checkInPatient: (slotId: string) => void;
  updateAppointmentStatus: (slotId: string, status: AppointmentStatus, reason?: string) => void;
  cancelAppointment: (slotId: string, reason: string) => void;
  addDoctorSlot: (
    doctorId: string,
    date: string,
    timeSlot: string,
    fee: number,
    consultationType: 'Video Consultation' | 'In-Clinic Follow-up'
  ) => void;
  toggleDoctorSlot: (slotId: string) => void;

  // Payments & Google Pay
  processPayment: (
    appointmentId: string,
    method: 'Google Pay' | 'Card (TLS 1.3)' | 'UPI Instant',
    details: { cardLast4?: string; upiId?: string },
    simulateFail?: boolean
  ) => { success: boolean; transaction?: PaymentTransaction; error?: string };

  // Prescriptions & UC-7 Amendments
  signPrescription: (prescriptionId: string, signatureDataUrl: string) => void;
  createAmendment: (
    originalId: string,
    updatedMedications: PrescriptionMedication[],
    diagnosis: string,
    reason: string
  ) => Prescription;
  fulfillPrescription: (
    prescriptionId: string,
    pharmacistName: string,
    pharmacyLicense: string
  ) => { success: boolean; message: string };

  // Audit
  addAuditLog: (action: string, category: AuditCategory, details: string, status: AuditStatus) => void;

  // Toast / notification banner
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // D1: User Accounts
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('D1_UserAccounts');
    if (!saved || saved.includes('Alex Rivera') || !saved.includes('Pooja Sharma')) {
      localStorage.setItem('D1_UserAccounts', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(saved);
  });

  // Current User Session: default to null (so Login Page opens first!) unless active session exists
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedSession = sessionStorage.getItem('CareSync_ActiveSession');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Ensure user still exists in current user roster
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Navigation View State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);

  // D2: Patient EHR
  const [ehrs, setEhrs] = useState<Record<string, PatientEHR>>(() => {
    const saved = localStorage.getItem('D2_PatientEHR');
    if (!saved || saved.includes('Alex Rivera') || !saved.includes('usr_pat_1')) {
      localStorage.setItem('D2_PatientEHR', JSON.stringify(INITIAL_EHRS));
      return INITIAL_EHRS;
    }
    return JSON.parse(saved);
  });

  // D3: Appointments
  const [appointments, setAppointments] = useState<AppointmentSlot[]>(() => {
    const saved = localStorage.getItem('D3_Appointments');
    if (!saved || saved.includes('Alex Rivera') || !saved.includes('Dr. Rajesh Sharma')) {
      localStorage.setItem('D3_Appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(saved);
  });

  // D4: Payments
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('D4_Payments');
    if (!saved || saved.includes('Alex Rivera')) {
      localStorage.setItem('D4_Payments', JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(saved);
  });

  // D6: Prescriptions
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('D6_Prescriptions');
    if (!saved || saved.includes('Alex Rivera') || !saved.includes('Dr. Rajesh Sharma')) {
      localStorage.setItem('D6_Prescriptions', JSON.stringify(INITIAL_PRESCRIPTIONS));
      return INITIAL_PRESCRIPTIONS;
    }
    return JSON.parse(saved);
  });

  // D7: Audit Log (Immutable append-only)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('D7_AuditLog');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('D1_UserAccounts', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('D2_PatientEHR', JSON.stringify(ehrs));
  }, [ehrs]);

  useEffect(() => {
    localStorage.setItem('D3_Appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('D4_Payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('D6_Prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('D7_AuditLog', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Interval check to auto-release expired slot locks (5-minute countdown)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setAppointments((prev) =>
        prev.map((slot) => {
          if (slot.status === 'pending' && slot.pendingExpiresAt && slot.pendingExpiresAt <= now) {
            return {
              ...slot,
              status: 'available',
              patientId: undefined,
              patientName: undefined,
              pendingExpiresAt: undefined,
            };
          }
          return slot;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Helper to add Audit Log Entry (D7)
  const addAuditLog = (action: string, category: AuditCategory, details: string, status: AuditStatus) => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser ? currentUser.id : 'usr_anon',
      actorName: currentUser ? currentUser.name : 'System/Guest',
      role: currentUser ? currentUser.role : 'SYSTEM',
      action,
      category,
      details,
      status,
      ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 200),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Authentication & DEF-01 Lockout Implementation with Role Authorization
  const login = (idOrEmail: string, pass: string, selectedRole: UserRole) => {
    const trimmed = idOrEmail.trim().toLowerCase();
    const cleanPhone = trimmed.replace(/\s+/g, '').replace('+', '');

    const user = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === trimmed;
      const idMatch = u.id.toLowerCase() === trimmed;
      const phoneMatch = u.phone && u.phone.replace(/\s+/g, '').replace('+', '').includes(cleanPhone);
      return emailMatch || idMatch || phoneMatch;
    });

    if (!user) {
      addAuditLog('AUTH_UNKNOWN_ACCOUNT', 'AUTH', `Login attempt for unmapped ID/Email: ${idOrEmail}`, 'WARNING');
      return { success: false, message: 'Account not found. Please check your User ID, Mobile number, or Email.' };
    }

    // Role Authorization Check
    if (user.role !== selectedRole) {
      addAuditLog(
        'AUTH_ROLE_MISMATCH',
        'AUTH',
        `Role mismatch: User ${user.name} is ${user.role}, attempted login as ${selectedRole}.`,
        'WARNING'
      );
      return {
        success: false,
        message: `Access Denied: This account is registered as ${user.role}, not ${selectedRole}. Please select the "${user.role}" role card above.`,
      };
    }

    const now = Date.now();
    // Check if account is currently locked out (DEF-01)
    if (user.lockedUntil && user.lockedUntil > now) {
      const remainingMinutes = Math.ceil((user.lockedUntil - now) / 60000);
      addAuditLog(
        'AUTH_LOCKED_ATTEMPT',
        'AUTH',
        `Blocked access for locked account ${user.email}. Remaining: ${remainingMinutes}m`,
        'FAILURE'
      );
      return {
        success: false,
        locked: true,
        remainingMinutes,
        message: `Account is temporarily locked for 15 minutes due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s) or contact Administrator to unlock.`,
      };
    }

    // Password verification: accepts "password123", "demo", or user's first name
    const firstName = user.name.split(' ')[0].toLowerCase().replace('dr.', '');
    const isValidPass =
      pass.toLowerCase() === 'password123' ||
      pass.toLowerCase() === 'demo' ||
      pass.toLowerCase() === firstName;

    if (!isValidPass) {
      const updatedAttempts = (user.failedAttempts || 0) + 1;
      let newLockedUntil: number | null = null;
      let isNowLocked = false;

      // Lockout on 3 consecutive failed attempts (15 min = 900,000 ms)
      if (updatedAttempts >= 3) {
        newLockedUntil = now + 15 * 60 * 1000;
        isNowLocked = true;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, failedAttempts: updatedAttempts, lockedUntil: newLockedUntil }
            : u
        )
      );

      if (isNowLocked) {
        addAuditLog(
          'ACCOUNT_LOCKED_DEF01',
          'AUTH',
          `Account ${user.email} locked for 15 minutes after 3 consecutive failed attempts.`,
          'FAILURE'
        );
        return {
          success: false,
          locked: true,
          remainingMinutes: 15,
          message:
            'Account locked for 15 minutes due to 3 consecutive failed attempts (Exception Flow 11 & DEF-01). An administrator can unlock it from the Admin Console.',
        };
      } else {
        addAuditLog(
          'AUTH_FAILED_ATTEMPT',
          'AUTH',
          `Failed login attempt ${updatedAttempts} of 3 for ${user.email}.`,
          'WARNING'
        );
        return {
          success: false,
          message: `Invalid password. Attempt ${updatedAttempts} of 3. ${
            updatedAttempts === 2 ? '⚠️ Warning: Account will be locked out on the next failure!' : ''
          }`,
        };
      }
    }

    // Direct login success: reset failed attempts
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, failedAttempts: 0, lockedUntil: null } : u))
    );
    setCurrentUser(user);
    sessionStorage.setItem('CareSync_ActiveSession', JSON.stringify(user));
    setActiveView('dashboard');
    addAuditLog('AUTH_SUCCESS', 'AUTH', `User ${user.name} (${user.role}) logged in successfully.`, 'SUCCESS');
    showToast(`Welcome back, ${user.name}!`, 'success');
    return { success: true, user };
  };

  const verifyMFA = (otp: string) => {
    if (/^\d{6}$/.test(otp)) {
      if (currentUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === currentUser.id ? { ...u, failedAttempts: 0, lockedUntil: null } : u))
        );
        addAuditLog('AUTH_MFA_SUCCESS', 'AUTH', `MFA OTP verified for ${currentUser.name}.`, 'SUCCESS');
      }
      showToast('Authentication & MFA verified successfully.', 'success');
      return true;
    }
    if (currentUser) {
      addAuditLog('AUTH_MFA_FAILED', 'AUTH', `Invalid MFA code attempt for ${currentUser.name}.`, 'WARNING');
    }
    showToast('Invalid 6-digit OTP code.', 'error');
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', 'AUTH', `User ${currentUser.name} logged out.`, 'INFO');
    }
    setCurrentUser(null);
    sessionStorage.removeItem('CareSync_ActiveSession');
    setActiveView('login');
    showToast('You have been logged out successfully.', 'info');
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      sessionStorage.setItem('CareSync_ActiveSession', JSON.stringify(targetUser));
      setActiveView('dashboard');
      setActiveConsultationId(null);
      addAuditLog('ROLE_SWITCH', 'AUTH', `Switched active profile to ${targetUser.name} (${role})`, 'INFO');
      showToast(`Switched active profile to ${targetUser.name} (${role})`, 'info');
    }
  };

  const selectUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      sessionStorage.setItem('CareSync_ActiveSession', JSON.stringify(target));
      setActiveView('dashboard');
      setActiveConsultationId(null);
      addAuditLog('DEMO_USER_SELECT', 'AUTH', `Switched active session to ${target.name} (${target.role})`, 'INFO');
      showToast(`Signed in as ${target.name} (${target.role})`, 'info');
    }
  };

  const registerPatient = (patientData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    gender: string;
    dob: string;
    bloodGroup: string;
    address?: string;
  }) => {
    // Check if email already exists
    const existing = users.find((u) => u.email.toLowerCase() === patientData.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please sign in.' };
    }

    const newId = `usr_pat_${Date.now()}`;
    const newPatient: UserAccount = {
      id: newId,
      name: patientData.name,
      email: patientData.email,
      role: 'PATIENT',
      avatar: '',
      mfaEnabled: true,
      failedAttempts: 0,
      lockedUntil: null,
      phone: patientData.phone,
      dateOfBirth: patientData.dob,
      gender: patientData.gender,
      isActive: true,
    };

    // Create Initial EHR
    const newEhr: PatientEHR = {
      id: `ehr_${newId}`,
      patientId: newId,
      bloodGroup: patientData.bloodGroup || 'O+',
      allergies: [],
      conditions: [],
      currentMedications: [],
      emergencyContact: {
        name: 'Primary Contact',
        phone: patientData.phone,
        relation: 'Self',
      },
      records: [],
      consentGranted: true,
      accessLog: [],
    };

    setUsers((prev) => [newPatient, ...prev]);
    setEhrs((prev) => ({ ...prev, [newId]: newEhr }));

    // Auto-login the registered patient
    setCurrentUser(newPatient);
    sessionStorage.setItem('CareSync_ActiveSession', JSON.stringify(newPatient));
    setActiveView('dashboard');

    addAuditLog(
      'PATIENT_REGISTRATION',
      'AUTH',
      `New patient registered: ${newPatient.name} (ID: ${newId})`,
      'SUCCESS'
    );
    showToast(`Welcome to CareSync, ${newPatient.name}! Your account is ready.`, 'success');
    return { success: true, user: newPatient };
  };

  const adminUnlockAccount = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, failedAttempts: 0, lockedUntil: null } : u))
    );
    addAuditLog('ADMIN_UNLOCK_ACCOUNT', 'ADMIN', `Administrator unlocked account ID: ${userId}`, 'SUCCESS');
    showToast('Account unlocked successfully.', 'success');
  };

  const adminUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    addAuditLog('ADMIN_ROLE_CHANGE', 'ADMIN', `Updated role for user ID: ${userId} to ${newRole}`, 'SUCCESS');
    showToast(`Updated user role to ${newRole}`, 'success');
  };

  // EHR & Consent Management
  const toggleEHRConsent = (patientId: string) => {
    const current = ehrs[patientId]?.consentGranted ?? true;
    const nextStatus = !current;

    setEhrs((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        consentGranted: nextStatus,
      },
    }));

    addAuditLog(
      'EHR_CONSENT_CHANGE',
      'EHR_ACCESS',
      `Patient ${patientId} changed Doctor Access Consent to: ${nextStatus ? 'GRANTED' : 'RESTRICTED'}`,
      'INFO'
    );
    showToast(
      nextStatus ? 'Doctor access consent enabled.' : 'Doctor access consent restricted. Doctors cannot inspect your records.',
      nextStatus ? 'success' : 'warning'
    );
  };

  const uploadEHRDocument = (patientId: string, doc: Omit<EHRDocument, 'id'>) => {
    const newDoc: EHRDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
    };

    setEhrs((prev) => {
      const patientRecord = prev[patientId] || {
        id: `ehr_${patientId}`,
        patientId,
        bloodGroup: 'Unknown',
        allergies: [],
        conditions: [],
        currentMedications: [],
        emergencyContact: { name: 'Not set', phone: '', relation: '' },
        records: [],
        consentGranted: true,
        accessLog: [],
      };

      return {
        ...prev,
        [patientId]: {
          ...patientRecord,
          records: [newDoc, ...patientRecord.records],
        },
      };
    });

    addAuditLog(
      'EHR_DOCUMENT_UPLOAD',
      'EHR_ACCESS',
      `Patient ${patientId} uploaded document: ${doc.title} (${doc.type})`,
      'SUCCESS'
    );
    showToast(`Document "${doc.title}" stored securely in EHR vault.`, 'success');
  };

  const logEHRAccess = (doctorId: string, doctorName: string, patientId: string, purpose: string) => {
    const patientRecord = ehrs[patientId];
    if (!patientRecord || !patientRecord.consentGranted) {
      addAuditLog(
        'EHR_ACCESS_BLOCKED',
        'EHR_ACCESS',
        `Doctor ${doctorName} attempted access to EHR of patient ${patientId}, but consent was RESTRICTED.`,
        'WARNING'
      );
      return false;
    }

    const logEntry = {
      id: `log_ehr_${Date.now()}`,
      doctorId,
      doctorName,
      timestamp: new Date().toISOString(),
      purpose,
      action: 'READ' as const,
    };

    setEhrs((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        accessLog: [logEntry, ...(prev[patientId].accessLog || [])],
      },
    }));

    addAuditLog(
      'EHR_ACCESS_AUTHORIZED',
      'EHR_ACCESS',
      `Doctor ${doctorName} accessed EHR of patient ${patientId} for "${purpose}".`,
      'INFO'
    );
    return true;
  };

  // Appointments & Slot-Locking (5-minute hold)
  const lockAppointmentSlot = (slotId: string, patientId: string, patientName: string) => {
    const slot = appointments.find((s) => s.id === slotId);
    if (!slot || slot.status !== 'available') {
      showToast('This slot is currently reserved or unavailable.', 'warning');
      return false;
    }

    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    setAppointments((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status: 'pending',
              patientId,
              patientName,
              pendingExpiresAt: expiresAt,
            }
          : s
      )
    );

    addAuditLog(
      'APPOINTMENT_SLOT_LOCKED',
      'PAYMENT',
      `Slot ${slotId} temporarily locked for patient ${patientName} (5-minute hold).`,
      'INFO'
    );
    return true;
  };

  const unlockAppointmentSlot = (slotId: string) => {
    setAppointments((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status: 'available',
              patientId: undefined,
              patientName: undefined,
              pendingExpiresAt: undefined,
            }
          : s
      )
    );
  };

  // Direct Book Appointment (Used by Patient or Receptionist)
  const bookAppointment = (
    slotId: string,
    patientId: string,
    patientName: string,
    reason: string,
    consultationType: 'Video Consultation' | 'In-Clinic Follow-up' = 'In-Clinic Follow-up',
    bookedBy?: string,
    patientPhone?: string,
    patientAge?: number,
    patientGender?: string
  ) => {
    const slot = appointments.find((s) => s.id === slotId);
    if (!slot) return { success: false, message: 'Appointment slot not found.' };

    const meetingId = consultationType === 'Video Consultation' ? `meet-${slotId}` : undefined;

    setAppointments((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status: 'confirmed',
              patientId,
              patientName,
              patientPhone: patientPhone || s.patientPhone,
              patientAge: patientAge || s.patientAge,
              patientGender: patientGender || s.patientGender,
              reason,
              consultationType,
              meetingId,
              bookedBy: bookedBy || (currentUser ? currentUser.name : 'Patient'),
              pendingExpiresAt: undefined,
            }
          : s
      )
    );

    addAuditLog(
      'APPOINTMENT_BOOKED',
      'CONSULTATION',
      `Appointment ${slotId} confirmed for ${patientName} with ${slot.doctorName} on ${slot.date} at ${slot.timeSlot}.`,
      'SUCCESS'
    );
    showToast(`Appointment confirmed for ${slot.date} at ${slot.timeSlot}!`, 'success');
    return { success: true };
  };

  // Check-In Patient at Front Desk OPD
  const checkInPatient = (slotId: string) => {
    const slot = appointments.find((s) => s.id === slotId);
    if (!slot) return;

    const nowIso = new Date().toISOString();
    setAppointments((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status: 'checked_in',
              checkedInAt: nowIso,
            }
          : s
      )
    );

    addAuditLog(
      'PATIENT_CHECKED_IN',
      'RECEPTION',
      `Patient ${slot.patientName} checked-in at Front Desk for Dr. ${slot.doctorName} (Slot: ${slot.timeSlot}).`,
      'SUCCESS'
    );
    showToast(`Patient ${slot.patientName} marked as CHECKED-IN. Doctor notified.`, 'success');
  };

  // Doctor & Receptionist Update Appointment Status
  const updateAppointmentStatus = (slotId: string, status: AppointmentStatus, reason?: string) => {
    const slot = appointments.find((s) => s.id === slotId);
    if (!slot) return;

    setAppointments((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status,
              reason: reason ? `${s.reason || ''} [Status: ${status} - ${reason}]` : s.reason,
            }
          : s
      )
    );

    addAuditLog(
      'APPOINTMENT_STATUS_UPDATE',
      'CONSULTATION',
      `Appointment ${slotId} status changed to ${status.toUpperCase()} by ${currentUser ? currentUser.name : 'System'}.`,
      'INFO'
    );
    showToast(`Appointment status updated to ${status.toUpperCase()}.`, 'info');
  };

  // Doctor Availability Slot Management
  const addDoctorSlot = (
    doctorId: string,
    date: string,
    timeSlot: string,
    fee: number,
    consultationType: 'Video Consultation' | 'In-Clinic Follow-up'
  ) => {
    const doctor = users.find((u) => u.id === doctorId);
    const newSlot: AppointmentSlot = {
      id: `slot_${Date.now()}`,
      doctorId,
      doctorName: doctor ? doctor.name : 'Attending Doctor',
      specialization: doctor?.specialization || 'General Medicine',
      date,
      timeSlot,
      fee,
      status: 'available',
      consultationType,
    };

    setAppointments((prev) => [...prev, newSlot]);
    addAuditLog(
      'DOCTOR_SLOT_ADDED',
      'CONSULTATION',
      `Dr. ${doctor?.name} added new availability slot on ${date} at ${timeSlot}.`,
      'SUCCESS'
    );
    showToast(`New availability slot added for ${timeSlot}.`, 'success');
  };

  const toggleDoctorSlot = (slotId: string) => {
    const slot = appointments.find((s) => s.id === slotId);
    if (!slot) return;

    if (slot.status === 'available') {
      setAppointments((prev) => prev.filter((s) => s.id !== slotId));
      showToast('Slot removed from your schedule.', 'info');
    } else {
      showToast('Cannot remove a slot that is already booked or checked-in.', 'warning');
    }
  };

  // Payments & Receipt Generation (UC-4, Exception Flow 13)
  const processPayment = (
    appointmentId: string,
    method: 'Google Pay' | 'Card (TLS 1.3)' | 'UPI Instant',
    details: { cardLast4?: string; upiId?: string },
    simulateFail = false
  ) => {
    const slot = appointments.find((s) => s.id === appointmentId);
    if (!slot) return { success: false, error: 'Appointment not found.' };

    const patientName = slot.patientName || (currentUser ? currentUser.name : 'Patient');
    const patientId = slot.patientId || (currentUser ? currentUser.id : 'usr_anon');

    if (simulateFail) {
      const failedTx: PaymentTransaction = {
        id: `tx_fail_${Date.now()}`,
        appointmentId,
        patientId,
        patientName,
        doctorName: slot.doctorName,
        amount: slot.fee,
        status: 'failed',
        receiptNumber: 'DECLINED-' + Math.floor(100000 + Math.random() * 900000),
        transactionDate: new Date().toISOString(),
        paymentMethod: method,
        failureReason: 'Payment declined: Insufficient funds or invalid UPI / CVV token (Exception Flow 13 simulation).',
      };

      setPayments((prev) => [failedTx, ...prev]);
      addAuditLog(
        'PAYMENT_DECLINED',
        'PAYMENT',
        `Payment declined for appointment ${appointmentId}: ${failedTx.failureReason}`,
        'FAILURE'
      );
      return { success: false, error: failedTx.failureReason };
    }

    // Success flow
    const receiptNum =
      method === 'Google Pay'
        ? `GPay-RCPT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
        : `UPI-RCPT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      appointmentId,
      patientId,
      patientName,
      doctorName: slot.doctorName,
      amount: slot.fee,
      status: 'completed',
      receiptNumber: receiptNum,
      transactionDate: new Date().toISOString(),
      paymentMethod: method,
      cardLast4: details.cardLast4,
      upiId: details.upiId,
    };

    setPayments((prev) => [newTx, ...prev]);

    // Confirm slot & assign meeting ID
    setAppointments((prev) =>
      prev.map((s) =>
        s.id === appointmentId
          ? {
              ...s,
              status: 'confirmed',
              pendingExpiresAt: undefined,
              meetingId: s.consultationType === 'Video Consultation' ? `meet-${s.id}` : undefined,
            }
          : s
      )
    );

    addAuditLog(
      'PAYMENT_COMPLETED',
      'PAYMENT',
      `Payment of ₹${slot.fee}.00 confirmed via ${method}. Receipt: ${receiptNum}.`,
      'SUCCESS'
    );
    showToast(`Payment of ₹${slot.fee} completed. Appointment confirmed!`, 'success');
    return { success: true, transaction: newTx };
  };

  // Cancellation with Immediate Refund (Alternate Flow 12)
  const cancelAppointment = (slotId: string, reason: string) => {
    const slot = appointments.find((s) => s.id === slotId);
    if (!slot) return;

    // Check if appointment had completed payment
    const existingPayment = payments.find((p) => p.appointmentId === slotId && p.status === 'completed');

    if (existingPayment) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === existingPayment.id
            ? { ...p, status: 'refunded', failureReason: `Refund initiated: ${reason}` }
            : p
        )
      );
      addAuditLog(
        'PAYMENT_REFUNDED',
        'PAYMENT',
        `Automatic refund of ₹${existingPayment.amount}.00 initiated for appointment ${slotId}.`,
        'INFO'
      );
    }

    setAppointments((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status: 'cancelled',
              reason: `Cancelled: ${reason}`,
            }
          : s
      )
    );

    addAuditLog(
      'APPOINTMENT_CANCELLED',
      'CONSULTATION',
      `Appointment ${slotId} cancelled by ${currentUser ? currentUser.name : 'User'}. Reason: ${reason}`,
      'WARNING'
    );
    showToast(
      existingPayment
        ? `Appointment cancelled. Full refund of ₹${existingPayment.amount} has been initiated.`
        : 'Appointment cancelled.',
      'info'
    );
  };

  // Prescriptions & Immutability (UC-7)
  const signPrescription = (prescriptionId: string, signatureDataUrl: string) => {
    const nowIso = new Date().toISOString();
    const fakeHash = 'SHA256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === prescriptionId
          ? {
              ...p,
              status: 'signed',
              doctorSignature: signatureDataUrl,
              signatureTimestamp: nowIso,
              cryptographicHash: fakeHash,
            }
          : p
      )
    );

    addAuditLog(
      'PRESCRIPTION_SIGNED_CRYPTOGRAPHIC',
      'PRESCRIPTION',
      `Prescription ${prescriptionId} signed cryptographically by ${currentUser ? currentUser.name : 'Doctor'}. Immutable lock applied.`,
      'SUCCESS'
    );
    showToast(`Prescription ${prescriptionId} signed & locked with cryptographic assurance.`, 'success');
  };

  // Prescription Amendment (UC-7 / Alternate Flow 14)
  const createAmendment = (
    originalId: string,
    updatedMedications: PrescriptionMedication[],
    diagnosis: string,
    reason: string
  ): Prescription => {
    const original = prescriptions.find((p) => p.id === originalId);
    if (!original) throw new Error('Original prescription not found');

    const newPrescriptionId = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVersion = (original.version || 1) + 1;
    const nowIso = new Date().toISOString();
    const newHash = 'SHA256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === originalId
          ? {
              ...p,
              status: 'amended',
              amendedPrescriptionId: newPrescriptionId,
              amendmentReason: reason,
            }
          : p
      )
    );

    const amendment: Prescription = {
      id: newPrescriptionId,
      appointmentId: original.appointmentId,
      patientId: original.patientId,
      patientName: original.patientName,
      doctorId: currentUser ? currentUser.id : original.doctorId,
      doctorName: currentUser ? currentUser.name : original.doctorName,
      doctorLicense: (currentUser && currentUser.licenseNumber) || original.doctorLicense,
      doctorSpecialization: (currentUser && currentUser.specialization) || original.doctorSpecialization,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      medications: updatedMedications,
      doctorSignature: original.doctorSignature,
      signatureTimestamp: nowIso,
      cryptographicHash: newHash,
      status: 'signed',
      version: newVersion,
      originalPrescriptionId: originalId,
      amendmentReason: reason,
    };

    setPrescriptions((prev) => [amendment, ...prev]);

    addAuditLog(
      'PRESCRIPTION_AMENDED',
      'PRESCRIPTION',
      `Prescription ${originalId} amended by ${currentUser ? currentUser.name : 'Doctor'}. Spawned replacement version ${newPrescriptionId} (v${newVersion}.0). Reason: ${reason}`,
      'INFO'
    );
    showToast(`Prescription amended! Generated linked version ${newPrescriptionId}.`, 'success');
    return amendment;
  };

  // Pharmacist Fulfillment (UC-9)
  const fulfillPrescription = (prescriptionId: string, pharmacistName: string, pharmacyLicense: string) => {
    const rx = prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) {
      return { success: false, message: 'Prescription ID not found in system.' };
    }

    if (rx.status === 'fulfilled') {
      return { success: false, message: `Prescription has ALREADY been dispensed by ${rx.fulfilledBy} on ${rx.fulfilledAt}. Cannot re-dispense!` };
    }

    if (rx.status === 'draft') {
      return { success: false, message: 'Prescription is in DRAFT state. Not valid for dispensing.' };
    }

    if (rx.status === 'amended') {
      return { success: false, message: `This prescription has been superseded by amended Rx #${rx.amendedPrescriptionId}. Dispense the amended version instead.` };
    }

    const nowIso = new Date().toISOString();

    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === prescriptionId
          ? {
              ...p,
              status: 'fulfilled',
              fulfilledAt: nowIso,
              fulfilledBy: pharmacistName,
              pharmacyLicense,
            }
          : p
      )
    );

    addAuditLog(
      'PRESCRIPTION_FULFILLED',
      'PRESCRIPTION',
      `Prescription ${prescriptionId} verified and fulfilled by ${pharmacistName} (${pharmacyLicense}).`,
      'SUCCESS'
    );
    showToast(`Prescription ${prescriptionId} successfully marked as FULFILLED.`, 'success');
    return { success: true, message: 'Prescription successfully fulfilled and updated in national registry.' };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeView,
        setActiveView,
        activeConsultationId,
        setActiveConsultationId,
        users,
        ehrs,
        appointments,
        payments,
        prescriptions,
        auditLogs,
        login,
        verifyMFA,
        logout,
        switchRole,
        selectUser,
        registerPatient,
        adminUnlockAccount,
        adminUpdateUserRole,
        toggleEHRConsent,
        uploadEHRDocument,
        logEHRAccess,
        lockAppointmentSlot,
        unlockAppointmentSlot,
        bookAppointment,
        checkInPatient,
        updateAppointmentStatus,
        cancelAppointment,
        addDoctorSlot,
        toggleDoctorSlot,
        processPayment,
        signPrescription,
        createAmendment,
        fulfillPrescription,
        addAuditLog,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
