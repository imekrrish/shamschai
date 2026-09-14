import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight,Minus,Plus} from 'lucide-react';
import {Product} from '../data/products';
import {checkoutUrl} from '../utils/whatsapp';
import {money} from './ui';

export default function ProductSelector({product}:{product:Product}){
  const [selected,setSelected]=useState(0);
  const [quantity,setQuantity]=useState(1);
  const variant=product.variants[selected];
  return <div className="product-selector">
    <fieldset><legend>Choose your pack</legend><div className="size-options">{product.variants.map((v,i)=><label key={v.sku} className={selected===i?'selected':''}><input type="radio" name={`size-${product.id}`} checked={selected===i} onChange={()=>setSelected(i)}/><span>{v.weight}</span></label>)}</div></fieldset>
    <div className="selector-bottom"><div className="quantity-control"><button type="button" disabled={quantity===1} onClick={()=>setQuantity(q=>q-1)} aria-label="Decrease quantity"><Minus/></button><output aria-live="polite" aria-label="Quantity">{quantity}</output><button type="button" disabled={quantity===20} onClick={()=>setQuantity(q=>q+1)} aria-label="Increase quantity"><Plus/></button></div><span>{variant.price>0?money(variant.price*quantity):'Price confirmed on WhatsApp'}</span></div>
    <Link className="btn order-button" to={checkoutUrl(variant.weight,quantity)}>Order on WhatsApp <ArrowUpRight/></Link>
    <small>Confirm availability, delivery and payment with us directly.</small>
  </div>;
}
