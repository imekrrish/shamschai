import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Eyebrow, ImageSlot, Reveal } from '../components/ui';

const moods = [
  'She’s ambitious.',
  'She’s tired.',
  'She’s curious.',
  'She’s figuring things out.',
  'She’s building something.',
  'She’s celebrating something.',
  'She’s starting over.',
  'She’s having the best day of her life.',
  'She’s having absolutely none of it.',
];

export function TheIdea() {
  return (
    <div className="idea-page">
      {/* Editorial Header */}
      <section className="page-hero idea-hero">
        <Eyebrow>THE MODERN WOMAN’S RECIPE</Eyebrow>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          The idea<br />
          <em>behind Shams.</em>
        </motion.h1>
        <p className="lead-text">
          She was never just one thing.<br />
          So why should her chai be?
        </p>
      </section>

      {/* Rhythmic Manifesto Section */}
      <section className="section idea-manifesto-section">
        <div className="manifesto-grid">
          <Reveal className="manifesto-lead">
            <span className="chapter-number">01 / THE TRUTH</span>
            <h2>SHE WAS NEVER<br />JUST ONE THING.</h2>
            <div className="mood-ticker">
              {moods.map((m, i) => (
                <motion.div
                  key={m}
                  className="mood-ticker-item"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <span className="mood-bullet">/</span>
                  <span className="mood-text">{m}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal className="manifesto-aside">
            <div className="quote-box">
              <p className="callout-statement">
                Different days call for different things.<br />
                Different moments call for different cups.
              </p>
              <p className="body-copy">
                THERE WAS NEVER GOING TO BE ONE RECIPE FOR ALL OF THAT.
              </p>
              <div className="image-frame">
                <ImageSlot
                  src="/assets/shams/optimized/lifestyle-home-v2.webp"
                  alt="Chai ritual in morning light"
                  ratio="4 / 5"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="section idea-philosophy-section">
        <div className="philosophy-card">
          <Eyebrow>HOW WE EXPLORE</Eyebrow>
          <h2>So Shams explores<br /><em>masala chai differently.</em></h2>
          <div className="variables-four">
            <div className="var-col">
              <span className="var-idx">01</span>
              <h3>Different tea.</h3>
              <p>From estate BOP and broken pekoes to whole orthodox leaf cuts.</p>
            </div>
            <div className="var-col">
              <span className="var-idx">02</span>
              <h3>Different masala.</h3>
              <p>Hand-bruised green cardamom, Ceylon cinnamon, sun-dried ginger, and nutmeg.</p>
            </div>
            <div className="var-col">
              <span className="var-idx">03</span>
              <h3>Different balance.</h3>
              <p>Calibrating sweetness, milk extraction, tannin grip, and spice finish.</p>
            </div>
            <div className="var-col">
              <span className="var-idx">04</span>
              <h3>Different personalities.</h3>
              <p>Crafted for specific hours of the day and specific states of mind.</p>
            </div>
          </div>

          <div className="philosophy-narrative">
            <p>
              Each recipe is developed, refined and made with intention.<br />
              When we find one worth keeping, we give it a name.<br />
              A personality. A place in the collection.<br />
              Then we start exploring again.
            </p>
            <div className="climax-phrase">
              <span>Because the modern woman doesn’t live by one recipe.</span>
              <strong>NEITHER SHOULD HER CHAI.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Lock CTA Banner */}
      <section className="section idea-closing-banner">
        <div className="closing-banner-inner">
          <Eyebrow>SHAMS MASALA CHAI</Eyebrow>
          <h2>IT’S A MODERN WOMAN’S RECIPE.</h2>
          <p>Tea. Masala. Mood. Moment.</p>
          <div className="banner-actions">
            <Link to="/the-collection" className="btn btn-light">
              Explore The Collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
