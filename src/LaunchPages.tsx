import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, QrCode } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog, useProduct } from './context/CatalogContext';
import { pack } from './data/pack';
import { CatalogNotice, Eyebrow, ImageSlot, money, numberWord, Reveal } from './components/ui';
import ProductSelector from './components/ProductSelector';
import RecipeWaitlist from './components/RecipeWaitlist';
import HeroSachet from './components/HeroSachet';
import { NotFound } from './pages';

export function LaunchHome() {
  const reduced = useReducedMotion();
  const { chai, loading, error, reload } = useCatalog();
  const packSizes = chai?.variants ?? [];
  const from = packSizes.length ? Math.min(...packSizes.map(v => v.price)) : null;

  // Each headline line rises out of its own mask, one after the next.
  const line = (i: number) => reduced
    ? {}
    : { initial: { y: '110%' }, animate: { y: '0%' }, transition: { duration: 1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <>
      {/* 1. HERO */}
      <section className="home-hero signature-hero">
        <div className="hero-copy">
          <motion.div
            className="hero-kicker"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span /> {chai?.variantNameSlot || 'Masala Chai'}
          </motion.div>

          <h1>
            <span className="line"><motion.span {...line(0)}>It’s a modern</motion.span></span>
            <span className="line"><motion.span {...line(1)}>woman’s</motion.span></span>
            <span className="line"><motion.em {...line(2)}>recipe.</motion.em></span>
          </h1>

          <motion.div
            className="hero-actions"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62 }}
          >
            <Link className="btn btn-light" to="/the-collection">
              Shop the pack <ArrowUpRight size={14} />
            </Link>
            <Link className="hero-story-link" to="/our-story">Our story <ArrowRight size={14} /></Link>
          </motion.div>

          <motion.ul
            className="hero-assurance"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.85 }}
          >
            {pack.assurances.map(claim => <li key={claim}>{claim}</li>)}
          </motion.ul>
        </div>

        <motion.div
          className="hero-product"
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-glow" aria-hidden="true" />
          {packSizes[0] && (
            <div className="hero-edition"><span>Net weight</span><strong>{packSizes[0].weight}</strong></div>
          )}
          <HeroSachet />
          <Link to="/products/recipe-01" className="hero-detail-link" aria-label="Read the pack">
            <ArrowUpRight />
          </Link>
        </motion.div>

        <div className="hero-scroll" aria-hidden="true"><span /></div>
      </section>

      {/* 2. WHAT IS IN IT */}
      <section className="section pack-blend">
        <Reveal className="pack-blend-head">
          <Eyebrow>INGREDIENTS</Eyebrow>
          <h2>{chai ? `${numberWord(chai.ingredients.length)} things.` : 'What’s inside.'}<br /><em>Nothing else.</em></h2>
          {chai?.description && <p>{chai.description}</p>}
        </Reveal>
        {chai ? (
          <ol className="pack-ingredients">
            {chai.ingredients.map((item, i) => (
              <li key={item}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
        ) : (
          <CatalogNotice loading={loading} error={error} reload={reload} />
        )}
      </section>

      {/* 3. THE PACK ITSELF */}
      <section className="section pack-shelf" id="the-collection">
        <div className="shelf-layout">
          <Reveal className="shelf-photo">
            <ImageSlot
              src={chai?.images[0] || '/assets/shams/optimized/lifestyle-home-v2.webp'}
              alt="Sham’s masala chai poured at home"
              ratio="4 / 5"
            />
          </Reveal>
          <div className="shelf-copy">
            <Eyebrow>THE PACK</Eyebrow>
            <h2>100% pure.<br /><em>Handcrafted.</em></h2>
            {chai ? (
              <>
                <dl className="shelf-specs">
                  <div>
                    <dt>Net weight</dt>
                    <dd>{packSizes.map(v => v.weight).join(' · ')}</dd>
                  </div>
                  {from !== null && (
                    <div>
                      <dt>From</dt>
                      <dd>{money(from)} <small>{pack.details.mrpNote}</small></dd>
                    </div>
                  )}
                  <div>
                    <dt>Best before</dt>
                    <dd>{pack.details.bestBefore}</dd>
                  </div>
                </dl>
                <Link to="/the-collection" className="btn btn-light">
                  See pack sizes &amp; prices <ArrowUpRight size={14} />
                </Link>
              </>
            ) : (
              <CatalogNotice loading={loading} error={error} reload={reload} />
            )}
          </div>
        </div>
      </section>

      {/* 4. HOW TO BREW IT */}
      {(chai?.brewInstructions.length ?? 0) > 0 && (
        <section className="section pack-method">
          <Reveal className="method-head">
            <Eyebrow>BREWING INSTRUCTIONS</Eyebrow>
            <h2>{numberWord(chai!.brewInstructions.length)} steps,<br /><em>straight off the pack.</em></h2>
          </Reveal>
          <ol className="method-steps">
            {chai!.brewInstructions.map((step, i) => (
              <li key={step}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 5. CLOSING */}
      <section className="final-homepage-moment">
        <div className="moment-content">
          <h2>Aromatic black tea.<br /><em>Handpicked spices.</em></h2>
          <div className="moment-cta">
            <Link to="/the-collection" className="btn btn-light">
              Bring {pack.brand} home <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="moment-record">
          <span>FSSAI {pack.record.fssai}</span>
          <span>{pack.record.packedBy}</span>
          <a href={`mailto:${pack.record.email}`}>{pack.record.email}</a>
        </div>
      </section>
    </>
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
