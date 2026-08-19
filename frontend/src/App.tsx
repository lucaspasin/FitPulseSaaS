import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { TrainerDashboard } from './pages/TrainerDashboard.js';
import { StudentApp } from './pages/StudentApp.js';
import { AuthLayout } from './components/AuthLayout.js';

export const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/register') || search.includes('invite=') || search.includes('code=')) {
      return 'register';
    }
    return 'login';
  });

  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/register') || search.includes('invite=')) {
      setAuthView('register');
    }
  }, []);

  if (!user) {
    return (
      <AuthLayout>
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
      </AuthLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1">
        {user.role === 'ADMIN' && <AdminDashboard />}
        {user.role === 'TRAINER' && <TrainerDashboard />}
        {user.role === 'STUDENT' && <StudentApp />}
      </main>
    </div>
  );
};
