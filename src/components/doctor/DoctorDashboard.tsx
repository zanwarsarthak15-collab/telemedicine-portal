import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { AppointmentSlot } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  User,
  Phone,
  FileText,
  Building,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    ehrs,
    updateAppointmentStatus,
    addDoctorSlot,
    toggleDoctorSlot,
    setActiveView,
    setActiveConsultationId,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'AVAILABILITY' | 'PATIENTS'>('SCHEDULE');

  // New slot form state
  const [newSlotDate, setNewSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSlotTime, setNewSlotTime] = useState('04:30 PM - 05:00 PM');
  const [newSlotFee, setNewSlotFee] = useState(currentUser?.consultationFee || 800);
  const [newSlotType, setNewSlotType] = useState<'Video Consultation' | 'In-Clinic Follow-up'>('In-Clinic Follow-up');

  // Cancel appointment modal state
  const [cancelModalSlot, setCancelModalSlot] = useState<AppointmentSlot | null>(null);
  const [cancelReason, setCancelReason] = useState('Doctor unavailable / Emergency surgery');

  if (!currentUser) return null;

  const mySlots = appointments.filter((s) => s.doctorId === currentUser.id);

  // Booked patient appointments
  const bookedAppointments = mySlots.filter(
    (s) => s.status === 'confirmed' || s.status === 'checked_in' || s.status === 'completed'
  );
  const waitingAppointments = mySlots.filter((s) => s.status === 'checked_in');
  const availableSlots = mySlots.filter((s) => s.status === 'available');

  const handleStartConsultation = (slot: AppointmentSlot) => {
    setActiveConsultationId(slot.meetingId || `meet-${slot.id}`);
    setActiveView('consultation');
    showToast('Connecting to encrypted WebRTC video consultation...', 'info');
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addDoctorSlot(currentUser.id, newSlotDate, newSlotTime, newSlotFee, newSlotType);
  };

  const handleConfirmCancel = () => {
    if (cancelModalSlot) {
      updateAppointmentStatus(cancelModalSlot.id, 'cancelled', cancelReason);
      setCancelModalSlot(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={currentUser.name} role="DOCTOR" size="xl" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-google-dark">{currentUser.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-google-green border border-emerald-300">
                  {currentUser.specialization || 'Attending Physician'}
                </span>
              </div>
              <p className="text-xs text-google-gray mt-0.5">
                {currentUser.qualifications} • Registration: <span className="font-mono font-semibold">{currentUser.licenseNumber}</span>
              </p>
              <p className="text-xs text-google-gray mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-google-gray" />
                <span>{currentUser.hospitalAffiliation || 'Apollo Hospital OPD'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-google-canvas px-4 py-3 rounded-2xl border border-google-border text-center min-w-[95px]">
              <span className="text-xl font-bold text-google-green block">{waitingAppointments.length}</span>
              <span className="text-[11px] text-google-gray font-medium">Waiting / Checked-In</span>
            </div>
            <div className="bg-google-canvas px-4 py-3 rounded-2xl border border-google-border text-center min-w-[95px]">
              <span className="text-xl font-bold text-google-blue block">{bookedAppointments.length}</span>
              <span className="text-[11px] text-google-gray font-medium">Total Booked</span>
            </div>
            <div className="bg-google-canvas px-4 py-3 rounded-2xl border border-google-border text-center min-w-[95px]">
              <span className="text-xl font-bold text-google-dark block">{availableSlots.length}</span>
              <span className="text-[11px] text-google-gray font-medium">Open Slots</span>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-t border-google-border mt-6 pt-4 flex-wrap">
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SCHEDULE'
                ? 'bg-google-blue text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Today&apos;s Appointments Queue ({bookedAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('AVAILABILITY')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'AVAILABILITY'
                ? 'bg-google-blue text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Manage Slot Availability ({availableSlots.length} Open)
          </button>
          <button
            onClick={() => setActiveTab('PATIENTS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PATIENTS'
                ? 'bg-google-blue text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Patient Records & Privacy Consents
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: TODAY'S APPOINTMENT QUEUE ======================= */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-6">
          {bookedAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-google-border">
              <Calendar className="w-12 h-12 text-google-gray mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-google-dark">No Patients Scheduled Right Now</h3>
              <p className="text-xs text-google-gray mt-1">
                Patients will appear here once booked online or checked in by the receptionist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookedAppointments.map((slot) => {
                const isCheckedIn = slot.status === 'checked_in';
                const isCompleted = slot.status === 'completed';
                const isConfirmed = slot.status === 'confirmed';

                return (
                  <div
                    key={slot.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                      isCheckedIn
                        ? 'border-emerald-400 bg-emerald-50/20 shadow-md ring-2 ring-emerald-200'
                        : 'border-google-border hover:shadow-google-card'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Patient Details */}
                      <div className="flex items-start gap-4">
                        <UserAvatar name={slot.patientName || 'Patient'} role="PATIENT" size="lg" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-google-dark">{slot.patientName}</h3>
                            {isCheckedIn && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-google-green border border-emerald-400 animate-pulse flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                CHECKED IN (WAITING IN CLINIC)
                              </span>
                            )}
                            {isConfirmed && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-google-blue border border-blue-200">
                                CONFIRMED APPOINTMENT
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-google-canvas text-google-gray border border-google-border">
                                COMPLETED
                              </span>
                            )}
                            <span className="text-xs text-google-gray font-mono">
                              Patient ID: {slot.patientId || 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-1.5 text-xs text-google-gray flex-wrap">
                            <span className="font-mono font-bold text-google-dark flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-google-gray" />
                              {slot.timeSlot} ({slot.date})
                            </span>
                            <span>•</span>
                            <span className="text-google-blue font-semibold">{slot.consultationType}</span>
                            {slot.patientPhone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {slot.patientPhone}
                                </span>
                              </>
                            )}
                          </div>

                          {slot.reason && (
                            <p className="text-xs text-google-dark mt-2 bg-google-canvas px-3 py-1.5 rounded-xl border border-google-border inline-block">
                              Reason: <span className="font-medium">{slot.reason}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Doctor Actions */}
                      <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                        {slot.consultationType === 'Video Consultation' && !isCompleted && (
                          <button
                            onClick={() => handleStartConsultation(slot)}
                            className="px-4 py-2.5 rounded-full bg-google-blue hover:bg-google-blue-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                          >
                            <Video className="w-4 h-4" />
                            <span>Start Video Call</span>
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => updateAppointmentStatus(slot.id, 'completed', 'Consultation finished')}
                            className="px-4 py-2 rounded-full bg-google-green hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => setCancelModalSlot(slot)}
                            className="px-3 py-2 rounded-full text-google-red hover:bg-rose-50 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: MANAGE AVAILABILITY ======================= */}
      {activeTab === 'AVAILABILITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Slot Form */}
          <div className="bg-white rounded-3xl p-6 shadow-google-card border border-google-border">
            <h3 className="text-base font-bold text-google-dark mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-google-blue" />
              Add Open Availability Slot
            </h3>
            <p className="text-xs text-google-gray mb-4">
              Add new slots so patients and receptionists can book consultations.
            </p>

            <form onSubmit={handleCreateSlot} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Time Slot</label>
                <input
                  type="text"
                  required
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  placeholder="e.g. 05:00 PM - 05:30 PM"
                  className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Consultation Mode</label>
                <select
                  value={newSlotType}
                  onChange={(e) => setNewSlotType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs outline-none"
                >
                  <option value="In-Clinic Follow-up">In-Clinic Follow-up</option>
                  <option value="Video Consultation">Video Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={newSlotFee}
                  onChange={(e) => setNewSlotFee(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-google-blue hover:bg-google-blue-hover text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Open Slot</span>
              </button>
            </form>
          </div>

          {/* List of Open Slots */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-google-card border border-google-border">
            <h3 className="text-base font-bold text-google-dark mb-1">
              Active Available Slots ({availableSlots.length})
            </h3>
            <p className="text-xs text-google-gray mb-4">
              Currently open slots visible to patients for booking.
            </p>

            {availableSlots.length === 0 ? (
              <p className="text-xs text-google-gray p-6 text-center bg-google-canvas rounded-2xl border border-google-border">
                No open slots configured. Add a new slot using the form on the left.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-2xl border border-google-border bg-google-canvas/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold font-mono text-google-dark block">{slot.timeSlot}</span>
                      <span className="text-[11px] text-google-gray block">{slot.date} • ₹{slot.fee}</span>
                      <span className="text-[10px] text-google-blue font-semibold">{slot.consultationType}</span>
                    </div>

                    <button
                      onClick={() => toggleDoctorSlot(slot.id)}
                      className="p-2 rounded-xl text-google-gray hover:text-google-red hover:bg-rose-50 transition-colors"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: PATIENT RECORDS & CONSENTS ======================= */}
      {activeTab === 'PATIENTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border">
          <h3 className="text-base font-bold text-google-dark mb-1">Patient Roster & EHR Privacy Permissions</h3>
          <p className="text-xs text-google-gray mb-6">
            Under HIPAA § 164.312, patient records are strictly accessible only when Doctor Access Consent is active.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookedAppointments.map((slot) => {
              const patientEhr = slot.patientId ? ehrs[slot.patientId] : null;
              const hasConsent = patientEhr?.consentGranted ?? true;

              return (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl border border-google-border bg-google-canvas/30 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar name={slot.patientName || 'Patient'} role="PATIENT" size="md" />
                    <div>
                      <h4 className="text-xs font-bold text-google-dark">{slot.patientName}</h4>
                      <p className="text-[11px] text-google-gray font-mono">ID: {slot.patientId}</p>
                      <p className="text-[11px] text-google-gray mt-1">
                        Blood Group: <strong>{patientEhr?.bloodGroup || 'Unknown'}</strong>
                      </p>
                      <p className="text-[11px] text-google-gray">
                        Documents in EHR: {patientEhr?.records.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasConsent ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-google-green border border-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        CONSENT ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-google-red border border-rose-300 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        ACCESS BLOCKED
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (hasConsent) {
                          setActiveView('records');
                        } else {
                          showToast(`Cannot inspect records: Patient ${slot.patientName} has restricted doctor access.`, 'warning');
                        }
                      }}
                      className="mt-3 text-xs font-bold text-google-blue hover:underline block"
                    >
                      {hasConsent ? 'Inspect EHR & Reports &rarr;' : 'Permission Blocked'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Cancel Appointment Dialog */}
      {cancelModalSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-google-3 border border-google-border">
            <h3 className="text-base font-bold text-google-dark mb-1">Cancel Patient Consultation</h3>
            <p className="text-xs text-google-gray mb-4">
              Cancel appointment for {cancelModalSlot.patientName} on {cancelModalSlot.date} at {cancelModalSlot.timeSlot}.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-google-dark mb-1.5">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none"
              >
                <option value="Doctor unavailable / Emergency surgery">Doctor unavailable / Emergency surgery</option>
                <option value="Medical leave / Clinic closed">Medical leave / Clinic closed</option>
                <option value="Rescheduling required">Rescheduling required</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setCancelModalSlot(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-google-gray hover:bg-google-surface"
              >
                Close
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-full bg-google-red text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
