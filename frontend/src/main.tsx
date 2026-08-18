import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { AppContent } from './App.js';
import { ensureInitialClientSeed } from './seed/initialSeed.js';
import './index.css';

// Ensure seed data is populated in client storage for static web hosting
ensureInitialClientSeed();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
