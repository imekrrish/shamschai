import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Eyebrow } from './components/ui';

export function EmailVerificationPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email address...');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setState('error'); setMessage('This verification link is incomplete.'); return; }
    const base = (__API_BASE_URL__ || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')).replace(/\/$/, '');
    fetch(`${base}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'This verification link is invalid or expired.');
        setState('success'); setMessage(result.message);
      })
      .catch(error => { setState('error'); setMessage(error.message); });
  }, [params]);

  return <section className="auth-page section"><div className="auth-card" role="status">
    <Eyebrow>SHAM'S CHAI ACCOUNT</Eyebrow>
    {state === 'success' ? <CheckCircle2 size={44} aria-hidden="true" /> : state === 'error' ? <AlertCircle size={44} aria-hidden="true" /> : null}
    <h1>{state === 'success' ? <>Email confirmed.<br /><em>Welcome to the table.</em></> : state === 'error' ? <>That link needs<br /><em>a fresh pour.</em></> : 'Confirming your email...'}</h1>
    <p>{message}</p>
    <Link className="btn" to={state === 'error' ? '/register' : '/account'}>{state === 'error' ? 'Create account again' : 'Continue to Sham\'s Chai'} <ArrowRight size={16} /></Link>
  </div></section>;
}
