import { useState } from 'react';
import Picker from './Picker.jsx';
import { api } from '../api.js';

const NAMES = { mcq: 'Section A: Objective', short: 'Section B: Short answer', long: 'Section C: Long answer' };

export default function Papers() {
  const [sel, setSel] = useState({ chapters: [] });
  const [chosen, setChosen] = useState([]);
  const [difficulty, setDifficulty] = useState('mixed');
  const [counts, setCounts] = useState({ mcq: 10, short: 5, long: 2 });
  const [paper, setPaper] = useState(null);
  const [showAns, setShowAns] = useState(false);
  const [err, setErr] = useState('');

  const toggle = (id) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const generate = async () => {
    setErr('');
    try { setPaper(await api('/papers/generate', { method: 'POST', body: { chapters: chosen, difficulty, counts } })); setShowAns(false); }
    catch (e) { setErr(e.message); }
  };
  let n = 0;

  return (
    <div className="sheet">
      <h1>Practice paper maker</h1>
      <div className="no-print">
        <Picker withChapter={false} onChange={setSel} />
        <fieldset className="chapters"><legend>Chapters</legend>
          {sel.chapters?.length ? sel.chapters.map((c) => (
            <label key={c._id} className="chk"><input type="checkbox" checked={chosen.includes(c._id)} onChange={() => toggle(c._id)} />{c.number ? c.number + '. ' : ''}{c.title}</label>
          )) : <span className="empty">No chapters for this subject yet.</span>}
        </fieldset>
        <div className="row">
          <label>Difficulty
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="mixed">Mixed, easy to hard</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </label>
          {['mcq', 'short', 'long'].map((t) => (
            <label key={t}>{t === 'mcq' ? 'Objective' : t === 'short' ? 'Short' : 'Long'}
              <input type="number" min="0" max="50" value={counts[t]} onChange={(e) => setCounts({ ...counts, [t]: e.target.value })} />
            </label>
          ))}
        </div>
        <button className="btn" disabled={!chosen.length} onClick={generate}>Make paper</button>
        {err && <p className="err">{err}</p>}
      </div>

      {paper && (
        <article className="paper">
          <div className="no-print row">
            <button className="btn small" onClick={() => window.print()}>Print or save as PDF</button>
            <button className="btn small ghost" onClick={() => setShowAns(!showAns)}>{showAns ? 'Hide solutions' : 'Show solutions'}</button>
          </div>
          {paper.sections.length === 0 && <p className="empty">No matching questions yet. Try Mixed difficulty or add more questions.</p>}
          {paper.sections.map((s) => (
            <section key={s.type}>
              <h2>{NAMES[s.type]}</h2>
              {s.questions.map((q) => { n++; return (
                <div className="pq" key={q._id}>
                  <p><b>Q{n}.</b> {q.text} <span className={'tag ' + q.difficulty}>{q.difficulty}</span></p>
                  {q.options?.length > 0 && <ol type="A" className="opts">{q.options.map((o, i) => <li key={i}>{o}</li>)}</ol>}
                  {showAns && (
                    <div className="sol">
                      <b>Answer:</b> {q.type === 'mcq' ? String.fromCharCode(65 + q.answerIndex) + '. ' + q.options[q.answerIndex] : q.answerText}
                      {q.explanation && <p>{q.explanation}</p>}
                      {q.diagramUrl && <img className="diagram" src={q.diagramUrl} alt="Diagram for the solution" />}
                    </div>
                  )}
                </div>
              ); })}
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
