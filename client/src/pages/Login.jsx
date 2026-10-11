import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveSession, LEVELS } from '../api.js';
import { SITE } from '../site.js';

export default function Login({ onAuth }) {
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', level: '10' });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const body = reg ? { ...f, acceptedTerms: agree, termsVersion: SITE.termsVersion } : f;
      const data = await api(reg ? '/auth/register' : '/auth/login', { method: 'POST', body });
      saveSession(data); onAuth(data.user); nav('/');
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };

  return (
    <div className="sheet narrow">
      <h1>{reg ? 'Create your free account' : 'Welcome back'}</h1>
      <p className="lead">{reg ? 'Save resources and keep track of your quiz scores.' : 'Log in to see your saved resources and scores.'}</p>
      <form onSubmit={submit} className="stack">
        {reg && <label>Your name<input value={f.name} onChange={set('name')} autoComplete="name" /></label>}
        <label>Email<input type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Password{reg && ' (at least 6 characters)'}<input type="password" required minLength={6} value={f.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} /></label>
        {reg && <label>I am preparing for<select value={f.level} onChange={set('level')}>{LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>}
        {reg && (
          <label className="agree">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I have read and agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link> and the <Link to="/privacy" target="_blank">Privacy Policy</Link>. If I am under 18, my parent or guardian has allowed me to use this site.</span>
          </label>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy || (reg && !agree)}>{busy ? 'Please wait...' : reg ? 'Create account' : 'Log in'}</button>
      </form>
      <button className="link" onClick={() => { setReg(!reg); setErr(''); }}>{reg ? 'I already have an account' : 'New here? Create a free account'}</button>
    </div>
  );
}
