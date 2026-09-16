import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { articles } from '../data/content';
import { useCatalog } from '../context/CatalogContext';

const pages: Record<string, [string, string]> = {
  '/': [
    'Sham’s Chai | Indian Masala Chai',
    'Bold tea, warm spices and an everyday ritual. Explore Sham’s Masala Chai in 200 g, 500 g and 1000 g packs. Order directly online.'
  ],
  '/the-idea': [
    'The Idea Behind Shams | Sham’s Chai',
    'Chai made without shortcuts. The standard, philosophy, and origins behind Sham’s Chai.'
  ],
  '/the-collection': [
    'The Shams Collection | Sham’s Chai',
    'Meet our signature masala chai, blended with whole spices and black tea leaves for your everyday ritual.'
  ],
  '/products': [
    'Shop Masala Chai | Sham’s Chai',
    'Discover Sham’s signature Masala Chai. Choose your pack size and order directly through our secure store.'
  ],
  '/products/recipe-01': [
    'Recipe 01 Masala Chai — Ingredients & Packs | Sham’s Chai',
    'Black tea leaves with clove, cinnamon, cardamom, nutmeg and black pepper. Explore the original packaging, brewing guide and available pack sizes.'
  ],
  '/products/masala-chai': [
    'Masala Chai — Ingredients & Packs | Sham’s Chai',
    'Black tea leaves with clove, cinnamon, cardamom, nutmeg and black pepper. Explore the original packaging, brewing guide and available pack sizes.'
  ],
  '/our-story': [
    'Our Story | Sham’s Chai',
    'The chai we grew up with, made for the lives we live now. The idea behind Sham’s and its everyday Indian cup.'
  ],
  '/the-edit': [
    'The Shams Edit | Sham’s Chai',
    'Stories on chai, home, habit and the small moments that make a day feel familiar.'
  ],
  '/journal': [
    'The Chai Journal | Sham’s Chai',
    'Stories on chai, home, habit and the small moments that make a day feel familiar.'
  ],
  '/corporate': [
    'Corporate Gifting & Wholesale | Sham’s Chai',
    'Bring people together over a good cup of chai. Shams bespoke corporate gifting, workplace orders, and wholesale enquiries.'
  ],
  '/founder': [
    'Sharmila Krishna, Founder | Sham’s Chai',
    'Meet the idea behind Sham’s Chai, founded by Sharmila Krishna.'
  ],
  '/brew-guide': [
    'How to Brew Masala Chai | Sham’s Chai',
    'Six simple steps from the Sham’s Masala Chai pack. Prepare, brew and pour a proper cup, your way.'
  ],
  '/gifting': [
    'Chai Gifting Enquiries | Sham’s Chai',
    'Talk to Sham’s about chai for personal occasions, festive tables, teams and partners.'
  ],
  '/where-to-buy': [
    'Where to Buy | Sham’s Chai',
    'Order Sham’s Masala Chai directly online. Find updates about future shopping options.'
  ],
  '/contact': [
    'Contact | Sham’s Chai',
    'Questions, order support or gifting enquiries? Contact the Sham’s Chai team by email.'
  ],
  '/faq': [
    'Frequently Asked Questions | Sham’s Chai',
    'Answers about pack sizes, brewing, ingredients and ordering Sham’s Masala Chai.'
  ],
  '/cart': [
    'Your Cart | Sham’s Chai',
    'Review your selected Sham’s Masala Chai packs and proceed to secure checkout.'
  ],
  '/checkout': [
    'Secure Checkout | Sham’s Chai',
    'Choose your chai packs and confirm delivery details. Secure online checkout with instant confirmation.'
  ],
  '/order-confirmation': [
    'Order Confirmation | Sham’s Chai',
    'Thank you for your order with Sham’s Chai. Review your order details and delivery status.'
  ],
  '/account': [
    'My Account & Orders | Sham’s Chai',
    'Track your chai orders, manage saved delivery addresses, and update account details.'
  ],
  '/orders': [
    'My Account & Orders | Sham’s Chai',
    'Track your chai orders, manage saved delivery addresses, and view order history.'
  ],
  '/login': [
    'Sign In | Sham’s Chai',
    'Sign in to your Sham’s Chai customer account to view past orders and manage addresses.'
  ],
  '/register': [
    'Create Account | Sham’s Chai',
    'Create your Sham’s Chai customer account for swift checkout and order tracking.'
  ],
  '/verify-email': [
    'Verify Email | Sham’s Chai',
    'Confirm your email address for your Sham’s Chai customer account.'
  ],
  '/recipe-feedback': [
    'Packaging Tasting Feedback | Sham’s Chai',
    'Submit your recipe feedback and tasting notes from your Sham’s Chai pack QR code.'
  ],
  '/qr': [
    'Packaging Tasting Feedback | Sham’s Chai',
    'Submit your recipe feedback and tasting notes from your Sham’s Chai pack QR code.'
  ],
  '/return-refund-policy': [
    'Return, Refund & Cancellation Policy | Shams Chai',
    'Read the Shams Chai Return, Refund & Cancellation Policy including information about damaged, incorrect, defective or missing orders.'
  ],
  '/terms-and-conditions': [
    'Terms & Conditions | Shams Chai',
    'Read the Terms & Conditions governing purchases and use of the Shams Chai website.'
  ],
  '/refund-policy': [
    'Return, Refund & Cancellation Policy | Shams Chai',
    'Read the Shams Chai Return, Refund & Cancellation Policy including information about damaged, incorrect, defective or missing orders.'
  ],
  '/search': [
    'Search | Sham’s Chai',
    'Find Sham’s Masala Chai, brewing notes and stories.'
  ],
};

export default function Seo() {
  const { pathname } = useLocation();
  const { products } = useCatalog();

  useEffect(() => {
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

    let entry: [string, string] | undefined = pages[cleanPath];

    if (!entry) {
      if (cleanPath === '/the-collection' || cleanPath === '/collections' || cleanPath.startsWith('/collections/')) {
        entry = pages['/the-collection'];
      } else if (cleanPath.startsWith('/the-edit/') || cleanPath.startsWith('/journal/')) {
        const slug = cleanPath.replace(/^\/(?:the-edit|journal)\//, '');
        const article = articles.find((a) => a.slug === slug);
        if (article) {
          entry = [`${article.title} | Sham’s Chai`, article.excerpt];
        } else {
          entry = pages['/the-edit'];
        }
      } else if (cleanPath.startsWith('/products/')) {
        const slug = cleanPath.replace(/^\/products\//, '');
        const product = products.find(
          (p) => p.slug === slug || p.id === slug || (slug === 'masala-chai' && p.slug === 'recipe-01')
        );
        if (product) {
          entry = [
            `${product.name} — Ingredients & Packs | Sham’s Chai`,
            product.description ||
              'Black tea leaves with whole spices. Explore the original packaging, brewing guide and available pack sizes.'
          ];
        } else if (slug === 'recipe-01' || slug === 'masala-chai') {
          entry = pages['/products/recipe-01'];
        }
      } else if (cleanPath.startsWith('/order-confirmation')) {
        entry = pages['/order-confirmation'];
      }
    }

    const [title, description] = entry || [
      'Page Not Found | Sham’s Chai',
      'Find your way back to Sham’s Chai.'
    ];

    const canonical = `https://www.shamschai.com${cleanPath === '/' ? '/' : cleanPath}`;
    document.title = title;

    const meta = (key: string, value: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.append(el);
      }
      el.content = value;
    };

    meta('description', description);
    meta('og:title', title, true);
    meta('og:description', description, true);
    meta('og:url', canonical, true);
    meta('twitter:title', title);
    meta('twitter:description', description);
    meta(
      'robots',
      !entry ||
        cleanPath === '/search' ||
        cleanPath.startsWith('/order-confirmation') ||
        cleanPath === '/verify-email' ||
        cleanPath === '/cart' ||
        cleanPath === '/checkout'
        ? 'noindex,follow'
        : 'index,follow'
    );

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.append(link);
    }
    link.href = canonical;
  }, [pathname, products]);

  return null;
}

