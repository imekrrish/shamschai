import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Product, toProduct } from '../data/products';
import { api } from '../utils/api';

type CatalogState = {
  products: Product[];
  /** The single published pack, or null until it loads. */
  chai: Product | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.getProducts()
      .then(rows => {
        if (cancelled) return;
        setProducts((Array.isArray(rows) ? rows : []).map(toProduct).filter(p => p.slug));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // No bundled catalogue stands in for the database; the page says so instead.
        setProducts([]);
        setError(err.message || 'The catalogue is unavailable right now.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const reload = useCallback(() => setAttempt(n => n + 1), []);

  const value = useMemo<CatalogState>(() => ({
    products,
    chai: products[0] ?? null,
    loading,
    error,
    reload,
  }), [products, loading, error, reload]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside a CatalogProvider');
  return context;
}

/** Looks up one pack by slug, tolerating the legacy /products/masala-chai link. */
export function useProduct(slug?: string) {
  const { products, loading, error, reload } = useCatalog();
  const product = useMemo(() => {
    if (!products.length) return null;
    if (!slug) return products[0];
    const wanted = slug === 'masala-chai' || slug === 'masala' ? 'recipe-01' : slug;
    return products.find(p => p.slug === wanted || p.id === wanted) ?? null;
  }, [products, slug]);
  return { product, loading, error, reload };
}
