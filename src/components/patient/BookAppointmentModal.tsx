import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAccount, AppointmentSlot } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  Calendar,
  Clock,
  Stethoscope,
  Video,
  CheckCircle2,
  X,
  Search,
  Star,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctorId,
}) => {
  const { currentUser, users, appointments, bookAppointment, processPayment } = useApp();

  // Booking step: 1 = Specialty/Search & Doctor List, 2 = Slot & Date, 3 = Reason & Mode, 4 = Review & Confirm, 5 = Confirmation Success
  const [step, setStep] = useState<number>(1);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');

  // Selected State
  const [selectedDoctor, setSelectedDoctor] = useState<UserAccount | null>(() => {
    if (preselectedDoctorId) {
      return users.find((u) => u.id === preselectedDoctorId) || null;
    }
    return null;
  });
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [visitReason, setVisitReason] = useState('Routine checkup & consultation');
  const [consultationType, setConsultationType] = useState<'Video Consultation' | 'In-Clinic Follow-up'>('In-Clinic Follow-up');
  const [paymentOption, setPaymentOption] = useState<'pay_now' | 'pay_at_clinic'>('pay_at_clinic');

  // Confirmed Appointment Reference
  const [confirmedBooking, setConfirmedBooking] = useState<{
    slotId: string;
    doctorName: string;
    date: string;
    time: string;
    type: string;
    fee: number;
  } | null>(null);

  if (!isOpen) return null;

  const doctors = users.filter((u) => u.role === 'DOCTOR');

  const specialties = [
    { label: 'All Specialties', value: 'ALL' },
    { label: 'General Physician', value: 'General Physician' },
    { label: 'Cardiology', value: 'Cardiology' },
    { label: 'Neurology', value: 'Neurology' },
    { label: 'Dermatology', value: 'Dermatology' },
  ];

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.hospitalAffiliation && doc.hospitalAffiliation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === 'ALL' ||
      (doc.specialization && doc.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    return matchesSearch && matchesSpecialty;
  });

  // Available slots for selected doctor
  const availableDoctorSlots = selectedDoctor
    ? appointments.filter((s) => s.doctorId === selectedDoctor.id && s.status === 'available')
    : [];

  const handleSelectDoctor = (doc: UserAccount) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSelectSlot = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleConfirm = () => {
    if (!selectedSlot || !selectedDoctor || !currentUser) return;

    // Direct booking in system
    const res = bookAppointment(
      selectedSlot.id,
      currentUser.id,
      currentUser.name,
      visitReason,
      consultationType,
      currentUser.name,
      currentUser.phone,
      32,
      currentUser.gender
    );

    if (res.success) {
      if (paymentOption === 'pay_now') {
        processPayment(selectedSlot.id, 'Google Pay', { upiId: `${currentUser.email.split('@')[0]}@okaxis` });
      }

      setConfirmedBooking({
        slotId: selectedSlot.id,
        doctorName: selectedDoctor.name,
        date: selectedSlot.date,
        time: selectedSlot.timeSlot,
        type: consultationType,
        fee: selectedSlot.fee,
      });
      setStep(5); // Confirmation screen
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-google-3 border border-google-border overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-google-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-google-blue-light text-google-blue flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-google-dark">Book Doctor Consultation</h2>
              <p className="text-xs text-google-gray">Practo-Easy Appointment Flow (Steps 1–10)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-google-surface text-google-gray transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="bg-google-canvas/60 px-6 py-2.5 border-b border-google-border flex items-center justify-between text-[11px] font-bold text-google-gray">
          <span className={step >= 1 ? 'text-google-blue' : ''}>1. Choose Doctor</span>
          <span>&rarr;</span>
          <span className={step >= 2 ? 'text-google-blue' : ''}>2. Select Date & Slot</span>
          <span>&rarr;</span>
          <span className={step >= 3 ? 'text-google-blue' : ''}>3. Visit Details</span>
          <span>&rarr;</span>
          <span className={step >= 4 ? 'text-google-blue' : ''}>4. Review</span>
          <span>&rarr;</span>
          <span className={step >= 5 ? 'text-google-green' : ''}>5. Confirmed</span>
        </div>

        {/* Main Step Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ===================== STEP 1: DOCTOR SEARCH & SELECTION ===================== */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Search & Specialty Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-google-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search doctor by name, specialty, or hospital (e.g., Rajesh, Apollo, Cardiology)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-google-canvas border border-google-border rounded-full text-xs outline-none focus:border-google-blue focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {specialties.map((spec) => (
                    <button
                      key={spec.value}
                      onClick={() => setSelectedSpecialty(spec.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        selectedSpecialty === spec.value
                          ? 'bg-google-blue text-white shadow-xs'
                          : 'bg-google-canvas text-google-gray hover:bg-google-surface hover:text-google-dark'
                      }`}
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor Profiles List */}
              <div className="grid grid-cols-1 gap-3.5">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc)}
                    className="p-4 rounded-2xl border border-google-border hover:border-google-blue hover:shadow-google-card bg-white cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <UserAvatar name={doc.name} role="DOCTOR" size="lg" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-google-dark group-hover:text-google-blue transition-colors">
                            {doc.name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-google-green border border-emerald-300">
                            {doc.specialization}
                          </span>
                        </div>

                        <p className="text-xs text-google-gray flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-google-gray" />
                          <span>{doc.qualifications}</span>
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-google-gray flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {doc.rating || 4.9} ({doc.experienceYears || 15}+ yrs exp)
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-google-gray" />
                            {doc.hospitalAffiliation}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-google-border">
                      <span className="text-base font-bold text-google-dark">
                        ₹{doc.consultationFee || 600}
                        <span className="text-[10px] font-normal text-google-gray block text-right">
                          consultation fee
                        </span>
                      </span>
                      <button className="mt-1.5 px-4 py-1.5 rounded-full bg-google-blue text-white text-xs font-bold shadow-xs group-hover:bg-google-blue-hover transition-colors">
                        Select Doctor &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== STEP 2: SELECT DATE & TIME SLOT ===================== */}
          {step === 2 && selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedDoctor.name} role="DOCTOR" size="md" />
                  <div>
                    <h3 className="text-sm font-bold text-google-dark">{selectedDoctor.name}</h3>
                    <p className="text-xs text-google-gray">
                      {selectedDoctor.specialization} • Fee: ₹{selectedDoctor.consultationFee}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-google-blue hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Doctor
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-google-dark uppercase tracking-wider mb-3">
                  Select Available Appointment Slot
                </h4>
                {availableDoctorSlots.length === 0 ? (
                  <div className="p-8 text-center bg-google-canvas rounded-2xl border border-google-border">
                    <Clock className="w-10 h-10 text-google-gray mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-google-dark">No Available Slots for Today</p>
                    <p className="text-xs text-google-gray mt-1">
                      Dr. {selectedDoctor.name.split(' ')[1]} has no open slots currently. Please pick another doctor or date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availableDoctorSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'bg-google-blue text-white border-google-blue ring-2 ring-google-blue/20 shadow-xs'
                            : 'bg-white text-google-dark border-google-border hover:border-google-blue hover:bg-blue-50/30'
                        }`}
                      >
                        <span className="block text-sm font-bold font-mono">{slot.timeSlot}</span>
                        <span className="text-[11px] block opacity-80 mt-0.5">{slot.date}</span>
                        <span className="text-[10px] block font-bold text-google-green mt-1">Available</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== STEP 3: REASON & MODE ===================== */}
          {step === 3 && selectedDoctor && selectedSlot && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-google-canvas p-3.5 rounded-2xl border border-google-border text-xs">
                <div>
                  <span className="font-bold text-google-dark">{selectedDoctor.name}</span>
                  <span className="text-google-gray"> • {selectedSlot.date} at {selectedSlot.timeSlot}</span>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-google-blue font-bold hover:underline"
                >
                  Change Slot
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-google-dark mb-1.5">
                  Reason for Visit / Symptoms
                </label>
                <textarea
                  rows={3}
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder="Describe your health concern or symptoms (e.g. routine checkup, headache, hypertension follow-up)..."
                  className="w-full p-3.5 bg-google-canvas border border-google-border rounded-2xl text-xs sm:text-sm outline-none focus:border-google-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-google-dark mb-1.5">Consultation Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('In-Clinic Follow-up')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      consultationType === 'In-Clinic Follow-up'
                        ? 'bg-blue-50 border-google-blue text-google-blue ring-2 ring-google-blue/20'
                        : 'bg-white border-google-border text-google-dark'
                    }`}
                  >
                    <Building className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">In-Clinic Visit (OPD)</span>
                      <span className="text-[11px] text-google-gray">
                        Meet the doctor at hospital OPD clinic desk
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('Video Consultation')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      consultationType === 'Video Consultation'
                        ? 'bg-blue-50 border-google-blue text-google-blue ring-2 ring-google-blue/20'
                        : 'bg-white border-google-border text-google-dark'
                    }`}
                  >
                    <Video className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">Telehealth Video Call</span>
                      <span className="text-[11px] text-google-gray">
                        Join encrypted remote video consultation from home
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-bold text-google-gray hover:text-google-dark"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-full bg-google-blue hover:bg-google-blue-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>Review Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 4: REVIEW & CONFIRM ===================== */}
          {step === 4 && selectedDoctor && selectedSlot && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-google-border p-5 space-y-4">
                <h4 className="text-xs font-bold text-google-dark uppercase tracking-wider">
                  Review Appointment Summary
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-google-gray block">Attending Doctor</span>
                    <span className="font-bold text-google-dark text-sm">{selectedDoctor.name}</span>
                    <span className="text-google-gray block">{selectedDoctor.specialization}</span>
                  </div>
                  <div>
                    <span className="text-google-gray block">Date & Time</span>
                    <span className="font-bold text-google-dark text-sm font-mono">
                      {selectedSlot.date} at {selectedSlot.timeSlot}
                    </span>
                    <span className="text-google-blue font-semibold block">{consultationType}</span>
                  </div>
                </div>

                <div className="border-t border-google-border pt-3">
                  <span className="text-google-gray block text-xs">Patient Name</span>
                  <span className="font-bold text-google-dark text-xs">{currentUser?.name}</span>
                </div>

                <div>
                  <span className="text-google-gray block text-xs">Reason for Visit</span>
                  <p className="text-xs text-google-dark italic">&quot;{visitReason}&quot;</p>
                </div>

                <div className="border-t border-google-border pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-google-dark">Consultation Fee</span>
                  <span className="text-base font-bold text-google-dark">₹{selectedSlot.fee}</span>
                </div>
              </div>

              {/* Payment choice */}
              <div>
                <label className="block text-xs font-bold text-google-dark mb-2">Payment Preference</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('pay_at_clinic')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold ${
                      paymentOption === 'pay_at_clinic'
                        ? 'border-google-blue bg-blue-50 text-google-blue'
                        : 'border-google-border bg-white text-google-gray'
                    }`}
                  >
                    Pay at Clinic / OPD Desk
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('pay_now')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold ${
                      paymentOption === 'pay_now'
                        ? 'border-google-blue bg-blue-50 text-google-blue'
                        : 'border-google-border bg-white text-google-gray'
                    }`}
                  >
                    Pay Now via UPI / GPay
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-bold text-google-gray hover:text-google-dark"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-3 rounded-full bg-google-green hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Appointment</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 5: CONFIRMATION SCREEN ===================== */}
          {step === 5 && confirmedBooking && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-google-green flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-bold text-google-dark">Appointment Confirmed!</h3>
              <p className="text-xs text-google-gray max-w-md mx-auto">
                Your consultation has been successfully scheduled and added to the hospital system.
              </p>

              <div className="bg-google-canvas p-5 rounded-2xl border border-google-border max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-google-gray">Booking Reference:</span>
                  <span className="font-mono font-bold text-google-dark">{confirmedBooking.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-google-gray">Doctor:</span>
                  <span className="font-bold text-google-dark">{confirmedBooking.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-google-gray">Date & Time:</span>
                  <span className="font-bold text-google-dark">
                    {confirmedBooking.date} at {confirmedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-google-gray">Consultation Mode:</span>
                  <span className="font-bold text-google-blue">{confirmedBooking.type}</span>
                </div>
                <div className="flex justify-between border-t border-google-border pt-2">
                  <span className="text-google-gray">Consultation Fee:</span>
                  <span className="font-bold text-google-dark">₹{confirmedBooking.fee}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 rounded-full bg-google-blue text-white text-xs font-bold hover:bg-google-blue-hover shadow-sm"
                >
                  View My Appointments & Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
