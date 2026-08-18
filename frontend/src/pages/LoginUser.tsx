import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Dumbbell, User, ArrowRight } from 'lucide-react';

export const LoginUser: React.FC<{ onSwitchToRegister: () => void; onSwitchRolePage: (page: 'user'|'coach'|'admin') => void }> = ({
  onSwitchToRegister,
  onSwitchRolePage
}) => {
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
      setError(err.message || 'Falha ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Área do Aluno</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Acesse seus treinos, calendário e pagamentos</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-mail do Aluno</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Entrando...' : 'Entrar no Treino'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onSwitchToRegister}
            className="text-slate-500 hover:text-emerald-600 font-medium"
          >
            Novo Aluno? <span className="font-bold text-emerald-600 underline">Cadastre-se</span>
          </button>

          <div className="flex gap-2">
            <button onClick={() => onSwitchRolePage('coach')} className="text-slate-400 hover:text-blue-600 text-[11px] font-semibold">
              Sou Treinador
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onSwitchRolePage('admin')} className="text-slate-400 hover:text-purple-600 text-[11px] font-semibold">
              Dev Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
