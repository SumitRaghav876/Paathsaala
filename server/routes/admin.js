import { Router } from 'express';
import mongoose from 'mongoose';
import { Subject, Chapter, Resource, Question, LEVELS, RESOURCE_TYPES } from '../models.js';
import { requireAdmin } from '../middleware/auth.js';

const r = Router();
r.use(requireAdmin);

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined && o[k] !== '').map((k) => [k, o[k]]));
const bad = (res, msg) => res.status(400).json({ error: msg });
const validId = (id) => mongoose.isValidObjectId(id);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const str = (v) => (v === undefined || v === null ? '' : String(v).trim());

function normLevel(v) {
  const s = str(v).toLowerCase().replace(/class|std|standard|grade/g, '').replace(/[\s._-]/g, '');
  const roman = { ix: '9', x: '10', xi: '11', xii: '12' };
  if (roman[s]) return roman[s];
  if (/^jee/.test(s)) return 'JEE';
  return LEVELS.find((l) => l.toLowerCase() === s) || null;
}
const TYPE_ALIASES = { textbook: 'book', ebook: 'book', 'question paper': 'paper', 'sample paper': 'paper', 'previous paper': 'paper', solutions: 'solution', 'ncert solutions': 'solution', note: 'notes', videos: 'video' };

// Accepts both form fields and CSV columns. Returns { doc } or { error }.
function cleanResource(b) {
  const title = str(b.title);
  const rawType = str(b.type).toLowerCase();
  const type = TYPE_ALIASES[rawType] || rawType;
  const url = str(b.url);
  const level = normLevel(b.level);
  if (!title) return { error: 'Title is missing.' };
  if (!RESOURCE_TYPES.includes(type)) return { error: `Type "${rawType}" is not valid. Use: ${RESOURCE_TYPES.join(', ')}.` };
  if (!/^https?:\/\//i.test(url)) return { error: 'Link must start with http:// or https://' };
  if (!level) return { error: 'Level must be 9, 10, 11, 12, JEE, NEET or UPSC.' };
  const year = Number(b.year);
  const tags = Array.isArray(b.tags) ? b.tags : str(b.tags).split(/[;,]/);
  const doc = {
    title, type, url, level,
    description: str(b.description) || undefined,
    board: str(b.board) || undefined,
    subjectName: str(b.subject ?? b.subjectName) || undefined,
    chapterName: str(b.chapter ?? b.chapterName) || undefined,
    language: str(b.language) || 'English',
    provider: str(b.provider) || undefined,
    year: Number.isFinite(year) && year > 1900 ? year : undefined,
    tags: tags.map((t) => str(t).toLowerCase()).filter(Boolean),
    featured: ['true', 'yes', '1'].includes(str(b.featured).toLowerCase()),
  };
  Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
  return { doc };
}

// ---- Subjects ----
r.post('/subjects', async (req, res) => {
  const { name, level } = req.body;
  if (!name?.trim() || !LEVELS.includes(level)) return bad(res, 'Subject name and a valid level are required.');
  res.json(await Subject.create({ name: name.trim(), level }));
});
r.delete('/subjects/:id', async (req, res) => {
  const chapters = await Chapter.find({ subject: req.params.id }).select('_id');
  await Question.deleteMany({ subject: req.params.id });
  await Chapter.deleteMany({ subject: req.params.id });
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ ok: true, removedChapters: chapters.length });
});

// ---- Chapters (also holds your written notes) ----
r.post('/chapters', async (req, res) => {
  if (!validId(req.body.subject) || !req.body.title?.trim()) return bad(res, 'Choose a subject and enter a chapter title.');
  res.json(await Chapter.create({ ...pick(req.body, ['subject', 'number', 'title', 'notes']), title: req.body.title.trim() }));
});
r.patch('/chapters/:id', async (req, res) => {
  const c = await Chapter.findByIdAndUpdate(req.params.id, pick(req.body, ['number', 'title', 'notes']), { new: true });
  if (!c) return res.status(404).json({ error: 'Chapter not found.' });
  res.json(c);
});
r.delete('/chapters/:id', async (req, res) => {
  await Question.deleteMany({ chapter: req.params.id });
  await Chapter.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ---- Questions ----
r.get('/questions', async (req, res) => {
  if (!validId(req.query.chapter)) return bad(res, 'Pick a chapter.');
  res.json(await Question.find({ chapter: req.query.chapter }).sort('type difficulty'));
});
r.post('/questions', async (req, res) => {
  const b = req.body;
  if (!validId(b.chapter) || !b.text?.trim()) return bad(res, 'Choose a chapter and write the question.');
  const ch = await Chapter.findById(b.chapter);
  if (!ch) return bad(res, 'Chapter not found.');
  const doc = { ...pick(b, ['type', 'difficulty', 'text', 'explanation', 'diagramUrl', 'year']), chapter: ch._id, subject: ch.subject };
  if (b.type === 'mcq') {
    const options = (b.options || []).map((o) => String(o).trim()).filter(Boolean);
    const idx = Number(b.answerIndex);
    if (options.length < 2) return bad(res, 'An objective question needs at least 2 options.');
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) return bad(res, 'Mark which option is correct.');
    doc.options = options; doc.answerIndex = idx;
  } else {
    if (!b.answerText?.trim()) return bad(res, 'Write the model answer.');
    doc.answerText = b.answerText.trim();
  }
  res.json(await Question.create(doc));
});
r.delete('/questions/:id', async (req, res) => { await Question.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

// ---- Library resources ----
r.post('/resources', async (req, res) => {
  const { doc, error } = cleanResource(req.body);
  if (error) return bad(res, error);
  res.json(await Resource.create(doc));
});
r.delete('/resources/:id', async (req, res) => { await Resource.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

// ---- Bulk import (rows come from a CSV parsed in the browser) ----
r.post('/import/resources', async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows.slice(0, 2000) : [];
  const ops = [], errors = [];
  rows.forEach((row, i) => {
    const { doc, error } = cleanResource(row);
    if (error) errors.push({ row: i + 2, error });
    else ops.push({ updateOne: { filter: { title: doc.title, url: doc.url }, update: { $set: doc }, upsert: true } });
  });
  if (ops.length) await Resource.bulkWrite(ops);
  res.json({ imported: ops.length, errorCount: errors.length, errors: errors.slice(0, 50) });
});

// Syllabus: level, subject, chapter_no, chapter. Creates missing subjects; updates numbers of existing chapters.
r.post('/import/chapters', async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows.slice(0, 2000) : [];
  const subjects = new Map(), errors = [];
  let imported = 0;
  for (const [i, row] of rows.entries()) {
    try {
      const level = normLevel(row.level), sname = str(row.subject), title = str(row.chapter);
      if (!level || !sname || !title) throw new Error('level, subject and chapter are required');
      const sk = level + '|' + sname.toLowerCase();
      const subject = subjects.get(sk) || await Subject.findOne({ name: new RegExp('^' + esc(sname) + '$', 'i'), level }) || await Subject.create({ name: sname, level });
      subjects.set(sk, subject);
      const number = Number(row.chapter_no) || undefined;
      await Chapter.findOneAndUpdate({ subject: subject._id, title: new RegExp('^' + esc(title) + '$', 'i') },
        { $set: { subject: subject._id, title, ...(number ? { number } : {}) } }, { upsert: true });
      imported++;
    } catch (e) { errors.push({ row: i + 2, error: e.message }); }
  }
  res.json({ imported, errorCount: errors.length, errors: errors.slice(0, 50) });
});

r.post('/import/questions', async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows.slice(0, 2000) : [];
  const subjects = new Map(), chapters = new Map();
  const errors = [];
  let imported = 0;

  for (const [i, row] of rows.entries()) {
    try {
      const level = normLevel(row.level);
      const sname = str(row.subject), cname = str(row.chapter);
      const text = str(row.question ?? row.text);
      const type = str(row.type || 'mcq').toLowerCase();
      if (!level || !sname || !cname || !text) throw new Error('level, subject, chapter and question are required');
      if (!['mcq', 'short', 'long'].includes(type)) throw new Error('type must be mcq, short or long');

      const sk = level + '|' + sname.toLowerCase();
      let subject = subjects.get(sk) || await Subject.findOne({ name: new RegExp('^' + esc(sname) + '$', 'i'), level }) || await Subject.create({ name: sname, level });
      subjects.set(sk, subject);
      const ck = subject._id + '|' + cname.toLowerCase();
      let chapter = chapters.get(ck) || await Chapter.findOne({ subject: subject._id, title: new RegExp('^' + esc(cname) + '$', 'i') })
        || await Chapter.create({ subject: subject._id, title: cname, number: Number(row.chapter_no) || undefined });
      chapters.set(ck, chapter);

      const diff = str(row.difficulty).toLowerCase();
      const doc = {
        subject: subject._id, chapter: chapter._id, type, text,
        difficulty: ['easy', 'medium', 'hard'].includes(diff) ? diff : 'medium',
        explanation: str(row.explanation) || undefined,
        diagramUrl: str(row.diagram_url) || undefined,
        year: Number(row.year) || undefined,
      };
      if (type === 'mcq') {
        const opts = ['a', 'b', 'c', 'd'].map((k) => str(row['option_' + k]));
        const c = str(row.correct).toLowerCase();
        const idx = 'abcd'.includes(c) && c ? 'abcd'.indexOf(c) : Number(c) - 1;
        if (opts.filter(Boolean).length < 2) throw new Error('an objective question needs at least 2 options');
        if (!Number.isInteger(idx) || idx < 0 || idx > 3 || !opts[idx]) throw new Error('"correct" must be A, B, C or D and point to a filled option');
        doc.options = opts.filter(Boolean);
        doc.answerIndex = doc.options.indexOf(opts[idx]);
      } else {
        doc.answerText = str(row.answer);
        if (!doc.answerText) throw new Error('"answer" is required for short and long questions');
      }
      await Question.create(doc);
      imported++;
    } catch (e) {
      errors.push({ row: i + 2, error: e.message });
    }
  }
  res.json({ imported, errorCount: errors.length, errors: errors.slice(0, 50) });
});

export default r;
