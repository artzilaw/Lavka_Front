import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-700'
      } ${className}`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
