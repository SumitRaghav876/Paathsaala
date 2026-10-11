import { Router } from 'express';
import mongoose from 'mongoose';
import { User } from '../models.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.use(requireAuth);

r.get('/bookmark-ids', async (req, res) => {
  const u = await User.findById(req.user.id).select('bookmarks');
  res.json((u?.bookmarks || []).map(String));
});

r.get('/bookmarks', async (req, res) => {
  const u = await User.findById(req.user.id).populate('bookmarks');
  res.json((u?.bookmarks || []).slice().reverse());
});

// Toggles save / unsave
r.post('/bookmarks/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid resource.' });
  const u = await User.findById(req.user.id);
  const has = u.bookmarks.some((b) => b.equals(req.params.id));
  if (has) u.bookmarks.pull(req.params.id); else u.bookmarks.push(req.params.id);
  await u.save();
  res.json({ bookmarked: !has, ids: u.bookmarks.map(String) });
});

export default r;
