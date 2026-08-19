import fs from 'fs';
import path from 'path';
import { User, Gym, Exercise, Schedule, PaymentConfig, StudentPayment, WorkoutExecutionLog } from '../domain/types.js';
import { IStorageAdapter } from './Interfaces.js';
import bcrypt from 'bcryptjs';
import {
  SEED_USERS,
  SEED_GYMS,
  SEED_EXERCISES,
  SEED_LUCAS_PASIN_SCHEDULE,
  SEED_PAYMENT_CONFIG,
  SEED_STUDENT_PAYMENTS
} from '../seed/seedData.js';

interface DatabaseSchema {
  users: User[];
  gyms: Gym[];
  exercises: Exercise[];
  schedules: Schedule[];
  paymentConfigs: PaymentConfig[];
  studentPayments: StudentPayment[];
  executionLogs: WorkoutExecutionLog[];
}

export class FileStorageAdapter implements IStorageAdapter {
  private filePath: string;
  private data: DatabaseSchema;

  constructor(customPath?: string) {
    this.filePath = customPath || path.join(process.cwd(), 'src', 'seed', 'db.json');
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    let parsed: DatabaseSchema | null = null;
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        parsed = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading db.json:', err);
    }

    if (!parsed || !parsed.users || parsed.users.length === 0) {
      parsed = {
        users: SEED_USERS,
        gyms: SEED_GYMS,
        exercises: SEED_EXERCISES,
        schedules: [SEED_LUCAS_PASIN_SCHEDULE],
        paymentConfigs: [SEED_PAYMENT_CONFIG],
        studentPayments: SEED_STUDENT_PAYMENTS,
        executionLogs: []
      };
    } else {
      // Ensure seed trainers exist in existing db.json
      SEED_USERS.forEach(su => {
        if (!parsed!.users.some(u => u.id === su.id || u.email === su.email)) {
          parsed!.users.push(su);
        }
      });
    }

    parsed.users = parsed.users.map((user) =>
      user.passwordHash.startsWith('$2')
        ? user
        : { ...user, passwordHash: bcrypt.hashSync(user.passwordHash, 10) }
    );

    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(parsed, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing seed to db.json:', err);
    }

    return parsed;
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  // --- Users ---
  async findAllUsers(): Promise<User[]> {
    return this.data.users;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.data.users.find(u => u.id === id) || null;
  }

  async findUserByInviteCode(inviteCode: string): Promise<User | null> {
    const clean = inviteCode.trim().toUpperCase();
    return this.data.users.find(u => 
      u.role === 'TRAINER' && (
        (u.inviteCode && u.inviteCode.toUpperCase() === clean) ||
        (`TRN-${u.name.toUpperCase().replace(/\s+/g, '')}` === clean) ||
        clean.includes(u.name.toUpperCase().replace(/\s+/g, '')) ||
        u.id === inviteCode
      )
    ) || null;
  }

  async findStudentsByTrainerId(trainerId: string): Promise<User[]> {
    return this.data.users.filter(u => 
      u.role === 'STUDENT' && (u.trainerId === trainerId || (!u.trainerId && trainerId === 'usr-trainer-dutra'))
    );
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  async updateUser(id: string, userData: Partial<User> & { gymId?: string | null }): Promise<User | null> {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...userData };
    this.save();
    return this.data.users[idx];
  }

  async deleteUser(id: string): Promise<boolean> {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.data.schedules = this.data.schedules.filter(s => s.studentId !== id && s.trainerId !== id);
      this.data.studentPayments = this.data.studentPayments.filter(p => p.studentId !== id && p.trainerId !== id);
      this.save();
      return true;
    }
    return false;
  }

  // --- Gyms ---
  async findAllGyms(): Promise<Gym[]> {
    return this.data.gyms;
  }

  async findGymBySlug(slug: string): Promise<Gym | null> {
    return this.data.gyms.find(g => g.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  async findGymById(id: string): Promise<Gym | null> {
    return this.data.gyms.find(g => g.id === id) || null;
  }

  async createGym(gymData: Omit<Gym, 'id' | 'createdAt'>): Promise<Gym> {
    const newGym: Gym = {
      ...gymData,
      id: `gym-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.gyms.push(newGym);
    this.save();
    return newGym;
  }

  async updateGym(id: string, gymData: Partial<Gym>): Promise<Gym | null> {
    const idx = this.data.gyms.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.data.gyms[idx] = { ...this.data.gyms[idx], ...gymData };
    this.save();
    return this.data.gyms[idx];
  }

  // --- Exercises ---
  async findExercisesByTrainerId(trainerId: string): Promise<Exercise[]> {
    return this.data.exercises.filter(e => e.trainerId === trainerId);
  }

  async findExerciseById(id: string): Promise<Exercise | null> {
    return this.data.exercises.find(e => e.id === id) || null;
  }

  async createExercise(exerciseData: Omit<Exercise, 'id' | 'createdAt'> & { id?: string }): Promise<Exercise> {
    if (exerciseData.id) {
      const idx = this.data.exercises.findIndex(e => e.id === exerciseData.id);
      if (idx !== -1) {
        this.data.exercises[idx] = { ...this.data.exercises[idx], ...exerciseData };
        this.save();
        return this.data.exercises[idx];
      }
    }
    const newEx: Exercise = {
      ...exerciseData,
      id: exerciseData.id || `ex-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.exercises.push(newEx);
    this.save();
    return newEx;
  }

  async deleteExercise(id: string): Promise<boolean> {
    const initialLen = this.data.exercises.length;
    this.data.exercises = this.data.exercises.filter(e => e.id !== id);
    if (this.data.exercises.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Schedules ---
  async findActiveScheduleByStudentId(studentId: string): Promise<Schedule | null> {
    return this.data.schedules.find(s => s.studentId === studentId && s.active) || null;
  }

  async findSchedulesByStudentId(studentId: string): Promise<Schedule[]> {
    return this.data.schedules.filter(s => s.studentId === studentId);
  }

  async findScheduleById(id: string): Promise<Schedule | null> {
    return this.data.schedules.find(s => s.id === id) || null;
  }

  async deactivateAllSchedulesForStudent(studentId: string): Promise<void> {
    this.data.schedules.forEach((s) => {
      if (s.studentId === studentId) s.active = false;
    });
    this.save();
  }

  async createSchedule(scheduleData: any): Promise<Schedule> {
    if (scheduleData.id) {
      const idx = this.data.schedules.findIndex(s => s.id === scheduleData.id);
      if (idx !== -1) {
        this.data.schedules[idx] = {
          ...this.data.schedules[idx],
          ...scheduleData
        };
        this.save();
        return this.data.schedules[idx];
      }
    }

    if (scheduleData.active) {
      this.data.schedules.forEach(s => {
        if (s.studentId === scheduleData.studentId) s.active = false;
      });
    }

    const newSched: Schedule = {
      ...scheduleData,
      id: `sched-${Date.now()}`,
      createdAt: new Date().toISOString(),
      active: scheduleData.active !== undefined ? scheduleData.active : true
    };
    this.data.schedules.push(newSched);
    this.save();
    return newSched;
  }

  async logExecution(logData: Omit<WorkoutExecutionLog, 'id'>): Promise<WorkoutExecutionLog> {
    const newLog: WorkoutExecutionLog = {
      ...logData,
      id: `log-${Date.now()}`
    };
    this.data.executionLogs.push(newLog);
    this.save();
    return newLog;
  }

  async findExecutionLogs(studentId: string): Promise<WorkoutExecutionLog[]> {
    return this.data.executionLogs.filter(l => l.studentId === studentId);
  }

  // --- Payment Config & Payments ---
  async getTrainerPaymentConfig(trainerId: string): Promise<PaymentConfig | null> {
    return this.data.paymentConfigs.find(p => p.trainerId === trainerId) || null;
  }

  async saveTrainerPaymentConfig(config: PaymentConfig): Promise<PaymentConfig> {
    const idx = this.data.paymentConfigs.findIndex(p => p.trainerId === config.trainerId);
    if (idx !== -1) {
      this.data.paymentConfigs[idx] = { ...this.data.paymentConfigs[idx], ...config };
    } else {
      this.data.paymentConfigs.push(config);
    }
    this.save();
    return config;
  }

  async findStudentPayments(studentId: string): Promise<StudentPayment[]> {
    return this.data.studentPayments.filter(p => p.studentId === studentId);
  }

  async findTrainerPayments(trainerId: string): Promise<StudentPayment[]> {
    return this.data.studentPayments.filter(p => p.trainerId === trainerId);
  }

  async findPaymentById(paymentId: string): Promise<StudentPayment | null> {
    return this.data.studentPayments.find(p => p.id === paymentId) || null;
  }

  async createPayment(paymentData: Omit<StudentPayment, 'id'>): Promise<StudentPayment> {
    const newPayment: StudentPayment = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    this.data.studentPayments.push(newPayment);
    this.save();
    return newPayment;
  }

  async updatePaymentStatus(paymentId: string, status: 'PAID' | 'PENDING' | 'OVERDUE'): Promise<StudentPayment | null> {
    const idx = this.data.studentPayments.findIndex(p => p.id === paymentId);
    if (idx === -1) return null;
    this.data.studentPayments[idx].status = status;
    if (status === 'PAID') {
      this.data.studentPayments[idx].paidAt = new Date().toISOString();
    }
    this.save();
    return this.data.studentPayments[idx];
  }
}
