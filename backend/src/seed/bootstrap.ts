import { Prisma, PrismaClient } from '@prisma/client';
import { IPasswordHasher } from '../security/IPasswordHasher.js';
import {
  SEED_USERS,
  SEED_GYMS,
  SEED_EXERCISES,
  SEED_LUCAS_PASIN_SCHEDULE,
  SEED_PAYMENT_CONFIG,
  SEED_STUDENT_PAYMENTS
} from './seedData.js';

export async function seedIfEmpty(prisma: PrismaClient, passwordHasher: IPasswordHasher): Promise<void> {
  const existing = await prisma.user.count();
  if (existing > 0) return;

  for (const gym of SEED_GYMS) {
    await prisma.gym.create({
      data: {
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        logoUrl: gym.logoUrl,
        bannerUrl: gym.bannerUrl,
        primaryColor: gym.primaryColor,
        secondaryColor: gym.secondaryColor,
        createdAt: new Date(gym.createdAt)
      }
    });
  }

  for (const user of SEED_USERS) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: await passwordHasher.hash(user.passwordHash),
        name: user.name,
        role: user.role,
        gymId: user.gymId,
        trainerId: user.trainerId,
        inviteCode: user.inviteCode,
        tags: user.tags ?? [],
        status: user.status ?? 'ACTIVE',
        createdAt: new Date(user.createdAt)
      }
    });
  }

  for (const exercise of SEED_EXERCISES) {
    await prisma.exercise.create({
      data: {
        id: exercise.id,
        trainerId: exercise.trainerId,
        name: exercise.name,
        category: exercise.category,
        muscleGroup: exercise.muscleGroup,
        instructions: exercise.instructions,
        gifUrl: exercise.gifUrl,
        createdAt: new Date(exercise.createdAt)
      }
    });
  }

  const schedule = SEED_LUCAS_PASIN_SCHEDULE;
  await prisma.schedule.create({
    data: {
      id: schedule.id,
      studentId: schedule.studentId,
      trainerId: schedule.trainerId,
      title: schedule.title,
      objective: schedule.objective,
      description: schedule.description,
      expectationNotes: schedule.expectationNotes,
      weeklyMatrix: schedule.weeklyMatrix as unknown as Prisma.InputJsonValue,
      progression: schedule.progression as unknown as Prisma.InputJsonValue,
      workouts: schedule.workouts as unknown as Prisma.InputJsonValue,
      bikePlanNotes: schedule.bikePlanNotes,
      recoveryAdvice: schedule.recoveryAdvice as unknown as Prisma.InputJsonValue,
      dailyCalendar: schedule.dailyCalendar as unknown as Prisma.InputJsonValue,
      active: schedule.active,
      createdAt: new Date(schedule.createdAt)
    }
  });

  await prisma.paymentConfig.create({
    data: {
      trainerId: SEED_PAYMENT_CONFIG.trainerId,
      pixKeyType: SEED_PAYMENT_CONFIG.pixKeyType,
      pixKey: SEED_PAYMENT_CONFIG.pixKey,
      monthlyFee: SEED_PAYMENT_CONFIG.monthlyFee,
      dueDay: SEED_PAYMENT_CONFIG.dueDay
    }
  });

  for (const payment of SEED_STUDENT_PAYMENTS) {
    await prisma.studentPayment.create({
      data: {
        id: payment.id,
        studentId: payment.studentId,
        trainerId: payment.trainerId,
        amount: payment.amount,
        dueDate: new Date(payment.dueDate),
        status: payment.status,
        paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
        pixKey: payment.pixKey,
        pixKeyType: payment.pixKeyType
      }
    });
  }

  console.log('FitPulse staging seed applied.');
}
