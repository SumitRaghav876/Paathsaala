export const getToken = () => localStorage.getItem('token');
export const getUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
export const saveSession = ({ token, user }) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); };
export const clearSession = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); };

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const LEVELS = [
  { id: '9', label: 'Class 9' },
  { id: '10', label: 'Class 10' },
  { id: '11', label: 'Class 11' },
  { id: '12', label: 'Class 12' },
  { id: 'JEE', label: 'JEE Main' },
  { id: 'NEET', label: 'NEET' },
  { id: 'UPSC', label: 'UPSC' },
];

export const levelLabel = (l) => (/^\d+$/.test(String(l)) ? 'Class ' + l : l === 'JEE' ? 'JEE Main' : l);
export const TYPE_LABELS = { book: 'Book', notes: 'Notes', paper: 'Paper', solution: 'Solutions', video: 'Video', worksheet: 'Practice', other: 'Other' };
export const FACET_LABELS = { level: 'Class / exam', subjectName: 'Subject', type: 'Resource type', board: 'Board', language: 'Language', provider: 'Provider', year: 'Year' };
export const facetValueLabel = (facet, v) => (facet === 'level' ? levelLabel(v) : facet === 'type' ? TYPE_LABELS[v] || v : String(v));

// "Recently viewed" is kept in this browser only
export const getRecent = () => { try { return JSON.parse(localStorage.getItem('recent')) || []; } catch { return []; } };
export const rememberRecent = (r) => {
  const item = { _id: r._id, title: r.title, type: r.type, level: r.level, subjectName: r.subjectName };
  localStorage.setItem('recent', JSON.stringify([item, ...getRecent().filter((x) => x._id !== r._id)].slice(0, 12)));
};

// Stable colour (1 to 6) for a subject tile, so "Science" is always the same colour
export const subjectColor = (name = '') => { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 6; return h + 1; };
