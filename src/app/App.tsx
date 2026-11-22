import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthContext';
import { FavoritesProvider } from './providers/FavoritesContext';
import { AppRouter } from './router';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <AppRouter />
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
