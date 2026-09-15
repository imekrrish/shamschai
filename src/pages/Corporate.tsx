import { FormEvent, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Eyebrow, ImageSlot } from '../components/ui';

export function Corporate() {
  const [draft, setDraft] = useState('');
  function prepareEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const details = ['Name', 'Company', 'Email', 'Occasion', 'Quantity', 'Details'].map(key => `${key}: ${String(data.get(key) || '').trim()}`).join('\n');
    setDraft(`mailto:support@shamschai.com?subject=${encodeURIComponent(`Corporate enquiry — ${data.get('Company')}`)}&body=${encodeURIComponent(details)}`);
  }
  return <div className="corporate-refined">
    <section className="section business-hero">
      <div><Eyebrow>CORPORATE &amp; GIFTING</Eyebrow><h1>A thoughtful gift.<br /><em>A shared ritual.</em></h1><p>Bring people together over a good cup of chai. Shams gifting for your team, your clients, and the occasions that matter.</p><a className="btn" href="#order-form">Plan your gifting <ArrowRight size={16} /></a><span className="business-caption">FOR TEAMS · CLIENTS · CELEBRATIONS</span></div>
      <figure><ImageSlot src="/assets/shams/optimized/lifestyle-home-v2.webp" alt="A glass of masala chai beside a kettle" ratio="4 / 5" priority /><figcaption>A little pause. A lasting impression.</figcaption></figure>
    </section>
    <section className="section business-options" aria-labelledby="gifting-options"><div className="business-heading"><Eyebrow>MADE PERSONAL</Eyebrow><h2 id="gifting-options">Good chai.<br /><em>Your thoughtful touch.</em></h2><p>Start with our original Recipe 01. Tell us how you would like to make it yours, and we will discuss the options for your order.</p></div><div className="business-option-grid">{[
      ['01', 'For your people', 'Welcome a new teammate, thank a client, or celebrate a milestone with something they can enjoy every day.'],
      ['02', 'For your occasion', 'Explore presentation, personal messages, and company branding to suit the moment.'],
      ['03', 'For your workplace', 'Planning chai for the office, an event, or hospitality? Share your quantities and requirements with us.'],
    ].map(([number,title,copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="section business-process"><Eyebrow>HOW IT WORKS</Eyebrow><h2>From a little idea<br /><em>to a thoughtful delivery.</em></h2><ol>{[
      ['Share your brief', 'Tell us the occasion, quantity, delivery location, and date.'],
      ['Make it yours', 'We discuss the available formats, personal touches, and pricing.'],
      ['Confirm the details', 'Agree on your order and delivery plan before production begins.'],
    ].map(([title,copy],index) => <li key={title}><span>0{index+1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
    <section className="section business-enquiry" id="order-form"><div><Eyebrow>LET’S TALK</Eyebrow><h2>Tell us what<br /><em>you have in mind.</em></h2><p>A few details help us suggest the right options. If you are still exploring, that is a good place to start.</p><a className="text-link" href="mailto:support@shamschai.com">support@shamschai.com <ArrowRight size={14} /></a><p className="business-contact-note">For gifting, workplace orders, wholesale, and international enquiries.</p></div>
      <form className="business-form" onSubmit={prepareEnquiry} onChange={() => setDraft('')}>
        <div className="business-fields"><label>Your name<input name="Name" autoComplete="name" required maxLength={100} /></label><label>Company<input name="Company" autoComplete="organization" required maxLength={150} /></label><label className="business-full">Email address<input name="Email" type="email" autoComplete="email" required maxLength={254} /></label><label>What are you planning?<select name="Occasion" defaultValue="Client gifting">{['Client gifting','Team gifting','Festival or event','Office pantry','Wholesale or hospitality','Something else'].map(option => <option key={option}>{option}</option>)}</select></label><label>Approximate quantity<select name="Quantity" defaultValue="Not sure yet">{['Not sure yet','Under 25','25–100','101–500','501–1,000','1,000+'].map(option => <option key={option}>{option}</option>)}</select></label><label className="business-full">Anything else? <span>(optional)</span><textarea name="Details" rows={4} maxLength={2000} placeholder="Delivery date, location, budget, or personal touches…" /></label></div>
        <button className="btn" type="submit">Prepare email enquiry <ArrowRight size={16} /></button><small>Review your details, then send the enquiry using your email app.</small>
        {draft && <div className="business-draft" role="status"><Mail size={20} /><div><strong>Your enquiry is ready to send.</strong><p>Open the draft in your email app and send it to our team.</p><a className="text-link" href={draft}>Open email draft <ArrowRight size={14} /></a></div></div>}
      </form>
    </section>
  </div>;
}
