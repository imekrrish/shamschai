import { useEffect, useId, useRef, useState } from 'react';
import './HeroSachet.css';

// Always use the original PNG, including while the optional renderer loads.
export const SACHET_FRONT = '/assets/shams/products/sachet-front.png';

export default function HeroSachet() {
  const host = useRef<HTMLDivElement>(null);
  const clip = useId().replace(/:/g, '');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      void import('./sachetScene').then(async ({ mountSachet }) => {
        if (cancelled) return;
        dispose = await mountSachet(element, SACHET_FRONT, '/assets/shams/products/sachet-back.png', () => {
          if (!cancelled) setReady(true);
        }, () => {
          if (!cancelled) setReady(false);
        }, () => false);
        if (cancelled) dispose();
      }).catch(() => { /* The original image remains available without WebGL. */ });
    }, { rootMargin: '160px' });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); dispose?.(); };
  }, []);

  return <div ref={host} className={`sachet-stage${ready ? ' sachet-stage--ready' : ''}`}
    role="group" tabIndex={ready ? 0 : -1} aria-label="Shams Masala Chai 360 degree view. Drag or swipe to rotate. Left and right arrow keys rotate; Home resets.">
    <div className="sachet-aura" aria-hidden="true" />
    <div className="sachet-contact-shadow" aria-hidden="true" />
    <svg className="sachet-fallback" viewBox="0 0 505 1080" aria-hidden="true">
      <defs><clipPath id={clip}>
        <path d="M 12 112 Q 12 84 40 84 L 465 84 Q 493 84 493 112 L 465 990 Q 253 1053 58 1000 Q 33 996 32 970 Z" />
      </clipPath></defs>
      <image href={SACHET_FRONT} width="505" height="1080" clipPath={`url(#${clip})`} />
    </svg>
    <div className="sachet-canvas" aria-hidden="true" />
  </div>;
}
