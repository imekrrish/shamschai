import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, QrCode } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog, useProduct } from './context/CatalogContext';
import { pack } from './data/pack';
import { CatalogNotice, Eyebrow, ImageSlot, money, Reveal } from './components/ui';
import ProductSelector from './components/ProductSelector';
import RecipeWaitlist from './components/RecipeWaitlist';
import HeroSachet from './components/HeroSachet';
import { NotFound } from './pages';

export function LaunchHome() {
  const reduced = useReducedMotion();
  const { chai, loading, error, reload } = useCatalog();
  const packSizes = chai?.variants ?? [];
  const from = packSizes.length ? Math.min(...packSizes.map(v => v.price)) : null;

  return (
    <div className="matte-home">
      <section className="home-hero matte-hero" aria-labelledby="home-title">
        <motion.img className="matte-hero-image" src="/assets/shams/hero/matte-sachet-v2.webp"
          initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : .15, ease: [.22, 1, .36, 1] }}
          alt="Shams black masala chai sachet and a freshly brewed glass of chai on a charcoal counter"
          width="1254" height="1254" fetchPriority="high" />
        <div className="matte-hero-shade" aria-hidden="true" />
        <div className="matte-hero-copy">
          <Eyebrow>GOOD CHAI. EVERY DAY.</Eyebrow>
          <h1 id="home-title" aria-label="Your day. Your chai. Your way.">
            {['Your day.', 'Your chai.', 'Your way.'].map((line, index) => <span className="headline-mask" key={line} aria-hidden="true">
              <motion.span initial={reduced ? false : { y: '105%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: reduced ? 0 : .85, delay: reduced ? 0 : .08 + index * .1, ease: [.22, 1, .36, 1] }}>
                {index === 2 ? <em>{line}</em> : line}
              </motion.span>
            </span>)}
          </h1>
          <p>Bold tea, real spices. For whatever the day brings.</p>
          <Link className="btn matte-button" to="/the-collection">Discover the blend <ArrowUpRight size={16} /></Link>
          <Link className="matte-story-link" to="/our-story">Our story <ArrowRight size={14} /></Link>
        </div>
        <div className="matte-hero-caption" aria-hidden="true"><span>MASALA CHAI</span><span>MAKE YOURSELF AT HOME.</span></div>
      </section>

      <div className="matte-assurances" aria-label="Our promise">
        {pack.assurances.map(claim => <span key={claim}>{claim}</span>)}
      </div>

      <section className="section matte-pack" id="the-collection" aria-labelledby="pack-title">
        <div className="matte-pack-art hero-product">
          <span className="matte-pack-number" aria-hidden="true">01</span>
          <HeroSachet />
        </div>
        <Reveal className="matte-pack-copy">
          <Eyebrow>MEET YOUR DAILY RITUAL</Eyebrow>
          <h2 id="pack-title">A good cup.<br /><em>Without the fuss.</em></h2>
          <p>Black tea and warming spices. Make it strong, milky, sweet, or just the way you grew up with.</p>
          {chai ? <>
            <div className="matte-pack-meta">
              <span>{packSizes.map(v => v.weight).join(' / ')}</span>
              {from !== null && <span>From {money(from)}</span>}
            </div>
            <Link className="btn matte-button" to="/products/recipe-01">Explore the pack <ArrowUpRight size={16} /></Link>
          </> : <CatalogNotice loading={loading} error={error} reload={reload} />}
          <Link className="text-link" to="/brew-guide">Make it your way <ArrowRight size={14} /></Link>
        </Reveal>
      </section>

      <section className="section everyday-stories" aria-labelledby="stories-title">
        <Reveal className="stories-heading">
          <div><Eyebrow>THE SHAMS EDIT</Eyebrow><h2 id="stories-title">Life happens.<br /><em>Chai helps.</em></h2></div>
          <Link className="text-link" to="/the-edit">All stories <ArrowUpRight size={16} /></Link>
        </Reveal>
        <div className="everyday-card-grid">
          {[
            { image: 'home', tag: 'AT HOME', title: 'Every home has its own recipe.', copy: 'A little more milk. One extra simmer. The small things that make it yours.', slug: 'why-every-indian-home-makes-chai-differently', alt: 'Shams sachet and two glasses of chai in a sunlit home kitchen' },
            { image: 'spice', tag: 'IN THE CUP', title: 'Good spice. Better balance.', copy: 'How tea, ginger and cardamom find their sweet spot.', slug: 'does-more-masala-mean-better-chai', alt: 'Shams sachet with ginger, cardamom and a glass of masala chai' },
            { image: 'pause', tag: 'A MOMENT FOR YOU', title: 'Make room for a small pause.', copy: 'Rain outside. A warm cup inside. Some moments need very little.', slug: 'why-chai-tastes-different-every-morning', alt: 'Shams sachet beside a cup of chai and a book by a rainy window' },
          ].map((story, index) => <Reveal className="everyday-card-reveal" key={story.image} delay={index * .09}><Link className="everyday-card" to={`/the-edit/${story.slug}`}>
            <div className="everyday-card-image"><img src={`/assets/shams/journal/matte-${story.image}-v1.webp`} alt={story.alt} width="1448" height="1086" loading="lazy" /></div>
            <div className="everyday-card-copy"><span>{story.tag}</span><h3>{story.title}</h3><p>{story.copy}</p><div className="everyday-card-link">Read the story <ArrowUpRight size={16} /></div></div>
          </Link></Reveal>)}
        </div>
      </section>
    </div>
  );
}

export function LaunchProducts() {
  const { chai, loading, error, reload } = useCatalog();

  return <div className="collection-edit">
    <header className="collection-intro section"><Eyebrow>THE SHAMS COLLECTION</Eyebrow><h1>One beautiful beginning.<br /><em>More brewing.</em></h1><p>Meet our signature masala chai, blended with black tea leaves and whole spices for your everyday ritual.</p><div className="collection-nav"><a href="#recipe-01">01 / Shop masala chai <ArrowRight size={14} /></a><a href="#recipe-02">02 / Coming soon <ArrowRight size={14} /></a></div></header>
    <section className="collection-feature section" id="recipe-01" aria-labelledby="original-title">
      {chai ? <>
        <div className="collection-pack"><span className="release-label">{chai.variantNameSlot || chai.name} · {chai.stock ? 'AVAILABLE NOW' : 'OUT OF STOCK'}</span><ImageSlot src={chai.images[0]} alt="Shams masala chai pouch beside a glass of chai" ratio="4 / 5" priority /><span className="pack-footnote">{chai.ingredients.join(' · ').toUpperCase()}</span></div>
        <div className="collection-copy"><Eyebrow>{chai.name}</Eyebrow><h2 id="original-title">The original.<br /><em>Anything but ordinary.</em></h2><p>{chai.description}</p><div className="flavour-chips">{chai.flavourNotes.map(note => <span key={note}>{note}</span>)}</div><dl className="collection-notes"><div><dt>THE FEELING</dt><dd>Bold. Grounded. Unapologetic.</dd></div><div><dt>THE MOMENT</dt><dd>Your first cup. Your fresh start.</dd></div></dl><ProductSelector product={chai} /><Link className="text-link" to="/products/recipe-01">Get to know the blend <ArrowRight size={14} /></Link></div>
      </> : <CatalogNotice loading={loading} error={error} reload={reload} />}
    </section>
    <section className="next-recipe section" id="recipe-02" aria-labelledby="next-title"><div className="next-recipe-art" aria-hidden="true"><span>THE NEXT CHAPTER</span><strong>02</strong><em>Good things take a little brewing.</em></div><div className="next-recipe-copy"><Eyebrow>RECIPE 02 · COMING SOON</Eyebrow><h2 id="next-title">A new mood.<br /><em>A new recipe.</em></h2><p>Our second recipe is on its way. Leave your email and be first to hear when it drops.</p><RecipeWaitlist /></div></section>
    <footer className="collection-end section"><span>ONE BRAND. MANY POSSIBILITIES.</span><Link className="text-link" to="/our-story">The story behind every cup <ArrowRight size={14} /></Link></footer>
  </div>;
}

export function LaunchProduct() {
  const { slug } = useParams();
  const { product: p, loading, error, reload } = useProduct(slug);
  const [view, setView] = useState(0);

  if (loading || error) {
    return <section className="section pdp-page">
      <CatalogNotice loading={loading} error={error} reload={reload} heading />
    </section>;
  }
  if (!p) return <NotFound />;

  return (
    <div className="pdp-page">
      <section className="product-detail section">
        <div className="pdp-gallery">
          <div className="pdp-main-photo">
            <ImageSlot
              src={p.images[view]}
              alt={`${p.recipeNumber} packaging view`}
              ratio="4 / 5"
              priority
            />
          </div>
          <div className="gallery-controls">
            {['In the ritual'].map((label, i) => (
              <button
                key={label}
                className={view === i ? 'active' : ''}
                aria-pressed={view === i}
                onClick={() => setView(i)}
              >
                {label} <span>0{i + 1}</span>
              </button>
            ))}
          </div>

          <div className="pdp-qr-helper">
            <QrCode size={16} />
            <div>
              <strong>Holding this pack?</strong>
              <p>Scan the on-pack QR code or submit your verdict directly.</p>
              <Link to={`/recipe-feedback?recipe=${p.slug}`} className="text-link">
                Submit Tasting Feedback <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        <div className="pdp-info">
          <div className="breadcrumb-row">
            <Link className="breadcrumb" to="/the-collection">
              THE COLLECTION
            </Link>
            <span>/</span>
            <span className="breadcrumb-current">{p.recipeNumber}</span>
          </div>

          <div className="pdp-recipe-badge">
            <span>{p.recipeNumber}</span>
            <span className="slot-badge">{p.variantNameSlot}</span>
          </div>

          <div className="personality-line">
            <small>THE PERSONALITY</small>
            <h1>{p.personality}</h1>
          </div>

          <div className="cup-line">
            <small>THE CUP</small>
            <p>{p.cup}</p>
          </div>

          <div className="pdp-profile-specs">
            <div className="spec-item">
              <strong>TEA</strong>
              <span>{p.profile.tea}</span>
            </div>
            <div className="spec-item">
              <strong>MASALA</strong>
              <span>{p.profile.masala}</span>
            </div>
            <div className="spec-item">
              <strong>AROMA</strong>
              <span>{p.profile.aroma}</span>
            </div>
            <div className="spec-item">
              <strong>BODY</strong>
              <span>{p.profile.body}</span>
            </div>
            <div className="spec-item">
              <strong>FINISH</strong>
              <span>{p.profile.finish}</span>
            </div>
          </div>

          {/* Ordering area */}
          <div className="pdp-order-box">
            <ProductSelector product={p} />
          </div>

          {/* Accordion Facts */}
          <div className="product-facts">
            <details open>
              <summary>Why this recipe?</summary>
              <div className="fact-content">
                <p>Every Shams recipe exists for a reason.</p>
                <p>{p.whyThisRecipe}</p>
                <p>We explored. We tasted. We refined. And eventually:</p>
                <strong>RECIPE LOCKED.</strong>
              </div>
            </details>

            <details>
              <summary>Brew it your way</summary>
              <ol className="brew-steps-list">
                {p.brewInstructions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>

            <details>
              <summary>What’s in the blend</summary>
              <p>{p.ingredients.join(' · ')}.</p>
            </details>

            <details>
              <summary>Shipping &amp; Delivery</summary>
              <p>
                Complimentary express shipping across India on orders over ₹500.
                Delivered freshly packaged within 2–4 business days with live SMS/WhatsApp tracking.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Availability() {
  return (
    <>
      <section className="page-hero">
        <Eyebrow>WHERE TO FIND SHAMS</Eyebrow>
        <h1>A little closer<br /><em>to your kitchen.</em></h1>
        <p>Order directly through our secure online shop with complimentary pan-India shipping over ₹500.</p>
        <Link className="btn btn-light" to="/the-collection">
          Explore The Collection <ArrowUpRight size={14} />
        </Link>
      </section>
      <section className="section availability-note">
        <Eyebrow>MORE WAYS TO SHOP · COMING SOON</Eyebrow>
        <h2>Shams, where<br /><em>your day takes you.</em></h2>
        <p>We’re working towards availability through leading Indian commerce platforms. Official shopping links will appear here when listings are confirmed.</p>
        <Link className="text-link" to="/contact">Stay in touch <ArrowRight /></Link>
      </section>
    </>
  );
}

export function FounderLaunch() {
  return (
    <>
      <section className="page-hero founder-heading">
        <Eyebrow>FOUNDER · SHAMS CHAI</Eyebrow>
        <h1>Sharmila<br /><em>Krishna.</em></h1>
        <p>Building a modern Indian chai brand around the cup that was already ours.</p>
      </section>
      <section className="section story-home">
        <div className="story-monogram" aria-hidden="true">
          <span>Sham’s</span>
          <small>IT’S A MODERN WOMAN’S RECIPE</small>
        </div>
        <div>
          <Eyebrow>THE IDEA BEHIND SHAMS</Eyebrow>
          <h2>Everyday things.<br /><em>Made with intention.</em></h2>
          <p>
            Sharmila Krishna created Shams from a simple belief: the chai already woven into our everyday lives
            deserves to be made with intention, honesty and care.
          </p>
          <p>Familiar, dependable and presented with the care an everyday ritual deserves.</p>
          <Link to="/our-story" className="text-link">Explore our story <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
