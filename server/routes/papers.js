import { Router } from 'express';
import mongoose from 'mongoose';
import { Question } from '../models.js';

const r = Router();
const RANK = { easy: 0, medium: 1, hard: 2 };

// body: { chapters: [id], difficulty: 'easy'|'medium'|'hard'|'mixed', counts: { mcq, short, long } }
// Returns a practice paper ordered easy -> hard, with solutions.
r.post('/generate', async (req, res) => {
  const { chapters = [], difficulty = 'mixed', counts = { mcq: 10, short: 5, long: 2 } } = req.body;
  const ids = chapters.filter(mongoose.isValidObjectId).map((c) => new mongoose.Types.ObjectId(c));
  if (!ids.length) return res.status(400).json({ error: 'Choose at least one chapter.' });

  const sections = [];
  for (const type of ['mcq', 'short', 'long']) {
    const size = Math.min(Number(counts[type]) || 0, 50);
    if (!size) continue;
    const match = { chapter: { $in: ids }, type };
    if (difficulty !== 'mixed') match.difficulty = difficulty;
    const qs = await Question.aggregate([{ $match: match }, { $sample: { size } }]);
    qs.sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]);
    sections.push({ type, questions: qs });
  }
  res.json({ generatedAt: new Date(), difficulty, sections });
});

// Previous-year questions: /api/papers/previous?chapter=ID&year=2023
r.get('/previous', async (req, res) => {
  const f = { year: { $exists: true, $ne: null } };
  if (req.query.chapter) f.chapter = req.query.chapter;
  if (req.query.year) f.year = Number(req.query.year);
  res.json(await Question.find(f).sort('-year').limit(200));
});

export default r;
