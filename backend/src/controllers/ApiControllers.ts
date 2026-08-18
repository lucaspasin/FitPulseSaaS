import { Router, Request, Response } from 'express';
import { FileStorageAdapter } from '../repositories/StorageAdapter.js';
import { AuthService, GymService, ScheduleService, ExerciseService, PaymentService } from '../services/Services.js';

export function createApiRouter(): Router {
  const router = Router();
  const storage = new FileStorageAdapter();

  const authService = new AuthService(storage);
  const gymService = new GymService(storage);
  const scheduleService = new ScheduleService(storage);
  const exerciseService = new ExerciseService(storage);
  const paymentService = new PaymentService(storage);

  // --- Auth & Gym Public Routes ---
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.findAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, inviteCode, gymSlug } = req.body;
      const result = await authService.registerStudent({ name, email, passwordHash: password, inviteCode, gymSlug });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Trainer Creation API (Dev Admin Role) ---
  router.post('/trainers', async (req: Request, res: Response) => {
    try {
      const { name, email, password, gymId, inviteCode } = req.body;
      const existing = await storage.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'E-mail de treinador já cadastrado' });
      }

      const newTrainer = await storage.createUser({
        name,
        email,
        passwordHash: password || 'trainer123',
        role: 'TRAINER',
        gymId: gymId || 'gym-dutra12',
        inviteCode: inviteCode || `TRN-${name.toUpperCase().replace(/\s+/g, '')}`
      });

      res.status(201).json(newTrainer);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/gyms', async (req: Request, res: Response) => {
    try {
      const gyms = await gymService.getAllGyms();
      res.json(gyms);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/gyms/slug/:slug', async (req: Request, res: Response) => {
    try {
      const gym = await gymService.getGymBySlug(req.params.slug);
      if (!gym) return res.status(404).json({ error: 'Gym not found' });
      res.json(gym);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/gyms', async (req: Request, res: Response) => {
    try {
      const gym = await gymService.createGym(req.body);
      res.status(201).json(gym);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/gyms/:id', async (req: Request, res: Response) => {
    try {
      const gym = await gymService.updateGym(req.params.id, req.body);
      res.json(gym);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Student Management & Custom Tags (Trainer Role) ---
  router.get('/trainers/:trainerId/students', async (req: Request, res: Response) => {
    try {
      const students = await storage.findStudentsByTrainerId(req.params.trainerId);
      res.json(students);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/users/:userId/tags', async (req: Request, res: Response) => {
    try {
      const { tags, status } = req.body;
      const updateData: any = {};
      if (tags !== undefined) updateData.tags = tags;
      if (status !== undefined) updateData.status = status;
      const updated = await storage.updateUser(req.params.userId, updateData);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Exercise Bank Routes ---
  router.get('/trainers/:trainerId/exercises', async (req: Request, res: Response) => {
    try {
      const exercises = await exerciseService.getExercisesByTrainer(req.params.trainerId);
      res.json(exercises);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/exercises', async (req: Request, res: Response) => {
    try {
      const exercise = await exerciseService.createExercise(req.body);
      res.status(201).json(exercise);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/exercises/:id', async (req: Request, res: Response) => {
    try {
      const success = await exerciseService.deleteExercise(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Schedule Prescriptions ---
  router.get('/students/:studentId/schedules/active', async (req: Request, res: Response) => {
    try {
      const schedule = await scheduleService.getActiveScheduleForStudent(req.params.studentId);
      if (!schedule) return res.status(404).json({ error: 'No active schedule found' });
      res.json(schedule);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/students/:studentId/schedules', async (req: Request, res: Response) => {
    try {
      const schedules = await storage.findSchedulesByStudentId(req.params.studentId);
      res.json(schedules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/schedules', async (req: Request, res: Response) => {
    try {
      const schedule = await scheduleService.createPrescription(req.body);
      res.status(201).json(schedule);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/executions', async (req: Request, res: Response) => {
    try {
      const log = await scheduleService.logExecution(req.body);
      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/students/:studentId/executions', async (req: Request, res: Response) => {
    try {
      const logs = await scheduleService.getExecutionLogs(req.params.studentId);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Billing & PIX Payments ---
  router.get('/trainers/:trainerId/payment-config', async (req: Request, res: Response) => {
    try {
      const config = await paymentService.getTrainerConfig(req.params.trainerId);
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/trainers/payment-config', async (req: Request, res: Response) => {
    try {
      const config = await paymentService.saveTrainerConfig(req.body);
      res.json(config);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/students/:studentId/payments', async (req: Request, res: Response) => {
    try {
      const payments = await paymentService.getStudentPayments(req.params.studentId);
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/payments/:paymentId/pay', async (req: Request, res: Response) => {
    try {
      const payment = await paymentService.updatePaymentStatus(req.params.paymentId, 'PAID');
      res.json(payment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
