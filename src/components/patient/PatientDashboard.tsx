import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';
import { UserAvatar } from '../common/UserAvatar';
import { BookAppointmentModal } from './BookAppointmentModal';
import { AppointmentSlot } from '../../types';
import {
  Calendar,
  FileText,
  Pill,
  Video,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Download,
  Stethoscope,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    ehrs,
    prescriptions,
    setActiveView,
    setActiveConsultationId,
    toggleEHRConsent,
    cancelAppointment,
    showToast,
  } = useApp();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<string | undefined>(undefined);
  const [cancelSlot, setCancelSlot] = useState<AppointmentSlot | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule / Unavoidable commitment');

  if (!currentUser) return null;

  const patientEHR = ehrs[currentUser.id] || {
    id: `ehr_${currentUser.id}`,
    patientId: currentUser.id,
    bloodGroup: 'B+',
    allergies: [],
    conditions: [],
    currentMedications: [],
    emergencyContact: { name: '', phone: '', relation: '' },
    records: [],
    consentGranted: true,
    accessLog: [],
  };

  // Patient appointments
  const myAppointments = appointments.filter((s) => s.patientId === currentUser.id);
  const upcomingAppointments = myAppointments.filter(
    (s) => s.status === 'confirmed' || s.status === 'checked_in' || s.status === 'pending'
  );
  const previousAppointments = myAppointments.filter(
    (s) => s.status === 'completed' || s.status === 'cancelled'
  );

  const nextVisit = upcomingAppointments[0];
  const myPrescriptions = prescriptions.filter((p) => p.patientId === currentUser.id);

  const handleStartConsultation = (slot: AppointmentSlot) => {
    setActiveConsultationId(slot.meetingId || `meet-${slot.id}`);
    setActiveView('consultation');
    showToast('Joining secure encrypted consultation room...', 'info');
  };

  const handleConfirmCancel = () => {
    if (cancelSlot) {
      cancelAppointment(cancelSlot.id, cancelReason);
      setCancelSlot(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* 1. Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={currentUser.name} role="PATIENT" size="xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-google-dark">Namaste, {currentUser.name}!</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-google-blue border border-blue-200">
                  Patient Health Hub
                </span>
              </div>
              <p className="text-xs text-google-gray mt-0.5">
                CareSync Healthcare Portal • Patient ID:{' '}
                <span className="font-mono font-semibold">{currentUser.id}</span> • Mobile:{' '}
                <span className="font-semibold text-google-dark">{currentUser.phone || '+91 98201 44520'}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-google-gray">
                  Blood Group: <strong>{patientEHR.bloodGroup}</strong>
                </span>
                <span>•</span>
                <span className="text-xs text-google-gray">
                  Records in Vault: <strong>{patientEHR.records.length} documents</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Prominent "Book Appointment" CTA + Privacy Switch */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                setSelectedDoctorForBooking(undefined);
                setIsBookModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-full bg-google-blue hover:bg-google-blue-hover text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-google transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            {/* Doctor Access Consent Toggle */}
            <div className="bg-google-canvas p-3 rounded-2xl border border-google-border flex items-center justify-between gap-3 min-w-[220px]">
              <div className="flex items-center gap-2">
                {patientEHR.consentGranted ? (
                  <ShieldCheck className="w-5 h-5 text-google-green" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-google-red" />
                )}
                <div>
                  <span className="text-[11px] font-bold text-google-dark block">
                    {patientEHR.consentGranted ? 'Doctor Access: Allowed' : 'Doctor Access: Blocked'}
                  </span>
                  <span className="text-[10px] text-google-gray">
                    {patientEHR.consentGranted ? 'Records visible to doctor' : 'Reports kept private'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleEHRConsent(currentUser.id)}
                className="text-[11px] font-bold text-google-blue hover:underline"
              >
                Toggle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fast Navigation & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Next Visit Card */}
        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-google-gray uppercase tracking-wider">Next Visit</span>
            <div className="w-9 h-9 rounded-2xl bg-google-blue-light text-google-blue flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            {nextVisit ? (
              <div>
                <span className="text-sm font-bold text-google-dark block truncate">{nextVisit.doctorName}</span>
                <span className="text-xs text-google-blue font-mono font-bold block mt-0.5">
                  {nextVisit.date} at {nextVisit.timeSlot}
                </span>
                <span className="text-[10px] text-google-gray block mt-0.5">{nextVisit.consultationType}</span>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold text-google-dark block">No Upcoming Visits</span>
                <span className="text-[11px] text-google-gray block mt-0.5">Ready to schedule an appointment</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedDoctorForBooking(undefined);
              setIsBookModalOpen(true);
            }}
            className="text-xs font-bold text-google-blue hover:underline flex items-center gap-1"
          >
            <span>Book New Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Digital Prescriptions Card */}
        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-google-gray uppercase tracking-wider">Prescriptions</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-google-green flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-google-dark block">{myPrescriptions.length}</span>
            <span className="text-xs text-google-gray mt-0.5 block">Signed by Certified Physicians</span>
          </div>
          <button
            onClick={() => setActiveView('records')}
            className="text-xs font-bold text-google-green hover:underline flex items-center gap-1"
          >
            <span>View All Rx</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* EHR Vault Card */}
        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-google-gray uppercase tracking-wider">Health Records</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-google-dark block">{patientEHR.records.length}</span>
            <span className="text-xs text-google-gray mt-0.5 block">Stored in HIPAA Vault</span>
          </div>
          <button
            onClick={() => setActiveView('records')}
            className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
          >
            <span>Upload or View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Instant Video Telehealth Card */}
        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-google-gray uppercase tracking-wider">Telehealth Status</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-google-red flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-xs font-bold text-google-dark block">Encrypted Video Call</span>
            <span className="text-[11px] text-google-green font-semibold flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-google-green animate-pulse" />
              WebRTC Room Ready
            </span>
          </div>
          <button
            onClick={() => {
              if (nextVisit) {
                handleStartConsultation(nextVisit);
              } else {
                setIsBookModalOpen(true);
              }
            }}
            className="text-xs font-bold text-google-blue hover:underline flex items-center gap-1"
          >
            <span>{nextVisit ? 'Join Scheduled Call' : 'Book a Video Slot'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Upcoming Appointments Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-google-blue" />
            <h2 className="text-lg font-bold text-google-dark">Upcoming Appointments ({upcomingAppointments.length})</h2>
          </div>
          <button
            onClick={() => {
              setSelectedDoctorForBooking(undefined);
              setIsBookModalOpen(true);
            }}
            className="text-xs font-bold text-google-blue hover:underline"
          >
            + Book Another Visit
          </button>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-8 text-center bg-google-canvas/60 rounded-2xl border border-google-border">
            <Calendar className="w-10 h-10 text-google-gray mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-google-dark">No Active Upcoming Appointments</p>
            <p className="text-xs text-google-gray mt-1 max-w-sm mx-auto">
              Schedule your consultation with top specialists in Cardiology, Neurology, General Medicine, and Dermatology.
            </p>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="mt-4 px-6 py-2.5 rounded-full bg-google-blue text-white text-xs font-bold shadow-xs hover:bg-google-blue-hover"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {upcomingAppointments.map((slot) => {
              const isCheckedIn = slot.status === 'checked_in';
              const isConfirmed = slot.status === 'confirmed';

              return (
                <div
                  key={slot.id}
                  className="p-5 rounded-2xl border border-google-border hover:border-google-blue/40 bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <UserAvatar name={slot.doctorName} role="DOCTOR" size="md" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-google-dark">{slot.doctorName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-google-blue border border-blue-200">
                          {slot.specialization}
                        </span>
                        {isCheckedIn && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-google-green border border-emerald-300">
                            CHECKED IN AT CLINIC
                          </span>
                        )}
                        {isConfirmed && !isCheckedIn && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-google-green border border-emerald-300">
                            CONFIRMED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-google-gray flex-wrap">
                        <span className="font-mono font-bold text-google-dark">
                          {slot.date} at {slot.timeSlot}
                        </span>
                        <span>•</span>
                        <span className="text-google-blue font-semibold">{slot.consultationType}</span>
                        <span>•</span>
                        <span>Fee: ₹{slot.fee}</span>
                      </div>

                      {slot.reason && (
                        <p className="text-xs text-google-gray mt-1.5 italic">
                          Reason: &quot;{slot.reason}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {slot.consultationType === 'Video Consultation' && (
                      <button
                        onClick={() => handleStartConsultation(slot)}
                        className="px-4 py-2 rounded-full bg-google-blue hover:bg-google-blue-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </button>
                    )}

                    <button
                      onClick={() => setCancelSlot(slot)}
                      className="px-3.5 py-2 rounded-full text-google-red hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      Cancel Visit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Previous Appointments History */}
      {previousAppointments.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="w-5 h-5 text-google-gray" />
            <h2 className="text-base font-bold text-google-dark">Past Appointments ({previousAppointments.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {previousAppointments.map((slot) => (
              <div
                key={slot.id}
                className="p-4 rounded-2xl border border-google-border bg-google-canvas/40 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-google-dark block">{slot.doctorName}</span>
                  <span className="text-[11px] text-google-gray block font-mono">
                    {slot.date} at {slot.timeSlot} • {slot.specialization}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      slot.status === 'completed'
                        ? 'bg-blue-50 text-google-blue border border-blue-200'
                        : 'bg-rose-50 text-google-red border border-rose-200'
                    }`}
                  >
                    {slot.status === 'completed' ? 'COMPLETED' : 'CANCELLED'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoctorForBooking(slot.doctorId);
                    setIsBookModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white border border-google-border text-xs font-bold text-google-blue hover:bg-google-blue hover:text-white transition-all shadow-xs"
                >
                  Book Again
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Cancel Appointment Modal */}
      {cancelSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-google-3 border border-google-border">
            <h3 className="text-base font-bold text-google-dark mb-1">Cancel Consultation</h3>
            <p className="text-xs text-google-gray mb-4">
              Are you sure you want to cancel your visit with {cancelSlot.doctorName} on {cancelSlot.date} at {cancelSlot.timeSlot}?
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-google-dark mb-1.5">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none"
              >
                <option value="Change of schedule / Unavoidable commitment">Change of schedule / Unavoidable commitment</option>
                <option value="Recovered / Consultation no longer needed">Recovered / Consultation no longer needed</option>
                <option value="Booked another doctor">Booked another doctor</option>
                <option value="Emergency rescheduling required">Emergency rescheduling required</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setCancelSlot(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-google-gray hover:bg-google-surface"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-full bg-google-red text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Practo-Style 10-Step Appointment Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        preselectedDoctorId={selectedDoctorForBooking}
      />
    </div>
  );
};
