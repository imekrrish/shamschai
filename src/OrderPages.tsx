import {FormEvent,useMemo,useState} from 'react';
import {ArrowRight,Check,ChevronLeft,Minus,Plus,ShieldCheck} from 'lucide-react';
import {Link,useSearchParams} from 'react-router-dom';
import {Eyebrow} from './components/ui';
import {WHATSAPP_NUMBER,packSizes,whatsappUrl,orderLines} from './utils/whatsapp';

const sizes=packSizes;
type Size=typeof sizes[number];

export function Checkout(){
  const [params]=useSearchParams();
  const initial=sizes.includes(params.get('size') as Size)?params.get('size') as Size:'200g';
  const requested=Number(params.get('quantity')||1);
  const initialQuantity=Number.isFinite(requested)?Math.max(1,Math.min(20,Math.floor(requested))):1;
  const [quantities,setQuantities]=useState<Record<Size,number>>(()=>Object.fromEntries(sizes.map(size=>[size,size===initial?initialQuantity:0])));
  const [agreed,setAgreed]=useState(false);
  const [error,setError]=useState('');
  const total=useMemo(()=>Object.values(quantities).reduce((sum,qty)=>sum+qty,0),[quantities]);
  const change=(size:Size,delta:number)=>setQuantities(current=>({...current,[size]:Math.max(0,Math.min(20,current[size]+delta))}));

  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(total<1){setError('Please choose at least one pack.');return}
    if(!agreed){setError('Please accept the refund policy before continuing.');return}
    const data=new FormData(e.currentTarget);
    const packs=orderLines(quantities);
    const message=[
      `Hello Sham's Chai! I would like to place an order.`,'','*ORDER*',packs,`Total packs: ${total}`,'','*CUSTOMER DETAILS*',
      `Name: ${data.get('name')}`,`Phone: ${data.get('phone')}`,`Address: ${data.get('address')}`,
      `City: ${data.get('city')}`,`State: ${data.get('state')}`,`PIN code: ${data.get('pincode')}`,
      `Notes: ${data.get('notes')||'None'}`,'','I have read and accepted the refund policy. Please confirm availability, price, delivery charge and payment details.'
    ].join('\n');
    setError('');
    window.open(whatsappUrl(message),'_blank','noopener,noreferrer');
  }

  return <section className="checkout-page">
    <div className="checkout-heading">
      <Link to="/products/masala-chai" className="checkout-back"><ChevronLeft/> BACK TO THE BLEND</Link>
      <Eyebrow>ORDER DIRECTLY</Eyebrow><h1>Your chai,<br/><em>packed with care.</em></h1>
      <p>Choose your packs and share your delivery details. Your order opens in WhatsApp for final price, delivery and payment confirmation.</p>
      <div className="checkout-trust"><ShieldCheck/><span><b>No online payment collected here</b><small>Confirm everything directly with Sham's before paying.</small></span></div>
    </div>
    <form className="checkout-form" onSubmit={submit}>
      <div className="checkout-section"><span className="checkout-step">01</span><div><h2>Choose your pack</h2><p>Add the quantity you need in each size.</p></div></div>
      <div className="pack-chooser">{sizes.map(size=><div className={quantities[size]?'pack-choice active':'pack-choice'} key={size}>
        <div><span>SHAM'S MASALA CHAI</span><strong>{size}</strong></div>
        <div className="quantity-control" aria-label={`${size} quantity`}><button type="button" onClick={()=>change(size,-1)} aria-label={`Remove one ${size} pack`}><Minus/></button><output aria-live="polite">{quantities[size]}</output><button type="button" onClick={()=>change(size,1)} aria-label={`Add one ${size} pack`}><Plus/></button></div>
      </div>)}</div>
      <div className="checkout-section details-title"><span className="checkout-step">02</span><div><h2>Delivery details</h2><p>Used only to prepare your WhatsApp message.</p></div></div>
      <div className="field-grid">
        <label>FULL NAME<input name="name" autoComplete="name" required placeholder="Your name"/></label>
        <label>PHONE NUMBER<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9 +()-]{10,18}" placeholder="10-digit mobile number"/></label>
        <label className="wide">DELIVERY ADDRESS<textarea name="address" autoComplete="street-address" required rows={3} placeholder="House, street and locality"/></label>
        <label>CITY<input name="city" autoComplete="address-level2" required/></label>
        <label>STATE<input name="state" autoComplete="address-level1" required/></label>
        <label>PIN CODE<input name="pincode" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{6}" maxLength={6} placeholder="6 digits"/></label>
        <label>ORDER NOTES <small>OPTIONAL</small><input name="notes" placeholder="Delivery preference, gift note…"/></label>
      </div>
      <label className="policy-check"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/><span>I have read and agree to the <Link to="/refund-policy" target="_blank">refund &amp; replacement policy</Link>.</span></label>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <div className="checkout-submit"><div><span>TOTAL PACKS</span><strong>{total}</strong></div><button className="btn whatsapp-btn" type="submit">CONTINUE ON WHATSAPP <ArrowRight/></button></div>
      <p className="checkout-fineprint">Submitting does not place a paid order. Availability, final price, shipping charge and payment method will be confirmed on WhatsApp.</p>
    </form>
  </section>
}

export function RefundPolicy(){return <section className="policy-page">
  <div className="policy-hero"><Eyebrow>CUSTOMER CARE</Eyebrow><h1>Refund &amp;<br/><em>replacement policy.</em></h1><p>Simple, fair and written for a food product.</p></div>
  <article className="policy-copy">
    <p className="policy-lead">Because tea is a consumable product, we cannot accept returns or exchanges for a change of mind once an order has been dispatched.</p>
    <h2>Damaged, incorrect or missing items</h2><p>If your order arrives damaged, unsealed, incorrect or incomplete, message us on WhatsApp at <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">+91 90003 03897</a> within 48 hours of delivery. Please include your name, order conversation and clear photos of the outer package and affected item.</p>
    <h2>When a refund or replacement applies</h2><p>After reviewing the details, we may offer a replacement or a refund for the affected item. Please keep the product and original packaging until the request is resolved. Products that have been substantially used, tampered with or reported after 48 hours may not qualify.</p>
    <h2>Cancellations</h2><p>You may request a cancellation on WhatsApp before dispatch. Once dispatched, an order cannot ordinarily be cancelled. If Sham's cannot fulfil an accepted order, any amount already paid will be returned in full.</p>
    <h2>Refund timing</h2><p>Approved refunds are initiated to the original payment method. Bank or payment-provider processing times may vary; we will share confirmation when the refund is initiated.</p>
    <div className="policy-note"><Check/><div><b>Need help with an order?</b><p>Message us with your order details and we’ll review it personally.</p><a className="text-link" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">MESSAGE ON WHATSAPP <ArrowRight/></a></div></div>
    <small>Last updated: 3 September 2026</small>
  </article>
  </section>}
