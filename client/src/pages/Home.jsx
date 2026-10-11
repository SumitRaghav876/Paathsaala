import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, levelLabel, subjectColor } from '../api.js';
import Icon from '../icons.jsx';
import ResourceCard from './ResourceCard.jsx';

const SEGS = [['', 'All'], ['9', 'Class 9'], ['10', 'Class 10'], ['11', 'Class 11'], ['12', 'Class 12'], ['JEE', 'JEE Main'], ['NEET', 'NEET']];
const IDEAS = ['NCERT Science', 'sample paper', 'Physics', 'Hindi medium'];
const STICKERS = [['book', 'Books', 'book', 's-book'], ['notes', 'Notes', 'notes', 's-notes'], ['paper', 'Question papers', 'paper', 's-paper'], ['video', 'Videos', 'video', 's-video']];

export default function Home({ user }) {
  const nav = useNavigate();
  const [lvl, setLvl] = useState('');
  const [q, setQ] = useState('');
  const [home, setHome] = useState(null);
  const [subjects, setSubjects] = useState(null);
  const [types, setTypes] = useState([]);

  useEffect(() => { api('/library/home').then(setHome).catch(() => setHome({ total: 0, popular: [], featured: [] })); }, []);
  useEffect(() => {
    const lv = lvl ? '?level=' + lvl : '';
    api('/library/browse/subjectName' + lv).then(setSubjects).catch(() => setSubjects([]));
    api('/library/browse/type' + lv).then(setTypes).catch(() => setTypes([]));
  }, [lvl]);

  const params = (extra = {}) => new URLSearchParams({ ...(lvl ? { level: lvl } : {}), ...extra });
  const go = (text) => nav('/search?' + params(text ? { q: text } : {}));
  const count = (t) => types.find((x) => x.value === t)?.count || 0;

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>Study material for Class 9 to 12 and JEE, all in one place.</h1>
          <p className="lead">Find textbooks, notes, sample papers and videos. Then practise with quizzes and ask the AI teacher when you get stuck.</p>
          <form className="searchbar" role="search" onSubmit={(e) => { e.preventDefault(); go(q); }}>
            <div className="seg" role="group" aria-label="Choose your class">
              {SEGS.map(([id, label]) => <button type="button" key={id} aria-pressed={lvl === id} className={lvl === id ? 'on' : ''} onClick={() => setLvl(id)}>{label}</button>)}
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a subject, chapter or paper" aria-label="Search the library" />
            <button className="btn"><Icon name="search" size={20} />Search</button>
          </form>
          <p className="try">Popular searches: {IDEAS.map((s) => <button key={s} className="chip" onClick={() => go(s)}>{s}</button>)}</p>
        </div>
        <div className="stickers">
          {STICKERS.map(([t, label, icon, cls]) => (
            <Link key={t} to={'/search?' + params({ type: t })} className={'sticker ' + cls}>
              <Icon name={icon} />
              <span><b>{label}</b><small>{count(t) ? `${count(t)} to explore` : 'Coming soon'}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>{lvl ? `Subjects in ${levelLabel(lvl)}` : 'Pick a subject'}</h2>
        {subjects === null && <p className="empty">Loading subjects...</p>}
        {subjects?.length === 0 && <p className="empty">No subjects yet. {user?.role === 'admin' ? <Link to="/admin">Add resources in the admin panel.</Link> : 'Please check back soon.'}</p>}
        <div className="tiles">
          {subjects?.slice(0, 12).map((s) => (
            <Link key={s.value} className="tile" data-c={subjectColor(s.value)} to={'/search?' + params({ subjectName: s.value })}>
              <span className="tname">{s.value}</span>
              <span className="tcount">{s.count} {s.count === 1 ? 'resource' : 'resources'}</span>
            </Link>
          ))}
        </div>
        {subjects?.length > 12 && <p><Link to={'/browse/subjectName' + (lvl ? '?level=' + lvl : '')}>See all subjects</Link></p>}
      </section>

      <section>
        <h2>Practise and get help</h2>
        <div className="features">
          <Link to="/quiz" className="feature f-pink"><span className="ficon"><Icon name="quiz" size={28} /></span><h3>Chapter quizzes</h3><p>Answer objective questions and see why each answer is right.</p></Link>
          <Link to="/papers" className="feature f-teal"><span className="ficon"><Icon name="paper" size={28} /></span><h3>Paper maker</h3><p>Choose chapters and difficulty. Get a printable paper, easy to hard, with solutions.</p></Link>
          <Link to="/teacher" className="feature f-violet"><span className="ficon"><Icon name="spark" size={28} /></span><h3>AI teacher</h3><p>Simple explanations and step-by-step maths, in English, Hindi or Hinglish.</p></Link>
        </div>
      </section>

      {home?.featured?.length > 0 && (<section><h2>Start here</h2><ul className="reslist panel">{home.featured.map((r) => <ResourceCard key={r._id} r={r} />)}</ul></section>)}
      {home?.popular?.length > 0 && (<section><h2>Most viewed</h2><ul className="reslist panel">{home.popular.map((r) => <ResourceCard key={r._id} r={r} />)}</ul></section>)}

      {!user && (
        <section className="cta">
          <div><h2>Make it yours with a free account</h2><p>Save resources, keep your quiz scores and pick up where you left off.</p></div>
          <Link className="btn" to="/login">Create free account</Link>
        </section>
      )}
    </div>
  );
}
