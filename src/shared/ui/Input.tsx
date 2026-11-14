import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 ${
              icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15'
            } ${className}`}
            {...props}
          />
        </div>
        {error && error.trim() && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
