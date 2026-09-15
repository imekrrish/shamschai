import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShieldCheck } from 'lucide-react';
import { Product } from '../data/products';
import { money } from './ui';
import RecipeWaitlist from './RecipeWaitlist';
import { CartSize, useCart } from '../context/CartContext';
import { api } from '../utils/api';

export default function ProductSelector({ product: initialProduct }: { product: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api.getProduct(initialProduct.id || initialProduct.slug)
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.variants)) {
          setProduct((prev) => ({
            ...prev,
            ...data,
            variants: data.variants,
          }));
        }
      })
      .catch(() => {
        // Fallback to static props
      });
    return () => { cancelled = true; };
  }, [initialProduct.id, initialProduct.slug]);

  if (product.id !== 'recipe-01') return <div className="upcoming-product"><p>{product.id === 'recipe-02' ? 'Recipe 02 is coming soon. Join the waitlist for launch news.' : 'This recipe is still in development.'}</p>{product.id === 'recipe-02' && <RecipeWaitlist />}</div>;

  const variant = product.variants[selected] || product.variants[0];
  const isSelectedOutOfStock = !product.stock || (variant && !variant.stock);

  return (
    <div className="product-selector">
      <fieldset>
        <legend>Choose your pack size</legend>
        <div className="size-options">
          {product.variants.map((v, i) => {
            const isOos = !product.stock || !v.stock;
            return (
              <label 
                key={v.sku || `${v.weight}-${i}`} 
                className={`${selected === i ? 'selected' : ''} ${isOos ? 'variant-out-of-stock' : ''}`}
                style={{ opacity: isOos ? 0.65 : 1 }}
              >
                <input
                  type="radio"
                  name={`size-${product.id}`}
                  checked={selected === i}
                  onChange={() => setSelected(i)}
                />
                <span>
                  {v.weight}
                  {isOos && <span className="text-[10px] ml-1.5 font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Sold Out</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="selector-bottom">
        <div className="quantity-control">
          <button
            type="button"
            disabled={quantity === 1 || isSelectedOutOfStock}
            onClick={() => setQuantity((q) => q - 1)}
            aria-label="Decrease quantity"
          >
            <Minus />
          </button>
          <output aria-live="polite" aria-label="Quantity">
            {quantity}
          </output>
          <button
            type="button"
            disabled={quantity === 20 || isSelectedOutOfStock}
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus />
          </button>
        </div>
        <span className="selector-price">{money(variant.price * quantity)}</span>
      </div>

      <button 
        type="button" 
        className={`btn order-button ${isSelectedOutOfStock ? 'disabled-button' : ''}`}
        disabled={isSelectedOutOfStock}
        style={{
          cursor: isSelectedOutOfStock ? 'not-allowed' : 'pointer',
          backgroundColor: isSelectedOutOfStock ? '#9c9a95' : undefined,
        }}
        onClick={() => {
          if (isSelectedOutOfStock) return;
          const cartSize = variant.weight.replace(/\s+/g, '').toLowerCase() === '1kg' ? '1000g' : variant.weight.replace(/\s+/g, '') as CartSize;
          cart.add(cartSize, quantity);
          navigate('/cart');
        }}
      >
        {isSelectedOutOfStock ? 'OUT OF STOCK' : <>ADD TO CART <ArrowRight size={16} /></>}
      </button>
      <small className="selector-trust-note">
        <ShieldCheck size={14} /> Freshly blended · Fast dispatch in 24 hours · Free shipping over ₹500
      </small>
    </div>
  );
}
