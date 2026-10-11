import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';

const r = Router();

const SYSTEM = {
  explain: `You are a friendly, patient school teacher for Indian students (Class 10, Class 12, NEET, UPSC).
Explain the topic in simple language with everyday examples. Structure: 1) one-line idea, 2) explanation in short steps,
3) a labelled text diagram when it helps (plain text/ASCII, keep it small), 4) 3 key points to remember for the exam.
Follow NCERT terminology. If the student seems confused, ask one short check question at the end.`,
  solve: `You are a maths and science tutor for Indian students. Solve the problem step by step.
Show the formula used, each calculation on its own line, and the final answer clearly marked. After the solution,
add "Why this works" in 2-3 simple sentences and one similar practice problem (without the answer).`,
};
const LANG = {
  english: 'Reply in simple English.',
  hindi: 'Reply in simple Hindi (Devanagari). Keep scientific terms in English in brackets.',
  hinglish: 'Reply in Hinglish (Hindi written in Roman letters mixed with English terms).',
};

// body: { mode: 'explain'|'solve', language, level, messages: [{role, content}] }
r.post('/teach', optionalAuth, async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY)
    return res.status(503).json({ error: 'AI Teacher is not configured. Add ANTHROPIC_API_KEY in server/.env.' });
  const { mode = 'explain', language = 'english', level = '10', messages = [] } = req.body;
  const clean = messages.slice(-12).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content).slice(0, 4000),
  }));
  if (!clean.length || clean[clean.length - 1].role !== 'user')
    return res.status(400).json({ error: 'Ask a question first.' });

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 1500,
        system: `${SYSTEM[mode] || SYSTEM.explain}\nStudent level: ${level}. ${LANG[language] || LANG.english}`,
        messages: clean,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(502).json({ error: data?.error?.message || 'AI request failed.' });
    res.json({ reply: data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n') });
  } catch {
    res.status(502).json({ error: 'Could not reach the AI service.' });
  }
});

export default r;
