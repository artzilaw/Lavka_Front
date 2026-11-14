import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  showLockIcon?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showLockIcon = true, className = '', id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {showLockIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={`w-full rounded-xl border bg-slate-50/70 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 ${
              showLockIcon ? 'pl-10' : 'pl-3.5'
            } ${
              error
                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={visible ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
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

PasswordInput.displayName = 'PasswordInput';
