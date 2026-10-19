import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppointmentSlot, UserAccount } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  ClipboardList,
  Search,
  UserCheck,
  UserPlus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Phone,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    users,
    checkInPatient,
    bookAppointment,
    updateAppointmentStatus,
    registerPatient,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'WALKIN' | 'BOOK_PATIENT' | 'DIRECTORY'>('SCHEDULE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('ALL');

  // Walk-in Registration form state
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinGender, setWalkinGender] = useState('Male');
  const [walkinDob, setWalkinDob] = useState('1992-06-15');
  const [walkinBloodGroup, setWalkinBloodGroup] = useState('B+');

  // Book on behalf form state
  const [bookPatientId, setBookPatientId] = useState('');
  const [bookDoctorId, setBookDoctorId] = useState('');
  const [bookSlotId, setBookSlotId] = useState('');
  const [bookReason, setBookReason] = useState('Routine consultation / Follow-up');
  const [bookType, setBookType] = useState<'Video Consultation' | 'In-Clinic Follow-up'>('In-Clinic Follow-up');

  // Doctors & Patients lists
  const doctors = users.filter((u) => u.role === 'DOCTOR');
  const patients = users.filter((u) => u.role === 'PATIENT');

  // Today's appointments
  const todayDate = new Date().toISOString().split('T')[0];
  const allActiveAppointments = appointments.filter(
    (s) => s.status === 'confirmed' || s.status === 'checked_in' || s.status === 'completed'
  );

  // Filtered appointments
  const filteredAppointments = allActiveAppointments.filter((slot) => {
    const matchesSearch =
      (slot.patientName && slot.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (slot.patientPhone && slot.patientPhone.includes(searchQuery)) ||
      (slot.patientId && slot.patientId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      slot.doctorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDoctor = selectedDoctorFilter === 'ALL' || slot.doctorId === selectedDoctorFilter;

    return matchesSearch && matchesDoctor;
  });

  // Available slots for booking on behalf
  const availableSlotsForDoctor = appointments.filter(
    (s) => s.doctorId === bookDoctorId && s.status === 'available'
  );

  // Counts
  const checkedInCount = allActiveAppointments.filter((s) => s.status === 'checked_in').length;
  const confirmedCount = allActiveAppointments.filter((s) => s.status === 'confirmed').length;
  const completedCount = allActiveAppointments.filter((s) => s.status === 'completed').length;

  const handleRegisterWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) {
      showToast('Please enter patient name and mobile number.', 'warning');
      return;
    }

    const email = walkinEmail.trim() || `walkin.${Date.now()}@care.in`;
    const res = registerPatient({
      name: walkinName,
      email,
      phone: walkinPhone,
      gender: walkinGender,
      dob: walkinDob,
      bloodGroup: walkinBloodGroup,
    });

    if (res.success && res.user) {
      showToast(`Walk-in patient ${res.user.name} registered successfully.`, 'success');
      setBookPatientId(res.user.id);
      setActiveTab('BOOK_PATIENT');
      setWalkinName('');
      setWalkinPhone('');
      setWalkinEmail('');
    }
  };

  const handleBookOnBehalf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPatientId || !bookSlotId) {
      showToast('Please select both a patient and an open appointment slot.', 'warning');
      return;
    }

    const patient = patients.find((p) => p.id === bookPatientId);
    if (!patient) return;

    const res = bookAppointment(
      bookSlotId,
      patient.id,
      patient.name,
      bookReason,
      bookType,
      `Reception Desk (${currentUser ? currentUser.name : 'Pooja Sharma'})`,
      patient.phone,
      30,
      patient.gender
    );

    if (res.success) {
      setActiveTab('SCHEDULE');
      setBookSlotId('');
      setBookReason('Routine consultation / Follow-up');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={currentUser?.name || 'Pooja Sharma'} role="RECEPTIONIST" size="xl" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-google-dark">
                  {currentUser?.name || 'Pooja Sharma'}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Front Desk OPD Reception
                </span>
              </div>
              <p className="text-xs text-google-gray mt-0.5">
                CareSync Central Clinic • Staff ID: <span className="font-mono font-semibold">{currentUser?.id || 'usr_rec_1'}</span>
              </p>
              <p className="text-xs text-google-gray mt-1">
                Manage daily patient arrivals, OPD check-ins, and schedule walk-in appointments.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-google-canvas px-4 py-3 rounded-2xl border border-google-border text-center min-w-[95px]">
              <span className="text-xl font-bold text-google-blue block">{allActiveAppointments.length}</span>
              <span className="text-[11px] text-google-gray font-medium">Total Today</span>
            </div>
            <div className="bg-google-canvas px-4 py-3 rounded-2xl border border-google-border text-center min-w-[95px]">
              <span className="text-xl font-bold text-google-green block">{checkedInCount}</span>
              <span className="text-[11px] text-google-gray font-medium">Checked-In</span>
            </div>
            <div className="bg-google-canvas px-4 py-3 rounded-2xl border border-google-border text-center min-w-[95px]">
              <span className="text-xl font-bold text-amber-600 block">{confirmedCount}</span>
              <span className="text-[11px] text-google-gray font-medium">Awaiting</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-google-border mt-6 pt-4 flex-wrap">
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SCHEDULE'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Today&apos;s OPD Schedule & Check-In ({allActiveAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('WALKIN')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'WALKIN'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Walk-in Patient
          </button>
          <button
            onClick={() => setActiveTab('BOOK_PATIENT')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'BOOK_PATIENT'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Book on Behalf of Patient
          </button>
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'DIRECTORY'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Patient Directory ({patients.length})
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: TODAY'S OPD SCHEDULE & CHECK-IN ======================= */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-google-card border border-google-border flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-google-gray absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name, mobile number (+91), or Patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-google-canvas border border-google-border rounded-full text-xs outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-google-gray flex-shrink-0" />
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="px-4 py-2.5 bg-google-canvas border border-google-border rounded-full text-xs outline-none text-google-dark font-medium"
              >
                <option value="ALL">All Attending Doctors</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Appointments Table / Cards */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-google-border">
              <Clock className="w-12 h-12 text-google-gray mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-google-dark">No Matching Appointments Found</h3>
              <p className="text-xs text-google-gray mt-1">
                There are no scheduled visits matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAppointments.map((slot) => {
                const isCheckedIn = slot.status === 'checked_in';
                const isCompleted = slot.status === 'completed';

                return (
                  <div
                    key={slot.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                      isCheckedIn
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-sm'
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
                            {isCheckedIn ? (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-google-green border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                CHECKED IN
                              </span>
                            ) : isCompleted ? (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-google-blue border border-blue-200">
                                COMPLETED
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                                CONFIRMED (AWAITING ARRIVAL)
                              </span>
                            )}
                            <span className="text-xs text-google-gray font-mono">
                              ID: {slot.patientId || 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-1.5 text-xs text-google-gray flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-google-dark">
                              <Stethoscope className="w-3.5 h-3.5 text-google-blue" />
                              {slot.doctorName} ({slot.specialization})
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono font-bold text-google-dark">
                              <Clock className="w-3.5 h-3.5 text-google-gray" />
                              {slot.timeSlot} ({slot.date})
                            </span>
                            {slot.patientPhone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-google-gray" />
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

                          {slot.checkedInAt && (
                            <p className="text-[11px] text-google-green font-semibold mt-1">
                              Arrived at clinic: {new Date(slot.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Front-Desk Actions */}
                      <div className="flex items-center gap-2.5 self-end lg:self-center">
                        {!isCheckedIn && !isCompleted && (
                          <button
                            onClick={() => checkInPatient(slot.id)}
                            className="px-5 py-2.5 rounded-full bg-google-green hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Mark Patient Checked-In</span>
                          </button>
                        )}

                        {isCheckedIn && (
                          <button
                            onClick={() => updateAppointmentStatus(slot.id, 'completed', 'Consultation finished')}
                            className="px-4 py-2 rounded-full bg-google-canvas hover:bg-google-surface text-google-dark border border-google-border text-xs font-bold transition-all"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button
                          onClick={() => updateAppointmentStatus(slot.id, 'cancelled', 'Cancelled at front desk')}
                          className="px-3.5 py-2 rounded-full text-google-red hover:bg-rose-50 text-xs font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: REGISTER WALK-IN PATIENT ======================= */}
      {activeTab === 'WALKIN' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-google-card border border-google-border max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-google-dark">Register Walk-in Patient</h2>
              <p className="text-xs text-google-gray">Create account instantly for on-the-spot clinic visits.</p>
            </div>
          </div>

          <form onSubmit={handleRegisterWalkin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-google-dark mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                placeholder="e.g. Ramesh Chandra, Deepa Nair"
                className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Mobile Phone (+91) *</label>
                <input
                  type="tel"
                  required
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="e.g. +91 98112 00000"
                  className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={walkinEmail}
                  onChange={(e) => setWalkinEmail(e.target.value)}
                  placeholder="e.g. ramesh@gmail.com"
                  className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={walkinDob}
                  onChange={(e) => setWalkinDob(e.target.value)}
                  className="w-full px-3 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Gender</label>
                <select
                  value={walkinGender}
                  onChange={(e) => setWalkinGender(e.target.value)}
                  className="w-full px-3 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">Blood Group</label>
                <select
                  value={walkinBloodGroup}
                  onChange={(e) => setWalkinBloodGroup(e.target.value)}
                  className="w-full px-3 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white"
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

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Register Patient & Proceed to Slot Booking</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================= TAB 3: BOOK ON BEHALF OF PATIENT ======================= */}
      {activeTab === 'BOOK_PATIENT' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-google-card border border-google-border max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-google-dark">Front-Desk Appointment Booking</h2>
              <p className="text-xs text-google-gray">Schedule an appointment on behalf of any registered patient.</p>
            </div>
          </div>

          <form onSubmit={handleBookOnBehalf} className="space-y-4">
            {/* Select Patient */}
            <div>
              <label className="block text-xs font-bold text-google-dark mb-1">1. Select Patient *</label>
              <select
                required
                value={bookPatientId}
                onChange={(e) => setBookPatientId(e.target.value)}
                className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white font-medium"
              >
                <option value="">-- Choose a registered patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone || p.email}) [ID: {p.id}]
                  </option>
                ))}
              </select>
            </div>

            {/* Select Doctor */}
            <div>
              <label className="block text-xs font-bold text-google-dark mb-1">2. Select Doctor *</label>
              <select
                required
                value={bookDoctorId}
                onChange={(e) => {
                  setBookDoctorId(e.target.value);
                  setBookSlotId('');
                }}
                className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white font-medium"
              >
                <option value="">-- Choose attending doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} • {d.specialization} (Fee: ₹{d.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Slot */}
            {bookDoctorId && (
              <div>
                <label className="block text-xs font-bold text-google-dark mb-1">3. Select Available Slot *</label>
                {availableSlotsForDoctor.length === 0 ? (
                  <p className="text-xs text-google-red p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                    No open availability slots currently found for this doctor.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlotsForDoctor.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setBookSlotId(s.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          bookSlotId === s.id
                            ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                            : 'bg-google-canvas text-google-dark border-google-border hover:border-purple-500'
                        }`}
                      >
                        <span className="block text-xs font-bold font-mono">{s.timeSlot}</span>
                        <span className="text-[10px] block opacity-80">{s.date}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-google-dark mb-1">4. Reason for Consultation</label>
              <input
                type="text"
                value={bookReason}
                onChange={(e) => setBookReason(e.target.value)}
                placeholder="e.g. Chest pain follow-up, Routine health checkup"
                className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-google-dark mb-1">5. Consultation Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookType('In-Clinic Follow-up')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                    bookType === 'In-Clinic Follow-up'
                      ? 'bg-purple-50 text-purple-700 border-purple-400'
                      : 'bg-google-canvas text-google-gray border-google-border'
                  }`}
                >
                  In-Clinic OPD Visit
                </button>
                <button
                  type="button"
                  onClick={() => setBookType('Video Consultation')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                    bookType === 'Video Consultation'
                      ? 'bg-purple-50 text-purple-700 border-purple-400'
                      : 'bg-google-canvas text-google-gray border-google-border'
                  }`}
                >
                  Telehealth Video Call
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!bookSlotId}
              className="w-full py-3.5 px-6 rounded-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Front-Desk Booking</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================= TAB 4: PATIENT DIRECTORY ======================= */}
      {activeTab === 'DIRECTORY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-google-dark">Registered Patients Directory</h2>
            <span className="text-xs text-google-gray font-semibold">{patients.length} Registered Patients</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-google-border bg-google-canvas/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={p.name} role="PATIENT" size="md" />
                  <div>
                    <span className="text-xs font-bold text-google-dark block">{p.name}</span>
                    <span className="text-[11px] text-google-gray block">{p.phone || p.email}</span>
                    <span className="text-[10px] text-google-blue font-mono">ID: {p.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBookPatientId(p.id);
                    setActiveTab('BOOK_PATIENT');
                  }}
                  className="px-3 py-1.5 rounded-full bg-white border border-google-border text-xs font-bold text-google-blue hover:bg-google-blue hover:text-white transition-all shadow-xs"
                >
                  Book Visit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
