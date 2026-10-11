import { Router } from 'express';
import mongoose from 'mongoose';
import { Resource } from '../models.js';

const r = Router();
const FACETS = ['level', 'board', 'subjectName', 'type', 'language', 'provider', 'year'];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = {
  relevance: { views: -1, createdAt: -1 },
  new: { createdAt: -1 },
  popular: { views: -1 },
  year: { year: -1, createdAt: -1 },
  title: { title: 1 },
};

// Filters are comma-separated lists (?level=10,12&type=book). Search words are AND-ed.
function buildMatch(q) {
  const and = [];
  for (const f of FACETS) {
    if (!q[f]) continue;
    const vals = String(q[f]).split(',').map((v) => v.trim()).filter(Boolean);
    if (!vals.length) continue;
    and.push({ [f]: { $in: f === 'year' ? vals.map(Number).filter(Number.isFinite) : vals } });
  }
  const words = String(q.q || '').trim().split(/\s+/).filter(Boolean).slice(0, 8);
  for (const w of words) {
    const rx = new RegExp(esc(w), 'i');
    and.push({ $or: [{ title: rx }, { description: rx }, { subjectName: rx }, { chapterName: rx }, { tags: rx }, { board: rx }, { provider: rx }] });
  }
  return and.length ? { $and: and } : {};
}

// Search with filters, sorting, paging and facet counts
r.get('/search', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const match = buildMatch(req.query);
  const sort = SORTS[req.query.sort] || SORTS.relevance;
  const stages = Object.fromEntries(FACETS.map((f) => [f, [
    { $match: { [f]: { $nin: [null, ''] } } },
    { $group: { _id: '$' + f, n: { $sum: 1 } } },
    { $sort: { n: -1, _id: 1 } },
    { $limit: 25 },
  ]]));
  const [items, total, fa] = await Promise.all([
    Resource.find(match).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Resource.countDocuments(match),
    Resource.aggregate([{ $match: match }, { $facet: stages }]),
  ]);
  const facets = Object.fromEntries(FACETS.map((f) => [f, (fa[0]?.[f] || []).map((x) => ({ value: x._id, count: x.n }))]));
  res.json({ items, total, page, pages: Math.ceil(total / limit), facets });
});

// Browse one dimension: /api/library/browse/subjectName?level=10
r.get('/browse/:facet', async (req, res) => {
  const f = req.params.facet;
  if (!FACETS.includes(f)) return res.status(400).json({ error: 'Unknown browse option.' });
  const match = { [f]: { $nin: [null, ''] } };
  if (req.query.level) match.level = req.query.level;
  const rows = await Resource.aggregate([{ $match: match }, { $group: { _id: '$' + f, n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } }]);
  res.json(rows.map((x) => ({ value: x._id, count: x.n })));
});

// Home page data
r.get('/home', async (_req, res) => {
  const [total, byLevel, latest, popular, featured] = await Promise.all([
    Resource.countDocuments(),
    Resource.aggregate([{ $group: { _id: '$level', n: { $sum: 1 } } }]),
    Resource.find().sort('-createdAt').limit(6).lean(),
    Resource.find().sort('-views -createdAt').limit(6).lean(),
    Resource.find({ featured: true }).sort('-createdAt').limit(6).lean(),
  ]);
  res.json({ total, byLevel: Object.fromEntries(byLevel.map((x) => [x._id, x.n])), latest, popular, featured });
});

// One resource + related items. Counts a view.
r.get('/resource/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Resource not found.' });
  const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).lean();
  if (!resource) return res.status(404).json({ error: 'Resource not found.' });
  const related = await Resource.find({
    _id: { $ne: resource._id },
    level: resource.level,
    ...(resource.subjectName ? { subjectName: resource.subjectName } : {}),
  }).sort('-views').limit(6).lean();
  res.json({ resource, related });
});

export default r;
