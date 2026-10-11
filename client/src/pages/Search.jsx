import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, FACET_LABELS, facetValueLabel } from '../api.js';
import ResourceCard from './ResourceCard.jsx';

const ORDER = ['level', 'subjectName', 'type', 'board', 'language', 'provider', 'year'];

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [showF, setShowF] = useState(false);

  useEffect(() => {
    setQ(sp.get('q') || ''); setErr('');
    api('/library/search?' + sp.toString()).then(setData).catch((e) => setErr(e.message));
  }, [sp]);

  const selected = (f) => (sp.get(f) ? sp.get(f).split(',') : []);
  const update = (mut) => { const n = new URLSearchParams(sp); mut(n); n.delete('page'); setSp(n); };
  const toggle = (f, v) => update((n) => {
    const cur = selected(f);
    const next = cur.includes(String(v)) ? cur.filter((x) => x !== String(v)) : [...cur, String(v)];
    if (next.length) n.set(f, next.join(',')); else n.delete(f);
  });
  const submit = (e) => { e.preventDefault(); update((n) => (q.trim() ? n.set('q', q.trim()) : n.delete('q'))); };
  const goPage = (p) => { const n = new URLSearchParams(sp); n.set('page', p); setSp(n); window.scrollTo({ top: 0 }); };
  const active = ORDER.flatMap((f) => selected(f).map((v) => [f, v]));
  const clearAll = () => update((n) => ORDER.forEach((f) => n.delete(f)));

  return (
    <div className="sheet wide">
      <h1>Library</h1>
      <form className="searchbar" role="search" onSubmit={submit}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, subject, chapter or tag" aria-label="Search the library" />
        <button className="btn">Search</button>
      </form>

      {active.length > 0 && (
        <p className="chips">{active.map(([f, v]) => <button key={f + v} className="chip" onClick={() => toggle(f, v)}>{facetValueLabel(f, v)} &times;</button>)}
          <button className="link" onClick={clearAll}>Clear all</button></p>
      )}
      {err && <p className="err" role="alert">{err}</p>}

      <button className="btn small ghost filter-toggle" aria-expanded={showF} aria-controls="filters" onClick={() => setShowF(!showF)}>{showF ? 'Hide filters' : `Filters${active.length ? ' (' + active.length + ')' : ''}`}</button>
      <div className="results">
        <aside className={'facets' + (showF ? ' open' : '')} aria-label="Filters" id="filters">
          {ORDER.map((f) => {
            const raw = data?.facets?.[f] || [];
            const list = f === 'year' ? [...raw].sort((a, b) => b.value - a.value) : raw;
            if (!list.length) return null;
            return (
              <fieldset key={f}><legend>{FACET_LABELS[f]}</legend>
                {list.map((x) => (
                  <label key={x.value} className="chk"><input type="checkbox" checked={selected(f).includes(String(x.value))} onChange={() => toggle(f, x.value)} />
                    <span>{facetValueLabel(f, x.value)}</span><em>{x.count}</em></label>
                ))}
              </fieldset>
            );
          })}
        </aside>

        <div>
          <div className="row between">
            <p className="stat">{data ? `${data.total.toLocaleString('en-IN')} result${data.total === 1 ? '' : 's'}` : 'Searching...'}</p>
            <label className="inline">Sort by
              <select value={sp.get('sort') || 'relevance'} onChange={(e) => update((n) => n.set('sort', e.target.value))}>
                <option value="relevance">Most viewed</option><option value="new">Newest added</option><option value="year">Year</option><option value="title">Title A to Z</option>
              </select>
            </label>
          </div>
          {data && data.items.length === 0 && <p className="empty">No resources match. Remove a filter or try a shorter search. You can also <Link to="/teacher">ask the AI teacher</Link>.</p>}
          <ul className="reslist">{data?.items.map((r) => <ResourceCard key={r._id} r={r} />)}</ul>
          {data?.pages > 1 && (
            <nav className="pager" aria-label="Pages">
              <button className="btn small ghost" disabled={data.page <= 1} onClick={() => goPage(data.page - 1)}>Previous</button>
              <span>Page {data.page} of {data.pages}</span>
              <button className="btn small ghost" disabled={data.page >= data.pages} onClick={() => goPage(data.page + 1)}>Next</button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
