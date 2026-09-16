import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, ArrowRight, User as UserIcon, ShoppingBag } from 'lucide-react';
import { openLaunchEmail } from '../utils/launchMail';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const mainNavLinks = [
  ['THE IDEA', '/the-idea'],
  ['THE COLLECTION', '/the-collection'],
  ['OUR STORY', '/our-story'],
  ['THE SHAMS EDIT', '/the-edit'],
  ['CORPORATE', '/corporate'],
];

function Logo() {
  return (
    <Link to="/" className="logo brand-logo-modern" aria-label="Shams Masala Chai Home">
      <img className="brand-logo-image" src="/assets/shams/brand/shams-logo.png" alt="Sham’s Masala Chai — It’s a modern woman’s recipe" />
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { count } = useCart();

  useEffect(() => {
    setMenu(false);
    document.body.style.overflow = '';
  }, [pathname]);

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 24);
    scroll();
    window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (menu) {
      if (!el.open) el.showModal();
      document.body.style.overflow = 'hidden';
      const trap = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;
        const controls = el.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]'
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          last?.focus();
        }
      };
      el.addEventListener('keydown', trap);
      return () => {
        el.removeEventListener('keydown', trap);
        if (el.open) el.close();
        document.body.style.overflow = '';
        trigger.current?.focus();
      };
    } else {
      if (el.open) el.close();
      document.body.style.overflow = '';
    }
  }, [menu]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    const close = () => {
      if (mq.matches) {
        setMenu(false);
        document.body.style.overflow = '';
      }
    };
    mq.addEventListener('change', close);
    return () => mq.removeEventListener('change', close);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Modern Announcement Strip */}
      <div className="announcement">
        SHAMS MASALA CHAI <span>·</span> IT’S A MODERN WOMAN’S RECIPE <span>·</span> COMPLIMENTARY EXPRESS SHIPPING OVER ₹500
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <Logo />

        <nav className="desktop-nav" aria-label="Main navigation">
          {mainNavLinks.map(([label, to]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="nav-cart-link" aria-label={`Cart, ${count} items`}><ShoppingBag size={18} /><span>{count}</span></Link>
          {isAuthenticated ? (
            <Link to="/account" className="nav-account-link" aria-label="Customer Account">
              <span className="account-icon-badge">
                <UserIcon size={14} />
              </span>
              <span className="nav-user-name">{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
            </Link>
          ) : (
            <Link to="/login" className="nav-account-link" aria-label="Sign In">
              <UserIcon size={15} />
              <span>Sign In</span>
            </Link>
          )}

          <Link className="btn btn-nav-shop" to="/the-collection">
            SHOP <ArrowUpRight size={13} />
          </Link>

          <button
            ref={trigger}
            className="menu-trigger icon-btn"
            onClick={() => setMenu(true)}
            aria-label="Open navigation"
            aria-expanded={menu}
            aria-controls="mobile-navigation"
          >
            <Menu />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="mobile-menu"
        aria-label="Navigation"
        onCancel={() => {
          setMenu(false);
          document.body.style.overflow = '';
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setMenu(false);
            document.body.style.overflow = '';
          }
        }}
      >
        <div className="mobile-menu-top">
          <Logo />
          <button
            className="icon-btn"
            onClick={() => {
              setMenu(false);
              document.body.style.overflow = '';
            }}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {mainNavLinks.map(([label, to], i) => (
            <Link key={to} to={to} onClick={() => setMenu(false)}>
              <small>0{i + 1}</small>
              {label}
              <ArrowUpRight size={14} />
            </Link>
          ))}
          <Link to="/the-collection" onClick={() => setMenu(false)}>
            <small>06</small>
            SHOP THE COLLECTION
            <ArrowUpRight size={14} />
          </Link>
          {isAuthenticated ? (
            <Link to="/account" onClick={() => setMenu(false)}>
              <small>07</small>
              MY ACCOUNT &amp; ORDERS
              <ArrowUpRight size={14} />
            </Link>
          ) : (
            <Link to="/login" onClick={() => setMenu(false)}>
              <small>07</small>
              SIGN IN / REGISTER
              <ArrowUpRight size={14} />
            </Link>
          )}
        </nav>
        <div className="mobile-menu-footer">
          <Link className="btn btn-light" to="/the-collection" onClick={() => setMenu(false)}>
            Order Shams Now <ArrowUpRight size={14} />
          </Link>
        </div>
      </dialog>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer modern-master-footer">
      <div className="footer-lead">
        <div>
          <div className="eyebrow">SHAMS MASALA CHAI</div>
          <h2>
            IT’S A MODERN WOMAN’S RECIPE.
          </h2>
          <p className="footer-lead-sub">
            She was never just one thing. So why should her chai be?
          </p>
        </div>
        <Link to="/the-collection" className="footer-order" aria-label="Explore The Collection">
          <ArrowUpRight />
        </Link>
      </div>

      <div className="footer-grid master-footer-grid">
        {/* Column 1: Explore */}
        <div>
          <h3>Explore</h3>
          <Link to="/the-idea">The Idea</Link>
          <Link to="/the-collection">The Collection</Link>
          <Link to="/our-story">Our Story</Link>
          <Link to="/the-edit">The Shams Edit</Link>
        </div>

        {/* Column 2: Business */}
        <div>
          <h3>Business</h3>
          <Link to="/corporate">Corporate</Link>
          <Link to="/corporate">Custom Editions</Link>
          <Link to="/corporate">Wholesale</Link>
          <Link to="/corporate">International</Link>
        </div>

        {/* Column 3: Shop */}
        <div>
          <h3>Shop</h3>
          <Link to="/the-collection">All Chai</Link>
          <Link to="/corporate">Gift</Link>
          <Link to="/checkout">Fast Checkout</Link>
          <Link to="/recipe-feedback">Packaging QR Feedback</Link>
        </div>

        {/* Column 4: Legal & Help */}
        <div>
          <h3>Legal</h3>
          <span className="footer-link-pending" title="Coming soon">Privacy Policy</span>
          <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
          <Link to="/return-refund-policy">Return &amp; Refund Policy</Link>
          <span className="footer-link-pending" title="Coming soon">Shipping Policy</span>

          <h3 className="footer-subheading">Help</h3>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        {/* Column 5: Dispatch */}
        <div className="newsletter-col">
          <div className="newsletter-dispatch">
            <small className="dispatch-title">THE SHAMS DISPATCH</small>
            <p>Priority tasting invites and first word on fresh batches.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                openLaunchEmail((e.currentTarget.elements.namedItem('email') as HTMLInputElement).value);
              }}
            >
              <label className="sr-only" htmlFor="footer-email">
                Your email address
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                placeholder="Your email address"
                autoComplete="email"
                required
              />
              <button type="submit" aria-label="Join the dispatch list">
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-wordmark">
        <Logo />
      </div>

      <div className="footer-bottom-statement">
        <div className="closing-mantra">
          <span>ONE BRAND.</span>
          <span>MANY CHAI PERSONALITIES.</span>
          <strong>AND WE’RE JUST GETTING STARTED.</strong>
        </div>
        <div className="copyright-line">
          <span>© {new Date().getFullYear()} SHAMS MASALA CHAI</span>
          <span>ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
}
