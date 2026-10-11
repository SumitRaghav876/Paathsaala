import { Link, useNavigate } from 'react-router-dom';
import { TYPE_LABELS, levelLabel } from '../api.js';
import { useBookmarks } from '../bookmarks.jsx';
import Icon from '../icons.jsx';

export default function ResourceCard({ r }) {
  const { ids, toggle, loggedIn } = useBookmarks();
  const nav = useNavigate();
  const saved = ids.has(String(r._id));
  const onSave = () => (loggedIn ? toggle(r._id) : nav('/login'));
  const meta = [r.level && levelLabel(r.level), r.subjectName, r.board, r.language, r.provider, r.year].filter(Boolean).join(', ');

  return (
    <li className="res">
      <span className={'rtype t-' + r.type}><Icon name={r.type} size={22} />{TYPE_LABELS[r.type] || r.type}</span>
      <div className="rbody">
        <Link to={'/resource/' + r._id} className="rtitle">{r.title}</Link>
        <small>{meta}</small>
        {r.description && <p>{r.description}</p>}
      </div>
      <button className={'save' + (saved ? ' on' : '')} aria-pressed={saved} onClick={onSave}>{saved ? 'Saved' : 'Save'}</button>
    </li>
  );
}
