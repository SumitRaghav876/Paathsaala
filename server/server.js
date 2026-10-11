import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import content from './routes/content.js';
import library from './routes/library.js';
import me from './routes/me.js';
import quiz from './routes/quiz.js';
import papers from './routes/papers.js';
import ai from './routes/ai.js';
import admin from './routes/admin.js';

const app = express();
app.set('trust proxy', 1); // correct client IPs behind Render/Railway/Nginx

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      frameSrc: ['https:'],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '5mb' }));

const limiter = (windowMs, limit, error) => rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { error } });
app.use('/api', limiter(15 * 60 * 1000, 600, 'Too many requests. Please wait a few minutes.'));
app.use('/api/auth', limiter(15 * 60 * 1000, 30, 'Too many login attempts. Try again in 15 minutes.'));
app.use('/api/ai', limiter(60 * 60 * 1000, 40, 'You have reached the hourly limit for the AI teacher. Try again later.'));

app.use('/api/auth', auth);
app.use('/api', content);
app.use('/api/library', library);
app.use('/api/me', me);
app.use('/api/quiz', quiz);
app.use('/api/papers', papers);
app.use('/api/ai', ai);
app.use('/api/admin', admin);
app.get('/api/health', (_q, res) => res.json({ ok: true }));
app.use('/api', (_q, res) => res.status(404).json({ error: 'Not found.' }));

// In production, serve the built React app from the same server
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong on the server.' }); });

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) { console.error('Set MONGO_URI and JWT_SECRET in server/.env'); process.exit(1); }
await mongoose.connect(process.env.MONGO_URI);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Paathshala running on port', port));
