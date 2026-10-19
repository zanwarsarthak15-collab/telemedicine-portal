import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppointmentSlot } from '../../types';
import { GooglePayModal } from './GooglePayModal';
import { UserAvatar } from '../common/UserAvatar';
import {
  Calendar,
  Search,
  Clock,
  Video,
  RotateCcw,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const PatientAppointmentsView: React.FC = () => {
  const {
    currentUser,
    appointments,
    lockAppointmentSlot,
    cancelAppointment,
    setActiveView,
    setActiveConsultationId,
  } = useApp();

  if (!currentUser) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedSlotForPayment, setSelectedSlotForPayment] = useState<AppointmentSlot | null>(null);
  const [cancelModalSlot, setCancelModalSlot] = useState<AppointmentSlot | null>(null);
  const [cancelReason, setCancelReason] = useState('Schedule conflict / Doctor unavailable');

  // Filter slots
  const filteredSlots = appointments.filter((slot) => {
    const matchesSearch =
      slot.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'ALL' || slot.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  // Patient's own active appointments
  const myAppointments = appointments.filter(
    (slot) => slot.patientId === currentUser.id && (slot.status === 'confirmed' || slot.status === 'pending')
  );

  const handleSlotClick = (slot: AppointmentSlot) => {
    if (slot.status === 'available') {
      const locked = lockAppointmentSlot(slot.id, currentUser.id, currentUser.name);
      if (locked) {
        setSelectedSlotForPayment(slot);
      }
    } else if (slot.status === 'pending' && slot.patientId === currentUser.id) {
      setSelectedSlotForPayment(slot);
    }
  };

  const handleConfirmCancel = () => {
    if (cancelModalSlot) {
      cancelAppointment(cancelModalSlot.id, cancelReason);
      setCancelModalSlot(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-google-blue-light text-google-blue flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-google-dark">Book Doctor Consultation</h1>
              <p className="text-xs text-google-gray mt-1">
                Choose an open appointment slot. When selected, the slot is held for 5 minutes while you confirm.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Chips Bar */}
        <div className="mt-6 pt-6 border-t border-google-border flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-google-gray absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name or specialty (e.g. Rajesh, Cardiology)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-google-canvas border border-google-border rounded-full text-xs outline-none focus:border-google-blue focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'Cardiology', 'Neurology'].map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedSpecialty === spec
                    ? 'bg-google-blue text-white border-google-blue shadow-xs'
                    : 'bg-white text-google-gray border-google-border hover:bg-google-surface hover:text-google-dark'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Consultations for Patient */}
      {myAppointments.length > 0 && (
        <div className="mb-10">
          <h2 className="text-base font-bold text-google-dark mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-google-blue" />
            My Booked Consultations ({myAppointments.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAppointments.map((slot) => {
              const isPending = slot.status === 'pending';
              const remainingSecs = slot.pendingExpiresAt
                ? Math.max(0, Math.floor((slot.pendingExpiresAt - Date.now()) / 1000))
                : 0;

              return (
                <div
                  key={slot.id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-google-card ${
                    isPending ? 'border-amber-400 bg-amber-50/20' : 'border-google-border'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isPending ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-google-green border border-emerald-300'
                        }`}
                      >
                        {isPending ? '⚠️ PENDING PAYMENT (LOCKED)' : '✓ CONFIRMED VISIT'}
                      </span>
                      <span className="text-xs text-google-gray font-mono font-bold">₹{slot.fee}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserAvatar name={slot.doctorName} role="DOCTOR" size="md" />
                      <div>
                        <h3 className="font-bold text-base text-google-dark">{slot.doctorName}</h3>
                        <p className="text-xs text-google-gray">{slot.specialization}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-google-canvas rounded-2xl border border-google-border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-google-gray font-medium">Session Date:</span>
                        <span className="font-bold text-google-dark">{slot.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-google-gray font-medium">Time Slot:</span>
                        <span className="font-bold text-google-dark">{slot.timeSlot}</span>
                      </div>
                      {isPending && remainingSecs > 0 && (
                        <div className="flex justify-between text-amber-800 font-bold pt-1 border-t border-google-border">
                          <span>Hold Expires In:</span>
                          <span>
                            {Math.floor(remainingSecs / 60)}m {remainingSecs % 60}s
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-google-border flex items-center justify-between gap-3">
                    <button
                      onClick={() => setCancelModalSlot(slot)}
                      className="text-xs font-bold text-google-red hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Cancel & Refund
                    </button>

                    {isPending ? (
                      <button
                        onClick={() => setSelectedSlotForPayment(slot)}
                        className="px-4 py-2 bg-google-blue hover:bg-google-blue-hover text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5"
                      >
                        Complete Payment
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveConsultationId(slot.meetingId || `meet-${slot.id}`);
                          setActiveView('consultation');
                        }}
                        className="px-4 py-2 bg-google-green hover:bg-google-green-hover text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Video Call
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open Availability Matrix */}
      <div>
        <h2 className="text-base font-bold text-google-dark mb-4">
          Available Doctor Slots
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => {
            const isAvailable = slot.status === 'available';
            const isPending = slot.status === 'pending';
            const isMyPending = isPending && slot.patientId === currentUser.id;

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isAvailable
                    ? 'border-google-border hover:border-google-blue/50 hover:shadow-google-2'
                    : isPending
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-google-border bg-google-canvas opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-google-gray font-mono">{slot.date}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-50 text-google-green border border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-google-surface text-google-gray'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserAvatar name={slot.doctorName} role="DOCTOR" size="md" />
                    <div>
                      <h3 className="font-bold text-sm text-google-dark">{slot.doctorName}</h3>
                      <p className="text-xs text-google-gray">{slot.specialization}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-google-canvas rounded-2xl border border-google-border text-xs flex justify-between items-center">
                    <span className="font-medium text-google-gray flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-google-blue" />
                      {slot.timeSlot}
                    </span>
                    <span className="font-bold text-sm text-google-dark">₹{slot.fee}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-google-border">
                  {isAvailable ? (
                    <button
                      onClick={() => handleSlotClick(slot)}
                      className="w-full py-2.5 bg-google-blue hover:bg-google-blue-hover text-white text-xs font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Hold & Book (5m Reservation)
                    </button>
                  ) : isMyPending ? (
                    <button
                      onClick={() => setSelectedSlotForPayment(slot)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      Pay Now (₹{slot.fee})
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 bg-google-surface text-google-gray text-xs font-medium rounded-full cursor-not-allowed"
                    >
                      {slot.status === 'confirmed' ? 'Reserved' : 'Locked in Checkout'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Pay / UPI Modal */}
      <GooglePayModal
        isOpen={!!selectedSlotForPayment}
        slot={selectedSlotForPayment}
        onClose={() => setSelectedSlotForPayment(null)}
        onSuccess={() => {
          setSelectedSlotForPayment(null);
        }}
      />

      {/* Cancellation Modal */}
      {cancelModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-google-3 border border-google-border max-w-md w-full p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-google-red-light text-google-red flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-google-dark">Cancel Visit & Refund</h3>
            <p className="text-xs text-google-gray mt-1">
              Cancellation triggers an immediate, full refund back to your payment account.
            </p>

            <div className="my-4 p-3 bg-google-canvas rounded-2xl border border-google-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-google-gray">Doctor:</span>
                <span className="font-semibold text-google-dark">{cancelModalSlot.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-google-gray">Slot Time:</span>
                <span className="font-semibold text-google-dark">
                  {cancelModalSlot.date} ({cancelModalSlot.timeSlot})
                </span>
              </div>
              <div className="flex justify-between text-google-green font-bold pt-1 border-t border-google-border">
                <span>Refund Amount:</span>
                <span>₹{cancelModalSlot.fee}.00</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-google-gray mb-1">Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs font-medium outline-none"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Condition resolved">Condition resolved</option>
                <option value="Booking error">Booking error</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCancelModalSlot(null)}
                className="flex-1 py-2.5 border border-google-border text-google-gray text-xs font-bold rounded-full"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-google-red text-white text-xs font-bold rounded-full shadow-sm"
              >
                Confirm & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
