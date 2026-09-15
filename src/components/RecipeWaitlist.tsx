import { FormEvent, useId, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function RecipeWaitlist() {
  const id = useId();
  const busy = useRef(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setState('pending');
    try {
      const base = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')).replace(/\/$/, '');
      const response = await fetch(`${base}/waitlist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), recipeId: 'recipe-02', source: 'collection_page' }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Waitlist request failed');
      setState('success');
    } catch { setState('error'); }
    finally { busy.current = false; }
  }
  return <div className="recipe-waitlist">
    {state === 'success' ? <div className="recipe-waitlist-success" role="status"><Check /><div><strong>You're on the list.</strong><p>Look out for Recipe 02 launch news in your inbox.</p></div></div> :
      <form onSubmit={submit} aria-busy={state === 'pending'}>
        <label htmlFor={id}>Email address</label>
        <div className="waitlist-input-row"><input id={id} type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} disabled={state === 'pending'} aria-describedby={`${id}-note`} /><button className="btn btn-light" disabled={state === 'pending'}>{state === 'pending' ? 'Joining…' : 'Join the waitlist'}<ArrowRight size={16} /></button></div>
        <small id={`${id}-note`}>By joining, you agree to receive email updates about Recipe 02.</small>
        {state === 'error' && <p className="waitlist-error" role="alert">We couldn't save your email. Please try again in a moment.</p>}
      </form>}
  </div>;
}
