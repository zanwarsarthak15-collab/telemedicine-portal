import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { Toast } from './components/common/Toast';
import { LoginScreen } from './components/auth/LoginScreen';
import { LoginModal } from './components/auth/LoginModal';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PatientRecordsView } from './components/patient/PatientRecordsView';
import { PatientAppointmentsView } from './components/patient/PatientAppointmentsView';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { ReceptionistDashboard } from './components/receptionist/ReceptionistDashboard';
import { ConsultationRoom } from './components/consultation/ConsultationRoom';
import { PharmacistDashboard } from './components/pharmacist/PharmacistDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, activeView, activeConsultationId } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // PRIORITY 1: If user is not authenticated, ALWAYS display the professional LoginScreen first!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
        <LoginScreen />
        <Toast />
      </div>
    );
  }

  // If in video consultation call room, render the full-screen Google Meet style room
  if (activeView === 'consultation' || activeConsultationId) {
    return (
      <div className="min-h-screen bg-[#202124] flex flex-col">
        <RoleSwitcherBar />
        <ConsultationRoom />
        <Toast />
      </div>
    );
  }

  // Render content according to user role and active view
  const renderContent = () => {
    switch (currentUser.role) {
      case 'PATIENT':
        if (activeView === 'records') return <PatientRecordsView />;
        if (activeView === 'appointments') return <PatientAppointmentsView />;
        return <PatientDashboard />;

      case 'DOCTOR':
        if (activeView === 'records') return <PatientRecordsView />;
        return <DoctorDashboard />;

      case 'RECEPTIONIST':
        return <ReceptionistDashboard />;

      case 'PHARMACIST':
        return <PharmacistDashboard />;

      case 'ADMIN':
        return <AdminDashboard />;

      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-google-canvas text-google-dark flex flex-col font-sans">
      {/* 1. Demo Role Switcher Toolbar */}
      <RoleSwitcherBar />

      {/* 2. Google Workspace Navbar */}
      <Navbar onOpenLoginModal={() => setIsLoginModalOpen(true)} />

      {/* 3. Main Dynamic Application Canvas */}
      <main className="flex-1 pb-16">{renderContent()}</main>

      {/* 4. Google Healthcare Suite Standard Footer */}
      <footer className="bg-white border-t border-google-border py-8 text-xs text-google-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-google-blue flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-google-dark">CareSync Telemedicine Health System</span>
            <span className="text-google-border">|</span>
            <span>Practo-Style Telehealth & OPD Suite</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-google-green font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              HIPAA § 164.312
            </span>
            <span className="flex items-center gap-1 text-google-blue font-medium">
              <Lock className="w-3.5 h-3.5" />
              GDPR Article 9
            </span>
            <span>Stores D1–D7 Active</span>
            <span>NFR-01 &lt;200ms WebRTC</span>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Notifications */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
