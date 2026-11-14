import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { Button } from '@/shared/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-10 text-center space-y-4">
        <BrandLogo size="lg" className="justify-center" />
        <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
        <p className="text-sm text-slate-500">
          Такой страницы не существует или она была перемещена.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="lg">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
