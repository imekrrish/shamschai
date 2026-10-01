import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BackSoon.css';

const QUOTES = [
  'Our kettle is on a short break. Good things take time to steep.',
  'We ran out of chai. Briefly. Panic has been contained.',
  'Currently brewing something worth the wait. Back before your tea gets cold.',
  'Gone to find more cardamom. Please hold your cravings.',
  'Out for a chai break. Yes, we sell chai. Yes, we still need breaks.',
];

export default function BackSoon() {
  const [i, setI] = useState(() => Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const t = window.setInterval(() => setI(n => (n + 1) % QUOTES.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <main className="backsoon">
      <div className="backsoon-steam" aria-hidden="true"><span /><span /><span /></div>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        We'll be back soon<em>.</em>
      </motion.h1>
      <div className="backsoon-quote" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6 }}
          >
            {QUOTES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </main>
  );
}
