import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthContext';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdDetailPage } from '@/pages/AdDetailPage';
import { AdCreatePage } from '@/pages/AdCreatePage';
import { AdEditPage } from '@/pages/AdEditPage';
import { CartPage } from '@/pages/CartPage';
import { SellerPage } from '@/pages/SellerPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/ads/:id" element={<AdDetailPage />} />
      <Route path="/sellers/:id" element={<SellerPage />} />
      <Route
        path="/ads/new"
        element={
          <ProtectedRoute>
            <AdCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ads/:id/edit"
        element={
          <ProtectedRoute>
            <AdEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
