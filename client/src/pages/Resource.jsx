import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, rememberRecent, levelLabel, TYPE_LABELS } from '../api.js';
import { useBookmarks } from '../bookmarks.jsx';
import ResourceCard from './ResourceCard.jsx';

function embedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return 'https://www.youtube.com/embed/' + u.pathname.slice(1);
    if (u.hostname.endsWith('youtube.com') && u.searchParams.get('v')) return 'https://www.youtube.com/embed/' + u.searchParams.get('v');
  } catch { /* not a valid URL */ }
  return url;
}

export default function Resource() {
  const { id } = useParams();
  const nav = useNavigate();
  const { ids, toggle, loggedIn } = useBookmarks();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setData(null); setErr(''); setPreview(false);
    api('/library/resource/' + id).then((d) => { setData(d); rememberRecent(d.resource); }).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="sheet narrow"><h1>Not found</h1><p>{err}</p><Link to="/search">Back to the library</Link></div>;
  if (!data) return <div className="sheet narrow"><p className="empty">Loading...</p></div>;
  const r = data.resource;
  const saved = ids.has(String(r._id));
  const rows = [['Type', TYPE_LABELS[r.type]], ['Class', r.level && levelLabel(r.level)], ['Subject', r.subjectName], ['Chapter', r.chapterName], ['Board', r.board], ['Language', r.language], ['Provider', r.provider], ['Year', r.year], ['Views', r.views]].filter(([, v]) => v);

  return (
    <div className="sheet wide">
      <p><Link to="/search">Library</Link> / {r.subjectName && <Link to={'/search?' + new URLSearchParams({ subjectName: r.subjectName, level: r.level })}>{r.subjectName}</Link>}</p>
      <h1>{r.title}</h1>
      {r.description && <p className="lead">{r.description}</p>}
      <div className="row">
        <a className="btn" href={r.url} target="_blank" rel="noreferrer">Open at source</a>
        <button className="btn ghost" onClick={() => setPreview(!preview)}>{preview ? 'Hide preview' : 'Preview here'}</button>
        <button className="btn ghost" aria-pressed={saved} onClick={() => (loggedIn ? toggle(r._id) : nav('/login'))}>{saved ? 'Saved to My library' : 'Save to My library'}</button>
      </div>
      {preview && (
        <div className="viewer">
          <iframe title={r.title} src={embedUrl(r.url)} loading="lazy" allowFullScreen />
          <p className="empty">If the preview stays blank, the source site does not allow embedding. Use Open at source.</p>
        </div>
      )}
      <dl className="meta">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {r.tags?.length > 0 && <p>{r.tags.map((t) => <Link key={t} className="chip" to={'/search?q=' + encodeURIComponent(t)}>{t}</Link>)}</p>}
      <p className="empty">This item is hosted by {r.provider || 'its original publisher'}. Its accuracy and availability are the source's responsibility.</p>

      {r.subjectName && (
        <p className="prep">Practising {r.subjectName}? <Link to="/quiz">Take a chapter quiz</Link>, <Link to="/papers">make a practice paper</Link> or <Link to="/teacher" state={{ q: `Explain the key ideas of ${r.chapterName || r.subjectName} for ${levelLabel(r.level)}` }}>ask the AI teacher</Link>.</p>
      )}
      {data.related.length > 0 && (<><h2>More in {r.subjectName || 'this class'}</h2><ul className="reslist">{data.related.map((x) => <ResourceCard key={x._id} r={x} />)}</ul></>)}
    </div>
  );
}
