import {ReactNode,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {motion} from 'framer-motion';

export const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
export function ImageSlot({src,alt,ratio='4 / 5',className=''}:{src:string;alt:string;ratio?:string;className?:string}){const [bad,setBad]=useState(false);return <div className={`image-slot ${className}`} style={{aspectRatio:ratio}}>{!bad&&<img src={src} alt={alt} onError={()=>setBad(true)}/>} {bad&&<div className="placeholder"><span>IMAGE REQUIRED</span><strong>{src.split('/').pop()}</strong><small>{ratio.replace(' / ',':')}</small></div>}</div>}
export function Eyebrow({children}:{children:ReactNode}){return <div className="eyebrow">{children}</div>}
export function SectionTitle({eyebrow,title,copy,center=false}:{eyebrow?:string;title:string;copy?:string;center?:boolean}){return <div className={`section-title ${center?'center':''}`}>{eyebrow&&<Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{copy&&<p>{copy}</p>}</div>}
export function ButtonLink({children,outline=false,onClick}:{children:ReactNode;outline?:boolean;onClick?:()=>void}){return <button onClick={onClick} className={`btn ${outline?'btn-outline':''}`}>{children}<ArrowRight size={14}/></button>}
export function Reveal({children,className=''}:{children:ReactNode;className?:string}){return <motion.div className={className} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.65,ease:[.22,1,.36,1]}}>{children}</motion.div>}
