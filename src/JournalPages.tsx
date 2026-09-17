import { useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { articles, editPillars } from './data/content';
import { Eyebrow, ImageSlot, Reveal } from './components/ui';


const ease = [0.22, 1, 0.36, 1] as const;

const everydayStories: Record<string, { title: string; copy: string }[]> = {
  'why-every-indian-home-makes-chai-differently': [
    { title: 'The recipe you know by heart', copy: 'Some homes start with ginger. Others wait for the milk to rise before turning down the heat. Often, the recipe lives in a familiar spoon and a quick taste, rather than on a page.' },
    { title: 'Make a little room for your way', copy: 'Start with the brewing directions on your pack. Then adjust one thing at a time: a little more milk, less sweetness, or a stronger brew. Keep what you enjoy. A good cup should feel like yours.' },
  ],
  'does-more-masala-mean-better-chai': [
    { title: 'Let the tea have a say', copy: 'Spice brings warmth and aroma, but more is not always what the cup needs. Taste your chai before adding anything. You might want a brighter hint of ginger, or you might like it exactly as it is.' },
    { title: 'Small changes, one cup at a time', copy: 'If you enjoy experimenting, try a small amount of one spice rather than several at once. Taste again. The best balance is the one you look forward to drinking.' },
  ],
  'why-chai-tastes-different-every-morning': [
    { title: 'A pause, however small', copy: 'Between the morning rush and the next thing on your list, there is room for a cup. Put the phone down for a moment. Open a book, watch the rain, or call someone you have been meaning to speak to.' },
    { title: 'No special occasion needed', copy: 'Your favourite glass is enough. So is a kitchen stool or a chair by the window. Make your chai the way you like it, and let these few minutes belong to you.' },
  ],
};

function EditCard({ article, index, large = false }: { article: typeof articles[0]; index: number; large?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      className={`journal-new-card ${large ? 'journal-new-card--large' : ''}`}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }}
      transition={{ duration: reduced ? 0 : .65, delay: reduced ? 0 : Math.min(index, 2) * .08, ease }}
    >
      <Link to={`/the-edit/${article.slug}`}>
        <div className="journal-card-image">
          <ImageSlot
            src={article.image}
            alt={article.title}
            ratio="4 / 3"
          />
          
        </div>
        <div className="journal-card-copy">
          <div>
            <span className="pillar-badge">{article.category}</span>
            <i>{article.readTime}</i>
          </div>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
          <b>READ STORY <ArrowRight size={14} /></b>
        </div>
      </Link>
    </motion.article>
  );
}

export function JournalLaunch() {
  const reduced = useReducedMotion();
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const filteredArticles = selectedPillar === 'all'
    ? articles
    : articles.filter((a) => a.pillar === selectedPillar);

  const [featured, ...rest] = filteredArticles;

  return (
    <div className="shams-edit-page">
      {/* Hero */}
      <section className="journal-new-hero edit-hero">
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8, ease }}>
          <Eyebrow>THE SHAMS EDIT</Eyebrow>
          <h1>
            Chai. Culture.<br />
            <em>Curiosity.</em>
          </h1>
          <p className="lead-text">
            Stories about the cup, the craft, and the everyday rituals that bring us together.
          </p>
        </motion.div>

      </section>

      {/* Editorial Pillars Bar */}
      <section className="section edit-pillars-bar">
        <div className="pillars-scroll-track">
          <button
            className={`pillar-pill-btn ${selectedPillar === 'all' ? 'active' : ''}`}
            aria-pressed={selectedPillar === 'all'}
            onClick={() => setSelectedPillar('all')}
          >
            ALL STORIES
          </button>
          {editPillars.filter(p => articles.some(article => article.pillar === p.id)).map((p) => (
            <button
              key={p.id}
              className={`pillar-pill-btn ${selectedPillar === p.id ? 'active' : ''}`}
              aria-pressed={selectedPillar === p.id}
              onClick={() => setSelectedPillar(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait" initial={false}>
      <motion.div key={selectedPillar} className="edit-results"
        initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : .18 }}>
      <p className="sr-only" role="status">{filteredArticles.length} stories</p>
      {/* Featured Lead Story */}
      {featured && (
        <section className="journal-feature">
          <EditCard article={featured} index={0} large />

        </section>
      )}

      {/* Grid of Stories */}
      {rest.length > 0 && <section className="journal-new-grid">
        <div className="journal-grid-label">
          <span>MORE STORIES</span>
          
        </div>
        {rest.map((a, i) => (
          <EditCard key={a.slug} article={a} index={i + 1} />
        ))}
      </section>}
      </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end end'] });
  return <motion.div className="story-reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

export function JournalArticleLaunch() {
  const reduced = useReducedMotion();
  const storyRef = useRef<HTMLElement>(null);
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return <JournalLaunch />;
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 2);
  const everyday = everydayStories[article.slug];

  return (
    <article className="journal-story edit-article-story" ref={storyRef}>
      <ReadingProgress target={storyRef} />
      <header>
        <Link to="/the-edit" className="journal-back">
          <ArrowLeft size={14} /> THE SHAMS EDIT
        </Link>
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8, ease }}>
          <Eyebrow>{article.category}</Eyebrow>
          <h1>{article.title}</h1>
          <p className="article-lead">{article.excerpt}</p>
          <div className="journal-byline">
            <span>SHAMS LAB &amp; EDIT</span>
            <span><Clock size={13} /> {article.readTime}</span>
          </div>
        </motion.div>
      </header>

      <motion.div
        className="journal-story-image"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : .9, delay: reduced ? 0 : .15, ease }}
      >
        <ImageSlot src={article.image} alt={article.title} ratio="4 / 3" />
        <span>THE SHAMS EDIT · PERSPECTIVES ON CHAI</span>
      </motion.div>

      {everyday ? <div className="everyday-article-body">
        {everyday.map(section => <Reveal key={section.title}><section><h2>{section.title}</h2><p>{section.copy}</p></section></Reveal>)}
        <Link className="text-link" to="/brew-guide">Make your next cup <ArrowRight size={14} /></Link>
      </div> : <div className="journal-story-layout">
        <aside>
          <span>IN THIS ESSAY</span>
          <a href="#extraction">The Chemistry of Extraction</a>
          <a href="#proportions">The Hierarchy of Aromatics</a>
          <a href="#conclusion">The Shams Verdict</a>
        </aside>

        <div className="journal-story-body">
          <p className="journal-dropcap">
            There is a persistent myth that making great chai is simply a matter of generous boiling.
            In truth, every element—from the particle diameter of the leaf to the exact moment milk lipids bind with cardamom esters—follows a delicate curve.
          </p>

          <h2 id="extraction">The Chemistry of Extraction</h2>
          <p>
            When water meets whole spices at a rolling 100°C, the lighter, volatile monoterpenes—such as 1,8-cineole in green cardamom—vaporize instantly into the room.
            If the kettle is covered too late, that brightness is lost forever.
            Conversely, the heavier eugenols and piperines found in clove and Tellicherry black pepper require protracted contact with hot liquid to release their structural warmth.
          </p>

          <blockquote>
            “Chai is not an accident of boiled spices. It is a precise thermodynamic exchange between leaf tannin, milk fat, and aromatic oil.”
          </blockquote>

          <h2 id="proportions">The Hierarchy of Aromatics</h2>
          <p>
            When you double the clove, the tea is silenced. When you over-roast the cinnamon, the cup becomes dry and papery.
            In our laboratory trials, we learned that true elegance comes from restraint: setting the stage so that the estate tea remains the anchor,
            allowing the spice profile to arrive as a sequence rather than an ambush.
          </p>

          <h2 id="conclusion">The Shams Verdict</h2>
          <p>
            Our collection begins with Recipe 01, with Recipe 02 coming soon.
            Whether you seek brisk clarity or an unrushed afternoon embrace, the right recipe honors both the leaf and the moment.
          </p>

          <div className="journal-end">
            <i>〰</i>
            <span>THE KETTLE IS ALWAYS WORTH PUTTING ON.</span>
          </div>
        </div>
      </div>}

      <section className="journal-related">
        <div className="section-heading-row">
          <Eyebrow>KEEP READING</Eyebrow>
          <h2>More from The Shams Edit.</h2>
        </div>
        <div className="related-grid">
          {related.map((a, i) => (
            <EditCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </section>
    </article>
  );
}
