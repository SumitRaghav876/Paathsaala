import { Router } from 'express';
import { Subject, Chapter } from '../models.js';

const r = Router();

r.get('/subjects', async (req, res) => {
  const f = req.query.level ? { level: req.query.level } : {};
  res.json(await Subject.find(f).sort('name'));
});

r.get('/chapters', async (req, res) => {
  const f = req.query.subject ? { subject: req.query.subject } : {};
  res.json(await Chapter.find(f).sort('number'));
});

r.get('/chapters/:id', async (req, res) => {
  const c = await Chapter.findById(req.params.id).populate('subject');
  if (!c) return res.status(404).json({ error: 'Chapter not found.' });
  res.json(c);
});

export default r;
