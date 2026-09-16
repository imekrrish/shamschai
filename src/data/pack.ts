/**
 * The parts of the sachet the admin does not manage: the printed seal, the
 * claim band, and the regulatory panel. Everything the admin *can* edit —
 * name, description, ingredients, brewing steps, pack sizes and prices —
 * comes from the database instead, via CatalogContext.
 */
export const pack = {
  brand: 'Sham’s',
  tagline: 'It’s a modern woman’s recipe',

  /** Front-of-pack seal, printed under the wordmark. */
  seal: '100% Pure & Handcrafted',

  /** The three claims banded across the back of the pack. */
  assurances: ['No Added Sugar', 'No Preservatives', 'No Artificial Flavors'],

  /** Printed alongside the MRP and shelf life. */
  details: {
    mrpNote: 'incl. of all taxes',
    bestBefore: '24 months from the date of packing',
  },

  /** Regulatory and manufacturer panel. */
  record: {
    fssai: '13625012000056',
    packedBy: 'Sham’s MC Traders Private Limited',
    address: 'Plot No-196, Vaidehi Nagar, Vanasthalipuram, Hyderabad, Telangana – 500 070',
    email: 'hello@shamschai.com',
    phone: '+91 90003 03897',
    website: 'www.shamschai.com',
  },
} as const;
