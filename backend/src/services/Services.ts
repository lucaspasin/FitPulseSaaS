import { IStorageAdapter } from '../repositories/Interfaces.js';
import { IPasswordHasher } from '../security/IPasswordHasher.js';
import { ITokenService } from '../security/ITokenService.js';
import { User, Gym, Exercise, Schedule, PaymentConfig, StudentPayment, WorkoutExecutionLog } from '../domain/types.js';
import { toPublicUser, PublicUser } from '../domain/publicUser.js';
import { ForbiddenError, NotFoundError } from '../http/HttpError.js';

export class AuthService {
  constructor(
    private readonly storage: IStorageAdapter,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async login(email: string, password: string) {
    const user = await this.storage.findUserByEmail(email);
    if (!user || !(await this.passwordHasher.compare(password, user.passwordHash))) {
      throw new Error('Invalid email or password');
    }
    const token = this.tokenService.sign({
      userId: user.id,
      role: user.role,
      gymId: user.gymId
    });
    const gym = user.gymId ? await this.storage.findGymById(user.gymId) : null;
    return { token, user: toPublicUser(user), gym };
  }

  async registerStudent(data: {
    name: string;
    email: string;
    password: string;
    inviteCode?: string;
    gymSlug?: string;
  }) {
    const existing = await this.storage.findUserByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    let trainer: User | null = null;
    if (data.inviteCode) {
      trainer = await this.storage.findUserByInviteCode(data.inviteCode);
    }

    let gymId: string | undefined;
    if (data.gymSlug) {
      const gym = await this.storage.findGymBySlug(data.gymSlug);
      if (gym) gymId = gym.id;
    } else if (trainer?.gymId) {
      gymId = trainer.gymId;
    }

    const newUser = await this.storage.createUser({
      name: data.name,
      email: data.email,
      passwordHash: await this.passwordHasher.hash(data.password),
      role: 'STUDENT',
      gymId,
      trainerId: trainer?.id,
      tags: ['Novo Aluno'],
      status: 'ACTIVE'
    });

    const token = this.tokenService.sign({
      userId: newUser.id,
      role: newUser.role,
      gymId: newUser.gymId
    });
    const gym = newUser.gymId ? await this.storage.findGymById(newUser.gymId) : null;
    return { token, user: toPublicUser(newUser), gym };
  }
}

export class GymService {
  constructor(private readonly storage: IStorageAdapter) {}

  getAllGyms(): Promise<Gym[]> {
    return this.storage.findAllGyms();
  }

  getGymBySlug(slug: string): Promise<Gym | null> {
    return this.storage.findGymBySlug(slug);
  }

  createGym(gymData: Omit<Gym, 'id' | 'createdAt'>): Promise<Gym> {
    return this.storage.createGym(gymData);
  }

  updateGym(id: string, gymData: Partial<Gym>): Promise<Gym | null> {
    return this.storage.updateGym(id, gymData);
  }
}

export class UserService {
  constructor(
    private readonly storage: IStorageAdapter,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async listPublicUsers(): Promise<PublicUser[]> {
    const users = await this.storage.findAllUsers();
    return users.map(toPublicUser);
  }

  async createTrainer(data: {
    name: string;
    email: string;
    password?: string;
    gymId?: string;
    inviteCode?: string;
  }): Promise<{ user: PublicUser; temporaryPassword: string }> {
    const existing = await this.storage.findUserByEmail(data.email);
    if (existing) {
      throw new Error('E-mail de treinador já cadastrado');
    }

    const temporaryPassword = data.password || `coach${Math.floor(1000 + Math.random() * 9000)}`;
    const created = await this.storage.createUser({
      name: data.name,
      email: data.email,
      passwordHash: await this.passwordHasher.hash(temporaryPassword),
      role: 'TRAINER',
      gymId: data.gymId,
      inviteCode: data.inviteCode || `TRN-${data.name.toUpperCase().replace(/\s+/g, '')}`,
      status: 'ACTIVE'
    });
    return { user: toPublicUser(created), temporaryPassword };
  }

  async updateUser(id: string, patch: Partial<User> & { gymId?: string | null }): Promise<PublicUser | null> {
    const updated = await this.storage.updateUser(id, patch);
    return updated ? toPublicUser(updated) : null;
  }

  deleteUser(id: string): Promise<boolean> {
    return this.storage.deleteUser(id);
  }

  async listTrainerStudents(trainerId: string): Promise<PublicUser[]> {
    const students = await this.storage.findStudentsByTrainerId(trainerId);
    return students.map(toPublicUser);
  }
}

export class AccessPolicy {
  constructor(private readonly storage: IStorageAdapter) {}

  async assertCanAccessStudent(actor: { userId: string; role: string }, studentId: string): Promise<void> {
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'STUDENT' && actor.userId === studentId) return;
    if (actor.role === 'TRAINER') {
      const student = await this.storage.findUserById(studentId);
      if (student?.trainerId === actor.userId) return;
    }
    throw new ForbiddenError();
  }

  async assertCanManageTrainerResource(actor: { userId: string; role: string }, trainerId: string): Promise<void> {
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'TRAINER' && actor.userId === trainerId) return;
    throw new ForbiddenError();
  }

  async assertCanMutateExercise(actor: { userId: string; role: string }, exerciseId: string): Promise<void> {
    if (actor.role === 'ADMIN') return;
    const exercise = await this.storage.findExerciseById(exerciseId);
    if (!exercise) throw new NotFoundError('Exercise not found');
    if (actor.role === 'TRAINER' && exercise.trainerId === actor.userId) return;
    throw new ForbiddenError();
  }

  async assertCanPay(actor: { userId: string; role: string }, paymentId: string): Promise<void> {
    if (actor.role === 'ADMIN') return;
    const payment = await this.storage.findPaymentById(paymentId);
    if (!payment) throw new NotFoundError('Payment not found');
    if (actor.role === 'TRAINER' && payment.trainerId === actor.userId) return;
    if (actor.role === 'STUDENT' && payment.studentId === actor.userId) return;
    throw new ForbiddenError();
  }
}

export class ScheduleService {
  constructor(private readonly storage: IStorageAdapter) {}

  getActiveScheduleForStudent(studentId: string): Promise<Schedule | null> {
    return this.storage.findActiveScheduleByStudentId(studentId);
  }

  getStudentSchedules(studentId: string): Promise<Schedule[]> {
    return this.storage.findSchedulesByStudentId(studentId);
  }

  createPrescription(scheduleData: Omit<Schedule, 'id' | 'createdAt'> & { id?: string }): Promise<Schedule> {
    return this.storage.createSchedule(scheduleData);
  }

  logExecution(logData: Omit<WorkoutExecutionLog, 'id'>): Promise<WorkoutExecutionLog> {
    return this.storage.logExecution(logData);
  }

  getExecutionLogs(studentId: string): Promise<WorkoutExecutionLog[]> {
    return this.storage.findExecutionLogs(studentId);
  }
}

export class ExerciseService {
  constructor(private readonly storage: IStorageAdapter) {}

  getExercisesByTrainer(trainerId: string): Promise<Exercise[]> {
    return this.storage.findExercisesByTrainerId(trainerId);
  }

  createExercise(exerciseData: Omit<Exercise, 'id' | 'createdAt'> & { id?: string }): Promise<Exercise> {
    return this.storage.createExercise(exerciseData);
  }

  deleteExercise(id: string): Promise<boolean> {
    return this.storage.deleteExercise(id);
  }
}

export class PaymentService {
  constructor(private readonly storage: IStorageAdapter) {}

  getTrainerConfig(trainerId: string): Promise<PaymentConfig | null> {
    return this.storage.getTrainerPaymentConfig(trainerId);
  }

  saveTrainerConfig(config: PaymentConfig): Promise<PaymentConfig> {
    return this.storage.saveTrainerPaymentConfig(config);
  }

  async getStudentPayments(studentId: string): Promise<StudentPayment[]> {
    const list = await this.storage.findStudentPayments(studentId);
    const todayStr = new Date().toISOString().split('T')[0];

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

  getTrainerStudentPayments(trainerId: string): Promise<StudentPayment[]> {
    return this.storage.findTrainerPayments(trainerId);
  }

  async markAsPaidAndRenewNextMonth(paymentId: string): Promise<{ updatedPayment: StudentPayment | null; nextPayment: StudentPayment | null }> {
    const updated = await this.storage.updatePaymentStatus(paymentId, 'PAID');
    let nextPayment: StudentPayment | null = null;

    if (updated) {
      const currentDueDate = new Date(updated.dueDate || new Date());
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      nextPayment = await this.storage.createPayment({
        studentId: updated.studentId,
        trainerId: updated.trainerId,
        amount: updated.amount,
        dueDate: nextDueDate.toISOString().split('T')[0],
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
