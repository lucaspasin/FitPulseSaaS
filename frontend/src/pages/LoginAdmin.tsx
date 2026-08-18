import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Shield, ArrowRight } from 'lucide-react';

export const LoginAdmin: React.FC<{ onSwitchRolePage: (page: 'user'|'coach'|'admin') => void }> = ({ onSwitchRolePage }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@fitpulse.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-md">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Painel Master Admin</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gestão de Academias Whitelabel & Licenciamento Dev / PO</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-mail do Admin / Product Owner</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha Master</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Entrando...' : 'Acessar Painel Master'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => onSwitchRolePage('user')} className="text-slate-500 hover:text-emerald-600 font-medium">
            Entrar como Aluno
          </button>
          <button onClick={() => onSwitchRolePage('coach')} className="text-slate-500 hover:text-blue-600 font-medium">
            Entrar como Treinador
          </button>
        </div>

      </div>
    </div>
  );
};
