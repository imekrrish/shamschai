import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import './ChaiHero.css';

export default function ChaiHero() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; host.current?.dispatchEvent(new Event('chai:motion')); }, [paused]);
  useEffect(() => {
    const element = host.current!;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      void import('./chaiScene').then(async ({ mountChai }) => {
        if (disposed) return;
        cleanup = await mountChai(element, () => pausedRef.current, () => { if (!disposed) setReady(true); }, () => { if (!disposed) setReady(false); });
        if (disposed) cleanup();
      }).catch(() => { if (!disposed) setReady(false); });
    }, { rootMargin: '160px' });
    observer.observe(element);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setPaused(motion.matches);
    motion.addEventListener('change', change);
    return () => { disposed = true; observer.disconnect(); motion.removeEventListener('change', change); cleanup?.(); };
  }, []);
  return <div className={`chai-hero${ready ? ' chai-hero--ready' : ''}`} ref={host} role="group" aria-label="Shams Chai ivory ceramic cup and saucer with caramel chai, delicate steam and a falling chai drop">
    <img className="chai-poster" src="/assets/shams/hero/chai-cup-poster.webp" alt="Ivory Shams Chai cup and matching saucer filled with freshly brewed masala chai" width="1000" height="900" />
    <div className="chai-canvas" aria-hidden="true" />
    {ready && <button className="chai-motion" type="button" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Play chai animation' : 'Pause chai animation'}>{paused ? <Play size={14} /> : <Pause size={14} />}<span>{paused ? 'Play' : 'Pause'}</span></button>}
  </div>;
}
