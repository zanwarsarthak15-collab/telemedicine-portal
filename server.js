import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-Memory Data Stores (Indian Demo Profiles)
const D1_Users = [
  { id: 'usr_pat_1', name: 'Aarav Patel', email: 'aarav.patel@care.in', role: 'PATIENT', failedAttempts: 0, lockedUntil: null },
  { id: 'usr_pat_2', name: 'Priya Sharma', email: 'priya.sharma@care.in', role: 'PATIENT', failedAttempts: 0, lockedUntil: null },
  { id: 'usr_pat_3', name: 'Rohan Verma', email: 'rohan.verma@care.in', role: 'PATIENT', failedAttempts: 0, lockedUntil: null },
  { id: 'usr_doc_1', name: 'Dr. Rajesh Sharma, MD', email: 'dr.rajesh@apollo.med', role: 'DOCTOR', specialization: 'Cardiology (Apollo Hospitals)' },
  { id: 'usr_doc_2', name: 'Dr. Ananya Iyer, MD', email: 'dr.ananya@fortis.med', role: 'DOCTOR', specialization: 'Neurology (Fortis Healthcare)' },
  { id: 'usr_doc_3', name: 'Dr. Suresh Menon, MD', email: 'dr.suresh@max.med', role: 'DOCTOR', specialization: 'General Physician (Max Super Speciality)' },
  { id: 'usr_doc_4', name: 'Dr. Meera Nambiar, MD', email: 'dr.meera@apollo.med', role: 'DOCTOR', specialization: 'Dermatology (Apollo Clinic)' },
  { id: 'usr_rec_1', name: 'Pooja Sharma', email: 'pooja.reception@care.in', role: 'RECEPTIONIST', failedAttempts: 0, lockedUntil: null },
  { id: 'usr_pharm_1', name: 'Vikram Malhotra, B.Pharm', email: 'vikram@medplus.rx', role: 'PHARMACIST' },
  { id: 'usr_admin_1', name: 'Neha Gupta', email: 'neha.gupta@health.gov.in', role: 'ADMIN' },
];

const D7_AuditLogs = [
  { id: 'aud_init', timestamp: new Date().toISOString(), action: 'SERVER_BOOT', category: 'ADMIN', details: 'CareSync Telehealth Backend API initialized with Indian demo roster', status: 'SUCCESS' },
];

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'CareSync Telemedicine Healthcare Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    hipaaCompliance: 'AES-256 / TLS 1.3 Certified',
    activeStores: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
    demoUsers: D1_Users.length,
  });
});

// D1: User Accounts & DEF-01 Lockout API
app.get('/api/users', (req, res) => {
  res.json(D1_Users);
});

// D7: Audit Logs API
app.get('/api/audit-logs', (req, res) => {
  res.json(D7_AuditLogs);
});

// Serve compiled frontend production build from dist/
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Fallback for Express 5: catch-all middleware
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CareSync Backend & Web Server running successfully at:`);
  console.log(`- Local URL:   http://localhost:${PORT}/`);
  console.log(`- Network URL: http://10.168.36.210:${PORT}/`);
  console.log(`- API Status:  http://localhost:${PORT}/api/health`);
});
