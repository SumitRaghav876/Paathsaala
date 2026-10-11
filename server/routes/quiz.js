import { Router } from 'express';
import mongoose from 'mongoose';
import { Question, Attempt } from '../models.js';
import { optionalAuth } from '../middleware/auth.js';

const r = Router();

// Random MCQs for a chapter. Answers are NOT sent.
r.get('/', async (req, res) => {
  const { chapter, count = 10 } = req.query;
  if (!mongoose.isValidObjectId(chapter)) return res.status(400).json({ error: 'Pick a chapter.' });
  const qs = await Question.aggregate([
    { $match: { chapter: new mongoose.Types.ObjectId(chapter), type: 'mcq' } },
    { $sample: { size: Math.min(Number(count), 50) } },
    { $project: { answerIndex: 0, explanation: 0, answerText: 0 } },
  ]);
  res.json(qs);
});

// body: { chapter, answers: [{ questionId, choice }] }
r.post('/submit', optionalAuth, async (req, res) => {
  const { chapter, answers = [] } = req.body;
  const qs = await Question.find({ _id: { $in: answers.map((a) => a.questionId) } });
  const byId = Object.fromEntries(qs.map((q) => [q._id.toString(), q]));
  let score = 0;
  const review = answers.map((a) => {
    const q = byId[a.questionId];
    if (!q) return null;
    const correct = a.choice === q.answerIndex;
    if (correct) score++;
    return { questionId: q._id, correct, chosen: a.choice, answerIndex: q.answerIndex, explanation: q.explanation, diagramUrl: q.diagramUrl };
  }).filter(Boolean);
  if (req.user) await Attempt.create({ user: req.user.id, chapter, score, total: review.length });
  res.json({ score, total: review.length, review });
});

r.get('/history', optionalAuth, async (req, res) => {
  if (!req.user) return res.json([]);
  res.json(await Attempt.find({ user: req.user.id }).populate('chapter', 'title').sort('-createdAt').limit(20));
});

export default r;
