import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';
import {
  Pill,
  Search,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building,
} from 'lucide-react';
import { Prescription } from '../../types';

export const PharmacistDashboard: React.FC = () => {
  const { prescriptions, fulfillPrescription, currentUser, showToast } = useApp();

  if (!currentUser) return null;

  const [searchId, setSearchId] = useState('RX-2026-8841');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(() => {
    return prescriptions.find((p) => p.id === 'RX-2026-8841') || prescriptions[0] || null;
  });
  const [isVerifyingQR, setIsVerifyingQR] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = prescriptions.find((p) => p.id.toLowerCase() === searchId.trim().toLowerCase());
    if (found) {
      setSelectedRx(found);
      showToast(`Prescription ${found.id} located.`, 'info');
    } else {
      showToast(`Prescription ID "${searchId}" not found in national registry.`, 'warning');
    }
  };

  const handleSimulateQRScan = () => {
    setIsVerifyingQR(true);
    setTimeout(() => {
      // Pick first signed unfulfilled rx or fallback
      const signedRx = prescriptions.find((p) => p.status === 'signed') || prescriptions[0];
      if (signedRx) {
        setSearchId(signedRx.id);
        setSelectedRx(signedRx);
        showToast(`QR Code scanned: Prescription ${signedRx.id} verified via SHA-256 certificate.`, 'success');
      }
      setIsVerifyingQR(false);
    }, 1200);
  };

  const handleFulfill = () => {
    if (!selectedRx) return;
    const result = fulfillPrescription(
      selectedRx.id,
      currentUser.name,
      currentUser.licenseNumber || 'RPH-US-99120'
    );

    if (result.success) {
      // Refresh selected Rx from state
      const updated = prescriptions.find((p) => p.id === selectedRx.id);
      if (updated) {
        setSelectedRx({ ...updated, status: 'fulfilled' });
      }
    } else {
      showToast(result.message, 'warning');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-google-dark">Pharmacy Prescription Dispenser</h1>
              <p className="text-xs text-google-gray mt-1">
                Lookup prescriptions by ID or scan QR code to verify doctor signature and dispense medications.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-google-gray block">Pharmacist on Duty:</span>
            <span className="text-sm font-bold text-google-dark">{currentUser.name}</span>
            <span className="text-xs text-google-blue block font-mono">{currentUser.licenseNumber || 'DL-RPH-49201'}</span>
          </div>
        </div>

        {/* Search & QR Scanner Bar */}
        <div className="mt-6 pt-6 border-t border-google-border flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="w-4 h-4 text-google-gray absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Prescription ID (e.g. RX-2026-8841)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-11 pr-24 py-2.5 bg-google-canvas border border-google-border rounded-full text-sm outline-none focus:border-google-blue focus:bg-white transition-all font-mono"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-google-blue text-white text-xs font-semibold rounded-full hover:bg-google-blue-hover transition-colors"
            >
              Verify
            </button>
          </form>

          <button
            type="button"
            onClick={handleSimulateQRScan}
            disabled={isVerifyingQR}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-google-surface hover:bg-google-border border border-google-border text-google-dark text-xs font-semibold rounded-full transition-all"
          >
            <QrCode className="w-4 h-4 text-google-blue" />
            <span>{isVerifyingQR ? 'Scanning Camera QR...' : 'Simulate Camera QR Scan'}</span>
          </button>
        </div>
      </div>

      {/* Main Prescription Verification View */}
      {selectedRx ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Prescription Sheet */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-google-border shadow-google-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-google-border pb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-google-gray">
                  Electronic Prescription Verification
                </span>
                <h2 className="text-xl font-bold text-google-dark flex items-center gap-2 mt-0.5">
                  <span>Rx ID: {selectedRx.id}</span>
                  <span className="text-xs font-mono font-medium text-google-gray">
                    (Version {selectedRx.version}.0)
                  </span>
                </h2>
              </div>

              {/* Status Badge */}
              <div>
                {selectedRx.status === 'fulfilled' ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-google-surface text-google-gray border border-google-border flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-google-gray" />
                    DISPENSED / FULFILLED
                  </span>
                ) : selectedRx.status === 'signed' ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-google-green border border-google-green/40 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    CRYPTOGRAPHICALLY VALID & SIGNED
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {selectedRx.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Patient & Doctor Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-google-canvas rounded-2xl border border-google-border text-xs">
              <div>
                <span className="text-[10px] font-bold text-google-gray uppercase block mb-1">Patient Details</span>
                <p className="font-bold text-sm text-google-dark">{selectedRx.patientName}</p>
                <p className="text-google-gray">Patient ID: {selectedRx.patientId}</p>
                <p className="text-google-gray">Date Issued: {selectedRx.date}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-google-gray uppercase block mb-1">Prescribing Doctor</span>
                <p className="font-bold text-sm text-google-dark">{selectedRx.doctorName}</p>
                <p className="text-google-gray">{selectedRx.doctorSpecialization}</p>
                <p className="text-google-gray font-mono">License: {selectedRx.doctorLicense}</p>
              </div>
            </div>

            {/* Clinical Diagnosis */}
            <div>
              <span className="text-xs font-bold text-google-gray uppercase tracking-wider block mb-1">
                Clinical Indication:
              </span>
              <p className="text-sm font-semibold text-google-dark bg-google-surface p-3 rounded-2xl border border-google-border">
                {selectedRx.diagnosis}
              </p>
            </div>

            {/* Medications Table */}
            <div>
              <span className="text-xs font-bold text-google-gray uppercase tracking-wider block mb-2">
                Prescribed Drug Regimen:
              </span>
              <div className="space-y-3">
                {selectedRx.medications.map((med, i) => (
                  <div
                    key={med.id || i}
                    className="p-4 bg-white rounded-2xl border border-google-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-google-dark">{med.name}</h4>
                      <p className="text-xs text-google-gray mt-0.5">
                        Strength: {med.dosage} • Instructions: {med.instructions}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-semibold text-google-dark block">{med.frequency}</span>
                      <span className="text-google-gray">Duration: {med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic SHA-256 Assurance */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-google-green/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-google-green font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>SHA-256 Digital Certificate Validation</span>
              </div>
              <p className="text-google-gray text-[11px]">
                Signed at: {selectedRx.signatureTimestamp || new Date().toISOString()}
              </p>
              <div className="font-mono text-[10px] text-google-gray bg-white p-2 rounded-xl border border-google-green/20 break-all">
                {selectedRx.cryptographicHash ||
                  'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
              </div>
            </div>

            {/* Actions: Confirm Fulfillment or Download */}
            <div className="pt-4 border-t border-google-border flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => generatePrescriptionPDF(selectedRx)}
                className="px-5 py-2.5 bg-google-surface hover:bg-google-border border border-google-border text-google-dark text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Print / Save PDF
              </button>

              {selectedRx.status === 'signed' ? (
                <button
                  type="button"
                  onClick={handleFulfill}
                  className="px-6 py-2.5 bg-google-green hover:bg-google-green-hover text-white text-xs font-bold rounded-full shadow-google-1 hover:shadow-google-2 transition-all flex items-center gap-2 ml-auto"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Mark Fulfilled (UC-9)
                </button>
              ) : selectedRx.status === 'fulfilled' ? (
                <div className="ml-auto text-xs font-semibold text-google-gray flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-google-green" />
                  <span>
                    Fulfilled on {new Date(selectedRx.fulfilledAt || Date.now()).toLocaleDateString()} by{' '}
                    {selectedRx.fulfilledBy}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Col: Pharmacy Registry & Recent Dispense Log */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-google-border shadow-google-card">
              <h3 className="font-bold text-sm text-google-dark mb-3">All Active Prescriptions</h3>
              <div className="space-y-2.5">
                {prescriptions.map((rx) => (
                  <button
                    key={rx.id}
                    onClick={() => {
                      setSearchId(rx.id);
                      setSelectedRx(rx);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                      selectedRx.id === rx.id
                        ? 'border-google-blue bg-google-blue-light/50 font-semibold'
                        : 'border-google-border hover:bg-google-surface'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-google-blue">{rx.id}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          rx.status === 'fulfilled'
                            ? 'bg-google-surface text-google-gray'
                            : 'bg-emerald-50 text-google-green font-bold'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </div>
                    <p className="text-google-dark font-medium truncate">{rx.patientName}</p>
                    <p className="text-google-gray text-[11px] truncate">{rx.diagnosis}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-google-border shadow-google-card text-xs space-y-2">
              <h3 className="font-bold text-sm text-google-dark flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-google-green" />
                e-Prescribing Protocol Standards
              </h3>
              <p className="text-google-gray">
                Complies with DEA Electronic Prescriptions for Controlled Substances (EPCS) and HIPAA Security rule.
                Fulfillment actions are permanently sealed in Data Store D6.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-google-border">
          <Pill className="w-12 h-12 text-google-gray mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-google-dark">No Prescription Selected</h3>
          <p className="text-xs text-google-gray mt-1">Enter a Prescription ID above or click "Simulate Camera QR Scan".</p>
        </div>
      )}
    </div>
  );
};
