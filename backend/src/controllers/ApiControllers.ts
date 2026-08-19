import { Router, Response } from 'express';
import { IStorageAdapter } from '../repositories/Interfaces.js';
import {
  AuthService,
  GymService,
  ScheduleService,
  ExerciseService,
  PaymentService,
  UserService,
  AccessPolicy
} from '../services/Services.js';
import { ITokenService } from '../security/ITokenService.js';
import { asyncHandler } from '../http/asyncHandler.js';
import { AuthenticatedRequest, createRequireAuth, requireRole } from '../http/authMiddleware.js';
import { NotFoundError } from '../http/HttpError.js';

export function createApiRouter(deps: {
  storage: IStorageAdapter;
  authService: AuthService;
  gymService: GymService;
  scheduleService: ScheduleService;
  exerciseService: ExerciseService;
  paymentService: PaymentService;
  userService: UserService;
  accessPolicy: AccessPolicy;
  tokenService: ITokenService;
}): Router {
  const router = Router();
  const requireAuth = createRequireAuth(deps.tokenService);
  const {
    storage,
    authService,
    gymService,
    scheduleService,
    exerciseService,
    paymentService,
    userService,
    accessPolicy
  } = deps;

  router.post('/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  }));

  router.post('/auth/register', asyncHandler(async (req, res) => {
    const { name, email, password, inviteCode, gymSlug } = req.body;
    const result = await authService.registerStudent({ name, email, password, inviteCode, gymSlug });
    res.json(result);
  }));

  router.get('/gyms', asyncHandler(async (_req, res) => {
    res.json(await gymService.getAllGyms());
  }));

  router.get('/gyms/slug/:slug', asyncHandler(async (req, res) => {
    const gym = await gymService.getGymBySlug(req.params.slug);
    if (!gym) throw new NotFoundError('Gym not found');
    res.json(gym);
  }));

  router.use(requireAuth);

  router.get('/users', requireRole('ADMIN'), asyncHandler(async (_req, res) => {
    res.json(await userService.listPublicUsers());
  }));

  router.delete('/users/:id', requireRole('ADMIN', 'TRAINER'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const target = await storage.findUserById(req.params.id);
    if (!target) throw new NotFoundError('User not found');
    if (req.auth!.role === 'TRAINER') {
      if (target.role !== 'STUDENT' || target.trainerId !== req.auth!.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    }
    res.json({ success: await userService.deleteUser(req.params.id) });
  }));

  router.put('/users/:userId', requireRole('ADMIN', 'TRAINER'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.auth!.role === 'TRAINER' && req.auth!.userId !== req.params.userId) {
      await accessPolicy.assertCanAccessStudent(req.auth!, req.params.userId);
    }
    const { gymId, tags, status, name } = req.body;
    const updated = await userService.updateUser(req.params.userId, {
      gymId: gymId === undefined ? undefined : gymId || null,
      tags,
      status,
      name
    });
    res.json(updated);
  }));

  router.post('/trainers', requireRole('ADMIN'), asyncHandler(async (req, res) => {
    const { name, email, password, gymId, inviteCode } = req.body;
    const result = await userService.createTrainer({ name, email, password, gymId, inviteCode });
    res.status(201).json({ ...result.user, temporaryPassword: result.temporaryPassword });
  }));

  router.post('/gyms', requireRole('ADMIN'), asyncHandler(async (req, res) => {
    const { name, slug, logoUrl, bannerUrl, primaryColor, secondaryColor } = req.body;
    const gym = await gymService.createGym({ name, slug, logoUrl, bannerUrl, primaryColor, secondaryColor });
    res.status(201).json(gym);
  }));

  router.put('/gyms/:id', requireRole('ADMIN'), asyncHandler(async (req, res) => {
    const gym = await gymService.updateGym(req.params.id, req.body);
    res.json(gym);
  }));

  router.get('/trainers/:trainerId/students', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanManageTrainerResource(req.auth!, req.params.trainerId);
    res.json(await userService.listTrainerStudents(req.params.trainerId));
  }));

  router.put('/users/:userId/tags', requireRole('ADMIN', 'TRAINER'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.auth!.role === 'TRAINER') {
      await accessPolicy.assertCanAccessStudent(req.auth!, req.params.userId);
    }
    const { tags, status } = req.body;
    const updated = await userService.updateUser(req.params.userId, { tags, status });
    res.json(updated);
  }));

  router.get('/trainers/:trainerId/exercises', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanManageTrainerResource(req.auth!, req.params.trainerId);
    res.json(await exerciseService.getExercisesByTrainer(req.params.trainerId));
  }));

  router.post('/exercises', requireRole('ADMIN', 'TRAINER'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const trainerId = req.auth!.role === 'TRAINER' ? req.auth!.userId : req.body.trainerId;
    const exercise = await exerciseService.createExercise({ ...req.body, trainerId });
    res.status(201).json(exercise);
  }));

  router.delete('/exercises/:id', requireRole('ADMIN', 'TRAINER'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanMutateExercise(req.auth!, req.params.id);
    res.json({ success: await exerciseService.deleteExercise(req.params.id) });
  }));

  router.get('/students/:studentId/schedules/active', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanAccessStudent(req.auth!, req.params.studentId);
    const schedule = await scheduleService.getActiveScheduleForStudent(req.params.studentId);
    if (!schedule) throw new NotFoundError('No active schedule found');
    res.json(schedule);
  }));

  router.get('/students/:studentId/schedules', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanAccessStudent(req.auth!, req.params.studentId);
    res.json(await storage.findSchedulesByStudentId(req.params.studentId));
  }));

  router.post('/schedules', requireRole('ADMIN', 'TRAINER'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanAccessStudent(req.auth!, req.body.studentId);
    const schedule = await scheduleService.createPrescription({
      ...req.body,
      trainerId: req.auth!.role === 'TRAINER' ? req.auth!.userId : req.body.trainerId
    });
    res.status(201).json(schedule);
  }));

  const createExecution = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanAccessStudent(req.auth!, req.body.studentId);
    const log = await scheduleService.logExecution(req.body);
    res.status(201).json(log);
  });
  router.post('/executions', createExecution);
  router.post('/schedules/execution-logs', createExecution);

  const listExecutions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanAccessStudent(req.auth!, req.params.studentId);
    res.json(await scheduleService.getExecutionLogs(req.params.studentId));
  });
  router.get('/students/:studentId/executions', listExecutions);
  router.get('/students/:studentId/execution-logs', listExecutions);

  router.get('/trainers/:trainerId/payment-config', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanManageTrainerResource(req.auth!, req.params.trainerId);
    res.json(await paymentService.getTrainerConfig(req.params.trainerId));
  }));

  router.post('/trainers/payment-config', requireRole('ADMIN', 'TRAINER'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const trainerId = req.auth!.role === 'TRAINER' ? req.auth!.userId : req.body.trainerId;
    const config = await paymentService.saveTrainerConfig({ ...req.body, trainerId });
    res.json(config);
  }));

  router.get('/students/:studentId/payments', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanAccessStudent(req.auth!, req.params.studentId);
    res.json(await paymentService.getStudentPayments(req.params.studentId));
  }));

  router.post('/payments/:paymentId/pay', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await accessPolicy.assertCanPay(req.auth!, req.params.paymentId);
    const payment = await paymentService.updatePaymentStatus(req.params.paymentId, 'PAID');
    res.json(payment);
  }));

  return router;
}
