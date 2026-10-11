import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getRecent, getUser, levelLabel } from '../api.js';
import ResourceCard from './ResourceCard.jsx';
import { useBookmarks } from '../bookmarks.jsx';

export default function MyLibrary() {
  const user = getUser();
  const { ids } = useBookmarks();
  const [saved, setSaved] = useState(null);
  const [history, setHistory] = useState([]);
  const recent = getRecent();

  useEffect(() => { if (user) api('/me/bookmarks').then(setSaved).catch(() => setSaved([])); }, [ids.size]); // eslint-disable-line
  useEffect(() => { if (user) api('/quiz/history').then(setHistory).catch(() => {}); }, []); // eslint-disable-line

  return (
    <div className="sheet wide">
      <h1>My library</h1>
      {!user ? <p><Link to="/login">Log in</Link> to save resources and keep your quiz scores.</p> : (
        <>
          <h2>Saved</h2>
          {saved?.length === 0 && <p className="empty">Nothing saved yet. Use Save on any resource.</p>}
          <ul className="reslist">{saved?.map((r) => <ResourceCard key={r._id} r={r} />)}</ul>
          <h2>Recent quiz scores</h2>
          {history.length === 0 ? <p className="empty">No quizzes taken yet.</p> : (
            <ul className="list">{history.map((h) => <li key={h._id}><span>{h.chapter?.title || 'Chapter'}</span><b>{h.score} / {h.total}</b></li>)}</ul>
          )}
        </>
      )}
      <h2>Recently viewed on this device</h2>
      {recent.length === 0 ? <p className="empty">Resources you open will appear here.</p> : (
        <ul className="list">{recent.map((r) => <li key={r._id}><Link to={'/resource/' + r._id}>{r.title}</Link><small>{[r.level && levelLabel(r.level), r.subjectName].filter(Boolean).join(', ')}</small></li>)}</ul>
      )}
    </div>
  );
}
