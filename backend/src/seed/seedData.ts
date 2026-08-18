import { Gym, User, Exercise, Schedule, PaymentConfig, StudentPayment } from '../domain/types.js';

export const SEED_GYMS: Gym[] = [
  {
    id: 'gym-dutra12',
    name: 'DUTRA12 Treinamento Esportivo',
    slug: 'dutra12',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    primaryColor: '#0f172a',
    secondaryColor: '#2563eb',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gym-ironfit',
    name: 'IronFit Performance Gym',
    slug: 'ironfit',
    logoUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    primaryColor: '#18181b',
    secondaryColor: '#ef4444',
    createdAt: new Date().toISOString()
  }
];

export const SEED_USERS: User[] = [
  {
    id: 'usr-admin',
    email: 'admin@fitpulse.com',
    passwordHash: 'admin123',
    name: 'Dev System Admin (PO)',
    role: 'ADMIN',
    gymId: 'gym-dutra12',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-trainer-dutra',
    email: 'treinador@dutra12.com',
    passwordHash: 'trainer123',
    name: 'Coach Dutra',
    role: 'TRAINER',
    gymId: 'gym-dutra12',
    inviteCode: 'TRN-DUTRA12',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-trainer-lucas',
    email: 'coach.lucas@fitpulse.com',
    passwordHash: 'trainer123',
    name: 'Coach Lucas',
    role: 'TRAINER',
    gymId: 'gym-ironfit',
    inviteCode: 'TRN-LUCASPASIN',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-student-lucas',
    email: 'lucas@pasin.com',
    passwordHash: 'student123',
    name: 'Lucas Pasin',
    role: 'STUDENT',
    gymId: 'gym-dutra12',
    trainerId: 'usr-trainer-dutra',
    tags: ['Meia Maratona', 'Foco Bíceps', 'Avançado'],
    createdAt: new Date().toISOString()
  }
];

export const SEED_EXERCISES: Exercise[] = [
  {
    id: 'ex-supino-reto',
    trainerId: 'usr-trainer-dutra',
    name: 'Supino Reto com Barra',
    category: 'Peitoral',
    muscleGroup: 'Peitoral / Tríceps',
    instructions: 'Mantenha as escápulas retraídas, pés firmes no chão e desça a barra até a linha do esterno.',
    gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Bench-press-1.gif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ex-agachamento',
    trainerId: 'usr-trainer-dutra',
    name: 'Agachamento Livre com Barra',
    category: 'Membros Inferiores',
    muscleGroup: 'Quadríceps / Glúteos',
    instructions: 'Base dos pés na largura dos ombros, joelhos acompanhando as pontas dos pés, profundidade máxima controlada.',
    gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats.gif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ex-barra-fixa',
    trainerId: 'usr-trainer-dutra',
    name: 'Barra Fixa + Puxada Peito',
    category: 'Dorsais',
    muscleGroup: 'Dorsal / Bíceps',
    instructions: 'Pegada pronada aberta, puxar até o peito na barra fixa ou na polia alta.',
    gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Pullups.gif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ex-rosca-w',
    trainerId: 'usr-trainer-dutra',
    name: 'Rosca W para Bíceps',
    category: 'Braços',
    muscleGroup: 'Bíceps Braquial',
    instructions: 'Cotovelos fixos ao lado do tronco, amplitude completa sem balançar a coluna.',
    gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bicep-curl-1.gif',
    createdAt: new Date().toISOString()
  }
];

export const SEED_LUCAS_PASIN_SCHEDULE: Schedule = {
  id: 'sch-lucas-marathon-biceps',
  studentId: 'usr-student-lucas',
  trainerId: 'usr-trainer-dutra',
  title: 'Ciclo para Meia Maratona & Hipertrofia de Bíceps',
  objective: 'Meia Maratona 21km (06/09/2026) + Hipertrofia de Bíceps (36,5cm -> 40cm)',
  description: 'Rotina fixa: força todos os dias úteis das 6h às 7h, corrida às 19h na segunda e quarta, bike leve terça/quinta/domingo, longão no sábado. Treino de quarta e sexta prioriza bíceps. Inclui mobilidade/alongamento para isquiotibiais.',
  expectationNotes: 'Pernas ficam em terça e quinta — únicos dias sem corrida — com 48h de intervalo entre si pra recuperar bem. Segunda, quarta e sexta são de upper body, preservando as pernas pra corrida da noite (seg/qua) e pro longão (sáb).',
  weeklyMatrix: [
    { day: 'Segunda', morningSlot: 'Força 1 — Upper Push (6h-7h)', eveningSlot: 'Corrida qualidade (19h)' },
    { day: 'Terça', morningSlot: 'Força 2 — Pernas pesado (6h-7h)', eveningSlot: 'Bike leve (Tarde/Noite)' },
    { day: 'Quarta', morningSlot: 'Força 3 — Upper Pull + bíceps (6h-7h)', eveningSlot: 'Corrida leve (19h)' },
    { day: 'Quinta', morningSlot: 'Força 4 — Pernas moderado/posterior (6h-7h)', eveningSlot: 'Bike leve (Tarde/Noite)' },
    { day: 'Sexta', morningSlot: 'Força 5 — Upper hipertrofia + bíceps (6h-7h)', eveningSlot: '— Descanso' },
    { day: 'Sábado', morningSlot: 'Sem força', eveningSlot: 'Longão (Manhã/Tarde)' },
    { day: 'Domingo', morningSlot: 'Sem força', eveningSlot: 'Bike leve (Giro regenerativo)' }
  ],
  progression: [
    { week: 1, dates: '20-26/07', monday: 'Tempo run 25min', wednesday: '20min leve', saturday: '9km leve', rpe: '7-8' },
    { week: 2, dates: '27/07-02/08', monday: 'Tiros 8x400m', wednesday: '25min leve', saturday: '10km leve', rpe: '7-8' },
    { week: 3, dates: '03-09/08', monday: 'Tempo run 30min', wednesday: '20min leve', saturday: '12km leve/mod.', rpe: '7-8' },
    { week: 4, dates: '10-16/08', monday: 'Fartlek 30min (3f/2l)', wednesday: '25min leve', saturday: '14km leve/mod.', rpe: '8-9' },
    { week: 5, dates: '17-23/08', monday: 'Tempo run 35min', wednesday: '20min leve', saturday: '16km leve/mod.', rpe: '8-9' },
    { week: 6, dates: '24-30/08', monday: 'Tiros 4x200m + 15min ritmo prova', wednesday: '20min leve', saturday: '18km (PICO)', rpe: '8-9' },
    { week: 7, dates: '31/08-06/09*', monday: '20min leve + 4 tiros 100m', wednesday: '15min soltura', saturday: 'Shakeout + PROVA dom 06/09 (21km)', rpe: '5-6 (leve)' }
  ],
  workouts: [
    {
      id: 'w-1',
      title: 'Força 1 — Segunda (Upper Push)',
      exercises: [
        { name: 'Supino reto', setsReps: '4x8-10', notes: 'Carga progressiva', gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Bench-press-1.gif' },
        { name: 'Desenvolvimento Arnold', setsReps: '3x8-10', notes: 'Rotação fluida de punho' },
        { name: 'Elevação lateral', setsReps: '3x12-15', notes: 'Foco no deltoide médio' },
        { name: 'Tríceps corda', setsReps: '3x10-12', notes: 'Pico de contração de 1s' },
        { name: 'Infra suspenso', setsReps: '3x40s', notes: 'Abs inferior concentrado' },
        { name: 'Remador', setsReps: '5x10', notes: 'Cadência controlada' }
      ]
    },
    {
      id: 'w-2',
      title: 'Força 2 — Terça (Pernas pesado)',
      exercises: [
        { name: 'Agachamento livre', setsReps: '4x6-8', notes: 'Pernas pesado', gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats.gif' },
        { name: 'Leg press', setsReps: '3x10-12', notes: 'Foco em quadríceps' },
        { name: 'Cadeira extensora unilateral', setsReps: '3x12-15', notes: 'Isometria no topo' },
        { name: 'Elevação panturrilha unilateral', setsReps: '3x10-12', notes: 'Pausa de 2s embaixo' },
        { name: 'Pallof press', setsReps: '3x12-15', notes: 'Anti-rotação de core' }
      ]
    },
    {
      id: 'w-3',
      title: 'Força 3 — Quarta (Upper Pull + Bíceps)',
      exercises: [
        { name: '3 Barra fixa + puxada peito', setsReps: '4x8-10', notes: 'Dorsal e bíceps', gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Pullups.gif' },
        { name: 'Remada curvada', setsReps: '4x8-10', notes: 'Tronco inclinado 45°' },
        { name: 'Rosca W', setsReps: '4x10-12', notes: 'Bíceps foco total', gifUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bicep-curl-1.gif' },
        { name: 'Rosca alternada com halteres', setsReps: '3x10/braço', notes: 'Supinação no topo' },
        { name: 'Spiderman', setsReps: '3x12-15', notes: 'Mobilidade de quadril + core' }
      ]
    },
    {
      id: 'w-4',
      title: 'Força 4 — Quinta (Pernas moderado/posterior)',
      exercises: [
        { name: 'Pliométrico step (alternado - bilateral - unilateral)', setsReps: '2x (3x10)', notes: 'Explosão e reatividade' },
        { name: 'Terra', setsReps: '4x8', notes: 'Cadeia posterior e eretores' },
        { name: 'Elevação pélvica uni', setsReps: '3x10', notes: 'Ativação glútea' },
        { name: 'Mesa flexora', setsReps: '3x12', notes: 'Isquiotibiais isolado' },
        { name: 'Búlgaro pliométrico', setsReps: '3x8/perna', notes: 'Salto suave na subida' },
        { name: 'Alongamento ativo de isquiotibiais (bicicleta + canela - calcanhar)', setsReps: '3x30s', notes: 'Mobilidade essencial' }
      ]
    },
    {
      id: 'w-5',
      title: 'Força 5 — Sexta (Upper hipertrofia + Bíceps)',
      exercises: [
        { name: 'Supino inclinado com halteres', setsReps: '4x10-12', notes: 'Porção superior de peito' },
        { name: 'Remada máquina', setsReps: '4x10-12', notes: 'Retração escapular' },
        { name: 'Facepull', setsReps: '4x10-12', notes: 'Manguito rotador e deltoide posterior' },
        { name: 'Rosca corda polia', setsReps: '4x10-12', notes: 'Braquial e bíceps' },
        { name: 'Elevação lateral + frontal (superset)', setsReps: '3x12-15', notes: 'Queima de deltoides' },
        { name: 'Prancha lateral', setsReps: '3x30s/lado', notes: 'Estabilidade oblíqua' }
      ]
    }
  ],
  bikePlanNotes: 'Sempre em Zona 1-2 (bem fácil, dá pra conversar). Terça/quinta você encaixa à tarde ou à noite, já que a manhã é força; domingo fica livre pra giro social de base.',
  recoveryAdvice: [
    { situation: 'Após a força', recommendation: 'O café da manhã logo em seguida já cobre a recuperação.' },
    { situation: 'Após corrida (seg/qua)', recommendation: 'Jantar com carboidrato reforçado + proteína, até 1-2h depois.' },
    { situation: 'Após o longão (sáb)', recommendation: 'Prioridade máxima: carboidrato + proteína o quanto antes.' },
    { situation: 'Após bike leve', recommendation: 'Refeição normal seguinte já resolve.' },
    { situation: 'Hidratação geral', recommendation: '35-40ml de água por kg/dia (≈3,3-3,7L). Isotônico no longão acima de 60-70min.' }
  ],
  dailyCalendar: [
    { id: 'cal-1', week: 'S1', date: '20/07', dayName: 'Segunda', workoutTitle: 'Força 1 + Corrida — Tempo run 25min (19h)', nutritionNote: 'Padrão + lanche 17h' },
    { id: 'cal-2', week: 'S1', date: '21/07', dayName: 'Terça', workoutTitle: 'Força 2 + Bike leve (tarde/noite)', nutritionNote: 'Padrão' },
    { id: 'cal-3', week: 'S1', date: '22/07', dayName: 'Quarta', workoutTitle: 'Força 3 + Corrida — 20min leve (19h)', nutritionNote: 'Padrão + lanche 17h' },
    { id: 'cal-4', week: 'S1', date: '23/07', dayName: 'Quinta', workoutTitle: 'Força 4 + Bike leve (tarde/noite)', nutritionNote: 'Padrão' },
    { id: 'cal-5', week: 'S1', date: '24/07', dayName: 'Sexta', workoutTitle: 'Força 5 (Upper hipertrofia + Bíceps)', nutritionNote: 'Padrão' },
    { id: 'cal-6', week: 'S1', date: '25/07', dayName: 'Sábado', workoutTitle: 'Longão — 9km leve', nutritionNote: 'Refeição robusta antes + reposição prioritária depois' },
    { id: 'cal-7', week: 'S1', date: '26/07', dayName: 'Domingo', workoutTitle: 'Bike leve (Zona 1-2)', nutritionNote: 'Padrão' },
    { id: 'cal-8', week: 'S6', date: '29/08', dayName: 'Sábado', workoutTitle: 'Longão — 18km (PICO)', nutritionNote: 'Refeição robusta antes + reposição prioritária depois' },
    { id: 'cal-9', week: 'S7', date: '06/09', dayName: 'Domingo', workoutTitle: 'PROVA — MEIA MARATONA 21km', nutritionNote: 'Café leve 2-3h antes + isotônico + reposição imediata' }
  ],
  active: true,
  createdAt: new Date().toISOString()
};

export const SEED_PAYMENT_CONFIG: PaymentConfig = {
  trainerId: 'usr-trainer-dutra',
  pixKeyType: 'CPF',
  pixKey: '123.456.789-00',
  monthlyFee: 250.00,
  dueDay: 10
};

export const SEED_STUDENT_PAYMENTS: StudentPayment[] = [
  {
    id: 'pay-1',
    studentId: 'usr-student-lucas',
    trainerId: 'usr-trainer-dutra',
    amount: 250.00,
    dueDate: '2026-08-10',
    status: 'PAID',
    paidAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    pixKey: '123.456.789-00',
    pixKeyType: 'CPF'
  },
  {
    id: 'pay-2',
    studentId: 'usr-student-lucas',
    trainerId: 'usr-trainer-dutra',
    amount: 250.00,
    dueDate: '2026-09-10',
    status: 'PENDING',
    pixKey: '123.456.789-00',
    pixKeyType: 'CPF'
  }
];
