import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
const sign = (u) => jwt.sign({ id: u._id, name: u.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, level: u.level, role: u.role });

r.post('/register', async (req, res) => {
  const { name, email, password, level, acceptedTerms, termsVersion } = req.body;
  if (acceptedTerms !== true)
    return res.status(400).json({ error: 'Please accept the Terms and Conditions and Privacy Policy to create an account.' });
  if (!email || !password || password.length < 6)
    return res.status(400).json({ error: 'Email and a password of 6+ characters are required.' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'This email is already registered.' });
  const u = await User.create({ name, email, level, passwordHash: await bcrypt.hash(password, 10), termsAcceptedAt: new Date(), termsVersion: String(termsVersion || '').slice(0, 20) });
  res.json({ token: sign(u), user: pub(u) });
});

r.post('/login', async (req, res) => {
  const u = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.passwordHash)))
    return res.status(401).json({ error: 'Wrong email or password.' });
  res.json({ token: sign(u), user: pub(u) });
});

r.get('/me', requireAuth, async (req, res) => res.json(pub(await User.findById(req.user.id))));
export default r;
