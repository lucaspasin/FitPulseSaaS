import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { ScheduleViewer } from '../components/ScheduleViewer.js';
import { PixPaymentWidget } from '../components/PixPaymentWidget.js';
import { Dumbbell, History, QrCode, Sparkles, Archive, AlertOctagon, Lock } from 'lucide-react';

export const StudentApp: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'payment'>('schedule');
  const [schedule, setSchedule] = useState<any | null>(null);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveSchedule = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/students/${user.id}/schedules/active`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setSchedule(await res.json());
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Using client-side active schedule fallback:', err);
    }

    const localSchedulesRaw = localStorage.getItem('fitpulse_schedules');
    if (localSchedulesRaw) {
      const parsed = JSON.parse(localSchedulesRaw);
      const active = parsed.find((s: any) => (s.studentId === user.id || user.role === 'STUDENT') && s.active) || parsed[0];
      setSchedule(active || null);
    }
    setLoading(false);
  };

  const fetchAllSchedules = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/students/${user.id}/schedules`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setAllSchedules(await res.json());
        return;
      }
    } catch (err) {
      console.warn('Using client-side schedules fallback:', err);
    }

    const localSchedulesRaw = localStorage.getItem('fitpulse_schedules');
    if (localSchedulesRaw) {
      setAllSchedules(JSON.parse(localSchedulesRaw));
    }
  };

  const fetchPayments = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/students/${user.id}/payments`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setPayments(await res.json());
        return;
      }
    } catch (err) {
      console.warn('Using client-side payments fallback:', err);
    }

    const localPaymentsRaw = localStorage.getItem('fitpulse_payments');
    if (localPaymentsRaw) {
      setPayments(JSON.parse(localPaymentsRaw));
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/students/${user.id}/execution-logs`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setHistoryLogs(await res.json());
        return;
      }
    } catch (err) {
      console.warn('Using client-side history fallback:', err);
    }

    const localLogsRaw = localStorage.getItem('fitpulse_execution_logs');
    if (localLogsRaw) {
      setHistoryLogs(JSON.parse(localLogsRaw));
    }
  };

  useEffect(() => {
    fetchActiveSchedule();
    fetchAllSchedules();
    fetchPayments();
    fetchHistory();
  }, [user]);

  const handleLogWorkout = async (workoutTitle: string, completedExercises: string[]) => {
    if (!user || !schedule) return;
    const newLog = {
      id: `log-${Date.now()}`,
      scheduleId: schedule.id,
      studentId: user.id,
      workoutTitle,
      completedExercises,
      completedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/schedules/execution-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        fetchHistory();
        return;
      }
    } catch (err) {
      console.warn('Saving execution log to client-side storage:', err);
    }

    const existingLogs = JSON.parse(localStorage.getItem('fitpulse_execution_logs') || '[]');
    const updated = [newLog, ...existingLogs];
    localStorage.setItem('fitpulse_execution_logs', JSON.stringify(updated));
    setHistoryLogs(updated);
  };

  const currentPayment = payments[0] || {
    pixKey: '123.456.789-00',
    pixKeyType: 'CPF',
    amount: 250.00,
    dueDate: '2026-09-10',
    status: 'PENDING'
  };

  // Count unpaid payments (PENDING or OVERDUE)
  const unpaidCount = payments.filter(p => p.status !== 'PAID').length;
  const isAccessBlocked = unpaidCount > 2;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in pb-24 sm:pb-12">
      
      {/* ACCESS BLOCKED WARNING SCREEN IF UNPAID > 2 */}
      {isAccessBlocked ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/90 text-white border border-rose-800 shadow-2xl space-y-6 animate-pulse-subtle">
          <div className="flex items-center gap-3 text-rose-400">
            <Lock className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="text-xl font-black">{t('accessBlockedTitle')}</h2>
              <p className="text-xs text-rose-200">{t('accessBlockedSub').replace('{0}', String(unpaidCount))}</p>
            </div>
          </div>

          <PixPaymentWidget
            pixKey={currentPayment.pixKey}
            pixKeyType={currentPayment.pixKeyType}
            monthlyFee={currentPayment.amount}
            dueDate={currentPayment.dueDate}
            status={currentPayment.status}
          />
        </div>
      ) : (
        <>
          {/* Mobile Navigation Bar */}
          <div className="flex items-center justify-around bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl backdrop-blur-md sticky top-20 z-30">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>{t('activeSchedule')}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t('history')}</span>
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'payment'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{t('payment')}</span>
            </button>
          </div>

          {/* Historical Schedule Selector */}
          {allSchedules.length > 1 && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('viewPreviousWorkouts')}</span>
              </span>

              <select
                onChange={(e) => {
                  const selected = allSchedules.find(s => s.id === e.target.value);
                  if (selected) setSchedule(selected);
                }}
                value={schedule?.id || ''}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              >
                {allSchedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.active ? t('activeStatus') : t('history')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* TAB 1: ACTIVE OR SELECTED SCHEDULE */}
          {activeTab === 'schedule' && (
            schedule ? (
              <ScheduleViewer schedule={schedule} onLogWorkout={handleLogWorkout} />
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('noActiveSchedule')}</p>
              </div>
            )
          )}

          {/* TAB 2: WORKOUT HISTORY LOGS */}
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{t('history')}</span>
              </h3>

              {historyLogs.length > 0 ? (
                <div className="space-y-3">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{log.workoutTitle}</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(log.completedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>{t('exercises')}:</strong> {log.completedExercises.join(', ') || 'All'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  Nenhum treino registrado no histórico ainda.
                </p>
              )}
            </div>
          )}

          {/* TAB 3: PIX PAYMENT WIDGET */}
          {activeTab === 'payment' && (
            <PixPaymentWidget
              pixKey={currentPayment.pixKey}
              pixKeyType={currentPayment.pixKeyType}
              monthlyFee={currentPayment.amount}
              dueDate={currentPayment.dueDate}
              status={currentPayment.status}
            />
          )}
        </>
      )}

    </div>
  );
};
