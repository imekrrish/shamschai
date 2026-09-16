import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search as SearchIcon, Sparkles } from 'lucide-react';
import { useCatalog } from './context/CatalogContext';
import { articles, collections } from './data/content';
import ProductCard from './components/ProductCard';
import { Eyebrow, ImageSlot, Reveal } from './components/ui';

const PageHero = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => (
  <section className="page-hero">
    <Eyebrow>{eyebrow}</Eyebrow>
    <h1>{title}</h1>
    {copy && <p>{copy}</p>}
  </section>
);

export function OurStory() {
  return (
    <div className="our-story-page">
      <section className="page-hero story-lead-hero">
        <Eyebrow>OUR STORY</Eyebrow>
        <h1>
          I didn’t want to make<br />
          <em>another masala chai.</em>
        </h1>
        <p className="lead-text">
          I wanted to understand how many different ways masala chai could actually feel.
        </p>
      </section>

      <section className="section story-manifesto-block">
        <div className="story-editorial-layout">
          <div className="story-text-column">
            <span className="chapter-number">01 / THE BEGINNING</span>
            <h2>So we started exploring.</h2>
            <div className="rhythm-story-lines">
              <p>Different teas. Different spices. A hundred small adjustments, each changing the cup.</p>
            </div>

            <div className="story-breakthrough">
              <p>Some were brilliant.</p>
              <p>Some were terrible.</p>
              <div className="wait-moment">
                <span>Some made us stop and say:</span>
                <strong>“WAIT.”</strong>
              </div>
              <p>
                So we refined them. We tasted again. We kept what worked.
                And eventually, a recipe became a Shams recipe.
              </p>
              <p className="chain-sentence">
                Our first recipe is here. And the next chapter is already brewing.
              </p>
            </div>

            <div className="story-epiphany">
              <h3>ONE RECIPE WAS NEVER THE POINT.</h3>
              <em>THE POSSIBILITY WAS.</em>
            </div>
          </div>

          <div className="story-image-column">
            <ImageSlot
              src="/assets/shams/optimized/lifestyle-home-v2.webp"
              alt="Shams tea testing in morning kitchen light"
              ratio="4 / 5"
              priority
            />
            <div className="story-image-caption">
              <span>FOUNDED BY SHARMILA KRISHNA</span>
              <small>“Tea is a living medium that responds to emotion and precision.”</small>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy pillars */}
      <section className="section story-pillars-dark">
        <div className="story-grid-two">
          <div className="story-pillar-item">
            <span className="chapter-number">02</span>
            <h3>The Modern Woman’s Recipe</h3>
            <p>
              She was never just one thing—so why should her chai be?
              Shams was built for the multifaceted reality of modern women: morning focus, afternoon comfort,
              sharp resets, and midnight celebrations.
            </p>
            <Link to="/the-idea" className="text-link">
              Discover the idea <ArrowRight size={14} />
            </Link>
          </div>

          <div className="story-pillar-item">
            <span className="chapter-number">03</span>
            <h3>A Collection, Growing Slowly</h3>
            <p>
              We treat each recipe like an authored work. Tested, locked, and given its own place
              in our collection. Recipe 01 is available now, with Recipe 02 coming soon.
            </p>
            <Link to="/the-collection" className="text-link">
              Meet the collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function BrewGuide() {
  const steps = [
    { n: '01', title: 'Prepare Water', copy: 'Bring 150 ml fresh water to a rolling boil.' },
    { n: '02', title: 'Add Shams Tea', copy: 'Add 1 teaspoon (2.5 g) of your preferred Shams recipe.' },
    { n: '03', title: 'Sweeten', copy: 'Add unrefined sugar or jaggery to taste.' },
    { n: '04', title: 'Pour Milk', copy: 'Add whole milk as desired to create creamy emulsion.' },
    { n: '05', title: 'Simmer', copy: 'Simmer gently for 3–5 minutes so the spice oils bloom.' },
    { n: '06', title: 'Strain & Enjoy', copy: 'Strain hot into heavy glassware or earthenware. Savor the moment.' },
  ];

  return (
    <>
      <section className="page-hero">
        <Eyebrow>THE SHAMS METHOD</Eyebrow>
        <h1>A proper cup.<br /><em>Made your way.</em></h1>
        <p>Begin with the instructions on our pack, then adjust milk, sweetness and strength until the cup tastes like home.</p>
      </section>
      <section className="section brew-guide">
        {steps.map((s) => (
          <div key={s.n}>
            <span>{s.n}</span>
            <h2>{s.title}</h2>
            <p>{s.copy}</p>
          </div>
        ))}
      </section>
      <section className="section brew-note">
        <div>
          <Eyebrow>YOUR CUP, YOUR CALL</Eyebrow>
          <h2>Room for<br /><em>your own ritual.</em></h2>
        </div>
        <div>
          <p>Make it strong. Make it milky. Sweeten it, or don’t. The best method is the one that brings the cup closest to home.</p>
          <Link className="btn btn-light" to="/the-collection">
            Meet the collection <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}

export function Gifting() {
  return (
    <div className="gifting-redirect-page">
      <section className="page-hero">
        <Eyebrow>CORPORATE &amp; PERSONAL GIFTING</Eyebrow>
        <h1>Don’t send another gift.<br /><em>Send a moment.</em></h1>
        <p>Curated gifting, custom co-branded packaging editions, and celebration hampers built around your brand.</p>
        <div className="hero-actions">
          <Link to="/corporate" className="btn btn-light">
            Explore Corporate &amp; Custom Gifting <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export function Contact() {
  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title="Let’s talk over chai."
        copy="Questions, gifting enquiries or feedback on our recipes — write to the Shams team."
      />
      <ContactForm title="Send us a note." />
    </>
  );
}

function ContactForm({ title, id }: { title: string; id?: string }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`${data.get('type')} from ${data.get('name')}`);
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nEnquiry: ${data.get('type')}\n\n${data.get('message')}`);
    window.location.href = `mailto:support@shamschai.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="section contact-form" id={id}>
      <div>
        <Eyebrow>GET IN TOUCH</Eyebrow>
        <h2>{title}</h2>
        <p>Complete the form and we’ll prepare the message in your email app.</p>
        <a className="contact-email" href="mailto:support@shamschai.com">support@shamschai.com</a>
        <p className="contact-note">Customer care hours: Mon–Sat, 9 am – 6 pm IST</p>
      </div>
      <form onSubmit={submit}>
        <label>Name<input name="name" autoComplete="name" placeholder="Your name" required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
        <label>Enquiry type
          <select name="type">
            <option>General question</option>
            <option>Recipe feedback</option>
            <option>Corporate gifting</option>
            <option>Wholesale</option>
            <option>Press</option>
          </select>
        </label>
        <label>Message<textarea name="message" placeholder="How can we help?" rows={5} required /></label>
        <button className="btn btn-light" type="submit">Open email app <ArrowRight size={14} /></button>
      </form>
    </section>
  );
}

export function Faq() {
  const qs = [
    {
      q: 'WHAT IS SHAMS?',
      a: 'Shams is a modern masala chai brand exploring different tea and masala personalities through a growing collection of recipes.',
    },
    {
      q: 'WHY DO YOU HAVE DIFFERENT RECIPES?',
      a: 'Because we don’t believe masala chai has to fit into one definition. Each Shams recipe has its own flavour profile, personality and purpose.',
    },
    {
      q: 'ARE THE RECIPES FIXED?',
      a: 'Yes. Once a Shams variant is developed and launched, its recipe is defined for that variant. We’re simply not stopping at one variant.',
    },
    {
      q: 'WHAT IS IN SHAMS MASALA CHAI?',
      a: 'Estate-grown Assam black teas (BOP/BP/Orthodox) paired with freshly ground whole spices: green cardamom, Ceylon cinnamon, clove, sun-dried ginger, nutmeg, and Tellicherry black pepper. Free of artificial flavourings or preservatives.',
    },
    {
      q: 'HOW SHOULD I BREW IT?',
      a: 'Boil 150 ml water, add 1 tsp Shams Masala Chai and sugar to taste. Add milk as desired, simmer for 3–5 minutes to extract spice depth, then strain hot and enjoy.',
    },
    {
      q: 'DO YOU OFFER CORPORATE GIFTING?',
      a: 'Yes. We offer corporate gifting, events, custom-branded packaging and bulk requirements, subject to quantity and production requirements.',
    },
    {
      q: 'CAN YOU CUSTOMISE THE PACKAGING?',
      a: 'Yes. For qualifying corporate quantities we offer co-branded outer sleeves, bespoke presentation boxes, tasting cards, and personalized messaging inserts.',
    },
    {
      q: 'DO YOU TAKE BULK ORDERS?',
      a: 'Yes. Tell us your quantity, occasion and requirements through our Corporate order portal and we’ll recommend the appropriate option.',
    },
    {
      q: 'DO YOU SHIP INTERNATIONALLY?',
      a: 'We ship pan-India directly through our online store. For international orders, events, and bulk shipments, please submit an enquiry through our Corporate & International page.',
    },
    {
      q: 'CAN I TRY BEFORE PLACING A LARGE CORPORATE ORDER?',
      a: 'Yes. We provide curated sample kits for corporate clients planning orders of 100 units or more.',
    },
  ];

  return (
    <>
      <PageHero eyebrow="HELP &amp; FAQ" title="While the kettle boils." copy="A few useful answers about Shams, our recipes, and our craft." />
      <section className="section faq">
        {qs.map((item, i) => (
          <details key={item.q} open={i === 0}>
            <summary>
              <span>0{i + 1}</span>{item.q}
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
        <div className="faq-contact-cta">
          <p>Have an unanswered question?</p>
          <Link to="/contact" className="text-link">Still have a question? Write to us <ArrowRight size={14} /></Link>
        </div>
      </section>
    </>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [term, setTerm] = useState(q);
  const query = q.toLowerCase();
  const { products } = useCatalog();
  const pp = products.filter((p) => (p.name + p.recipeNumber + p.personality + p.flavourNotes.join(' ')).toLowerCase().includes(query));
  const aa = articles.filter((a) => (a.title + a.category + a.excerpt).toLowerCase().includes(query));
  const cc = collections.filter((c) => (c.name + c.copy).toLowerCase().includes(query));

  return (
    <>
      <section className="page-hero search-head">
        <Eyebrow>SEARCH SHAMS</Eyebrow>
        <h1>Find your moment.</h1>
        <form onSubmit={(e) => { e.preventDefault(); setParams({ q: term }); }}>
          <SearchIcon />
          <label className="sr-only" htmlFor="search-query">Search recipes and stories</label>
          <input id="search-query" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Kadak, ginger, recipe, cardamom…" />
          <button type="submit">Search <ArrowRight size={14} /></button>
        </form>
        {q && <p>{pp.length + aa.length + cc.length} results for “{q}”</p>}
      </section>
      <section className="section search-results">
        {q ? (
          <>
            {pp.length > 0 && (
              <>
                <h2>The Collection</h2>
                <div className="product-grid">
                  {pp.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}
            {cc.map((c) => (
              <Link className="search-row" to={`/collections/${c.slug}`} key={c.slug}>
                <h3>{c.name}</h3>
                <p>{c.copy}</p>
                <ArrowRight size={14} />
              </Link>
            ))}
            {aa.map((a) => (
              <Link className="search-row" to={`/journal/${a.slug}`} key={a.slug}>
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <ArrowRight size={14} />
              </Link>
            ))}
            {!pp.length && !aa.length && !cc.length && <p>No results yet. Try “recipe”, “cardamom” or “kadak”.</p>}
          </>
        ) : (
          <div className="search-suggest">
            {['Recipe 01', 'Cardamom', 'Kadak', 'Ginger'].map((x) => (
              <button onClick={() => { setTerm(x); setParams({ q: x }); }} key={x}>
                {x} <ArrowRight size={14} />
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <section className="not-found section">
      <Eyebrow>404 / A LITTLE LOST</Eyebrow>
      <h1>The cup isn’t here.</h1>
      <p>The page may have moved, but the kettle is still warm.</p>
      <Link to="/" className="btn btn-light">Back home <ArrowRight size={14} /></Link>
    </section>
  );
}
