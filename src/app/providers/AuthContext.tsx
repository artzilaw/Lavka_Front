import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/user/model';
import { userApi } from '@/entities/user/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshProfile = useCallback(async () => {
    const res = await userApi.getProfile();
    if (res.success && res.data) {
      setUser(res.data);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await userApi.checkSession();
      if (mounted) {
        if (res.success && res.data) {
          setUser(res.data);
        }
        setIsInitializing(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await userApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        setUser,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
