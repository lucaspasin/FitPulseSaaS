import React, { useState, useEffect } from 'react';
import { useAuth, Gym } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Shield, Building2, Plus, Users, Dumbbell, Palette, Check, Mail, Send, Edit2, Search, X, UserCheck, Eye, ExternalLink } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { setGym } = useAuth();
  const { t } = useLanguage();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [sentEmailModal, setSentEmailModal] = useState<any | null>(null);

  // Inspector Modal State ('gyms' | 'trainers' | 'students' | null)
  const [activeInspectorModal, setActiveInspectorModal] = useState<'gyms' | 'trainers' | 'students' | null>(null);
  const [inspectorSearchTerm, setInspectorSearchTerm] = useState('');

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
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setGyms(data);
        return;
      }
    } catch (err) {
      console.warn('Error loading gyms, using client storage fallback:', err);
    }
    const localGyms = JSON.parse(localStorage.getItem('fitpulse_gyms') || '[]');
    setGyms(localGyms);
  };

  const fetchUsersData = async () => {
    try {
      const resT = await fetch('/api/trainers');
      const contentTypeT = resT.headers.get('content-type');
      if (resT.ok && contentTypeT && contentTypeT.includes('application/json')) {
        setTrainers(await resT.json());
      } else {
        const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
        setTrainers(localUsers.filter((u: any) => u.role === 'TRAINER'));
      }
    } catch (err) {
      const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
      setTrainers(localUsers.filter((u: any) => u.role === 'TRAINER'));
    }

    try {
      const resS = await fetch('/api/students');
      const contentTypeS = resS.headers.get('content-type');
      if (resS.ok && contentTypeS && contentTypeS.includes('application/json')) {
        setStudents(await resS.json());
      } else {
        const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
        setStudents(localUsers.filter((u: any) => u.role === 'STUDENT'));
      }
    } catch (err) {
      const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
      setStudents(localUsers.filter((u: any) => u.role === 'STUDENT'));
    }
  };

  useEffect(() => {
    fetchGyms();
    fetchUsersData();
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
    const newGym: Gym = {
      id: editingGym ? editingGym.id : `gym-${Date.now()}`,
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
      primaryColor,
      secondaryColor
    };

    try {
      const url = editingGym ? `/api/gyms/${editingGym.id}` : '/api/gyms';
      const method = editingGym ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGym)
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setShowModal(false);
        setEditingGym(null);
        setName('');
        setSlug('');
        setLogoUrl('');
        setBannerUrl('');
        fetchGyms();
        return;
      }
    } catch (err) {
      console.warn('Saving gym to client storage:', err);
    }

    const localGyms = JSON.parse(localStorage.getItem('fitpulse_gyms') || '[]');
    const existingIdx = localGyms.findIndex((g: any) => g.id === newGym.id);
    let updatedGyms;
    if (existingIdx !== -1) {
      localGyms[existingIdx] = newGym;
      updatedGyms = localGyms;
    } else {
      updatedGyms = [...localGyms, newGym];
    }
    localStorage.setItem('fitpulse_gyms', JSON.stringify(updatedGyms));
    setShowModal(false);
    setEditingGym(null);
    setName('');
    setSlug('');
    setLogoUrl('');
    setBannerUrl('');
    setGyms(updatedGyms);
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempPassword = 'coach' + Math.floor(1000 + Math.random() * 9000);

    const newTrainer = {
      id: `usr-${Date.now()}`,
      name: trainerName,
      email: trainerEmail,
      role: 'TRAINER',
      gymId: gyms[0]?.id || 'gym-dutra12',
      inviteCode: `TRN-${trainerName.toUpperCase().replace(/\s+/g, '')}`
    };

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

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setSentEmailModal({
          to: trainerEmail,
          name: trainerName,
          tempPassword,
          accessLink: `${window.location.origin}/login`
        });
        setShowTrainerModal(false);
        setTrainerName('');
        setTrainerEmail('');
        fetchUsersData();
        return;
      }
    } catch (err) {
      console.warn('Saving trainer to client storage:', err);
    }

    const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
    const updatedUsers = [...localUsers, newTrainer];
    localStorage.setItem('fitpulse_users', JSON.stringify(updatedUsers));
    setSentEmailModal({
      to: trainerEmail,
      name: trainerName,
      tempPassword,
      accessLink: `${window.location.origin}/login`
    });
    setShowTrainerModal(false);
    setTrainerName('');
    setTrainerEmail('');
    setTrainers(updatedUsers.filter((u: any) => u.role === 'TRAINER'));
  };

  // Filtered dataset for inspector modals
  const filteredGyms = gyms.filter((g) => {
    const term = inspectorSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return g.name.toLowerCase().includes(term) || g.slug.toLowerCase().includes(term);
  });

  const filteredTrainers = trainers.filter((tr) => {
    const term = inspectorSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return tr.name.toLowerCase().includes(term) || tr.email.toLowerCase().includes(term);
  });

  const filteredStudents = students.filter((st) => {
    const term = inspectorSearchTerm.toLowerCase().trim();
    if (!term) return true;
    const tagMatch = (st.tags || []).some((t: string) => t.toLowerCase().includes(term));
    return st.name.toLowerCase().includes(term) || st.email.toLowerCase().includes(term) || tagMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white border border-purple-900/50 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{t('masterPanelTitle')}</h1>
            <p className="text-xs text-purple-200 font-medium">{t('masterPanelSub')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrainerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold border border-purple-700 flex items-center gap-1.5 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>{t('newTrainer')}</span>
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

      {/* INTERACTIVE METRICS ROW (CLICKABLE BUTTON CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Academias Ativas */}
        <div
          onClick={() => {
            setInspectorSearchTerm('');
            setActiveInspectorModal('gyms');
          }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-purple-600">{t('activeGymsCount')}</span>
            <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Eye className="w-3 h-3" /> {t('clickToInspect')}
            </span>
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{gyms.length}</span>
        </div>

        {/* Metric 2: Treinadores Ativos */}
        <div
          onClick={() => {
            setInspectorSearchTerm('');
            setActiveInspectorModal('trainers');
          }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-blue-600">{t('activeTrainersCount')}</span>
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Eye className="w-3 h-3" /> {t('clickToInspect')}
            </span>
          </div>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400 block">{trainers.length || 4}</span>
        </div>

        {/* Metric 3: Alunos na Plataforma */}
        <div
          onClick={() => {
            setInspectorSearchTerm('');
            setActiveInspectorModal('students');
          }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-400 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-emerald-600">{t('platformStudentsCount')}</span>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Eye className="w-3 h-3" /> {t('clickToInspect')}
            </span>
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">{students.length || 18}</span>
        </div>

      </div>

      {/* Gym List / Whitelabel Management */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>{t('gymsWhitelabelTitle')}</span>
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
                      <Edit2 className="w-3.5 h-3.5" /> {t('editGym')}
                    </button>
                    <button
                      onClick={() => setGym(g)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      {t('simulateTheme')}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{g.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Slug: /{g.slug}</span>
                </div>

                <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">{t('primaryColorLabel')}:</span>
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shadow-sm" style={{ backgroundColor: g.primaryColor }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">{t('secondaryColorLabel')}:</span>
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shadow-sm" style={{ backgroundColor: g.secondaryColor }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DATASET INSPECTOR MODALS (GYMS / TRAINERS / STUDENTS) */}
      {activeInspectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-fade-in">
          <div className="w-full max-w-4xl h-[88vh] max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Modal Sticky Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  {activeInspectorModal === 'gyms' && <Building2 className="w-6 h-6" />}
                  {activeInspectorModal === 'trainers' && <UserCheck className="w-6 h-6" />}
                  {activeInspectorModal === 'students' && <Users className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {activeInspectorModal === 'gyms' && t('gymsInspectorTitle')}
                    {activeInspectorModal === 'trainers' && t('trainersInspectorTitle')}
                    {activeInspectorModal === 'students' && t('studentsInspectorTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Inspeção detalhada de cadastros no sistema</p>
                </div>
              </div>

              <button
                onClick={() => setActiveInspectorModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Search filter bar */}
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={inspectorSearchTerm}
                  onChange={(e) => setInspectorSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou filtro..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* GYMS INSPECTOR VIEW */}
              {activeInspectorModal === 'gyms' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGyms.map((g) => (
                    <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={g.logoUrl} alt={g.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/30" />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                          <span className="text-xs text-slate-500 font-mono">Slug: /{g.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">Cores Whitelabel:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: g.primaryColor }} />
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: g.secondaryColor }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TRAINERS INSPECTOR VIEW */}
              {activeInspectorModal === 'trainers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTrainers.map((tr) => (
                    <div key={tr.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{tr.name}</h4>
                          <span className="text-xs text-slate-500">{tr.email}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase">
                          {t('trainer')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p><strong>{t('assignedGym')}:</strong> DUTRA12 Treinamento Esportivo</p>
                        <p><strong>Código de Convite:</strong> <span className="font-mono text-purple-400">{tr.inviteCode || 'TRN-DUTRA12'}</span></p>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setSentEmailModal({
                              to: tr.email,
                              name: tr.name,
                              tempPassword: 'coach' + Math.floor(1000 + Math.random() * 9000),
                              accessLink: `${window.location.origin}/login`
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> {t('resendInvite')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STUDENTS INSPECTOR VIEW */}
              {activeInspectorModal === 'students' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStudents.map((st) => (
                    <div key={st.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{st.name}</h4>
                          <span className="text-xs text-slate-500">{st.email}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase">
                          {st.status === 'INACTIVE' ? t('inactiveStatus') : t('activeStatus')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1">
                        <p><strong>{t('assignedTrainer')}:</strong> Coach Dutra</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(st.tags || ['Meia Maratona']).map((tg: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Sticky Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex justify-end">
              <button
                onClick={() => setActiveInspectorModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                {t('close')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* New Trainer Email Notification Modal */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>{t('newTrainerModalTitle')}</span>
            </h3>

            <form onSubmit={handleCreateTrainer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('trainerName')}</label>
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('trainerEmail')}</label>
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
                  {t('cancel')}
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
                  <Send className="w-4 h-4" /> {t('registerAndSendEmail')}
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
                <h3 className="font-extrabold text-base text-white">{t('welcomeEmailSentTitle')}</h3>
                <p className="text-xs text-slate-400">{t('welcomeEmailSentSub')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <p><strong>To:</strong> {sentEmailModal.to}</p>
              <p><strong>Subject:</strong> FitPulse — {t('welcomeBack')}</p>
              <hr className="border-slate-800 my-2" />
              <p>Hello <strong>{sentEmailModal.name}</strong>,</p>
              <p>{t('tempPasswordNotice')} <span className="bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-bold">{sentEmailModal.tempPassword}</span></p>
              <p>{t('accessLinkNotice')} <a href={sentEmailModal.accessLink} className="text-blue-400 underline">{sentEmailModal.accessLink}</a></p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSentEmailModal(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold"
              >
                {t('completedBtn')}
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
              <span>{editingGym ? t('editGym') : t('createGym')}</span>
            </h3>

            <form onSubmit={handleSaveGym} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('gymNameLabel')}</label>
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('slugUrlLabel')}</label>
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('logoUrlLabel')}</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('bannerUrlLabel')}</label>
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('primaryColorLabel')}</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer p-1"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('secondaryColorLabel')}</label>
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
