import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Clock,
  Heart,
  AlertCircle,
  Eye,
  Check,
  FileCheck2,
  Stethoscope,
  Lock,
} from 'lucide-react';
import { EHRDocument } from '../../types';

export const PatientRecordsView: React.FC = () => {
  const { currentUser, ehrs, toggleEHRConsent, uploadEHRDocument, showToast } = useApp();

  if (!currentUser) return null;

  const patientEHR = ehrs[currentUser.id] || {
    id: `ehr_${currentUser.id}`,
    patientId: currentUser.id,
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    conditions: ['Hypertension'],
    currentMedications: ['Telmisartan 40mg'],
    emergencyContact: { name: 'Family Contact', phone: '+91 98201 00000', relation: 'Relative' },
    records: [],
    consentGranted: true,
    accessLog: [],
  };

  const [activeTab, setActiveTab] = useState<'VAULT' | 'PROFILE' | 'TIMELINE'>('VAULT');
  const [filterType, setFilterType] = useState<string>('ALL');

  // New Document Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<EHRDocument['type']>('Lab Report');
  const [docDoctor, setDocDoctor] = useState('Dr. Rajesh Sharma, MD');
  const [docNotes, setDocNotes] = useState('');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    uploadEHRDocument(currentUser.id, {
      title: docTitle,
      type: docType,
      date: new Date().toISOString().split('T')[0],
      doctorName: docDoctor,
      fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      fileUrl: '#',
      notes: docNotes || 'Uploaded report saved to medical vault.',
    });

    setDocTitle('');
    setDocNotes('');
    setUploadModalOpen(false);
  };

  const filteredRecords = patientEHR.records.filter((rec) => {
    if (filterType === 'ALL') return true;
    return rec.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Banner: Simplified Header & Doctor Consent Control Switch */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-google-blue-light text-google-blue flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-google-dark">My Medical Records & Lab Vault</h1>
              </div>
              <p className="text-xs text-google-gray mt-1 max-w-xl">
                Safely store your health files. You decide whether consulting doctors can view your files during video
                appointments.
              </p>
            </div>
          </div>

          {/* Clean Doctor Access Consent Switch */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 sm:min-w-[340px] ${
              patientEHR.consentGranted
                ? 'bg-emerald-50/70 border-emerald-300 text-google-dark'
                : 'bg-rose-50/70 border-rose-300 text-google-dark'
            }`}
          >
            <div className="flex items-center gap-3">
              {patientEHR.consentGranted ? (
                <ShieldCheck className="w-8 h-8 text-google-green flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-google-red flex-shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-google-dark">Doctor Access</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      patientEHR.consentGranted ? 'bg-google-green text-white' : 'bg-google-red text-white'
                    }`}
                  >
                    {patientEHR.consentGranted ? 'ALLOWED' : 'BLOCKED'}
                  </span>
                </div>
                <p className="text-xs text-google-gray mt-0.5">
                  {patientEHR.consentGranted
                    ? 'Doctors can view your reports during calls'
                    : 'Doctors cannot view your reports (Private)'}
                </p>
              </div>
            </div>

            {/* Google-style Toggle Switch */}
            <button
              type="button"
              onClick={() => toggleEHRConsent(currentUser.id)}
              className={`w-14 h-8 flex items-center rounded-full p-1 duration-300 cursor-pointer shadow-inner transition-colors ${
                patientEHR.consentGranted ? 'bg-google-green' : 'bg-google-red'
              }`}
              title="Toggle Doctor Access"
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 flex items-center justify-center text-xs font-bold ${
                  patientEHR.consentGranted ? 'translate-x-6 text-google-green' : 'translate-x-0 text-google-red'
                }`}
              >
                {patientEHR.consentGranted ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
              </div>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-t border-google-border mt-6 pt-4">
          <button
            onClick={() => setActiveTab('VAULT')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'VAULT'
                ? 'bg-google-blue text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            All Reports ({patientEHR.records.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-google-blue text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            Health Vitals & Allergies
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'TIMELINE'
                ? 'bg-google-blue text-white shadow-xs'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Who Viewed My Records ({patientEHR.accessLog?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: Document Vault */}
      {activeTab === 'VAULT' && (
        <div>
          {/* Action Header & Filter Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['ALL', 'Lab Report', 'Imaging / X-Ray', 'Clinical Summary'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                    filterType === type
                      ? 'bg-google-blue text-white border-google-blue shadow-xs'
                      : 'bg-white text-google-gray border-google-border hover:bg-google-surface hover:text-google-dark'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-google-blue hover:bg-google-blue-hover text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Medical Report
            </button>
          </div>

          {/* Cards Grid */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-google-border">
              <FileCheck2 className="w-12 h-12 text-google-gray mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-google-dark">No reports found</h3>
              <p className="text-xs text-google-gray mt-1">
                Upload your lab tests, doctor summaries, or scans to view them here anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl p-6 border border-google-border hover:border-google-blue/40 shadow-google-card hover:shadow-google-2 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-google-surface text-google-gray border border-google-border">
                        {doc.type}
                      </span>
                      <span className="text-xs text-google-gray font-mono">{doc.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-google-dark leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-google-gray mt-1 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-google-blue" />
                      {doc.doctorName}
                    </p>

                    <div className="mt-4 p-3 bg-google-canvas rounded-2xl border border-google-border text-xs text-google-dark">
                      <span className="font-bold text-google-gray block text-[10px] uppercase mb-1">
                        Doctor Findings:
                      </span>
                      {doc.notes}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-google-border flex items-center justify-between text-xs">
                    <span className="text-google-gray font-medium">{doc.fileSize}</span>
                    <button
                      onClick={() => showToast(`Previewing report: ${doc.title}`, 'info')}
                      className="flex items-center gap-1 text-google-blue hover:text-google-blue-hover font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Vitals & Profile */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-google-border shadow-google-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-google-red-light text-google-red flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-google-dark">Blood & Contact</h3>
                <p className="text-xs text-google-gray">Basic patient identifiers</p>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-google-border">
                <span className="text-google-gray">Blood Group:</span>
                <span className="font-bold text-google-dark bg-google-surface px-2 py-0.5 rounded">
                  {patientEHR.bloodGroup}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-google-border">
                <span className="text-google-gray">Emergency Contact:</span>
                <span className="font-semibold text-google-dark">
                  {patientEHR.emergencyContact.name} ({patientEHR.emergencyContact.relation})
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-google-gray">Phone:</span>
                <span className="font-semibold text-google-dark">{patientEHR.emergencyContact.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-google-border shadow-google-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-google-yellow-light text-google-yellow flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-google-dark">Known Drug Allergies</h3>
                <p className="text-xs text-google-gray">Alerts shown to doctors</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {patientEHR.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300"
                >
                  ⚠️ {allergy}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-google-border shadow-google-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-google-blue-light text-google-blue flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-google-dark">Current Medications</h3>
                <p className="text-xs text-google-gray">Prescribed regimen</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-google-dark">
              {patientEHR.currentMedications.map((med, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-google-blue"></span>
                  <span>{med}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: Timeline */}
      {activeTab === 'TIMELINE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-google-border shadow-google-card">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-google-dark">Doctor Access History</h3>
            <p className="text-xs text-google-gray mt-1">
              Transparent record of which attending doctor opened your medical files.
            </p>
          </div>

          {patientEHR.accessLog.length === 0 ? (
            <div className="py-8 text-center text-google-gray text-xs">
              No doctors have accessed your records yet.
            </div>
          ) : (
            <div className="space-y-4">
              {patientEHR.accessLog.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-google-canvas border border-google-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-sm text-google-dark">{log.doctorName}</span>
                    <span className="text-xs text-google-gray font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-google-gray mt-1">
                    <strong className="text-google-dark">Purpose:</strong> {log.purpose}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-google-3 border border-google-border max-w-lg w-full p-6 sm:p-8 relative">
            <h2 className="text-xl font-bold text-google-dark mb-1">Add Medical Report</h2>
            <p className="text-xs text-google-gray mb-6">Your report will be stored securely in your health records.</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-google-gray mb-1">Report Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blood Test Report, Chest X-Ray"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-google-canvas border border-google-border focus:border-google-blue rounded-2xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-google-gray mb-1">Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as EHRDocument['type'])}
                    className="w-full px-3 py-2.5 bg-google-canvas border border-google-border rounded-2xl text-xs font-semibold outline-none"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Imaging / X-Ray">Imaging / X-Ray</option>
                    <option value="Clinical Summary">Clinical Summary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-google-gray mb-1">Doctor / Lab Name</label>
                  <input
                    type="text"
                    value={docDoctor}
                    onChange={(e) => setDocDoctor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-google-canvas border border-google-border rounded-2xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-google-gray mb-1">Notes / Key Values</label>
                <textarea
                  rows={2}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="e.g. Normal blood sugar, all parameters healthy..."
                  className="w-full px-4 py-2.5 bg-google-canvas border border-google-border focus:border-google-blue rounded-2xl text-xs outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 py-2.5 border border-google-border text-google-gray text-xs font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-google-blue text-white text-xs font-bold rounded-full shadow-sm"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
