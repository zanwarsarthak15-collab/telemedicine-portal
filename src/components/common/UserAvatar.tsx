import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  role?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  role,
  className = '',
}) => {
  // Extract initials (e.g., "Priya Sharma" -> "PS", "Dr. Rajesh Sharma" -> "RS")
  const getInitials = (fullName: string) => {
    const cleaned = fullName.replace(/^Dr\.\s+/i, '').trim();
    const parts = cleaned.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  // Google Material pastel background palettes
  const getBgColor = (userRole?: string, userName?: string) => {
    if (userRole === 'DOCTOR') return 'bg-emerald-600 text-white';
    if (userRole === 'PHARMACIST') return 'bg-amber-600 text-white';
    if (userRole === 'ADMIN') return 'bg-rose-600 text-white';

    // Variations for patients
    const charCode = (userName || 'A').charCodeAt(0);
    if (charCode % 3 === 0) return 'bg-blue-600 text-white';
    if (charCode % 3 === 1) return 'bg-indigo-600 text-white';
    return 'bg-teal-600 text-white';
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  const initials = getInitials(name);

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold tracking-tight shadow-sm select-none flex-shrink-0 ${sizeClasses[size]} ${getBgColor(
        role,
        name
      )} ${className}`}
      title={`${name} (${role || 'User'})`}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
};
