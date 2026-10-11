import { useEffect, useState } from 'react';
import Picker from './Picker.jsx';
import { api, LEVELS, TYPE_LABELS, levelLabel } from '../api.js';

const TABS = [['resources', 'Library resources'], ['import', 'Bulk import'], ['structure', 'Subjects and chapters'], ['questions', 'Questions'], ['notes', 'Notes']];
const post = (path, body) => api('/admin' + path, { method: 'POST', body });
const del = (path) => api('/admin' + path, { method: 'DELETE' });

export default function Admin({ user }) {
  const [tab, setTab] = useState('resources');
  const [sel, setSel] = useState({});
  const [refresh, setRefresh] = useState(0);
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const reload = () => setRefresh((n) => n + 1);

  if (user?.role !== 'admin') {
    return <div className="sheet narrow"><h1>Admin</h1><p>This page is for admins. Log in with an admin account, or run <code>npm run make-admin -- your@email.com</code> in the server folder, then log in again.</p></div>;
  }
  // Wrap an action: show success or the server's error message
  const run = async (fn, ok) => {
    setMsg({ ok: '', err: '' });
    try { await fn(); setMsg({ ok, err: '' }); reload(); return true; }
    catch (e) { setMsg({ ok: '', err: e.message }); return false; }
  };

  return (
    <div className="sheet wide">
      <h1>Admin</h1>
      <div className="tabs" role="tablist">
        {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); setMsg({ ok: '', err: '' }); }}>{label}</button>)}
      </div>
      {['structure', 'questions', 'notes'].includes(tab) && <Picker onChange={setSel} withChapter={tab !== 'structure'} refresh={refresh} />}
      {msg.ok && <p className="okmsg" role="status">{msg.ok}</p>}
      {msg.err && <p className="err" role="alert">{msg.err}</p>}

      {tab === 'structure' && <Structure sel={sel} run={run} />}
      {tab === 'questions' && <Questions sel={sel} run={run} refresh={refresh} />}
      {tab === 'resources' && <Resources run={run} refresh={refresh} />}
      {tab === 'import' && <Importer />}
      {tab === 'notes' && <Notes sel={sel} run={run} />}
    </div>
  );
}

function Structure({ sel, run }) {
  const [subj, setSubj] = useState('');
  const [ch, setCh] = useState({ number: '', title: '' });
  const chapters = sel.chapters || [];
  return (
    <>
      <h2>Add a subject to {LEVELS.find((l) => l.id === sel.level)?.label}</h2>
      <div className="row">
        <label>Subject name<input value={subj} onChange={(e) => setSubj(e.target.value)} placeholder="e.g. Physics" /></label>
        <button className="btn" onClick={async () => (await run(() => post('/subjects', { name: subj, level: sel.level }), 'Subject added.')) && setSubj('')}>Add subject</button>
        {sel.subject && <button className="btn ghost" onClick={() => confirm('Delete this subject with all its chapters, questions and resources?') && run(() => del('/subjects/' + sel.subject), 'Subject deleted.')}>Delete selected subject</button>}
      </div>

      <h2>Chapters in the selected subject</h2>
      <div className="row">
        <label>No.<input type="number" min="1" value={ch.number} onChange={(e) => setCh({ ...ch, number: e.target.value })} /></label>
        <label>Chapter title<input value={ch.title} onChange={(e) => setCh({ ...ch, title: e.target.value })} /></label>
        <button className="btn" disabled={!sel.subject} onClick={async () => (await run(() => post('/chapters', { subject: sel.subject, number: ch.number || undefined, title: ch.title }), 'Chapter added.')) && setCh({ number: '', title: '' })}>Add chapter</button>
      </div>
      <ul className="list">
        {chapters.map((c) => (
          <li key={c._id}><span>{c.number ? c.number + '. ' : ''}{c.title}</span>
            <button className="link" onClick={() => confirm('Delete this chapter and its questions?') && run(() => del('/chapters/' + c._id), 'Chapter deleted.')}>Delete</button></li>
        ))}
        {chapters.length === 0 && <li className="empty">No chapters yet.</li>}
      </ul>
    </>
  );
}

const blankQ = { type: 'mcq', difficulty: 'easy', text: '', options: ['', '', '', ''], answerIndex: 0, answerText: '', explanation: '', diagramUrl: '', year: '' };

function Questions({ sel, run, refresh }) {
  const [q, setQ] = useState(blankQ);
  const [list, setList] = useState([]);
  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });
  useEffect(() => { if (sel.chapter) api('/admin/questions?chapter=' + sel.chapter).then(setList).catch(() => setList([])); else setList([]); }, [sel.chapter, refresh]);

  const save = async () => {
    const body = { ...q, chapter: sel.chapter, answerIndex: Number(q.answerIndex) };
    if (await run(() => post('/questions', body), 'Question saved.')) setQ({ ...blankQ, type: q.type, difficulty: q.difficulty, year: q.year });
  };

  return (
    <>
      <h2>Add a question</h2>
      <div className="row">
        <label>Type<select value={q.type} onChange={set('type')}><option value="mcq">Objective (MCQ)</option><option value="short">Short answer</option><option value="long">Long answer</option></select></label>
        <label>Difficulty<select value={q.difficulty} onChange={set('difficulty')}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <label>Previous-year (optional)<input type="number" placeholder="e.g. 2023" value={q.year} onChange={set('year')} /></label>
      </div>
      <div className="stack">
        <label>Question<textarea rows={3} value={q.text} onChange={set('text')} /></label>
        {q.type === 'mcq' ? (
          <fieldset className="chapters"><legend>Options. Select the correct one.</legend>
            {q.options.map((o, i) => (
              <label key={i} className="chk">
                <input type="radio" name="correct" checked={Number(q.answerIndex) === i} onChange={() => setQ({ ...q, answerIndex: i })} aria-label={`Option ${i + 1} is correct`} />
                <input className="grow" value={o} placeholder={`Option ${i + 1}`} onChange={(e) => setQ({ ...q, options: q.options.map((x, j) => (j === i ? e.target.value : x)) })} />
              </label>
            ))}
          </fieldset>
        ) : <label>Model answer<textarea rows={4} value={q.answerText} onChange={set('answerText')} /></label>}
        <label>Explanation (shown with the solution)<textarea rows={2} value={q.explanation} onChange={set('explanation')} /></label>
        <label>Diagram image link (optional)<input value={q.diagramUrl} onChange={set('diagramUrl')} placeholder="https://..." /></label>
        <div><button className="btn" disabled={!sel.chapter || !q.text.trim()} onClick={save}>Save question</button></div>
      </div>

      <h2>Questions in this chapter ({list.length})</h2>
      <ul className="list">
        {list.map((x) => (
          <li key={x._id}>
            <div><b>{x.text}</b><small>{x.type}, {x.difficulty}{x.year ? ', ' + x.year : ''}{x.type === 'mcq' ? '. Answer: ' + x.options[x.answerIndex] : ''}</small></div>
            <button className="link" onClick={() => confirm('Delete this question?') && run(() => del('/questions/' + x._id), 'Question deleted.')}>Delete</button>
          </li>
        ))}
        {list.length === 0 && <li className="empty">No questions yet for this chapter.</li>}
      </ul>
    </>
  );
}

const RES_TYPES = Object.entries(TYPE_LABELS);
const blankR = { type: 'book', level: '10', subjectName: '', chapterName: '', board: '', language: 'English', provider: '', year: '', url: '', title: '', description: '', tags: '', featured: false };

function Resources({ run, refresh }) {
  const [f, setF] = useState(blankR);
  const [filter, setFilter] = useState('');
  const [list, setList] = useState([]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  useEffect(() => { api('/library/search?sort=new&limit=50' + (filter ? '&level=' + filter : '')).then((d) => setList(d.items)).catch(() => setList([])); }, [filter, refresh]);

  return (
    <>
      <h2>Add a library resource</h2>
      <p className="empty">Link to the official file or page (NCERT, CBSE, NIOS, DIKSHA...) or to a file you have the rights to share. The site does not copy the file.</p>
      <div className="row">
        <label>Type<select value={f.type} onChange={set('type')}>{RES_TYPES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></label>
        <label>Class<select value={f.level} onChange={set('level')}>{LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
        <label>Subject<input value={f.subjectName} onChange={set('subjectName')} placeholder="Physics" /></label>
        <label>Chapter (optional)<input value={f.chapterName} onChange={set('chapterName')} /></label>
      </div>
      <div className="row">
        <label>Board<input value={f.board} onChange={set('board')} placeholder="NCERT, CBSE" /></label>
        <label>Language<input value={f.language} onChange={set('language')} /></label>
        <label>Provider<input value={f.provider} onChange={set('provider')} placeholder="NCERT" /></label>
        <label>Year<input type="number" value={f.year} onChange={set('year')} /></label>
      </div>
      <div className="stack">
        <label>Title<input value={f.title} onChange={set('title')} /></label>
        <label>Link<input value={f.url} onChange={set('url')} placeholder="https://..." /></label>
        <label>Short description<textarea rows={2} value={f.description} onChange={set('description')} /></label>
        <label>Tags (separate with semicolons)<input value={f.tags} onChange={set('tags')} placeholder="sample paper; 2024" /></label>
        <label className="chk"><input type="checkbox" checked={f.featured} onChange={set('featured')} /> Show on the home page under Start here</label>
        <div><button className="btn" disabled={!f.title.trim() || !f.url.trim()} onClick={async () => (await run(() => post('/resources', { ...f, year: f.year || undefined }), 'Resource added.')) && setF({ ...f, title: '', url: '', description: '', tags: '', chapterName: '' })}>Add resource</button></div>
      </div>

      <h2>Recently added</h2>
      <div className="row"><label>Show<select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All classes</option>{LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label></div>
      <ul className="list">
        {list.map((r) => (
          <li key={r._id}><div><b>{r.title}</b><small>{[TYPE_LABELS[r.type], r.level && levelLabel(r.level), r.subjectName, r.board, r.year].filter(Boolean).join(', ')}</small></div>
            <button className="link" onClick={() => confirm('Delete this resource?') && run(() => del('/resources/' + r._id), 'Resource deleted.')}>Delete</button></li>
        ))}
        {list.length === 0 && <li className="empty">No resources yet.</li>}
      </ul>
    </>
  );
}

// ---- CSV bulk import ----
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '');
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  const filled = rows.filter((r) => r.some((x) => x.trim() !== ''));
  if (filled.length < 2) return [];
  const keys = filled[0].map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
  return filled.slice(1).map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

const SAMPLES = {
  resources: `title,type,level,subject,chapter,board,language,provider,year,url,description,tags
NCERT Science textbook Class 10,book,10,Science,,NCERT,English,NCERT,,https://ncert.nic.in/textbook.php,Official textbook,science;ncert
CBSE sample paper Physics Class 12,paper,12,Physics,,CBSE,English,CBSE,2024,https://cbseacademic.nic.in/,Sample paper with marking scheme,sample paper;physics
`,
  chapters: `level,subject,chapter_no,chapter
11,Physics,1,Units and Measurements
11,Physics,2,Motion in a Straight Line
JEE,Mathematics,1,Sets Relations and Functions
`,
  questions: `level,subject,chapter,chapter_no,type,difficulty,question,option_a,option_b,option_c,option_d,correct,answer,explanation,year,diagram_url
10,Science,Life Processes,5,mcq,easy,Which organ absorbs most digested food?,Stomach,Small intestine,Large intestine,Oesophagus,B,,Villi in the small intestine increase the surface area.,,
10,Science,Life Processes,5,short,easy,Why are villi present in the small intestine?,,,,,,Villi increase the surface area for absorption.,Larger area means faster absorption.,2023,
`,
};

function Importer() {
  const [kind, setKind] = useState('resources');
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const load = async (file) => {
    setResult(null); setErr('');
    if (!file) return;
    setFileName(file.name);
    const parsed = parseCsv(await file.text());
    setRows(parsed);
    if (!parsed.length) setErr('No data rows found. The first row must be the column names.');
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([SAMPLES[kind]], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `sample-${kind}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const send = async () => {
    setBusy(true); setErr(''); setResult(null);
    try { setResult(await post('/import/' + kind, { rows })); setRows([]); setFileName(''); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <h2>Import many items from a CSV file</h2>
      <p className="empty">Export your sheet from Excel or Google Sheets as CSV. Up to 2,000 rows per file. Importing resources again updates existing ones with the same title and link, so it is safe to repeat.</p>
      <div className="row">
        <label>What are you importing?<select value={kind} onChange={(e) => { setKind(e.target.value); setRows([]); setResult(null); setFileName(''); }}><option value="resources">Library resources</option><option value="chapters">Syllabus (subjects and chapters)</option><option value="questions">Quiz and paper questions</option></select></label>
        <button className="btn ghost" onClick={download}>Download sample CSV</button>
      </div>
      <label>CSV file<input type="file" accept=".csv,text/csv" onChange={(e) => load(e.target.files[0])} /></label>
      {err && <p className="err" role="alert">{err}</p>}
      {rows.length > 0 && (
        <>
          <p><b>{fileName}</b>: {rows.length} rows ready. First row: <code>{Object.values(rows[0]).filter(Boolean).slice(0, 4).join(' | ')}</code></p>
          <button className="btn" disabled={busy} onClick={send}>{busy ? 'Importing...' : `Import ${rows.length} rows`}</button>
        </>
      )}
      {result && (
        <div role="status">
          <p className="okmsg">{result.imported} imported{result.errorCount ? `, ${result.errorCount} skipped` : ''}.</p>
          {result.errors.length > 0 && <ul className="list">{result.errors.map((e, i) => <li key={i}><span>Row {e.row}</span><small>{e.error}</small></li>)}</ul>}
        </div>
      )}
      <h3>Columns</h3>
      <p className="empty">{kind === 'chapters' ? 'level (9, 10, 11, 12, JEE, NEET, UPSC), subject, chapter_no, chapter. Copy the chapter list from the official NCERT or CBSE syllabus page. Missing subjects are created; re-importing updates chapter numbers.'
        : kind === 'resources'
        ? 'title, type (book, notes, paper, solution, video, worksheet), level (9, 10, 11, 12, JEE, NEET, UPSC), subject, chapter, board, language, provider, year, url, description, tags, featured. Required: title, type, level, url.'
        : 'level, subject, chapter, chapter_no, type (mcq, short, long), difficulty (easy, medium, hard), question, option_a to option_d, correct (A to D), answer (short and long), explanation, year, diagram_url. Missing subjects and chapters are created automatically.'}</p>
    </>
  );
}

function Notes({ sel, run }) {
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState('');
  useEffect(() => { if (sel.chapter) api('/chapters/' + sel.chapter).then((c) => { setNotes(c.notes || ''); setLoaded(sel.chapter); }); else { setNotes(''); setLoaded(''); } }, [sel.chapter]);
  return (
    <>
      <h2>Notes for this chapter</h2>
      <div className="stack">
        <textarea rows={14} value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="Chapter notes" placeholder="Write your own notes. Plain text; line breaks are kept." />
        <div><button className="btn" disabled={!sel.chapter || loaded !== sel.chapter} onClick={() => run(() => api('/admin/chapters/' + sel.chapter, { method: 'PATCH', body: { notes } }), 'Notes saved.')}>Save notes</button></div>
      </div>
    </>
  );
}
