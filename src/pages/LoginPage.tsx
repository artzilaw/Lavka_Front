import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { LoginForm } from '@/features/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-950/5 p-7 sm:p-9">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>На главную</span>
          </Link>
        </div>

        <div className="flex flex-col items-center text-center mb-7">
          <BrandLogo size="lg" className="mb-3" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            С возвращением!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Войдите в свой аккаунт на маркетплейсе Лавка
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};
