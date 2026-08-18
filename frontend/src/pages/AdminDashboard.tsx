import React, { useState, useEffect } from 'react';
import { useAuth, Gym, User } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Building2,
  Users,
  UserCheck,
  Plus,
  Palette,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Zap,
  Activity,
  Search,
  ExternalLink,
  Edit,
  Mail,
  Copy,
  Check,
  X,
  CheckCircle,
  Eye,
  Settings
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { setGym, user, updateUserGymAffiliation } = useAuth();
  const { t } = useLanguage();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  // Modal State for Gym creation/editing
  const [showModal, setShowModal] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0f172a');
  const [secondaryColor, setSecondaryColor] = useState('#2563eb');

  // Modal State for Trainer creation
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [newTrainerGymId, setNewTrainerGymId] = useState('');
  const [sentEmailModal, setSentEmailModal] = useState<{ to: string; pass: string } | null>(null);

  // Inspector Modal State (Dataset Explorer)
  const [activeInspectorModal, setActiveInspectorModal] = useState<'gyms' | 'trainers' | 'students' | null>(null);
  const [inspectorSearchTerm, setInspectorSearchTerm] = useState('');

  const fetchGyms = async () => {
    try {
      const res = await fetch('/api/gyms');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setGyms(await res.json());
        return;
      }
    } catch (err) {
      console.warn('Using client-side gyms fallback:', err);
    }

    const localGyms = JSON.parse(localStorage.getItem('fitpulse_gyms') || '[]');
    setGyms(localGyms);
  };

  const fetchTrainersAndStudents = async () => {
    const localUsers: User[] = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
    
    // Default mocks if not in local
    const mockTrainers: User[] = [
      {
        id: 'usr-trainer-dutra',
        email: 'treinador@dutra12.com',
        name: 'Coach Dutra',
        role: 'TRAINER',
        gymId: 'gym-dutra12',
        inviteCode: 'TRN-DUTRA12'
      }
    ];

    const mockStudents: User[] = [
      {
        id: 'usr-student-lucas',
        email: 'lucas@pasin.com',
        name: 'Lucas Pasin',
        role: 'STUDENT',
        gymId: 'gym-dutra12',
        trainerId: 'usr-trainer-dutra',
        tags: ['Meia Maratona', 'Foco Bíceps', 'Avançado']
      }
    ];

    const combined = [...localUsers];
    mockTrainers.forEach(mt => {
      if (!combined.some(u => u.id === mt.id || u.email === mt.email)) combined.push(mt);
    });
    mockStudents.forEach(ms => {
      if (!combined.some(u => u.id === ms.id || u.email === ms.email)) combined.push(ms);
    });

    setTrainers(combined.filter(u => u.role === 'TRAINER'));
    setStudents(combined.filter(u => u.role === 'STUDENT'));
  };

  useEffect(() => {
    fetchGyms();
    fetchTrainersAndStudents();
  }, [user]);

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
    const assignedGymId = newTrainerGymId || undefined;

    const newTrainer: User = {
      id: `usr-${Date.now()}`,
      name: trainerName,
      email: trainerEmail,
      role: 'TRAINER',
      gymId: assignedGymId,
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
          gymId: assignedGymId
        })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setSentEmailModal({
          to: trainerEmail,
          pass: tempPassword
        });
        setShowTrainerModal(false);
        setTrainerName('');
        setTrainerEmail('');
        setNewTrainerGymId('');
        fetchTrainersAndStudents();
        return;
      }
    } catch (err) {
      console.warn('Saving trainer to client storage:', err);
    }

    const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
    localStorage.setItem('fitpulse_users', JSON.stringify([...localUsers, newTrainer]));
    setSentEmailModal({
      to: trainerEmail,
      pass: tempPassword
    });
    setShowTrainerModal(false);
    setTrainerName('');
    setTrainerEmail('');
    setNewTrainerGymId('');
    fetchTrainersAndStudents();
  };

  const handleEditGymClick = (g: Gym) => {
    setEditingGym(g);
    setName(g.name);
    setSlug(g.slug);
    setLogoUrl(g.logoUrl);
    setBannerUrl(g.bannerUrl);
    setPrimaryColor(g.primaryColor || '#0f172a');
    setSecondaryColor(g.secondaryColor || '#2563eb');
    setShowModal(true);
  };

  const handleChangeTrainerGym = (trainerId: string, gymIdValue: string) => {
    const updatedGymId = gymIdValue || undefined;
    updateUserGymAffiliation(trainerId, updatedGymId);
    fetchTrainersAndStudents();
  };

  const filteredGymsInspector = gyms.filter(g => {
    const term = inspectorSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return g.name.toLowerCase().includes(term) || g.slug.toLowerCase().includes(term);
  });

  const filteredTrainersInspector = trainers.filter(tr => {
    const term = inspectorSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return tr.name.toLowerCase().includes(term) || tr.email.toLowerCase().includes(term);
  });

  const filteredStudentsInspector = students.filter(st => {
    const term = inspectorSearchTerm.toLowerCase().trim();
    if (!term) return true;
    const nameMatch = st.name.toLowerCase().includes(term);
    const emailMatch = st.email.toLowerCase().includes(term);
    const tagMatch = (st.tags || []).some(t => t.toLowerCase().includes(term));
    return nameMatch || emailMatch || tagMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header & Main Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white border border-purple-900/40 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
              Master Admin Backoffice
            </span>
            <span className="text-xs text-slate-400">PO / Product Owner View</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t('adminDashboardTitle')}</h1>
          <p className="text-xs text-slate-300 max-w-xl">{t('adminDashboardSub')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingGym(null);
              setName('');
              setSlug('');
              setLogoUrl('');
              setBannerUrl('');
              setPrimaryColor('#0f172a');
              setSecondaryColor('#2563eb');
              setShowModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> {t('createGymBtn')}
          </button>

          <button
            onClick={() => {
              setNewTrainerGymId('');
              setShowTrainerModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <UserCheck className="w-4 h-4" /> {t('createTrainerBtn')}
          </button>
        </div>
      </div>

      {/* METRIC CARDS (INTERACTIVE DATASET INSPECTORS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active Gyms */}
        <button
          onClick={() => {
            setInspectorSearchTerm('');
            setActiveInspectorModal('gyms');
          }}
          className="text-left p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-purple-500 dark:hover:border-purple-400 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {t('clickToInspect')}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t('activeGymsCount')}</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{gyms.length}</div>
          </div>
        </button>

        {/* Card 2: Active Trainers */}
        <button
          onClick={() => {
            setInspectorSearchTerm('');
            setActiveInspectorModal('trainers');
          }}
          className="text-left p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {t('clickToInspect')}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t('activeTrainersCount')}</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{trainers.length}</div>
          </div>
        </button>

        {/* Card 3: Platform Students */}
        <button
          onClick={() => {
            setInspectorSearchTerm('');
            setActiveInspectorModal('students');
          }}
          className="text-left p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-400 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {t('clickToInspect')}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t('totalStudentsCount')}</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{students.length}</div>
          </div>
        </button>

      </div>

      {/* WHITELABEL TENANTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Tenants e Academias Whitelabel Cadastradas</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gyms.map((g) => (
            <div
              key={g.id}
              className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all space-y-4 p-5"
            >
              <div className="h-32 rounded-2xl bg-slate-950 overflow-hidden relative border border-slate-200 dark:border-slate-800">
                <img src={g.bannerUrl} alt={g.name} className="w-full h-full object-cover opacity-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <img src={g.logoUrl} alt={g.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/50" />
                    <div>
                      <h3 className="font-extrabold text-base text-white leading-tight">{g.name}</h3>
                      <span className="text-[10px] text-purple-300 font-mono">slug: /{g.slug}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: g.primaryColor }} title="Primary" />
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: g.secondaryColor }} title="Secondary" />
                  <span className="text-[11px] text-slate-500 font-mono">{g.primaryColor}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGym(g)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800 transition-colors"
                  >
                    Simular Tema
                  </button>

                  <button
                    onClick={() => handleEditGymClick(g)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DATASET INSPECTOR MODALS */}
      {activeInspectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {activeInspectorModal === 'gyms' && <Building2 className="w-5 h-5 text-purple-500" />}
                {activeInspectorModal === 'trainers' && <UserCheck className="w-5 h-5 text-blue-500" />}
                {activeInspectorModal === 'students' && <Users className="w-5 h-5 text-emerald-500" />}
                <span>
                  {activeInspectorModal === 'gyms' && `${t('gymsInspectorModalTitle')} (${gyms.length})`}
                  {activeInspectorModal === 'trainers' && `${t('trainersInspectorModalTitle')} (${trainers.length})`}
                  {activeInspectorModal === 'students' && `${t('studentsInspectorModalTitle')} (${students.length})`}
                </span>
              </h3>
              <button
                onClick={() => setActiveInspectorModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={inspectorSearchTerm}
                  onChange={(e) => setInspectorSearchTerm(e.target.value)}
                  placeholder={t('searchPlaceholderInspector')}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              
              {/* Gyms List */}
              {activeInspectorModal === 'gyms' && filteredGymsInspector.map((g) => (
                <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={g.logoUrl} alt={g.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                      <span className="text-[11px] text-purple-500 font-mono">/{g.slug}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveInspectorModal(null);
                      handleEditGymClick(g);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                  >
                    Editar
                  </button>
                </div>
              ))}

              {/* Trainers List WITH GYM RE-ASSIGNMENT SELECTOR */}
              {activeInspectorModal === 'trainers' && filteredTrainersInspector.map((tr) => (
                <div key={tr.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{tr.name}</h4>
                    <span className="text-xs text-slate-500 block">{tr.email}</span>
                    <span className="text-[10px] font-mono text-blue-500 font-bold block mt-0.5">Convite: {tr.inviteCode || 'TRN-DUTRA12'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={tr.gymId || ''}
                      onChange={(e) => handleChangeTrainerGym(tr.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      <option value="">Independente (Sem Academia)</option>
                      {gyms.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => alert(`Convite de e-mail reenviado para ${tr.email}`)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                    >
                      Reenviar Convite
                    </button>
                  </div>
                </div>
              ))}

              {/* Students List */}
              {activeInspectorModal === 'students' && filteredStudentsInspector.map((st) => (
                <div key={st.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{st.name}</h4>
                    <span className="text-xs text-slate-500 block">{st.email}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(st.tags || []).map((tg, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    Ativo
                  </span>
                </div>
              ))}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveInspectorModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT GYM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingGym ? 'Editar Tenant Whitelabel' : 'Novo Tenant Whitelabel'}
            </h3>

            <form onSubmit={handleSaveGym} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome da Academia</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Velocity Gym"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Slug de Acesso</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="velocity"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">URL da Logomarca</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">URL da Imagem Banner</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cor Primária</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-9 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cor Secundária</label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full h-9 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold shadow"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TRAINER MODAL WITH GYM SELECTION DROPDOWN */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              <span>Cadastrar Novo Treinador</span>
            </h3>

            <form onSubmit={handleCreateTrainer} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome Completo do Treinador</label>
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
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  value={trainerEmail}
                  onChange={(e) => setTrainerEmail(e.target.value)}
                  required
                  placeholder="rafael@treinamento.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Vinculação de Academia / Tenant</label>
                <select
                  value={newTrainerGymId}
                  onChange={(e) => setNewTrainerGymId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="">Independente (Coach Avulso / Sem Academia)</option>
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrainerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SENT EMAIL MODAL (SIMULATED CONVITE) */}
      {sentEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-2xl text-center">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Convite Enviado com Sucesso!</h3>
            <p className="text-slate-500">
              As instruções e senha provisória foram enviadas para <strong>{sentEmailModal.to}</strong>.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-1 font-mono text-[11px]">
              <div>E-mail: {sentEmailModal.to}</div>
              <div>Senha Provisória: {sentEmailModal.pass}</div>
            </div>
            <button
              onClick={() => setSentEmailModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow"
            >
              Concluído
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
