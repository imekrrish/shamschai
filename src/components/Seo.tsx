import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {articles} from '../data/content';

const pages:Record<string,[string,string]>={
  '/':['Sham’s Chai | Indian Masala Chai','Bold tea, warm spices and an everyday ritual. Explore Sham’s Masala Chai in 200 g, 500 g and 1000 g packs. Order directly online.'],
  '/products':['Shop Masala Chai | Sham’s Chai','Discover Sham’s signature Masala Chai. Choose your pack size and order directly through our secure store.'],
  '/products/masala-chai':['Masala Chai — Ingredients & Packs | Sham’s Chai','Black tea leaves with clove, cinnamon, cardamom, nutmeg and black pepper. Explore the original packaging, brewing guide and available pack sizes.'],
  '/our-story':['Our Story | Sham’s Chai','The chai we grew up with, made for the lives we live now. The idea behind Sham’s and its everyday Indian cup.'],
  '/founder':['Sharmila Krishna, Founder | Sham’s Chai','Meet the idea behind Sham’s Chai, founded by Sharmila Krishna.'],
  '/brew-guide':['How to Brew Masala Chai | Sham’s Chai','Six simple steps from the Sham’s Masala Chai pack. Prepare, brew and pour a proper cup, your way.'],
  '/gifting':['Chai Gifting Enquiries | Sham’s Chai','Talk to Sham’s about chai for personal occasions, festive tables, teams and partners.'],
  '/where-to-buy':['Where to Buy | Sham’s Chai','Order Sham’s Masala Chai directly online. Find updates about future shopping options.'],
  '/journal':['The Chai Journal | Sham’s Chai','Stories on chai, home, habit and the small moments that make a day feel familiar.'],
  '/contact':['Contact | Sham’s Chai','Questions, order support or gifting enquiries? Contact the Sham’s Chai team by email.'],
  '/faq':['Frequently Asked Questions | Sham’s Chai','Answers about pack sizes, brewing, ingredients and ordering Sham’s Masala Chai.'],
  '/checkout':['Secure Checkout | Sham’s Chai','Choose your chai packs and confirm delivery details. Secure online checkout with instant confirmation.'],
  '/account':['My Account & Orders | Sham’s Chai','Track your chai orders, manage saved delivery addresses, and update account details.'],
  '/login':['Sign In | Sham’s Chai','Sign in to your Sham’s Chai customer account to view past orders and manage addresses.'],
  '/register':['Create Account | Sham’s Chai','Create your Sham’s Chai customer account for swift checkout and order tracking.'],
  '/return-refund-policy':['Return, Refund & Cancellation Policy | Shams Chai','Read the Shams Chai Return, Refund & Cancellation Policy including information about damaged, incorrect, defective or missing orders.'],
  '/terms-and-conditions':['Terms & Conditions | Shams Chai','Read the Terms & Conditions governing purchases and use of the Shams Chai website.'],
  '/refund-policy':['Return, Refund & Cancellation Policy | Shams Chai','Read the Shams Chai Return, Refund & Cancellation Policy including information about damaged, incorrect, defective or missing orders.'],
  '/search':['Search | Sham’s Chai','Find Sham’s Masala Chai, brewing notes and stories.'],
};

export default function Seo(){const {pathname}=useLocation();useEffect(()=>{
  const article=articles.find(a=>pathname===`/journal/${a.slug}`);
  const collection=pathname==='/collections'||pathname.startsWith('/collections/');
  const entry=article?[`${article.title} | Sham’s Chai`,article.excerpt]:pages[collection?'/products':pathname];
  const [title,description]=entry||['Page Not Found | Sham’s Chai','Find your way back to Sham’s Chai.'];
  const canonical=`https://www.shamschai.com${collection?'/products':pathname==='/'?'/':pathname}`;
  document.title=title;
  const meta=(key:string,value:string,property=false)=>{const attr=property?'property':'name';let el=document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.append(el)}el.content=value};
  meta('description',description);meta('og:title',title,true);meta('og:description',description,true);meta('og:url',canonical,true);meta('twitter:title',title);meta('twitter:description',description);meta('robots',!entry||pathname==='/search'?'noindex,follow':'index,follow');
  const link=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(link)link.href=canonical;
},[pathname]);return null}
