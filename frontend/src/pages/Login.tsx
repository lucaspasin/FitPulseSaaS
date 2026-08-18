import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Dumbbell, ArrowRight, Shield, UserCheck, User } from 'lucide-react';

export const Login: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('lucas@pasin.com');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">FitPulse</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Acesse sua conta (Aluno, Treinador ou Admin)</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Quick Fill Credentials Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center">
            Selecione uma conta para testar:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('lucas@pasin.com', 'student123')}
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <User className="w-4 h-4" />
              <span className="text-[10px]">Aluno</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('treinador@dutra12.com', 'trainer123')}
              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/80 border border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-[10px]">Treinador</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@fitpulse.com', 'admin123')}
              className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/80 border border-purple-300 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span className="text-[10px]">Dev Admin</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Entrando...' : 'Entrar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onSwitchToRegister}
            className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
          >
            Não tem uma conta? <span className="font-bold text-blue-600 underline">Cadastre-se como Aluno</span>
          </button>
        </div>

      </div>
    </div>
  );
};
