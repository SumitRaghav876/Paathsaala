import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, FACET_LABELS, facetValueLabel, LEVELS } from '../api.js';

export default function Browse() {
  const { facet } = useParams();
  const [sp, setSp] = useSearchParams();
  const level = sp.get('level') || '';
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setRows(null); setErr('');
    api(`/library/browse/${facet}${level ? '?level=' + level : ''}`).then(setRows).catch((e) => setErr(e.message));
  }, [facet, level]);

  return (
    <div className="sheet">
      <h1>Browse by {(FACET_LABELS[facet] || facet).toLowerCase()}</h1>
      <div className="row">
        <label>Class
          <select value={level} onChange={(e) => setSp(e.target.value ? { level: e.target.value } : {})}>
            <option value="">All</option>{LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </label>
        <nav className="row" aria-label="Browse by">
          {Object.entries(FACET_LABELS).map(([f, label]) => <Link key={f} to={'/browse/' + f + (level ? '?level=' + level : '')} className={'chip' + (f === facet ? ' on' : '')}>{label}</Link>)}
        </nav>
      </div>
      {err && <p className="err">{err}</p>}
      {rows?.length === 0 && <p className="empty">Nothing here yet.</p>}
      <ul className="list">
        {rows?.map((x) => (
          <li key={x.value}>
            <Link to={'/search?' + new URLSearchParams({ [facet]: x.value, ...(level && facet !== 'level' ? { level } : {}) })}>{facetValueLabel(facet, x.value)}</Link>
            <small>{x.count} resource{x.count === 1 ? '' : 's'}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
