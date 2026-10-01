import { useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
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

type Article = typeof articles[0];
const kicker = (a: Article) => `${a.category.replace('THE ', '')} · ${a.readTime.replace(' READ', '')}`;

function CoverStory({ article }: { article: Article }) {
  return <Reveal className="edit-cover-reveal"><Link className="edit-cover" to={`/the-edit/${article.slug}`}>
    <img src={article.image} alt="" width="1448" height="1086" fetchPriority="high" />
    <div className="edit-cover-copy">
      <span className="edit-kicker">Cover story · {kicker(article)}</span>
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
      <b>Read the story <ArrowUpRight size={16} /></b>
    </div>
  </Link></Reveal>;
}

function PairStory({ article, index }: { article: Article; index: number }) {
  return <Reveal className="edit-pair-item" delay={index * .08}><Link to={`/the-edit/${article.slug}`}>
    <figure><img src={article.image} alt="" width="1448" height="1086" loading="lazy" /></figure>
    <span className="edit-kicker">{kicker(article)}</span>
    <h3>{article.title}</h3>
    <p>{article.excerpt}</p>
  </Link></Reveal>;
}

function IndexRow({ article, n }: { article: Article; n: number }) {
  return <li><Link className="edit-index-row" to={`/the-edit/${article.slug}`}>
    <span className="edit-index-num">{String(n).padStart(2, '0')}</span>
    <div><span className="edit-kicker">{kicker(article)}</span><h3>{article.title}</h3></div>
    <img src={article.image} alt="" width="1448" height="1086" loading="lazy" />
    <ArrowUpRight className="edit-index-arrow" size={20} />
  </Link></li>;
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
      {featured && <section className="edit-cover-wrap"><CoverStory article={featured} /></section>}
      {rest.length > 0 && <section className="edit-pair">
        {rest.slice(0, 2).map((a, i) => <PairStory key={a.slug} article={a} index={i} />)}
      </section>}
      {rest.length > 2 && <section className="edit-index">
        <h2 className="edit-index-title">More to read</h2>
        <ol>{rest.slice(2).map((a, i) => <IndexRow key={a.slug} article={a} n={i + 4} />)}</ol>
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
      <header className="edit-article-head">
        <Link to="/the-edit" className="journal-back">
          <ArrowLeft size={14} /> THE SHAMS EDIT
        </Link>
        <motion.div className="edit-article-head-grid" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8, ease }}>
          <div>
            <span className="edit-kicker">{kicker(article)}</span>
            <h1>{article.title}</h1>
          </div>
          <div className="edit-article-meta">
            <p className="article-lead">{article.excerpt}</p>
            <span>By the Shams kitchen</span>
          </div>
        </motion.div>
      </header>

      <motion.figure
        className="edit-article-image"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : .9, delay: reduced ? 0 : .15, ease }}
      >
        <ImageSlot src={article.image} alt={article.title} ratio="16 / 9" priority />
      </motion.figure>

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

      <section className="edit-related">
        <div className="edit-related-head"><Eyebrow>KEEP READING</Eyebrow><Link className="text-link" to="/the-edit">All stories <ArrowRight size={14} /></Link></div>
        <div className="edit-related-grid">
          {related.map((a, i) => <Reveal key={a.slug} delay={i * .08}><Link className="edit-tile" to={`/the-edit/${a.slug}`}>
            <img src={a.image} alt="" width="1448" height="1086" loading="lazy" />
            <div><span className="edit-kicker">{kicker(a)}</span><h3>{a.title}</h3></div>
          </Link></Reveal>)}
        </div>
      </section>
    </article>
  );
}
