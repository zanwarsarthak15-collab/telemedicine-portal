import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UserAvatar } from './UserAvatar';
import { ShieldAlert, Users } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, users, selectUser, adminUnlockAccount } = useApp();

  if (!currentUser) return null;

  const demoAccounts: { role: UserRole; id: string; label: string; badge: string; color: string }[] = [
    {
      role: 'PATIENT',
      id: 'usr_pat_1',
      label: 'Aarav Patel',
      badge: 'Patient',
      color: 'bg-blue-50 text-google-blue border-google-blue/30 hover:bg-google-blue-light',
    },
    {
      role: 'DOCTOR',
      id: 'usr_doc_1',
      label: 'Dr. Rajesh Sharma',
      badge: 'Cardio',
      color: 'bg-emerald-50 text-google-green border-google-green/30 hover:bg-google-green-light',
    },
    {
      role: 'RECEPTIONIST',
      id: 'usr_rec_1',
      label: 'Pooja Sharma',
      badge: 'Reception',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
    {
      role: 'ADMIN',
      id: 'usr_admin_1',
      label: 'Neha Gupta',
      badge: 'Admin',
      color: 'bg-rose-50 text-google-red border-google-red/30 hover:bg-google-red-light',
    },
  ];

  const lockedUsers = users.filter((u) => u.lockedUntil && u.lockedUntil > Date.now());

  return (
    <aside aria-label="Demo Role Switcher Toolbar" className="bg-white border-b border-google-border px-4 py-2 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-google-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-google-green"></span>
          </span>
          <span className="font-bold text-google-dark hidden sm:inline">1-Click Demo Profiles:</span>
          <span className="text-google-gray">Active:</span>
          <strong className="text-google-dark bg-google-surface px-2.5 py-0.5 rounded-full border border-google-border font-bold">
            {currentUser.name} ({currentUser.role})
          </strong>
        </div>

        {/* Quick Indian Demo Profiles Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {demoAccounts.map((account) => {
            const isSelected = currentUser.id === account.id;
            return (
              <button
                key={account.id}
                onClick={() => selectUser(account.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  account.color
                } ${isSelected ? 'ring-2 ring-offset-1 ring-google-blue font-bold shadow-sm' : 'opacity-85'}`}
                title={`Switch to ${account.label} (${account.role})`}
              >
                <UserAvatar name={account.label} role={account.role} size="sm" className="w-4 h-4 text-[9px]" />
                <span>{account.label}</span>
                <span className="text-[10px] opacity-75 hidden md:inline">({account.badge})</span>
              </button>
            );
          })}
        </div>

        {/* Lockout status indicator */}
        {lockedUsers.length > 0 && (
          <div className="flex items-center gap-2 bg-google-red-light text-google-red px-2.5 py-1 rounded-full border border-google-red/20 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{lockedUsers.length} account locked (DEF-01)</span>
            <button
              onClick={() => lockedUsers.forEach((u) => adminUnlockAccount(u.id))}
              className="underline text-[11px] font-bold hover:text-red-700 ml-1"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
