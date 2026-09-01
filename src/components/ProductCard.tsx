import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {Product} from '../data/products';
import {ImageSlot} from './ui';
export default function ProductCard({product}:{product:Product}){return <article className="product-card launch-product-card"><Link to={`/products/${product.slug}`}><div className="product-image-wrap"><ImageSlot src={product.images[0]} alt={product.name} ratio="1 / 1"/><span>COMING SOON</span></div><div className="product-meta"><span>{product.category}</span><h3>{product.name}</h3><p>{product.subtitle}</p></div><div className="launch-product-link">DISCOVER THE BLEND <ArrowUpRight/></div></Link></article>}
