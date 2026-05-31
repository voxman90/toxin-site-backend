import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';

import { FALLBACK_PORT } from './constants/constants.js';
import { setupDatabase } from './database/db.js';
import v1Router from './v1/routes/index.js';

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many requests from this IP, please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

setupDatabase()
  .then(() => {
    const app = express();
    const PORT = process.env.PORT || FALLBACK_PORT;

    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    app.use(cors({
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));

    app.use(compression());

    app.use('/api/', limiter);

    app.use(express.json());

    app.use('/api/v1', v1Router);

    const __dirname = path.resolve();
    app.use('/images', express.static(path.join(__dirname, 'public'), {
      maxAge: '1d',
    }));

    app.listen(PORT, () => {
      console.log(`API is listening on port ${PORT}`);
    });
  }).catch((error) => {
    console.error('Critical error while starting the server:', error);
    process.exit(1);
  });
