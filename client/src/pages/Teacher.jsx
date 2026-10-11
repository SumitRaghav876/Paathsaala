import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, getUser, LEVELS } from '../api.js';

const STARTERS = ['Explain photosynthesis simply', 'Solve x² − 5x + 6 = 0 step by step', 'What is Newton\'s second law? Give examples', 'Explain mole concept for JEE'];

export default function Teacher() {
  const loc = useLocation();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [mode, setMode] = useState('explain');
  const [language, setLanguage] = useState('english');
  const [level, setLevel] = useState(getUser()?.level || '10');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const end = useRef(null);
  const sentInitial = useRef(false);

  const send = async (content) => {
    if (!content.trim() || busy) return;
    const next = [...msgs, { role: 'user', content }];
    setMsgs(next); setText(''); setErr(''); setBusy(true);
    try {
      const { reply } = await api('/ai/teach', { method: 'POST', body: { mode, language, level, messages: next } });
      setMsgs([...next, { role: 'assistant', content: reply }]);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  useEffect(() => { if (loc.state?.q && !sentInitial.current) { sentInitial.current = true; send(loc.state.q); } }, []); // eslint-disable-line
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  return (
    <div className="sheet">
      <h1>AI teacher</h1>
      <div className="row">
        <label>Help me<select value={mode} onChange={(e) => setMode(e.target.value)}><option value="explain">Understand a topic</option><option value="solve">Solve a problem</option></select></label>
        <label>Language<select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="english">English</option><option value="hindi">Hindi</option><option value="hinglish">Hinglish</option></select></label>
        <label>Level<select value={level} onChange={(e) => setLevel(e.target.value)}>{LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
      </div>
      <div className="chat" aria-live="polite">
        {msgs.length === 0 && (<div><p className="empty">Ask about any chapter. For a maths problem, switch to "Solve a problem" first.</p><p>{STARTERS.map((t) => <button key={t} className="chip" onClick={() => send(t)}>{t}</button>)}</p></div>)}
        {msgs.map((m, i) => <div key={i} className={'bubble ' + m.role}>{m.content}</div>)}
        {busy && <div className="bubble assistant">Writing the explanation...</div>}
        <div ref={end} />
      </div>
      {err && <p className="err">{err}</p>}
      <div className="composer">
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'solve' ? 'Type the problem, e.g. Find the roots of x² − 5x + 6 = 0' : 'What do you want to understand?'}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text); } }} aria-label="Your message" />
        <button className="btn" disabled={busy || !text.trim()} onClick={() => send(text)}>Send</button>
      </div>
    </div>
  );
}
