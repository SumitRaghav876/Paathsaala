import { useEffect, useState } from 'react';
import { api, LEVELS } from '../api.js';

// Level -> Subject -> Chapter selector. Calls onChange({ level, subject, chapter }).
export default function Picker({ onChange, withChapter = true, refresh = 0 }) {
  const [level, setLevel] = useState('10');
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState('');

  useEffect(() => { api('/subjects?level=' + level).then((s) => { setSubjects(s); setSubject((cur) => (s.some((x) => x._id === cur) ? cur : s[0]?._id || '')); }).catch(() => setSubjects([])); }, [level, refresh]);
  useEffect(() => {
    if (!subject) { setChapters([]); setChapter(''); return; }
    api('/chapters?subject=' + subject).then((c) => { setChapters(c); setChapter((cur) => (c.some((x) => x._id === cur) ? cur : c[0]?._id || '')); }).catch(() => setChapters([]));
  }, [subject, refresh]);
  useEffect(() => { onChange({ level, subject, chapter, chapters }); }, [level, subject, chapter, chapters]); // eslint-disable-line

  return (
    <div className="row">
      <label>Level
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </label>
      <label>Subject
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.length === 0 && <option value="">No subjects yet</option>}
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </label>
      {withChapter && (
        <label>Chapter
          <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
            {chapters.length === 0 && <option value="">No chapters yet</option>}
            {chapters.map((c) => <option key={c._id} value={c._id}>{c.number ? c.number + '. ' : ''}{c.title}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}
