/**
 * Shapes only. The catalogue itself lives in Postgres and reaches the
 * storefront through the backend API — nothing is bundled here, so the site
 * can never show a price or a pack size the admin has not published.
 */
export type Variant = {
  weight: string;
  price: number;
  sku: string;
  stock: boolean;
};

export type SensoryProfile = {
  tea: string;
  masala: string;
  aroma: string;
  body: string;
  finish: string;
};

export type ChartScores = {
  teaStrength: number; // 0 - 100 (Light <-> Kadak)
  masala: number;      // 0 - 100 (Subtle <-> Bold)
  aroma: number;       // 0 - 100 (Gentle <-> Intense)
  body: number;        // 0 - 100 (Light <-> Full)
  finish: number;      // 0 - 100 (Clean <-> Lingering)
};

export type Product = {
  id: string;
  slug: string;
  recipeNumber: string;
  code: string;
  name: string;
  variantNameSlot: string;
  personality: string;
  cup: string;
  mood: string;
  moment: string;
  whyThisRecipe: string;
  profile: SensoryProfile;
  chartScores: ChartScores;
  subtitle: string;
  description: string;
  category: string;
  images: string[];
  variants: Variant[];
  flavourNotes: string[];
  ingredients: string[];
  brewInstructions: string[];
  stock: boolean;
  featured: boolean;
  marketplaces: string[];
};

const text = (value: unknown, fallback = '') => (typeof value === 'string' && value.trim() ? value : fallback);
const list = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);

/**
 * Rows arrive as JSON columns, so every field is checked before use. Missing
 * copy becomes an empty string the page can skip; it is never invented.
 */
export function toProduct(row: Record<string, unknown>): Product {
  const variants = Array.isArray(row.variants) ? row.variants : [];
  return {
    id: text(row.id),
    slug: text(row.slug),
    recipeNumber: text(row.recipeNumber),
    code: text(row.code),
    name: text(row.name),
    variantNameSlot: text(row.variantNameSlot),
    personality: text(row.personality),
    cup: text(row.cup),
    mood: text(row.mood),
    moment: text(row.moment),
    whyThisRecipe: text(row.whyThisRecipe),
    profile: (row.profile as SensoryProfile) ?? { tea: '', masala: '', aroma: '', body: '', finish: '' },
    chartScores: (row.chartScores as ChartScores) ?? { teaStrength: 0, masala: 0, aroma: 0, body: 0, finish: 0 },
    subtitle: text(row.subtitle),
    description: text(row.description),
    category: text(row.category),
    images: list(row.images),
    variants: variants
      .filter((v): v is Record<string, unknown> => !!v && typeof v === 'object')
      .map(v => ({
        weight: text(v.weight),
        price: Number(v.price) || 0,
        sku: text(v.sku),
        stock: v.stock !== false,
      }))
      .filter(v => v.weight && v.price > 0),
    flavourNotes: list(row.flavourNotes),
    ingredients: list(row.ingredients),
    brewInstructions: list(row.brewInstructions),
    stock: row.stock !== false,
    featured: row.featured === true,
    marketplaces: list(row.marketplaces),
  };
}
