import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-google-green flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-google-red flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-google-yellow flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-google-blue flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-google-green/40';
      case 'error':
        return 'border-google-red/40';
      case 'warning':
        return 'border-google-yellow/40';
      default:
        return 'border-google-blue/40';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-short">
      <div
        className={`flex items-center gap-3 bg-white text-google-dark px-4 py-3.5 rounded-2xl shadow-google-3 border ${getBorderColor()} transition-all`}
      >
        {getIcon()}
        <span className="text-sm font-medium leading-snug flex-1">{toast.message}</span>
      </div>
    </div>
  );
};
