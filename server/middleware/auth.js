import jwt from 'jsonwebtoken';
import { User } from '../models.js';

function read(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), process.env.JWT_SECRET); } catch { return null; }
}
export const optionalAuth = (req, _res, next) => { req.user = read(req); next(); };
export const requireAuth = (req, res, next) => {
  req.user = read(req);
  if (!req.user) return res.status(401).json({ error: 'Please log in first.' });
  next();
};

// Role is checked in the database on every call, so removing admin rights takes effect immediately.
export const requireAdmin = async (req, res, next) => {
  req.user = read(req);
  if (!req.user) return res.status(401).json({ error: 'Please log in first.' });
  const u = await User.findById(req.user.id).select('role');
  if (u?.role !== 'admin') return res.status(403).json({ error: 'Admin access only.' });
  next();
};
