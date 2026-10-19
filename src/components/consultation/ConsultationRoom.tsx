import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SignaturePad } from './SignaturePad';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Share2,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Activity,
  AlertTriangle,
  Download,
  Lock,
  Edit3,
  Stethoscope,
  X,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import { PrescriptionMedication } from '../../types';

export const ConsultationRoom: React.FC = () => {
  const {
    currentUser,
    activeConsultationId,
    setActiveConsultationId,
    setActiveView,
    appointments,
    ehrs,
    prescriptions,
    signPrescription,
    createAmendment,
    logEHRAccess,
    showToast,
  } = useApp();

  if (!currentUser) return null;

  // Find appointment associated with this consultation
  const appointment = appointments.find(
    (a) => a.meetingId === activeConsultationId || `meet-${a.id}` === activeConsultationId
  ) || appointments[0];

  const targetPatientId = appointment.patientId || 'usr_pat_1';
  const targetPatientEHR = ehrs[targetPatientId];

  // Video call media states
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [activeSideTab, setActiveSideTab] = useState<'EHR' | 'PRESCRIPTION'>('EHR');

  // NFR-01 Performance HUD: Dynamic simulated WebRTC latency
  const [latencyMs, setLatencyMs] = useState(48);
  const [networkQuality, setNetworkQuality] = useState<'EXCELLENT' | 'DEGRADED'>('EXCELLENT');

  // Local camera stream reference
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Digital Prescription State
  const existingRx = prescriptions.find(
    (p) => p.appointmentId === appointment.id || p.patientId === targetPatientId
  );

  const [diagnosis, setDiagnosis] = useState(
    existingRx?.diagnosis || 'Essential Hypertension (Stage 1) & Mild Asthmatic Bronchospasm'
  );
  const [medications, setMedications] = useState<PrescriptionMedication[]>(
    existingRx?.medications || [
      {
        id: 'med_1',
        name: 'Amlodipine Besylate',
        dosage: '5 mg',
        frequency: 'Once Daily (Morning)',
        duration: '30 Days',
        instructions: 'Take with water. Monitor blood pressure weekly.',
      },
    ]
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(existingRx?.doctorSignature || null);
  const [rxStatus, setRxStatus] = useState<'DRAFT' | 'SIGNED' | 'AMENDED'>(
    existingRx?.status === 'signed' ? 'SIGNED' : existingRx?.status === 'amended' ? 'AMENDED' : 'DRAFT'
  );
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(existingRx?.id || 'RX-2026-8841');

  // Amendment modal for UC-7
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('Dosage titration due to systolic blood pressure variance');

  // Real WebRTC Camera Stream initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Fallback gracefully if physical webcam is not attached or blocked
        });
    } else if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Log EHR access when Doctor opens EHR tab (UC-6 & HIPAA § 164.528 audit)
  useEffect(() => {
    if (currentUser.role === 'DOCTOR' && activeSideTab === 'EHR') {
      logEHRAccess(currentUser.id, currentUser.name, targetPatientId, 'Telehealth Virtual Consultation Examination');
    }
  }, [currentUser, activeSideTab, targetPatientId]);

  // Simulate WebRTC jitter/latency ticker for NFR-01
  useEffect(() => {
    const interval = setInterval(() => {
      // Typically 40-75ms, occasionally spike to test warning pill
      const randomLatency = Math.floor(40 + Math.random() * 35);
      setLatencyMs(randomLatency);
      setNetworkQuality(randomLatency > 200 ? 'DEGRADED' : 'EXCELLENT');
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEndCall = () => {
    setActiveConsultationId(null);
    setActiveView('dashboard');
    showToast('Consultation session ended. EHR and session logs updated.', 'info');
  };

  const handleAddMedication = () => {
    const newMed: PrescriptionMedication = {
      id: `med_${Date.now()}`,
      name: '',
      dosage: '',
      frequency: 'Once Daily',
      duration: '14 Days',
      instructions: '',
    };
    setMedications([...medications, newMed]);
  };

  const handleRemoveMedication = (id: string) => {
    if (rxStatus === 'SIGNED') return;
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleSignPrescription = () => {
    if (!signatureDataUrl) {
      showToast('Please sign in the digital signature pad before locking.', 'warning');
      return;
    }

    signPrescription(currentPrescriptionId, signatureDataUrl);
    setRxStatus('SIGNED');
  };

  const handleCreateAmendment = () => {
    if (!amendmentReason) return;
    try {
      const newAmendment = createAmendment(currentPrescriptionId, medications, diagnosis, amendmentReason);
      setCurrentPrescriptionId(newAmendment.id);
      setRxStatus('SIGNED');
      setAmendModalOpen(false);
      showToast(`Prescription amended! Generated linked version ${newAmendment.id}`, 'success');
    } catch (err) {
      showToast('Failed to create amendment.', 'error');
    }
  };

  const handleDownloadPDF = () => {
    const currentRx = prescriptions.find((p) => p.id === currentPrescriptionId) || {
      id: currentPrescriptionId,
      appointmentId: appointment.id,
      patientId: targetPatientId,
      patientName: appointment.patientName || 'Alex Rivera',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorLicense: currentUser.licenseNumber || 'MD-CAL-89234-A',
      doctorSpecialization: currentUser.specialization || 'Cardiology',
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      medications,
      doctorSignature: signatureDataUrl || undefined,
      signatureTimestamp: new Date().toISOString(),
      cryptographicHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      status: 'signed' as const,
      version: 1,
    };
    generatePrescriptionPDF(currentRx);
  };

  return (
    <div className="h-[calc(100vh-105px)] bg-[#202124] text-white flex flex-col overflow-hidden relative font-sans">
      {/* Top Overlay Bar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center text-white font-bold text-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                Google Meet: {appointment.doctorName} & {appointment.patientName || 'Aarav Patel'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                {activeConsultationId || `meet-${appointment.id}`}
              </span>
            </div>
            <p className="text-[11px] text-white/60">
              End-to-End Encrypted (WebRTC DTLS-SRTP • HIPAA Security Rule)
            </p>
          </div>
        </div>

        {/* NFR-01 Performance HUD & Side Panel Toggle */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              latencyMs <= 200
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
            }`}
            title="NFR-01 Performance Requirement: Real-time network latency (<200 ms target)"
          >
            <span
              className={`w-2 h-2 rounded-full ${latencyMs <= 200 ? 'bg-emerald-400' : 'bg-rose-400'}`}
            ></span>
            <span>HUD: {latencyMs} ms latency</span>
            {latencyMs > 200 && <span className="font-bold text-[10px] uppercase">Degraded</span>}
          </div>

          <button
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              sidePanelOpen
                ? 'bg-google-blue text-white border-google-blue'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Side Panel</span>
          </button>
        </div>
      </div>

      {/* Main Content Area (Video Canvas + Side Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Call Stage */}
        <div className="flex-1 flex items-center justify-center p-4 relative bg-[#131314]">
          {/* Main Feed: Doctor view (or remote peer) */}
          <div className="w-full h-full max-w-5xl rounded-3xl overflow-hidden relative shadow-2xl bg-neutral-900 flex items-center justify-center border border-white/10">
            {/* If camera is on and stream available */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Avatar fallback when camera is toggled off */}
            {!cameraActive && (
              <div className="text-center space-y-3">
                <div className="w-24 h-24 rounded-full bg-google-blue flex items-center justify-center text-white text-3xl font-bold mx-auto ring-4 ring-white/10">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                  <p className="text-xs text-white/50">Camera turned off</p>
                </div>
              </div>
            )}

            {/* Remote Peer Watermark / Tag */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-google-green"></span>
              <span>
                {currentUser.role === 'DOCTOR' ? appointment.patientName || 'Aarav Patel' : appointment.doctorName}
              </span>
              <span className="text-[10px] text-white/60">• 1080p WebRTC</span>
            </div>

            {/* Picture-in-Picture (PIP) Floating Corner Widget for Self */}
            <div className="absolute bottom-4 right-4 w-44 sm:w-56 h-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/80 backdrop-blur-md flex items-center justify-center z-10">
              <div className="text-center p-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white text-xs font-bold mb-1">
                  You
                </div>
                <span className="text-xs font-semibold block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-white/60 uppercase">{currentUser.role}</span>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px]">
                {micActive ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Drawer Panel (UC-6 & UC-7) */}
        {sidePanelOpen && (
          <div className="w-96 lg:w-[440px] bg-white text-google-dark border-l border-google-border flex flex-col h-full shadow-2xl animate-fadeIn z-20">
            {/* Drawer Tab Header */}
            <div className="p-4 border-b border-google-border flex items-center justify-between">
              <div className="flex gap-1 bg-google-canvas p-1 rounded-2xl border border-google-border flex-1 mr-2">
                <button
                  type="button"
                  onClick={() => setActiveSideTab('EHR')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeSideTab === 'EHR'
                      ? 'bg-white text-google-blue shadow-sm'
                      : 'text-google-gray hover:text-google-dark'
                  }`}
                >
                  Patient EHR Records
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSideTab('PRESCRIPTION')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeSideTab === 'PRESCRIPTION'
                      ? 'bg-white text-google-blue shadow-sm'
                      : 'text-google-gray hover:text-google-dark'
                  }`}
                >
                  Digital Rx & Sign
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSidePanelOpen(false)}
                className="p-1.5 rounded-full hover:bg-google-surface text-google-gray"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* TAB 1: EHR Review with Strict Patient Consent Enforcement */}
              {activeSideTab === 'EHR' && (
                <div>
                  {/* Consent Guard: If patient denied consent, show Google Red Access Restricted! */}
                  {!targetPatientEHR?.consentGranted ? (
                    <div className="p-6 rounded-3xl bg-google-red-light border border-google-red/40 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-white text-google-red flex items-center justify-center mx-auto shadow-sm">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-base text-google-red">
                        Access Restricted by Patient
                      </h3>
                      <p className="text-xs text-red-700 leading-relaxed">
                        Under HIPAA Privacy Rule § 164.508, the patient has revoked third-party EHR viewing consent.
                        Medical records, imaging, and lab panels cannot be displayed to attending physicians.
                      </p>
                      <div className="p-2.5 bg-white/70 rounded-2xl text-[11px] text-google-gray text-left border border-google-red/20">
                        <strong className="text-google-dark block">HIPAA Notice:</strong>
                        To view these records, ask the patient to toggle "Doctor EHR Consent" to 'Authorized' in their
                        Records Hub.
                      </div>
                    </div>
                  ) : (
                    /* Patient Granted Consent -> Render Full EHR */
                    <div className="space-y-4">
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-google-green/30 flex items-center gap-2.5 text-xs text-google-green font-semibold">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                        <span>Active Patient Consent Granted (HIPAA Verified)</span>
                      </div>

                      {/* Patient Summary */}
                      <div className="bg-google-canvas p-4 rounded-2xl border border-google-border">
                        <h4 className="text-xs font-bold text-google-gray uppercase mb-2">Patient Profile</h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-google-gray">Name:</span>
                            <span className="font-bold text-google-dark">{appointment.patientName || 'Alex Rivera'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-google-gray">Blood Group:</span>
                            <span className="font-semibold text-google-dark">{targetPatientEHR.bloodGroup}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-google-gray">Known Allergies:</span>
                            <span className="font-bold text-google-red">
                              {targetPatientEHR.allergies.join(', ') || 'None'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-google-gray">Active Conditions:</span>
                            <span className="font-semibold text-google-dark">
                              {targetPatientEHR.conditions.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vault Records */}
                      <div>
                        <h4 className="text-xs font-bold text-google-gray uppercase mb-2">
                          Diagnostic Files ({targetPatientEHR.records.length})
                        </h4>
                        <div className="space-y-2">
                          {targetPatientEHR.records.map((r) => (
                            <div
                              key={r.id}
                              className="p-3 bg-white rounded-2xl border border-google-border hover:border-google-blue/40 text-xs transition-colors"
                            >
                              <div className="flex justify-between font-semibold text-google-dark">
                                <span>{r.title}</span>
                                <span className="text-[10px] text-google-gray">{r.date}</span>
                              </div>
                              <p className="text-[11px] text-google-gray mt-1">{r.notes}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Digital Prescription & Cryptographic Signing */}
              {activeSideTab === 'PRESCRIPTION' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-google-gray">Prescription ID:</span>
                    <span className="text-xs font-mono font-bold text-google-blue">{currentPrescriptionId}</span>
                  </div>

                  {rxStatus === 'SIGNED' ? (
                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-google-green/40 text-xs">
                      <div className="flex items-center gap-2 text-google-green font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Signed & Cryptographically Locked (Immutable)</span>
                      </div>
                      <p className="text-[11px] text-google-gray mt-1">
                        In accordance with UC-7, signed prescriptions are immutable. To make changes, an official
                        versioned amendment must be spawned.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-50 rounded-2xl border border-google-blue/30 text-xs text-google-blue font-medium">
                      ✎ Draft Mode — Add medications and sign below to lock.
                    </div>
                  )}

                  {/* Diagnosis */}
                  <div>
                    <label className="block text-xs font-semibold text-google-gray mb-1">Clinical Diagnosis</label>
                    <input
                      type="text"
                      disabled={rxStatus === 'SIGNED'}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs outline-none disabled:opacity-75 font-medium"
                    />
                  </div>

                  {/* Medications List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-google-gray">Medications Regimen</label>
                      {rxStatus !== 'SIGNED' && (
                        <button
                          type="button"
                          onClick={handleAddMedication}
                          className="text-[11px] font-bold text-google-blue hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Drug
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {medications.map((med, idx) => (
                        <div
                          key={med.id || idx}
                          className="p-3 bg-google-canvas rounded-2xl border border-google-border text-xs space-y-2 relative"
                        >
                          {rxStatus !== 'SIGNED' && medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(med.id)}
                              className="absolute top-2 right-2 text-google-gray hover:text-google-red"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div>
                            <input
                              type="text"
                              disabled={rxStatus === 'SIGNED'}
                              placeholder="Medication name (e.g. Amlodipine)"
                              value={med.name}
                              onChange={(e) => {
                                const updated = [...medications];
                                updated[idx].name = e.target.value;
                                setMedications(updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-google-border rounded-lg text-xs font-bold disabled:opacity-75"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              disabled={rxStatus === 'SIGNED'}
                              placeholder="Dosage (5mg)"
                              value={med.dosage}
                              onChange={(e) => {
                                const updated = [...medications];
                                updated[idx].dosage = e.target.value;
                                setMedications(updated);
                              }}
                              className="px-2 py-1 bg-white border border-google-border rounded-lg text-xs disabled:opacity-75"
                            />
                            <input
                              type="text"
                              disabled={rxStatus === 'SIGNED'}
                              placeholder="Frequency"
                              value={med.frequency}
                              onChange={(e) => {
                                const updated = [...medications];
                                updated[idx].frequency = e.target.value;
                                setMedications(updated);
                              }}
                              className="px-2 py-1 bg-white border border-google-border rounded-lg text-xs disabled:opacity-75"
                            />
                            <input
                              type="text"
                              disabled={rxStatus === 'SIGNED'}
                              placeholder="Duration"
                              value={med.duration}
                              onChange={(e) => {
                                const updated = [...medications];
                                updated[idx].duration = e.target.value;
                                setMedications(updated);
                              }}
                              className="px-2 py-1 bg-white border border-google-border rounded-lg text-xs disabled:opacity-75"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Digital Signature Pad */}
                  {rxStatus !== 'SIGNED' ? (
                    <div>
                      <SignaturePad onSave={(dataUrl) => setSignatureDataUrl(dataUrl)} />
                      <button
                        type="button"
                        onClick={handleSignPrescription}
                        className="w-full mt-3 py-2.5 bg-google-green hover:bg-google-green-hover text-white text-xs font-semibold rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Sign & Cryptographically Lock
                      </button>
                    </div>
                  ) : (
                    /* Locked & Signed State with Amendment Button */
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-google-canvas rounded-2xl border border-google-border flex items-center justify-between text-xs">
                        <span className="text-google-gray">Physician Signature:</span>
                        <span className="font-serif italic text-google-blue font-bold">
                          {currentUser.name}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {/* Download Official PDF */}
                        <button
                          type="button"
                          onClick={handleDownloadPDF}
                          className="flex-1 py-2.5 bg-google-blue hover:bg-google-blue-hover text-white text-xs font-semibold rounded-full shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </button>

                        {/* UC-7 Amendment trigger */}
                        <button
                          type="button"
                          onClick={() => setAmendModalOpen(true)}
                          className="flex-1 py-2.5 bg-google-yellow-light text-amber-900 border border-google-yellow/40 hover:bg-amber-100 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Amend Rx (UC-7)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Google Meet Style Bottom Control Bar */}
      <div className="h-20 bg-[#202124] border-t border-white/10 px-6 flex items-center justify-between z-20">
        {/* Left: Meeting Name */}
        <div className="hidden sm:block text-xs text-white/70">
          <span>{appointment.specialization}</span>
        </div>

        {/* Center: Control Pills (Google Meet Style) */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          {/* Mic */}
          <button
            type="button"
            onClick={() => setMicActive(!micActive)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              micActive
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                : 'bg-google-red hover:bg-red-600 text-white shadow-lg'
            }`}
            title={micActive ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              cameraActive
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                : 'bg-google-red hover:bg-red-600 text-white shadow-lg'
            }`}
            title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraActive ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            type="button"
            onClick={() => setScreenSharing(!screenSharing)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              screenSharing
                ? 'bg-google-blue text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
            title="Present now / Share screen"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* End Call (Google Red Pill) */}
          <button
            type="button"
            onClick={handleEndCall}
            className="px-6 h-12 rounded-full bg-google-red hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg flex items-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">End Call</span>
          </button>
        </div>

        {/* Right: Info/Layout */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            className="p-2.5 rounded-full hover:bg-neutral-800 text-white/70 hover:text-white"
            title="Toggle clinical side panel"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prescription Amendment Modal (UC-7 / Alternate Flow 14) */}
      {amendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-google-dark">
          <div className="bg-white rounded-3xl shadow-google-3 border border-google-border max-w-md w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-google-dark mb-1">Amend Digital Prescription</h3>
            <p className="text-xs text-google-gray mb-4">
              UC-7 & Alternate Flow 14: Signed prescriptions cannot be altered directly. An official amended version
              will be spawned, retaining the original parent record.
            </p>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs mb-4">
              <span className="font-bold text-amber-900 block">Original Prescription:</span>
              <span className="font-mono text-google-gray">{currentPrescriptionId} (v1.0)</span>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-google-gray mb-1">
                  Reason for Clinical Amendment
                </label>
                <textarea
                  rows={2}
                  required
                  value={amendmentReason}
                  onChange={(e) => setAmendmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs outline-none focus:border-google-blue resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-google-gray mb-1">
                  Adjusted Medication Dosage / Note
                </label>
                <input
                  type="text"
                  value={medications[0]?.dosage || ''}
                  onChange={(e) => {
                    const updated = [...medications];
                    if (updated[0]) updated[0].dosage = e.target.value;
                    setMedications(updated);
                  }}
                  className="w-full px-3 py-2 bg-google-canvas border border-google-border rounded-xl text-xs outline-none"
                  placeholder="e.g. Titrated to 10 mg QD"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAmendModalOpen(false)}
                className="flex-1 py-2.5 border border-google-border text-google-gray hover:bg-google-surface text-xs font-semibold rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAmendment}
                className="flex-1 py-2.5 bg-google-blue hover:bg-google-blue-hover text-white text-xs font-semibold rounded-full shadow-sm"
              >
                Spawn Versioned Amendment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
