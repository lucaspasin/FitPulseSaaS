import jwt from 'jsonwebtoken';
import { FileStorageAdapter } from '../repositories/StorageAdapter.js';
import { User, Gym, Exercise, Schedule, PaymentConfig, StudentPayment, WorkoutExecutionLog } from '../domain/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fitpulse_super_secret_jwt_key_2026';

export class AuthService {
  constructor(private storage: FileStorageAdapter) {}

  async login(email: string, passwordHash: string) {
    const user = await this.storage.findUserByEmail(email);
    if (!user || user.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password');
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role, gymId: user.gymId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const gym = await this.storage.findGymById(user.gymId);
    return { token, user, gym };
  }

  async registerStudent(data: {
    name: string;
    email: string;
    passwordHash: string;
    inviteCode?: string;
    gymSlug?: string;
  }) {
    const existing = await this.storage.findUserByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    let trainer: User | null = null;
    if (data.inviteCode) {
      trainer = await this.storage.findUserByInviteCode(data.inviteCode);
    }

    let gymId = 'gym-dutra12';
    if (data.gymSlug) {
      const gym = await this.storage.findGymBySlug(data.gymSlug);
      if (gym) gymId = gym.id;
    } else if (trainer) {
      gymId = trainer.gymId;
    }

    const newUser = await this.storage.createUser({
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: 'STUDENT',
      gymId,
      trainerId: trainer ? trainer.id : 'usr-trainer-dutra',
      tags: ['Novo Aluno']
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, gymId: newUser.gymId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const gym = await this.storage.findGymById(newUser.gymId);
    return { token, user: newUser, gym };
  }

  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; gymId: string };
  }
}

export class GymService {
  constructor(private storage: FileStorageAdapter) {}

  async getAllGyms(): Promise<Gym[]> {
    return this.storage.findAllGyms();
  }

  async getGymBySlug(slug: string): Promise<Gym | null> {
    return this.storage.findGymBySlug(slug);
  }

  async createGym(gymData: Omit<Gym, 'id' | 'createdAt'>): Promise<Gym> {
    return this.storage.createGym(gymData);
  }

  async updateGym(id: string, gymData: Partial<Gym>): Promise<Gym | null> {
    return this.storage.updateGym(id, gymData);
  }
}

export class ScheduleService {
  constructor(private storage: FileStorageAdapter) {}

  async getActiveScheduleForStudent(studentId: string): Promise<Schedule | null> {
    return this.storage.findActiveScheduleByStudentId(studentId);
  }

  async getStudentSchedules(studentId: string): Promise<Schedule[]> {
    return this.storage.findSchedulesByStudentId(studentId);
  }

  async createPrescription(scheduleData: Omit<Schedule, 'id' | 'createdAt'>): Promise<Schedule> {
    return this.storage.createSchedule(scheduleData);
  }

  async logExecution(logData: Omit<WorkoutExecutionLog, 'id'>): Promise<WorkoutExecutionLog> {
    return this.storage.logExecution(logData);
  }

  async getExecutionLogs(studentId: string): Promise<WorkoutExecutionLog[]> {
    return this.storage.findExecutionLogs(studentId);
  }
}

export class ExerciseService {
  constructor(private storage: FileStorageAdapter) {}

  async getExercisesByTrainer(trainerId: string): Promise<Exercise[]> {
    return this.storage.findExercisesByTrainerId(trainerId);
  }

  async createExercise(exerciseData: Omit<Exercise, 'id' | 'createdAt'>): Promise<Exercise> {
    return this.storage.createExercise(exerciseData);
  }

  async deleteExercise(id: string): Promise<boolean> {
    return this.storage.deleteExercise(id);
  }
}

export class PaymentService {
  constructor(private storage: FileStorageAdapter) {}

  async getTrainerConfig(trainerId: string): Promise<PaymentConfig | null> {
    return this.storage.getTrainerPaymentConfig(trainerId);
  }

  async saveTrainerConfig(config: PaymentConfig): Promise<PaymentConfig> {
    return this.storage.saveTrainerPaymentConfig(config);
  }

  async getStudentPayments(studentId: string): Promise<StudentPayment[]> {
    const list = await this.storage.findStudentPayments(studentId);
    const todayStr = new Date().toISOString().split('T')[0];

    // Check overdue and auto-generate next month payment if previous due date passed
    let needsNewPayment = false;
    let lastPayment: StudentPayment | null = null;

    for (const p of list) {
      if (p.status === 'PENDING' && p.dueDate < todayStr) {
        p.status = 'OVERDUE';
        await this.storage.updatePaymentStatus(p.id, 'OVERDUE');
      }
      if (!lastPayment || p.dueDate > lastPayment.dueDate) {
        lastPayment = p;
      }
    }

    if (lastPayment && lastPayment.dueDate < todayStr) {
      needsNewPayment = true;
    }

    if (needsNewPayment && lastPayment) {
      const lastDueDate = new Date(lastPayment.dueDate);
      const nextDueDate = new Date(lastDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      const newPayment = await this.storage.createPayment({
        studentId,
        trainerId: lastPayment.trainerId,
        amount: lastPayment.amount,
        dueDate: nextDueDate.toISOString().split('T')[0],
        status: 'PENDING',
        pixKey: lastPayment.pixKey,
        pixKeyType: lastPayment.pixKeyType
      });
      list.push(newPayment);
    }

    return list;
  }

  async getTrainerStudentPayments(trainerId: string): Promise<StudentPayment[]> {
    return this.storage.findTrainerPayments(trainerId);
  }

  async markAsPaidAndRenewNextMonth(paymentId: string): Promise<{ updatedPayment: StudentPayment | null; nextPayment: StudentPayment | null }> {
    const updated = await this.storage.updatePaymentStatus(paymentId, 'PAID');
    let nextPayment: StudentPayment | null = null;

    if (updated) {
      const currentDueDate = new Date(updated.dueDate || new Date());
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      const formattedDueDate = nextDueDate.toISOString().split('T')[0];

      nextPayment = await this.storage.createPayment({
        studentId: updated.studentId,
        trainerId: updated.trainerId,
        amount: updated.amount,
        dueDate: formattedDueDate,
        status: 'PENDING',
        pixKey: updated.pixKey,
        pixKeyType: updated.pixKeyType
      });
    }

    return { updatedPayment: updated, nextPayment };
  }

  async updatePaymentStatus(paymentId: string, status: 'PAID' | 'PENDING' | 'OVERDUE'): Promise<StudentPayment | null> {
    if (status === 'PAID') {
      const res = await this.markAsPaidAndRenewNextMonth(paymentId);
      return res.updatedPayment;
    }
    return this.storage.updatePaymentStatus(paymentId, status);
  }
}
