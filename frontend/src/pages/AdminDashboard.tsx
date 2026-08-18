import React, { useState, useEffect } from 'react';
import { useAuth, Gym } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Shield, Building2, Plus, Users, Dumbbell, Palette, Check, Mail, Send, Edit2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { setGym } = useAuth();
  const { t } = useLanguage();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [sentEmailModal, setSentEmailModal] = useState<any | null>(null);

  // Form fields for new gym
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0f172a');
  const [secondaryColor, setSecondaryColor] = useState('#2563eb');

  // Form fields for new trainer
  const [trainerName, setTrainerName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');

  const fetchGyms = async () => {
    try {
      const res = await fetch('/api/gyms');
      if (res.ok) {
        const data = await res.json();
        setGyms(data);
      }
    } catch (err) {
      console.error('Error loading gyms:', err);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleOpenEditGym = (g: Gym) => {
    setEditingGym(g);
    setName(g.name);
    setSlug(g.slug);
    setLogoUrl(g.logoUrl);
    setBannerUrl(g.bannerUrl);
    setPrimaryColor(g.primaryColor);
    setSecondaryColor(g.secondaryColor);
    setShowModal(true);
  };

  const handleSaveGym = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGym ? `/api/gyms/${editingGym.id}` : '/api/gyms';
      const method = editingGym ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          logoUrl: logoUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
          bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
          primaryColor,
          secondaryColor
        })
      });
      if (res.ok) {
        setShowModal(false);
        setEditingGym(null);
        setName('');
        setSlug('');
        setLogoUrl('');
        setBannerUrl('');
        fetchGyms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempPassword = 'coach' + Math.floor(1000 + Math.random() * 9000);

    try {
      const res = await fetch('/api/trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trainerName,
          email: trainerEmail,
          password: tempPassword,
          gymId: gyms[0]?.id || 'gym-dutra12'
        })
      });

      if (res.ok) {
        setSentEmailModal({
          to: trainerEmail,
          name: trainerName,
          tempPassword,
          accessLink: `${window.location.origin}/login`
        });
        setShowTrainerModal(false);
        setTrainerName('');
        setTrainerEmail('');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao cadastrar treinador');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white border border-purple-900/50 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Painel Master — Dev / Product Owner</h1>
            <p className="text-xs text-purple-200 font-medium">Gerencie Academias, Identidade Visual e Treinadores do FitPulse</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrainerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold border border-purple-700 flex items-center gap-1.5 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Novo Treinador</span>
          </button>
          <button
            onClick={() => {
              setEditingGym(null);
              setName('');
              setSlug('');
              setLogoUrl('');
              setBannerUrl('');
              setShowModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createGym')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Academias Ativas</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">{gyms.length}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Treinadores Ativos</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">4</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Alunos na Plataforma</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">18</span>
        </div>
      </div>

      {/* Gym List / Whitelabel Management */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Academias & Identidades Visuais (Whitelabel)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gyms.map((g) => (
            <div
              key={g.id}
              className="group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md dark:shadow-xl hover:border-purple-500 transition-all"
            >
              <div className="h-32 w-full relative overflow-hidden bg-slate-950">
                <img src={g.bannerUrl} alt={g.name} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </div>

              <div className="p-6 pt-0 relative space-y-4">
                <div className="flex items-end justify-between -mt-10 mb-2">
                  <img src={g.logoUrl} alt={g.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl" />
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditGym(g)}
                      className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300 dark:border-purple-800 flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar Academia
                    </button>
                    <button
                      onClick={() => setGym(g)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      Simular Tema
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{g.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Slug: /{g.slug}</span>
                </div>

                <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Cor Primária:</span>
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shadow-sm" style={{ backgroundColor: g.primaryColor }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Cor Secundária:</span>
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shadow-sm" style={{ backgroundColor: g.secondaryColor }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Trainer Email Notification Modal */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Cadastrar Novo Treinador (Enviar Convite por E-mail)</span>
            </h3>

            <form onSubmit={handleCreateTrainer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Treinador</label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  required
                  placeholder="Ex: Treinador Rafael"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail do Treinador</label>
                <input
                  type="email"
                  value={trainerEmail}
                  onChange={(e) => setTrainerEmail(e.target.value)}
                  required
                  placeholder="treinador@academia.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowTrainerModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
                  <Send className="w-4 h-4" /> Cadastrar & Enviar E-mail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Email Notification Popup */}
      {sentEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 text-white border border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">E-mail de Boas-Vindas Enviado!</h3>
                <p className="text-xs text-slate-400">Novo treinador cadastrado com sucesso no sistema</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <p><strong>Para:</strong> {sentEmailModal.to}</p>
              <p><strong>Assunto:</strong> Bem-vindo ao FitPulse — Seu Acesso de Treinador</p>
              <hr className="border-slate-800 my-2" />
              <p>Olá <strong>{sentEmailModal.name}</strong>,</p>
              <p>Sua conta de treinador foi criada com sucesso pelo Administrador.</p>
              <p>Sua senha provisória de primeiro acesso é: <span className="bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-bold">{sentEmailModal.tempPassword}</span></p>
              <p>Link de acesso: <a href={sentEmailModal.accessLink} className="text-blue-400 underline">{sentEmailModal.accessLink}</a></p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSentEmailModal(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Gym Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>{editingGym ? 'Editar Academia' : 'Cadastrar Nova Academia / Tenant'}</span>
            </h3>

            <form onSubmit={handleSaveGym} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Academia</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Velocity Sports Gym"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Slug URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="velocity"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL do Logo</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL do Banner</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cor Primária</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer p-1"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cor Secundária</label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer p-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg shadow-purple-600/30"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
