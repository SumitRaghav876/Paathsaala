import { useState } from 'react';
import Picker from './Picker.jsx';
import { api } from '../api.js';

export default function Quiz() {
  const [sel, setSel] = useState({});
  const [qs, setQs] = useState(null);
  const [picked, setPicked] = useState({});
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const start = async () => {
    setErr(''); setResult(null); setPicked({});
    try {
      const data = await api(`/quiz?chapter=${sel.chapter}&count=10`);
      if (!data.length) setErr('No objective questions for this chapter yet.');
      setQs(data);
    } catch (e) { setErr(e.message); }
  };

  const submit = async () => {
    const answers = qs.map((q) => ({ questionId: q._id, choice: picked[q._id] ?? -1 }));
    setResult(await api('/quiz/submit', { method: 'POST', body: { chapter: sel.chapter, answers } }));
  };
  const review = (id) => result?.review.find((r) => r.questionId === id);

  return (
    <div className="sheet">
      <h1>Chapter quiz</h1>
      <Picker onChange={setSel} />
      <button className="btn" disabled={!sel.chapter} onClick={start}>Start 10-question quiz</button>
      {err && <p className="err">{err}</p>}

      {qs?.length > 0 && !result && <p className="progress" role="status">Answered {Object.keys(picked).length} of {qs.length}</p>}
      {result && <p className="score">You scored {result.score} out of {result.total}.</p>}
      {qs?.map((q, i) => {
        const rv = review(q._id);
        return (
          <fieldset key={q._id} className="q">
            <legend>{i + 1}. {q.text} <span className={'tag ' + q.difficulty}>{q.difficulty}</span></legend>
            {q.options.map((o, idx) => (
              <label key={idx} className={'opt' + (rv ? (idx === rv.answerIndex ? ' right' : idx === rv.chosen ? ' wrong' : '') : '')}>
                <input type="radio" name={q._id} disabled={!!result} checked={picked[q._id] === idx} onChange={() => setPicked({ ...picked, [q._id]: idx })} />
                {o}
              </label>
            ))}
            {rv?.explanation && <p className="why"><b>Why:</b> {rv.explanation}</p>}
            {rv?.diagramUrl && <img className="diagram" src={rv.diagramUrl} alt="Diagram for this answer" />}
          </fieldset>
        );
      })}
      {qs?.length > 0 && !result && <button className="btn" onClick={submit}>Check my answers</button>}
    </div>
  );
}
