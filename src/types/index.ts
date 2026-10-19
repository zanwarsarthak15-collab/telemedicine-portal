export type UserRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN' | 'PHARMACIST';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  mfaEnabled: boolean;
  failedAttempts: number;
  lockedUntil?: number | null; // Timestamp in ms
  specialization?: string;
  qualifications?: string;
  experienceYears?: number;
  rating?: number;
  hospitalAffiliation?: string;
  consultationFee?: number;
  licenseNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive?: boolean;
}

export interface EHRDocument {
  id: string;
  title: string;
  type: 'Lab Report' | 'Imaging / X-Ray' | 'Prescription' | 'Clinical Summary' | 'Vaccination';
  date: string;
  doctorName: string;
  fileSize: string;
  fileUrl: string;
  notes: string;
}

export interface EHRAccessLogEntry {
  id: string;
  doctorId: string;
  doctorName: string;
  timestamp: string;
  purpose: string;
  action: 'READ' | 'DOWNLOAD' | 'AMEND';
}

export interface PatientEHR {
  id: string;
  patientId: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  records: EHRDocument[];
  consentGranted: boolean; // Granular Doctor Access Consent Switch
  accessLog: EHRAccessLogEntry[];
}

export type AppointmentStatus = 'available' | 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  date: string;
  timeSlot: string;
  fee: number;
  status: AppointmentStatus;
  pendingExpiresAt?: number;
  consultationType: 'Video Consultation' | 'In-Clinic Follow-up';
  reason?: string;
  meetingId?: string;
  checkedInAt?: string;
  bookedBy?: string;
}

export interface PaymentTransaction {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  amount: number;
  status: 'initiated' | 'completed' | 'failed' | 'refunded';
  receiptNumber: string;
  transactionDate: string;
  paymentMethod: 'Google Pay' | 'Card (TLS 1.3)' | 'UPI Instant';
  cardLast4?: string;
  upiId?: string;
  failureReason?: string;
}

export interface ConsultationSession {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'ended';
  latencyMs: number;
  networkQuality: 'excellent' | 'good' | 'poor';
  doctorNotes?: string;
}

export interface PrescriptionMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export type PrescriptionStatus = 'draft' | 'signed' | 'fulfilled' | 'amended';

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorLicense: string;
  doctorSpecialization: string;
  date: string;
  diagnosis: string;
  medications: PrescriptionMedication[];
  doctorSignature?: string;
  signatureTimestamp?: string;
  cryptographicHash?: string;
  status: PrescriptionStatus;
  originalPrescriptionId?: string;
  amendedPrescriptionId?: string;
  amendmentReason?: string;
  version: number;
  fulfilledAt?: string;
  fulfilledBy?: string;
  pharmacyLicense?: string;
}

export type AuditCategory = 'AUTH' | 'EHR_ACCESS' | 'PAYMENT' | 'CONSULTATION' | 'PRESCRIPTION' | 'ADMIN' | 'RECEPTION';
export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: UserRole | 'SYSTEM';
  action: string;
  category: AuditCategory;
  details: string;
  status: AuditStatus;
  ipAddress: string;
}
