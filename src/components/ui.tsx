import {ReactNode,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {motion,useReducedMotion} from 'framer-motion';

export const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
export function ImageSlot({src,alt,ratio='4 / 5',className='',priority=false}:{src:string;alt:string;ratio?:string;className?:string;priority?:boolean}){
  const [failed,setFailed]=useState('');
  const originalPack=/\/sachet-(front|back)\.png$/.test(src);
  const photo=<img src={src} alt={alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>setFailed(src)}/>;
  return <div className={`image-slot ${className}`} style={{aspectRatio:ratio}}>{failed!==src?(originalPack?<picture><source srcSet={src.replace('.png','.webp')} type="image/webp"/>{photo}</picture>:photo):<div className="image-unavailable" role="img" aria-label={alt}><span>Sham’s Chai</span><small>Photo coming soon</small></div>}</div>;
}
export function Eyebrow({children}:{children:ReactNode}){return <div className="eyebrow">{children}</div>}
export function SectionTitle({eyebrow,title,copy,center=false}:{eyebrow?:string;title:string;copy?:string;center?:boolean}){return <div className={`section-title ${center?'center':''}`}>{eyebrow&&<Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{copy&&<p>{copy}</p>}</div>}
export function ButtonLink({children,outline=false,onClick}:{children:ReactNode;outline?:boolean;onClick?:()=>void}){return <button onClick={onClick} className={`btn ${outline?'btn-outline':''}`}>{children}<ArrowRight size={18}/></button>}
export function Reveal({children,className=''}:{children:ReactNode;className?:string}){
  const reduced=useReducedMotion();
  return <motion.div className={className} initial={reduced?false:{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.65,ease:[.22,1,.36,1]}}>{children}</motion.div>;
}
