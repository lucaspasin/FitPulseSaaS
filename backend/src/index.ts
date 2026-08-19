import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createApiRouter } from './controllers/ApiControllers.js';
import { PrismaStorageAdapter } from './repositories/PrismaStorageAdapter.js';
import { BcryptPasswordHasher } from './security/BcryptPasswordHasher.js';
import { JwtTokenService } from './security/JwtTokenService.js';
import {
  AuthService,
  GymService,
  ScheduleService,
  ExerciseService,
  PaymentService,
  UserService,
  AccessPolicy
} from './services/Services.js';
import { seedIfEmpty } from './seed/bootstrap.js';
import { errorHandler } from './http/asyncHandler.js';
import { createEmailService } from './mail/createEmailService.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

function withRemotePostgresParams(url: string): string {
  if (/localhost|127\.0\.0\.1/i.test(url)) {
    return url;
  }
  const extras: string[] = [];
  if (!/sslmode=/i.test(url)) extras.push('sslmode=require');
  if (!/connect_timeout=/i.test(url)) extras.push('connect_timeout=30');
  if (extras.length === 0) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${extras.join('&')}`;
}

process.env.DATABASE_URL = withRemotePostgresParams(process.env.DATABASE_URL);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || (isProduction && jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be set (32+ characters in production)');
}

const prisma = new PrismaClient();
const storage = new PrismaStorageAdapter(prisma);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(jwtSecret);

const authService = new AuthService(storage, passwordHasher, tokenService);
const gymService = new GymService(storage);
const scheduleService = new ScheduleService(storage);
const exerciseService = new ExerciseService(storage);
const paymentService = new PaymentService(storage);
const accessPolicy = new AccessPolicy(storage);

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FitPulse API', timestamp: new Date().toISOString() });
});

const start = async () => {
  const emailService = await createEmailService();
  const userService = new UserService(storage, passwordHasher, emailService);

  app.use('/api', createApiRouter({
    storage,
    authService,
    gymService,
    scheduleService,
    exerciseService,
    paymentService,
    userService,
    accessPolicy,
    tokenService
  }));
  app.use(errorHandler);

  await prisma.$connect();
  if (process.env.SEED_ON_START === 'true') {
    await seedIfEmpty(prisma, passwordHasher);
  }
  app.listen(PORT, () => {
    console.log(`FitPulse API listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
