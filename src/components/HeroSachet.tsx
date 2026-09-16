import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import './HeroSachet.css';

// Always use the original PNG, including while the optional renderer loads.
export const SACHET_FRONT = '/assets/shams/products/sachet-front.png';

/** How long the turning pack gets to appear before the still image stands in. */
const STILL_AFTER_MS = 1400;

export default function HeroSachet() {
  const host = useRef<HTMLDivElement>(null);
  const clip = useId().replace(/:/g, '');
  const [ready, setReady] = useState(false);
  const [showStill, setShowStill] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    // The hero opens on the turning pack, so the scene starts loading at once
    // rather than waiting to be scrolled into view.
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) setShowStill(true);
    }, STILL_AFTER_MS);

    const reveal = () => {
      if (cancelled) return;
      window.clearTimeout(fallbackTimer);
      setReady(true);
    };
    const standIn = () => {
      if (cancelled) return;
      window.clearTimeout(fallbackTimer);
      setReady(false);
      setShowStill(true);
    };

    void import('./sachetScene').then(async ({ mountSachet }) => {
      if (cancelled) return;
      dispose = await mountSachet(
        element,
        SACHET_FRONT,
        '/assets/shams/products/sachet-back.png',
        reveal,
        standIn,
        () => pausedRef.current,
      );
      if (cancelled) dispose();
    }).catch(() => {
      // The original image remains available without WebGL.
      standIn();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      dispose?.();
    };
  }, []);

  const state = `${ready ? ' sachet-stage--ready' : ''}${showStill ? ' sachet-stage--still' : ''}`;

  return <div ref={host} className={`sachet-stage${state}`}
    role="group" tabIndex={ready ? 0 : -1} aria-label="Shams Masala Chai 360 degree view. Drag or swipe to rotate. Left and right arrow keys rotate; Home resets.">
    <div className="sachet-contact-shadow" aria-hidden="true" />
    <svg className="sachet-fallback" viewBox="0 0 505 1080" aria-hidden="true">
      <defs><clipPath id={clip}>
        <path d="M 12 112 Q 12 84 40 84 L 465 84 Q 493 84 493 112 L 465 990 Q 253 1053 58 1000 Q 33 996 32 970 Z" />
      </clipPath></defs>
      <image href={SACHET_FRONT} width="505" height="1080" clipPath={`url(#${clip})`} />
    </svg>
    <div className="sachet-canvas" aria-hidden="true" />
    {ready && <div className="sachet-controls">
      <button type="button" className="sachet-motion-toggle" aria-label={paused ? 'Play sachet rotation' : 'Pause sachet rotation'} onClick={() => {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
      }}>{paused ? <Play /> : <Pause />}</button>
      <span>DRAG TO EXPLORE</span>
    </div>}
  </div>;
}
