import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { Button } from '@/shared/ui/Button';
import { ProfileHeroCard } from '@/features/profile/ProfileHeroCard';
import { EditProfileForm } from '@/features/profile/EditProfileForm';
import { ChangePasswordForm } from '@/features/profile/ChangePasswordForm';
import { User } from '@/entities/user/model';

export const ProfilePage: React.FC = () => {
  const { user, setUser, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUserUpdated = (updated: User) => {
    setUser((prev) => ({ ...(prev || {}), ...updated }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-slate-50 to-violet-50/50 py-7 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl px-5 py-3.5 shadow-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>К объявлениям</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2.5">
            <BrandLogo size="sm" />
          </div>

          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </Button>
        </header>

        <ProfileHeroCard user={user} onUserUpdated={handleUserUpdated} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EditProfileForm user={user} onUserUpdated={handleUserUpdated} />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};
