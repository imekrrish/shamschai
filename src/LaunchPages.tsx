import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, QrCode } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getProduct, products, Product } from './data/products';
import { Eyebrow, ImageSlot, Reveal, SectionTitle } from './components/ui';
import ProductSelector from './components/ProductSelector';
import RecipeWaitlist from './components/RecipeWaitlist';
import HeroSachet from './components/HeroSachet';
import { NotFound } from './pages';
import { api } from './utils/api';

export function LaunchHome() {
  const reduced = useReducedMotion();

  return (
    <>
      {/* 1. CINEMATIC HERO */}
      <section className="home-hero modern-woman-hero centered-sachet-hero">
        <div className="hero-copy">
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-word-intro">IT’S A </span>
            <span className="hero-word-modern">MODERN </span>
            <span className="hero-word-woman">WOMAN’S </span>
            <em className="hero-word-recipe">RECIPE.</em>
          </motion.h1>

          <div className="hero-actions">
            <Link className="btn btn-light" to="/the-collection">
              Explore The Collection <ArrowUpRight size={14} />
            </Link>
          </div>

        </div>

        <motion.div
          className="hero-product"
          initial={reduced ? false : { opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <HeroSachet />
          <Link
            to="/products/recipe-01"
            className="hero-detail-link"
            aria-label="Discover masala chai"
          >
            <ArrowUpRight />
          </Link>
        </motion.div>
      </section>

      {/* 2. THE OPENING (Cinematic & Rhythmic) */}
      <section className="section cinematic-opening-section">
        <Reveal>
          <Eyebrow>A LITTLE DAILY RITUAL</Eyebrow>
          <h2>BEFORE THE DAY BEGINS,<br />TAKE A MOMENT.</h2>
        </Reveal>

        <div className="rhythmic-lines-grid">
          <div className="rhythm-item"><span>/</span><p>The kitchen is still quiet.</p></div>
          <div className="rhythm-item"><span>/</span><p>Water comes to a boil.</p></div>
          <div className="rhythm-item"><span>/</span><p>A spoonful goes into the pan.</p></div>
          <div className="rhythm-item"><span>/</span><p>The scent of spice fills the room.</p></div>
          <div className="rhythm-item"><span>/</span><p>Your favourite cup is waiting.</p></div>
          <div className="rhythm-item"><span>/</span><p>The first sip belongs to you.</p></div>
        </div>

        <Reveal className="opening-conclusion">
          <p className="highlight-sentence">
            A familiar ritual. A few minutes to call your own.
          </p>
          <div className="punchline">
            <h3>THE REST OF THE DAY CAN WAIT A MINUTE.</h3>
            <em>Stay for a sip.</em>
          </div>
        </Reveal>
      </section>

      {/* 3. THE SHAMS IDEA TEASER */}
      <section className="section home-idea-teaser">
        <div className="idea-teaser-box">
          <div className="idea-copy">
            <Eyebrow>WHAT GOES INTO YOUR CUP</Eyebrow>
            <h2>BLACK TEA.<br />WHOLE SPICES.<br /><em>THAT’S SHAMS.</em></h2>
            <p>
              Black tea leaves meet green cardamom, clove, black pepper and cinnamon
              in a full, fragrant blend made for the pan.
            </p>
            <p className="sub-p">
              We build around the tea, then work on the balance of spices.
              The result is a full-bodied cup that holds its own with milk.
            </p>
            <div className="idea-punch">
              <strong>GOOD CHAI STARTS WITH WHAT’S INSIDE.</strong>
              <span>Get to know the thinking behind the blend.</span>
            </div>
            <Link to="/the-idea" className="btn btn-light">
              The Shams Approach <ArrowRight size={14} />
            </Link>
          </div>
          <div className="idea-photo">
            <ImageSlot
              src="/assets/shams/optimized/lifestyle-home-v2.webp"
              alt="Shams morning ritual"
              ratio="4 / 5"
            />
          </div>
        </div>
      </section>

      {/* 4. THE COLLECTION PREVIEW */}
      <section className="section home-collection-preview" id="the-collection">
        <div className="section-heading-row">
          <div>
            <Eyebrow>THE COLLECTION</Eyebrow>
            <h2>THE FIRST CHAPTER.</h2>
          </div>
          <p className="collection-lead-phrase">
            Meet our signature masala chai. Get to know the blend,
            choose your pack, and make room for it on the kitchen shelf.
          </p>
        </div>

        <div className="home-recipes-grid">
          {products.slice(0, 1).map((p) => (
            <div key={p.id} className="home-recipe-card">
              <div className="recipe-card-top">
                <span className="recipe-number">{p.recipeNumber}</span>
                <span className="slot-badge">MASALA CHAI</span>
              </div>
              <h3>Your everyday kadak.</h3>
              <p className="recipe-cup">{p.cup}</p>
              <div className="recipe-mood-badge">
                <small>CHOOSE YOUR PACK</small>
                <span>{p.variants.map(variant => variant.weight).join(' · ')}</span>
              </div>
              <div className="recipe-card-action">
                <Link to={`/products/${p.slug}`} className="text-link">
                  Shop Masala Chai <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="collection-view-all">
          <Link to="/the-collection" className="btn btn-light">
            See Pack Sizes &amp; Prices <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* 5. BREW GUIDE */}
      <section className="section home-finder-teaser">
        <div className="finder-teaser-card">
          <div className="teaser-left">
            <Eyebrow>FROM PACK TO CUP</Eyebrow>
            <h2>A PAN. A SPOON.<br /><em>A PROPER BREW.</em></h2>
            <p>
              No special equipment needed. A small saucepan, your favourite cup,
              and a few minutes at the stove are all it takes.
            </p>
            <div className="chart-preview-axes">
              <div><span>01 / START</span><small>Boil 150 ml water. Add 1 tsp chai.</small></div>
              <div><span>02 / SIMMER</span><small>Add milk and sugar to taste. Simmer 4–5 minutes.</small></div>
              <div><span>03 / POUR</span><small>Strain into your cup and enjoy.</small></div>
            </div>
          </div>
          <div className="teaser-right">
            <div className="quote-badge">
              <small>MAKE IT YOURS</small>
              <p>A little more milk? A little less sugar? The finishing touch is yours.</p>
              <Link to="/brew-guide" className="text-link">Read the brew guide <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EVERYDAY CHAI MOMENTS */}
      <section className="section home-social-proof">
        <Eyebrow>BETTER WITH COMPANY</Eyebrow>
        <h2>There’s always time for one more cup.</h2>
        <div className="testimonials-grid">
          <div className="quote-card">
            <span className="recipe-tag">THE KITCHEN COUNTER</span>
            <p>
              Someone puts the chai on. Someone reaches for the biscuits. The best catch-ups rarely need a plan.
            </p>
            <small>Leave the washing-up for later.</small>
          </div>
          <div className="quote-card">
            <span className="recipe-tag">THE OFFICE BREAK</span>
            <p>
              Step away from the screen. Find the colleague you’ve only waved at all week. Let the conversation wander.
            </p>
            <small>A break worth taking together.</small>
          </div>
          <div className="quote-card">
            <span className="recipe-tag">THE UNEXPECTED GUEST</span>
            <p>
              The doorbell rings. Pull up another chair, reach for a second cup, and put a little more water in the pan.
            </p>
            <small>Make yourself at home.</small>
          </div>
        </div>
      </section>

      {/* 7. FINAL HOMEPAGE MOMENT */}
      <section className="final-homepage-moment">
        <div className="moment-content">
          <Eyebrow>SHAMS MASALA CHAI</Eyebrow>
          <h2>
            YOUR NEXT CUP<br />
            <em>STARTS HERE.</em>
          </h2>
          <div className="moment-cta">
            <Link to="/the-collection" className="btn btn-light">
              Bring Shams Home <ArrowRight size={14} />
            </Link>
          </div>
          <span className="closing-whisper">SEE YOU AT CHAI TIME.</span>
        </div>
      </section>
    </>
  );
}

export function LaunchProducts() {
  const [recipe, setRecipe] = useState<Product>(products[0]);
  useEffect(() => {
    void api.getProduct('recipe-01').then((live) => {
      setRecipe(current => ({ ...current, ...live, variants: live.variants || current.variants, flavourNotes: live.flavourNotes || current.flavourNotes, ingredients: live.ingredients || current.ingredients, images: live.images || current.images }));
    }).catch(() => { /* The bundled catalog remains available if the API is offline. */ });
  }, []);
  return <div className="collection-edit">
    <header className="collection-intro section"><Eyebrow>THE SHAMS COLLECTION</Eyebrow><h1>One beautiful beginning.<br /><em>More brewing.</em></h1><p>Meet our signature masala chai, blended with black tea leaves and whole spices for your everyday ritual.</p><div className="collection-nav"><a href="#recipe-01">01 / Shop masala chai <ArrowRight size={14} /></a><a href="#recipe-02">02 / Coming soon <ArrowRight size={14} /></a></div></header>
    <section className="collection-feature section" id="recipe-01" aria-labelledby="original-title">
      <div className="collection-pack"><span className="release-label">MASALA CHAI · AVAILABLE NOW</span><ImageSlot src={recipe.images[0]} alt="Shams masala chai pouch beside a glass of chai" ratio="4 / 5" priority /><span className="pack-footnote">BLACK TEA · CARDAMOM · CLOVE · CINNAMON · BLACK PEPPER</span></div>
      <div className="collection-copy"><Eyebrow>THE ORIGINAL BLEND</Eyebrow><h2 id="original-title">The original.<br /><em>Anything but ordinary.</em></h2><p>{recipe.cup}</p><div className="flavour-chips">{recipe.flavourNotes.map(note => <span key={note}>{note}</span>)}</div><dl className="collection-notes"><div><dt>THE FEELING</dt><dd>Bold. Grounded. Unapologetic.</dd></div><div><dt>THE MOMENT</dt><dd>Your first cup. Your fresh start.</dd></div></dl><ProductSelector product={recipe} /><Link className="text-link" to="/products/recipe-01">Get to know the blend <ArrowRight size={14} /></Link></div>
    </section>
    <section className="next-recipe section" id="recipe-02" aria-labelledby="next-title"><div className="next-recipe-art" aria-hidden="true"><span>THE NEXT CHAPTER</span><strong>02</strong><em>Good things take a little brewing.</em></div><div className="next-recipe-copy"><Eyebrow>RECIPE 02 ? COMING SOON</Eyebrow><h2 id="next-title">A new mood.<br /><em>A new recipe.</em></h2><p>Our second recipe is on its way. Leave your email and be first to hear when it drops.</p><RecipeWaitlist /></div></section>
    <footer className="collection-end section"><span>ONE BRAND. MANY POSSIBILITIES.</span><Link className="text-link" to="/our-story">The story behind every cup <ArrowRight size={14} /></Link></footer>
  </div>;
}

export function LaunchProduct() {
  const { slug } = useParams();
  const p = getProduct(slug);
  const [view, setView] = useState(0);

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
            <h2>{p.personality}</h2>
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
