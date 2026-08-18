import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  UserCheck,
  Users,
  Dumbbell,
  Link as LinkIcon,
  QrCode,
  Plus,
  Tag,
  Copy,
  Check,
  PlayCircle,
  FileText,
  DollarSign,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  Save,
  X,
  CreditCard,
  Layers,
  History,
  AlertTriangle,
  Clock,
  Settings,
  ChevronDown,
  ChevronUp,
  UserX,
  UserCheck as UserCheckIcon,
  Download,
  Info,
  TrendingUp,
  Activity,
  HeartPulse
} from 'lucide-react';

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'expiringWorkout' | 'expiringPayment' | 'exercises' | 'pixSettings'>('students');
  
  const [students, setStudents] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [inviteCode] = useState(user?.inviteCode || 'TRN-DUTRA12');
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected Student Management Drawer state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [studentDetailTab, setStudentDetailTab] = useState<'info' | 'payments' | 'trains'>('info');
  const [studentPaymentHistory, setStudentPaymentHistory] = useState<any[]>([]);
  const [studentSchedulesList, setStudentSchedulesList] = useState<any[]>([]);

  // Exercise Form (Create & Edit in Bank)
  const [showExModal, setShowExModal] = useState(false);
  const [editingExId, setEditingExId] = useState<string | null>(null);
  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState('Peitoral');
  const [exMuscle, setExMuscle] = useState('Peitoral / Tríceps');
  const [exInstructions, setExInstructions] = useState('');
  const [exGifUrl, setExGifUrl] = useState('');

  // Custom Tag Modal
  const [newTagInput, setNewTagInput] = useState('');

  // Trainer Default PIX Setup
  const [trainerPixKeyType, setTrainerPixKeyType] = useState<'CPF'|'CNPJ'|'EMAIL'|'PHONE'|'EVP'>('CPF');
  const [trainerPixKey, setTrainerPixKey] = useState('123.456.789-00');

  // Collapsible Workout Plan Editor State
  const [editingScheduleData, setEditingScheduleData] = useState<any | null>(null);
  const [openSegments, setOpenSegments] = useState<Record<string, boolean>>({
    seg1: true, // Info Geral & Preço
    seg2: false, // Matriz Semanal
    seg3: false, // Progressão
    seg4: true, // Rotinas de Força
    seg5: false, // Recuperação
    seg6: false // Calendário
  });

  const [openWorkouts, setOpenWorkouts] = useState<Record<string, boolean>>({});

  const toggleSegment = (key: string) => {
    setOpenSegments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleWorkoutCollapse = (wId: string) => {
    setOpenWorkouts(prev => ({ ...prev, [wId]: !prev[wId] }));
  };

  const fetchStudents = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/trainers/${user.id}/students`);
      if (res.ok) setStudents(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExercises = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/trainers/${user.id}/exercises`);
      if (res.ok) setExercises(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchExercises();
  }, [user]);

  const handleCopyReferral = () => {
    const link = `${window.location.origin}/register?invite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredStudents = students.filter((st) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nameMatch = st.name.toLowerCase().includes(term);
    const emailMatch = st.email.toLowerCase().includes(term);
    const tagMatch = (st.tags || []).some((t: string) => t.toLowerCase().includes(term));
    return nameMatch || emailMatch || tagMatch;
  });

  const handleOpenStudentDetail = async (st: any) => {
    setSelectedStudentDetail(st);
    setStudentDetailTab('info');

    try {
      const resP = await fetch(`/api/students/${st.id}/payments`);
      if (resP.ok) setStudentPaymentHistory(await resP.json());
    } catch (err) {
      console.error(err);
    }

    try {
      const resS = await fetch(`/api/students/${st.id}/schedules`);
      if (resS.ok) setStudentSchedulesList(await resS.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStudentStatus = async () => {
    if (!selectedStudentDetail) return;
    const newStatus = selectedStudentDetail.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      const res = await fetch(`/api/users/${selectedStudentDetail.id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSelectedStudentDetail({ ...selectedStudentDetail, status: newStatus });
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTag = async () => {
    if (!selectedStudentDetail || !newTagInput.trim()) return;
    const currentTags = selectedStudentDetail.tags || [];
    const updatedTags = [...currentTags, newTagInput.trim()];

    try {
      const res = await fetch(`/api/users/${selectedStudentDetail.id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags })
      });
      if (res.ok) {
        setSelectedStudentDetail({ ...selectedStudentDetail, tags: updatedTags });
        setNewTagInput('');
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedStudentDetail) return;
    const updatedTags = (selectedStudentDetail.tags || []).filter((t: string) => t !== tagToRemove);

    try {
      const res = await fetch(`/api/users/${selectedStudentDetail.id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags })
      });
      if (res.ok) {
        setSelectedStudentDetail({ ...selectedStudentDetail, tags: updatedTags });
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaymentAsPaid = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        alert('Pagamento marcado como PAGO! Próximo mês renovado automaticamente.');
        if (selectedStudentDetail) {
          const resP = await fetch(`/api/students/${selectedStudentDetail.id}/payments`);
          if (resP.ok) setStudentPaymentHistory(await resP.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSchedule = (sched: any) => {
    setEditingScheduleData(JSON.parse(JSON.stringify(sched)));
    const initOpen: Record<string, boolean> = {};
    (sched.workouts || []).forEach((w: any, idx: number) => {
      initOpen[w.id || `w-${idx}`] = idx === 0;
    });
    setOpenWorkouts(initOpen);
  };

  const handleCreateNewScheduleForStudent = () => {
    if (!selectedStudentDetail) return;
    const newSched = {
      studentId: selectedStudentDetail.id,
      trainerId: user?.id,
      title: `Novo Ciclo de Treino — ${selectedStudentDetail.name}`,
      objective: 'Hipertrofia & Condicionamento',
      description: 'Prescrição de treino personalizada.',
      expectationNotes: 'Foco na constância.',
      categories: ['Força', 'Hipertrofia'],
      planPrice: 250.00,
      targetEndDate: '2026-09-30',
      paymentDueDate: '2026-09-10',
      weeklyMatrix: [
        { day: 'Segunda', morningSlot: 'Força 1 — Peito & Tríceps (6h)' },
        { day: 'Terça', morningSlot: 'Força 2 — Pernas Pesado (6h)' }
      ],
      progression: [
        { week: 1, dates: '20-26/07', monday: 'Treino A', wednesday: 'Treino B', saturday: 'Descanso', rpe: '7-8' }
      ],
      workouts: [
        {
          id: `w-${Date.now()}`,
          title: 'Força 1 — Peito & Tríceps',
          exercises: [
            { name: 'Supino Reto com Barra', setsReps: '4x8-10', notes: 'Execução controlada', gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Bench-press-1.gif' }
          ]
        }
      ],
      recoveryAdvice: [
        { situation: 'Pós-Treino', recommendation: 'Alimentação adequada e hidratação.' }
      ],
      dailyCalendar: [
        { id: `c-${Date.now()}`, week: 'S1', date: '20/07', dayName: 'Segunda', workoutTitle: 'Força 1', nutritionNote: 'Padrão' }
      ],
      active: true
    };
    setEditingScheduleData(newSched);
    setOpenWorkouts({ [newSched.workouts[0].id]: true });
  };

  const handleSaveScheduleChanges = async () => {
    if (!editingScheduleData || !user) return;
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingScheduleData)
      });
      if (res.ok) {
        alert('Prescrição de treino salva com sucesso!');
        setEditingScheduleData(null);
        if (selectedStudentDetail) {
          const resS = await fetch(`/api/students/${selectedStudentDetail.id}/schedules`);
          if (resS.ok) setStudentSchedulesList(await resS.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoutine = (wIdx: number) => {
    if (!editingScheduleData) return;
    if (!confirm('Deseja realmente excluir esta rotina de treino inteira?')) return;
    const updatedWorkouts = editingScheduleData.workouts.filter((_: any, idx: number) => idx !== wIdx);
    setEditingScheduleData({ ...editingScheduleData, workouts: updatedWorkouts });
  };

  const handleDeleteExerciseFromRoutine = (wIdx: number, exIdx: number) => {
    if (!editingScheduleData) return;
    const updatedWorkouts = [...editingScheduleData.workouts];
    updatedWorkouts[wIdx].exercises = updatedWorkouts[wIdx].exercises.filter((_: any, idx: number) => idx !== exIdx);
    setEditingScheduleData({ ...editingScheduleData, workouts: updatedWorkouts });
  };

  const handleImportExerciseFromBank = (wIdx: number, exIdx: number, bankExId: string) => {
    const foundEx = exercises.find(e => e.id === bankExId);
    if (!foundEx || !editingScheduleData) return;

    const updatedWorkouts = [...editingScheduleData.workouts];
    updatedWorkouts[wIdx].exercises[exIdx] = {
      name: foundEx.name,
      setsReps: '3x10',
      notes: foundEx.instructions || foundEx.muscleGroup,
      gifUrl: foundEx.gifUrl || 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Bench-press-1.gif'
    };
    setEditingScheduleData({ ...editingScheduleData, workouts: updatedWorkouts });
  };

  const handleSaveExerciseToBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: user.id,
          name: exName,
          category: exCategory,
          muscleGroup: exMuscle,
          instructions: exInstructions,
          gifUrl: exGifUrl || 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Bench-press-1.gif'
        })
      });
      if (res.ok) {
        setShowExModal(false);
        setEditingExId(null);
        setExName('');
        setExInstructions('');
        setExGifUrl('');
        fetchExercises();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExerciseBankItem = async (id: string) => {
    if (!confirm('Deseja realmente remover este exercício do banco?')) return;
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExercises();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white border border-blue-900/50 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-300">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Backoffice do Treinador</h1>
            <p className="text-xs text-blue-200 font-medium">FitPulse — Gestão Segmentada de Alunos, Treinos e Cobrança</p>
          </div>
        </div>

        <button
          onClick={handleCopyReferral}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
        >
          {copiedLink ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          <span>{copiedLink ? t('copied') : 'Copiar Link de Indicação'}</span>
        </button>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeSubTab === 'students' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Todos os Alunos ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expiringWorkout')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeSubTab === 'expiringWorkout' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>Treinos Próximos do Vencimento (1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expiringPayment')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeSubTab === 'expiringPayment' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-rose-300" />
          <span>Pagamentos Próximos do Vencimento (1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exercises')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeSubTab === 'exercises' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Banco de Exercícios ({exercises.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pixSettings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeSubTab === 'pixSettings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Perfil PIX</span>
        </button>
      </div>

      {/* SUB TAB 1: TODOS OS ALUNOS */}
      {activeSubTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar aluno por Nome, E-mail ou Categoria..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Exibindo <strong>{filteredStudents.length}</strong> de {students.length} alunos
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                onClick={() => handleOpenStudentDetail(st)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600">{st.name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{st.email}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    st.status === 'INACTIVE'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {st.status === 'INACTIVE' ? 'Inativo' : 'Ativo'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(st.tags || []).map((tg: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
                      {tg}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: TREINOS PRÓXIMOS DO VENCIMENTO */}
      {activeSubTab === 'expiringWorkout' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Treinos Próximos do Vencimento</h3>
                <p className="text-slate-600 dark:text-slate-400">Estes alunos precisam de uma nova prescrição de treino em breve</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.slice(0, 1).map((st) => (
              <div
                key={st.id}
                onClick={() => handleOpenStudentDetail(st)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-amber-300 dark:border-amber-800/80 space-y-3 shadow-sm hover:border-amber-500 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{st.name}</h3>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Treino Vence em 18 dias (06/09/2026)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
                    Refresh Necessário
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ciclo Atual: Meia Maratona & Hipertrofia</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: PAGAMENTOS PRÓXIMOS DO VENCIMENTO */}
      {activeSubTab === 'expiringPayment' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Pagamentos Próximos do Vencimento / Pendentes</h3>
                <p className="text-slate-600 dark:text-slate-400">Alunos com mensalidades vencidas ou com vencimento próximo</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.slice(0, 1).map((st) => (
              <div
                key={st.id}
                onClick={() => handleOpenStudentDetail(st)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-rose-300 dark:border-rose-800/80 space-y-3 shadow-sm hover:border-rose-500 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{st.name}</h3>
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">Mensalidade Vencida: R$ 250,00 (Vencimento: 10/09/2026)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase">
                    Pendente
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: BANCO DE EXERCÍCIOS */}
      {activeSubTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Banco de Exercícios com GIF</h2>
            <button
              onClick={() => {
                setEditingExId(null);
                setExName('');
                setExInstructions('');
                setExGifUrl('');
                setShowExModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Cadastrar Exercício
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <div key={ex.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <div className="h-40 rounded-xl bg-slate-950 overflow-hidden relative border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  {ex.gifUrl ? (
                    <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" />
                  ) : (
                    <PlayCircle className="w-10 h-10 text-slate-600" />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-blue-400 border border-slate-800 shadow">
                    {ex.category}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{ex.name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{ex.muscleGroup}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingExId(ex.id);
                        setExName(ex.name);
                        setExCategory(ex.category);
                        setExMuscle(ex.muscleGroup);
                        setExInstructions(ex.instructions);
                        setExGifUrl(ex.gifUrl);
                        setShowExModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExerciseBankItem(ex.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 5: PERFIL PIX DO TREINADOR */}
      {activeSubTab === 'pixSettings' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm max-w-xl mx-auto">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Perfil de Cobrança PIX do Treinador</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure sua Chave PIX padrão enviada aos alunos</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tipo de Chave PIX</label>
              <select
                value={trainerPixKeyType}
                onChange={(e) => setTrainerPixKeyType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">E-mail</option>
                <option value="PHONE">Telefone</option>
                <option value="EVP">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Chave PIX</label>
              <input
                type="text"
                value={trainerPixKey}
                onChange={(e) => setTrainerPixKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => alert('Configurações de PIX salvas no perfil!')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar Perfil PIX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED STUDENT DETAIL DRAWER / MODAL WITH STICKY NON-SCROLLING HEADER & FOOTER */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
          <div className="w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Sticky Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedStudentDetail.name}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{selectedStudentDetail.email}</span>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Fechar (X)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* Student Detail Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
                <button
                  onClick={() => setStudentDetailTab('info')}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 ${
                    studentDetailTab === 'info' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Info className="w-4 h-4" /> Informações & Status
                </button>

                <button
                  onClick={() => setStudentDetailTab('payments')}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 ${
                    studentDetailTab === 'payments' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Pagamentos & PIX
                </button>

                <button
                  onClick={() => setStudentDetailTab('trains')}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 ${
                    studentDetailTab === 'trains' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Dumbbell className="w-4 h-4" /> Prescrições & Treinos ({studentSchedulesList.length})
                </button>
              </div>

              {/* TAB 1: INFO & STATUS */}
              {studentDetailTab === 'info' && (
                <div className="space-y-6 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Status do Cadastro:</span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {selectedStudentDetail.status === 'INACTIVE' ? 'Inativo / Pausado' : 'Ativo'}
                      </h4>
                    </div>
                    <button
                      onClick={handleToggleStudentStatus}
                      className={`px-4 py-2 rounded-xl font-extrabold flex items-center gap-1.5 text-xs ${
                        selectedStudentDetail.status === 'INACTIVE'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {selectedStudentDetail.status === 'INACTIVE' ? <UserCheckIcon className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      <span>{selectedStudentDetail.status === 'INACTIVE' ? 'Reativar Aluno' : 'Inativar Aluno'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-blue-500" /> Categorias / Tags do Aluno:
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {(selectedStudentDetail.tags || []).map((tg: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                          {tg}
                          <button onClick={() => handleRemoveTag(tg)} className="hover:text-rose-500 ml-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="Adicionar nova tag..."
                        className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs w-64"
                      />
                      <button onClick={handleAddTag} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold">
                        Adicionar Tag
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PAYMENTS & PIX */}
              {studentDetailTab === 'payments' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white">Mensalidades & Status PIX</h4>
                  
                  {studentPaymentHistory.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-black text-sm text-slate-900 dark:text-white block">R$ {p.amount.toFixed(2)}</span>
                        <span className="text-slate-500">Vencimento da Mensalidade: {p.dueDate}</span>
                      </div>

                      {p.status === 'PAID' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                          PAGO ({p.paidAt ? new Date(p.paidAt).toLocaleDateString('pt-BR') : ''})
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkPaymentAsPaid(p.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Marcar como PAGO
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: PRESCRIÇÕES & TREINOS */}
              {studentDetailTab === 'trains' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white">Lista de Treinos do Aluno</h4>
                    <button
                      onClick={handleCreateNewScheduleForStudent}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" /> Criar Novo Treino
                    </button>
                  </div>

                  <div className="space-y-3">
                    {studentSchedulesList.map((sched) => (
                      <div key={sched.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{sched.title}</h5>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sched.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {sched.active ? 'Ativo' : 'Histórico'}
                            </span>
                          </div>
                          <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                            {sched.objective} • R$ {sched.planPrice || 250.00} • Vencimento do Treino: {sched.targetEndDate || '06/09/2026'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleEditSchedule(sched)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow"
                        >
                          <Edit2 className="w-4 h-4" /> Editar Treino
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Footer */}
            <div className="p-4 sm:p-5 flex items-center justify-end border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* COLLAPSIBLE SEGMENTED WORKOUT PLAN EDITOR WITH STICKY HEADER & FOOTER */}
      {editingScheduleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
          <div className="w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Sticky Header with Close (X) button */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Edição de Treino — {editingScheduleData.title}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Edite as seções de treino de forma expansível (Atualiza o treino sem duplicar)</p>
              </div>

              <button
                onClick={() => setEditingScheduleData(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Fechar sem salvar (X)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* SEGMENT 1: UNCrowded CLEAN LAYOUT FOR GENERAL INFO, DUAL DUE DATES & PRICING */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSegment('seg1')}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-between text-xs font-black text-slate-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" /> Segmento 1: Info Geral, Preço & Datas de Vencimento
                  </span>
                  {openSegments.seg1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {openSegments.seg1 && (
                  <div className="p-5 space-y-4 text-xs bg-white dark:bg-slate-900">
                    
                    {/* Row 1: Title & Main Objective */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Título do Programa</label>
                        <input
                          type="text"
                          value={editingScheduleData.title || ''}
                          onChange={(e) => setEditingScheduleData({ ...editingScheduleData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Objetivo Principal</label>
                        <input
                          type="text"
                          value={editingScheduleData.objective || ''}
                          onChange={(e) => setEditingScheduleData({ ...editingScheduleData, objective: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    {/* Row 2: Target Date, Payment Due Date, Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-amber-600 dark:text-amber-400 mb-1.5">Vencimento do Treino (Target Date)</label>
                        <input
                          type="date"
                          value={editingScheduleData.targetEndDate || '2026-09-06'}
                          onChange={(e) => setEditingScheduleData({ ...editingScheduleData, targetEndDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-rose-600 dark:text-rose-400 mb-1.5">Vencimento da Mensalidade (PIX)</label>
                        <input
                          type="date"
                          value={editingScheduleData.paymentDueDate || '2026-09-10'}
                          onChange={(e) => setEditingScheduleData({ ...editingScheduleData, paymentDueDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">Preço do Treino (R$)</label>
                        <input
                          type="number"
                          value={editingScheduleData.planPrice || 250.00}
                          onChange={(e) => setEditingScheduleData({ ...editingScheduleData, planPrice: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>

                    {/* Row 3: Description & Rationale */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Descrição & Racional de Treino</label>
                      <textarea
                        rows={2}
                        value={editingScheduleData.description || ''}
                        onChange={(e) => setEditingScheduleData({ ...editingScheduleData, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                    </div>

                  </div>
                )}
              </div>

              {/* SEGMENT 2: MATRIZ SEMANAL */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSegment('seg2')}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-between text-xs font-black text-slate-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" /> Segmento 2: Matriz Semanal ("Sua Semana")
                  </span>
                  {openSegments.seg2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {openSegments.seg2 && (
                  <div className="p-4 space-y-2 text-xs bg-white dark:bg-slate-900">
                    {editingScheduleData.weeklyMatrix?.map((m: any, mIdx: number) => (
                      <div key={mIdx} className="grid grid-cols-3 gap-2 items-center">
                        <span className="font-bold text-slate-900 dark:text-white">{m.day}</span>
                        <input
                          type="text"
                          value={m.morningSlot || ''}
                          placeholder="Manhã"
                          onChange={(e) => {
                            const updated = [...editingScheduleData.weeklyMatrix];
                            updated[mIdx].morningSlot = e.target.value;
                            setEditingScheduleData({ ...editingScheduleData, weeklyMatrix: updated });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                        />
                        <input
                          type="text"
                          value={m.eveningSlot || ''}
                          placeholder="Noite"
                          onChange={(e) => {
                            const updated = [...editingScheduleData.weeklyMatrix];
                            updated[mIdx].eveningSlot = e.target.value;
                            setEditingScheduleData({ ...editingScheduleData, weeklyMatrix: updated });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEGMENT 4: ROTINAS DE FORÇA DIÁRIAS (COLLAPSIBLE + DELETE) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSegment('seg4')}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-between text-xs font-black text-slate-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" /> Segmento 4: Rotinas de Força Diárias (Colapsáveis & Exclusão)
                  </span>
                  {openSegments.seg4 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {openSegments.seg4 && (
                  <div className="p-4 space-y-4 text-xs bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Rotinas de Força ({editingScheduleData.workouts?.length || 0})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = `w-${Date.now()}`;
                          const newWorkout = {
                            id: newId,
                            title: `Força ${editingScheduleData.workouts.length + 1} — Novo Treino`,
                            exercises: [{ name: 'Novo Exercício', setsReps: '3x10', notes: '' }]
                          };
                          setEditingScheduleData({
                            ...editingScheduleData,
                            workouts: [...editingScheduleData.workouts, newWorkout]
                          });
                          setOpenWorkouts({ ...openWorkouts, [newId]: true });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow"
                      >
                        + Adicionar Rotina
                      </button>
                    </div>

                    {editingScheduleData.workouts?.map((w: any, wIdx: number) => {
                      const wKey = w.id || `w-${wIdx}`;
                      const isWOpen = !!openWorkouts[wKey];

                      return (
                        <div key={wKey} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                          
                          <div className="p-3 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
                            <div
                              onClick={() => toggleWorkoutCollapse(wKey)}
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              {isWOpen ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
                              <input
                                type="text"
                                value={w.title}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const updated = [...editingScheduleData.workouts];
                                  updated[wIdx].title = e.target.value;
                                  setEditingScheduleData({ ...editingScheduleData, workouts: updated });
                                }}
                                className="font-extrabold text-xs bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white w-full max-w-md"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteRoutine(wIdx)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1 border border-rose-200 dark:border-rose-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir Rotina
                            </button>
                          </div>

                          {isWOpen && (
                            <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                              {w.exercises?.map((ex: any, exIdx: number) => (
                                <div key={exIdx} className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                  
                                  <div className="flex items-center justify-between bg-blue-50/60 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-200 dark:border-blue-800/60">
                                    <span className="font-bold text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                      <Download className="w-3.5 h-3.5" /> Importar do Banco:
                                    </span>
                                    <select
                                      onChange={(e) => handleImportExerciseFromBank(wIdx, exIdx, e.target.value)}
                                      defaultValue=""
                                      className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-[11px]"
                                    >
                                      <option value="" disabled>-- Selecionar Exercício Cadastrado --</option>
                                      {exercises.map((bEx) => (
                                        <option key={bEx.id} value={bEx.id}>
                                          {bEx.name} ({bEx.category})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                                    <input
                                      type="text"
                                      value={ex.name}
                                      placeholder="Nome do Exercício"
                                      onChange={(e) => {
                                        const updated = [...editingScheduleData.workouts];
                                        updated[wIdx].exercises[exIdx].name = e.target.value;
                                        setEditingScheduleData({ ...editingScheduleData, workouts: updated });
                                      }}
                                      className="font-bold px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:col-span-1"
                                    />

                                    <input
                                      type="text"
                                      value={ex.setsReps}
                                      placeholder="Séries x Repet"
                                      onChange={(e) => {
                                        const updated = [...editingScheduleData.workouts];
                                        updated[wIdx].exercises[exIdx].setsReps = e.target.value;
                                        setEditingScheduleData({ ...editingScheduleData, workouts: updated });
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                    />

                                    <input
                                      type="text"
                                      value={ex.notes || ''}
                                      placeholder="Instruções / Obs"
                                      onChange={(e) => {
                                        const updated = [...editingScheduleData.workouts];
                                        updated[wIdx].exercises[exIdx].notes = e.target.value;
                                        setEditingScheduleData({ ...editingScheduleData, workouts: updated });
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                    />

                                    <input
                                      type="text"
                                      value={ex.gifUrl || ''}
                                      placeholder="URL do GIF"
                                      onChange={(e) => {
                                        const updated = [...editingScheduleData.workouts];
                                        updated[wIdx].exercises[exIdx].gifUrl = e.target.value;
                                        setEditingScheduleData({ ...editingScheduleData, workouts: updated });
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                    />

                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteExerciseFromRoutine(wIdx, exIdx)}
                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold text-xs flex items-center gap-1"
                                      >
                                        <X className="w-4 h-4" /> Excluir
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...editingScheduleData.workouts];
                                  updated[wIdx].exercises.push({ name: 'Novo Exercício', setsReps: '3x10', notes: '' });
                                  setEditingScheduleData({ ...editingScheduleData, workouts: updated });
                                }}
                                className="text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:underline block pt-1"
                              >
                                + Adicionar Exercício nesta Rotina
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Sticky Footer with Save & Cancel Buttons (ALWAYS VISIBLE WITHOUT SCROLLING) */}
            <div className="p-4 sm:p-5 flex items-center justify-end border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10 gap-3">
              <button
                type="button"
                onClick={() => setEditingScheduleData(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveScheduleChanges}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar Prescrição Completa
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Create / Edit Exercise Modal (Exercise Bank) */}
      {showExModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingExId ? 'Editar Exercício' : 'Cadastrar Exercício no Banco com GIF'}
            </h3>
            <form onSubmit={handleSaveExerciseToBank} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome do Exercício</label>
                <input
                  type="text"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  required
                  placeholder="Ex: Supino Reto com Barra"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Categoria</label>
                <input
                  type="text"
                  value={exCategory}
                  onChange={(e) => setExCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Grupo Muscular / Instruções</label>
                <input
                  type="text"
                  value={exMuscle}
                  onChange={(e) => setExMuscle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">URL do GIF de Demonstração</label>
                <input
                  type="text"
                  value={exGifUrl}
                  onChange={(e) => setExGifUrl(e.target.value)}
                  placeholder="https://upload.wikimedia.org/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowExModal(false)} className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
