import {products} from '../data/products';

// Existing business contact, shared by checkout and customer care.
export const WHATSAPP_NUMBER='919000303897';
export const packSizes=products[0].variants.map(v=>v.weight.replace(/\s/g,''));
export function whatsappUrl(message=''){
  return `https://wa.me/${WHATSAPP_NUMBER}${message?`?text=${encodeURIComponent(message)}`:''}`;
}
export function checkoutUrl(size:string,quantity=1){
  return `/checkout?${new URLSearchParams({size:size.replace(/\s/g,''),quantity:String(quantity)})}`;
}
export function orderLines(quantities:Record<string,number>){
  return ['Product: '+products[0].name,...packSizes.filter(size=>quantities[size]>0).map(size=>`Size: ${size} · Quantity: ${quantities[size]}`)].join('\n');
}
