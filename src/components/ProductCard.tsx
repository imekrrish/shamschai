import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {Product} from '../data/products';
import {ImageSlot} from './ui';
export default function ProductCard({product}:{product:Product}){return <article className="product-card"><Link to={`/products/${product.slug}`}><ImageSlot src={product.images[0]} alt={`${product.name}, original front sachet`} ratio="4 / 5"/><div className="eyebrow">{product.category}</div><h3>{product.name}</h3><p>{product.subtitle}</p><div className="text-link">Choose your pack <ArrowUpRight/></div></Link></article>}
