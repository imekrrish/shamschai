import {ReactNode,useEffect,useRef,useState} from 'react';
import {Link,NavLink,useLocation} from 'react-router-dom';
import {Menu,X,ArrowUpRight,ArrowRight} from 'lucide-react';
import {openLaunchEmail} from '../utils/launchMail';
import {whatsappUrl} from '../utils/whatsapp';

const links=[['Shop','/products'],['Our Story','/our-story'],['The Tea','/products/masala-chai'],['Brew Guide','/brew-guide']];
const moreLinks=[['Founder','/founder'],['Journal','/journal'],['Gifting','/gifting'],['Contact','/contact']];
function Logo(){return <Link to="/" className="logo" aria-label="Sham’s Indian Masala Chai home"><span>Sham’s</span><small>INDIAN MASALA CHAI</small></Link>}
export default function Layout({children}:{children:ReactNode}){
  const [menu,setMenu]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const {pathname}=useLocation();
  useEffect(()=>setMenu(false),[pathname]);
  useEffect(()=>{const scroll=()=>setScrolled(window.scrollY>24);scroll();window.addEventListener('scroll',scroll,{passive:true});return()=>window.removeEventListener('scroll',scroll)},[]);
  useEffect(()=>{
    const el=dialog.current;if(!el)return;
    if(menu){
      el.showModal();
      const previous=document.body.style.overflow;document.body.style.overflow='hidden';
      const trap=(event:KeyboardEvent)=>{
        if(event.key!=='Tab')return;
        const controls=el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]');
        const first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
      };
      el.addEventListener('keydown',trap);
      return()=>{el.removeEventListener('keydown',trap);el.close();document.body.style.overflow=previous;trigger.current?.focus()};
    }
  },[menu]);
  useEffect(()=>{const mq=window.matchMedia('(min-width: 1000px)');const close=()=>{if(mq.matches)setMenu(false)};mq.addEventListener('change',close);return()=>mq.removeEventListener('change',close)},[]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><div className="announcement">THE EVERYDAY INDIAN CUP <span>·</span> ORDER DIRECTLY ON WHATSAPP</div>
    <header className={`site-header ${scrolled?'scrolled':''}`}><Logo/><nav aria-label="Main navigation">{links.map(([label,to])=><NavLink key={to} to={to} end>{label}</NavLink>)}</nav><div className="nav-actions"><Link className="btn nav-order" to="/checkout">Order Shams <ArrowUpRight/></Link><button ref={trigger} className="menu-trigger icon-btn" onClick={()=>setMenu(true)} aria-label="Open navigation" aria-expanded={menu} aria-controls="mobile-navigation"><Menu/></button></div></header>
    <dialog ref={dialog} id="mobile-navigation" className="mobile-menu" aria-label="Navigation" onCancel={()=>setMenu(false)} onClick={e=>{if(e.target===e.currentTarget)setMenu(false)}}><div className="mobile-menu-top"><Logo/><button className="icon-btn" onClick={()=>setMenu(false)} aria-label="Close navigation"><X/></button></div><nav aria-label="Mobile navigation">{[...links,...moreLinks].map(([label,to],i)=><Link key={to} to={to} onClick={()=>setMenu(false)}><small>0{i+1}</small>{label}<ArrowUpRight/></Link>)}</nav><Link className="btn btn-light" to="/checkout" onClick={()=>setMenu(false)}>Order on WhatsApp <ArrowUpRight/></Link></dialog>
    <main id="main-content" tabIndex={-1}>{children}</main><Footer/></>;
}
function Footer(){return <footer className="site-footer"><div className="footer-lead"><div><div className="eyebrow">KEEP THE KETTLE ON</div><h2>The chai we grew up with,<br/><em>made for now.</em></h2></div><Link to="/checkout" className="footer-order" aria-label="Order Sham’s Chai"><ArrowUpRight/></Link></div><div className="footer-grid"><div><h3>Explore</h3>{[...links,['Journal','/journal'],['Founder','/founder']].map(([label,to])=><Link key={label} to={to}>{label}</Link>)}</div><div><h3>Let’s talk</h3><Link to="/contact">Contact us</Link><Link to="/gifting">Gifting & enquiries</Link><a href={whatsappUrl()} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight/></a><Link to="/where-to-buy">Where to find us</Link><Link to="/faq">FAQs</Link><Link to="/refund-policy">Refund policy</Link></div><div className="newsletter"><h3>Notes from Shams</h3><p>Brewing thoughts, everyday rituals<br/>and the first word on what’s next.</p><form onSubmit={e=>{e.preventDefault();openLaunchEmail((e.currentTarget.elements.namedItem('email') as HTMLInputElement).value)}}><label className="sr-only" htmlFor="footer-email">Your email address</label><input id="footer-email" name="email" type="email" placeholder="Your email address" autoComplete="email" required/><button type="submit" aria-label="Join the launch list by email"><ArrowRight/></button></form><small>Opens a ready-to-send email in your email app.</small></div></div><div className="footer-wordmark" aria-hidden="true">Sham’s</div><div className="footer-bottom"><span>© {new Date().getFullYear()} SHAMS CHAI</span><span>FOUNDED BY SHARMILA KRISHNA</span><span>THE EVERYDAY INDIAN CUP</span></div></footer>}
