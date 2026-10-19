import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  Shield,
  Users,
  Activity,
  Server,
  Unlock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Eye,
  FileText,
  Lock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, auditLogs, adminUnlockAccount, adminUpdateUserRole, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT' | 'METRICS'>('USERS');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterCategory, setAuditFilterCategory] = useState<string>('ALL');
  const [selectedUserForRoleEdit, setSelectedUserForRoleEdit] = useState<string | null>(null);

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesCategory = auditFilterCategory === 'ALL' || log.category === auditFilterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-google-green border-google-green/30';
      case 'FAILURE':
        return 'bg-rose-50 text-google-red border-google-red/30';
      case 'WARNING':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-50 text-google-blue border-google-blue/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-google-card border border-google-border mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-google-red border border-google-red/20 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-google-dark">System Administration & Audit Portal</h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-google-surface border border-google-border text-google-gray">
                  Data Stores D1 & D7 (UC-10)
                </span>
              </div>
              <p className="text-sm text-google-gray mt-1">
                Oversee Role-Based Access Control (RBAC), unlock locked user accounts, inspect immutable HIPAA audit
                trails, and observe system health metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-t border-google-border mt-6 pt-4">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'USERS'
                ? 'bg-google-blue text-white shadow-sm'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            User & RBAC Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'bg-google-blue text-white shadow-sm'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            System Audit Log Viewer D7 ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'METRICS'
                ? 'bg-google-blue text-white shadow-sm'
                : 'text-google-gray hover:bg-google-surface hover:text-google-dark'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            System Telemetry & Health
          </button>
        </div>
      </div>

      {/* Google Analytics Style System Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase text-google-gray">Service Uptime</span>
            <span className="w-2 h-2 rounded-full bg-google-green"></span>
          </div>
          <div className="text-2xl font-bold text-google-green">99.98%</div>
          <p className="text-[11px] text-google-gray mt-1">Target: &gt;99.9% availability</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase text-google-gray">Active WebRTC Feeds</span>
            <span className="w-2 h-2 rounded-full bg-google-blue"></span>
          </div>
          <div className="text-2xl font-bold text-google-blue">1,420 Sessions</div>
          <p className="text-[11px] text-google-gray mt-1">Cluster Scalable to 10,000</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase text-google-gray">DB Query Latency</span>
            <span className="w-2 h-2 rounded-full bg-google-green"></span>
          </div>
          <div className="text-2xl font-bold text-google-dark">142 ms</div>
          <p className="text-[11px] text-google-gray mt-1">HIPAA Target: &lt;2.0 seconds</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-google-border shadow-google-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase text-google-gray">Immutable Audit Events</span>
            <span className="w-2 h-2 rounded-full bg-google-yellow"></span>
          </div>
          <div className="text-2xl font-bold text-google-dark">{auditLogs.length} Records</div>
          <p className="text-[11px] text-google-gray mt-1">Data Store D7 Appended</p>
        </div>
      </div>

      {/* TAB 1: User & RBAC Management Table */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl border border-google-border shadow-google-card overflow-hidden">
          <div className="p-6 border-b border-google-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-google-dark">User Accounts & Role-Based Access (D1)</h2>
              <p className="text-xs text-google-gray">
                Assign privileges, monitor failed password attempts, and clear account lockouts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-google-canvas border-b border-google-border text-google-gray font-bold uppercase">
                <tr>
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Assigned Role (RBAC)</th>
                  <th className="py-3 px-6">MFA Security</th>
                  <th className="py-3 px-6">Failed Attempts / Lock</th>
                  <th className="py-3 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-google-border">
                {users.map((u) => {
                  const isLocked = u.lockedUntil && u.lockedUntil > Date.now();
                  const remainingSecs = isLocked ? Math.ceil((u.lockedUntil! - Date.now()) / 1000) : 0;

                  return (
                    <tr key={u.id} className="hover:bg-google-canvas/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} role={u.role} size="md" />
                          <div>
                            <span className="font-bold text-sm text-google-dark block">{u.name}</span>
                            <span className="text-google-gray text-[11px] font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`font-semibold px-2.5 py-1 rounded-full text-[11px] border ${
                            u.role === 'DOCTOR'
                              ? 'bg-emerald-50 text-google-green border-google-green/30'
                              : u.role === 'PHARMACIST'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : u.role === 'ADMIN'
                              ? 'bg-rose-50 text-google-red border-google-red/30'
                              : 'bg-blue-50 text-google-blue border-google-blue/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-google-green font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          2FA Active (OTP)
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {isLocked ? (
                          <div className="text-google-red font-bold">
                            <span className="bg-google-red-light px-2.5 py-1 rounded-full text-[11px] border border-google-red/30 inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              LOCKED ({Math.ceil(remainingSecs / 60)}m left)
                            </span>
                          </div>
                        ) : u.failedAttempts > 0 ? (
                          <span className="text-google-yellow font-bold text-[11px]">
                            {u.failedAttempts} / 3 failed attempts
                          </span>
                        ) : (
                          <span className="text-google-gray text-[11px]">0 (Clear)</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        {isLocked && (
                          <button
                            type="button"
                            onClick={() => adminUnlockAccount(u.id)}
                            className="px-3 py-1.5 bg-google-red-light text-google-red border border-google-red/40 rounded-full font-bold text-xs hover:bg-google-red hover:text-white transition-all shadow-sm"
                          >
                            <Unlock className="w-3.5 h-3.5 inline mr-1" />
                            Unlock Account
                          </button>
                        )}

                        <select
                          value={u.role}
                          onChange={(e) => adminUpdateUserRole(u.id, e.target.value as UserRole)}
                          className="px-2 py-1 bg-google-surface border border-google-border rounded-xl text-xs font-semibold outline-none"
                        >
                          <option value="PATIENT">PATIENT</option>
                          <option value="DOCTOR">DOCTOR</option>
                          <option value="PHARMACIST">PHARMACIST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: System Audit Log Viewer (Data Store D7) */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl border border-google-border shadow-google-card overflow-hidden">
          {/* Search & Category Filter */}
          <div className="p-6 border-b border-google-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-google-dark">System Audit Trail (Data Store D7)</h2>
              <p className="text-xs text-google-gray">
                Append-only immutable record of authentication, access grants, prescriptions, and payments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-google-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-google-canvas border border-google-border rounded-full text-xs outline-none focus:border-google-blue"
                />
              </div>

              <select
                value={auditFilterCategory}
                onChange={(e) => setAuditFilterCategory(e.target.value)}
                className="px-3 py-1.5 bg-google-surface border border-google-border rounded-full text-xs font-semibold outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH">AUTH</option>
                <option value="EHR_ACCESS">EHR_ACCESS</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="PRESCRIPTION">PRESCRIPTION</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-google-canvas border-b border-google-border text-google-gray font-bold uppercase">
                <tr>
                  <th className="py-3 px-6">Timestamp (UTC)</th>
                  <th className="py-3 px-6">Actor / Role</th>
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Details</th>
                  <th className="py-3 px-6">Outcome</th>
                  <th className="py-3 px-6">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-google-border font-mono text-[11px]">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-google-canvas/60 transition-colors">
                    <td className="py-3 px-6 text-google-gray whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()} ({log.timestamp.split('T')[0]})
                    </td>
                    <td className="py-3 px-6 font-sans">
                      <span className="font-bold text-google-dark block">{log.actorName}</span>
                      <span className="text-google-gray text-[10px]">{log.role}</span>
                    </td>
                    <td className="py-3 px-6 font-bold text-google-dark">{log.action}</td>
                    <td className="py-3 px-6">
                      <span className="bg-google-surface px-2 py-0.5 rounded text-[10px] text-google-gray font-semibold">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-sans text-google-dark max-w-xs">{log.details}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-google-gray">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: System Telemetry & Health */}
      {activeTab === 'METRICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-google-border shadow-google-card space-y-4">
            <h3 className="font-bold text-sm text-google-dark flex items-center gap-2">
              <Server className="w-4 h-4 text-google-blue" />
              Microservices & Cluster Status
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-3 bg-google-canvas rounded-2xl">
                <div>
                  <span className="font-bold text-google-dark block">WebRTC Signaling Gateway</span>
                  <span className="text-google-gray">Node / WebSocket Peer Relay</span>
                </div>
                <span className="text-google-green font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-google-green/30">
                  HEALTHY (32 ms)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-google-canvas rounded-2xl">
                <div>
                  <span className="font-bold text-google-dark block">EHR Encryption Engine (AES-256)</span>
                  <span className="text-google-gray">Data Store D2 Hardware Security Module</span>
                </div>
                <span className="text-google-green font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-google-green/30">
                  OPERATIONAL
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-google-canvas rounded-2xl">
                <div>
                  <span className="font-bold text-google-dark block">Google Pay Settlement Webhook</span>
                  <span className="text-google-gray">TLS 1.3 Certified Payment Vault</span>
                </div>
                <span className="text-google-green font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-google-green/30">
                  READY
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-google-border shadow-google-card space-y-4">
            <h3 className="font-bold text-sm text-google-dark flex items-center gap-2">
              <Shield className="w-4 h-4 text-google-red" />
              HIPAA & GDPR Compliance Checklist
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-google-green flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-google-dark block">Granular Consent Enforcement (UC-6)</strong>
                  <span className="text-google-gray">
                    Patients retain absolute privilege to restrict EHR access from attending doctors.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-google-green flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-google-dark block">3-Attempt Lockout Defense (DEF-01)</strong>
                  <span className="text-google-gray">
                    Brute force mitigation locks compromised accounts for 15 minutes with timer reset.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-google-green flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-google-dark block">Cryptographic Prescription Immutability (UC-7)</strong>
                  <span className="text-google-gray">
                    Signed prescriptions cannot be modified directly; all updates spawn linked versioned records.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
