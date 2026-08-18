import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createApiRouter } from './controllers/ApiControllers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', createApiRouter());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FitPulse API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`⚡ FitPulse Backend Server running on port ${PORT}`);
});
