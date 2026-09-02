import {motion} from 'framer-motion';
import {ArrowLeft,ArrowRight,Clock} from 'lucide-react';
import {Link,useParams} from 'react-router-dom';
import {articles} from './data/content';
import {Eyebrow,ImageSlot,Reveal} from './components/ui';
import {openLaunchEmail} from './utils/launchMail';

const ease=[.22,1,.36,1] as const;

function JournalCard({article,index,large=false}:{article:typeof articles[0];index:number;large?:boolean}){
  return <motion.article className={`journal-new-card ${large?'journal-new-card--large':''}`} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.16}} transition={{duration:.7,delay:index*.06,ease}}>
    <Link to={`/journal/${article.slug}`}>
      <div className="journal-card-image"><ImageSlot src={article.image} alt={article.title} ratio={large?'16 / 10':'4 / 3'}/><span>0{index+1}</span></div>
      <div className="journal-card-copy"><div><span>{article.category}</span><i>5 MIN READ</i></div><h2>{article.title}</h2><p>{article.excerpt}</p><b>READ THE STORY <ArrowRight/></b></div>
    </Link>
  </motion.article>
}

export function JournalLaunch(){const [featured,...rest]=articles;return <>
  <section className="journal-new-hero"><motion.div initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.8,ease}}><Eyebrow>THE SHAM’S JOURNAL</Eyebrow><h1>STORIES TO<br/><em>POUR OVER.</em></h1><p>On chai, home, habit and the small moments that make a day feel familiar.</p></motion.div><div className="journal-issue"><span>ISSUE</span><b>01</b><small>NOTES ON<br/>A SHARED RITUAL</small></div></section>
  <section className="journal-feature"><JournalCard article={featured} index={0} large/><aside><span>EDITOR’S NOTE</span><p>Chai rarely asks for attention. It simply appears—before work, after rain, between people who have more to say. This journal is a place to notice it.</p></aside></section>
  <section className="journal-new-grid"><div className="journal-grid-label"><span>THE LATEST</span><span>{String(rest.length).padStart(2,'0')} STORIES</span></div>{rest.map((a,i)=><JournalCard key={a.slug} article={a} index={i+1}/>)}</section>
  <section className="journal-letter"><Reveal><Eyebrow>NOTES FROM SHAM’S</Eyebrow><h2>A letter worth<br/><em>making chai for.</em></h2><p>Occasional stories, brewing thoughts and the first word on what comes next.</p><form onSubmit={e=>{e.preventDefault();const email=(e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;openLaunchEmail(email)}}><input name="email" type="email" placeholder="YOUR EMAIL ADDRESS" autoComplete="email" required/><button type="submit">JOIN THE LIST <ArrowRight/></button></form><small>Opens a ready-to-send email to support@shamschai.com.</small></Reveal></section>
  </>}

export function JournalArticleLaunch(){const {slug}=useParams();const article=articles.find(a=>a.slug===slug);if(!article)return <JournalLaunch/>;const related=articles.filter(a=>a.slug!==article.slug).slice(0,2);return <>
  <article className="journal-story">
    <header><Link to="/journal" className="journal-back"><ArrowLeft/> ALL STORIES</Link><motion.div initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.8,ease}}><Eyebrow>{article.category}</Eyebrow><h1>{article.title}</h1><p>{article.excerpt}</p><div className="journal-byline"><span>SHAM’S JOURNAL</span><span><Clock/> 5 MIN READ</span></div></motion.div></header>
    <motion.div className="journal-story-image" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.15,ease}}><ImageSlot src={article.image} alt={article.title} ratio="16 / 9"/><span>THE EVERYDAY CUP · 01</span></motion.div>
    <div className="journal-story-layout"><aside><span>IN THIS STORY</span><a href="#ritual">A familiar ritual</a><a href="#every-home">Every home is different</a><a href="#shams">The Sham’s way</a></aside><div className="journal-story-body"><p className="journal-dropcap">There are ordinary cups, and then there are cups that seem perfectly matched to the moment. Chai has always known the difference.</p><p>It arrives without ceremony. A saucepan finds the stove. Tea, milk and spice meet in proportions remembered by hand rather than written down. Before long, the room feels a little warmer and everyone knows to stay.</p><h2 id="ritual">A familiar ritual</h2><p>Chai is woven into the useful pauses of a day. It makes five minutes feel generous. It gives guests something to hold and conversations somewhere to begin. The cup matters, but so does everything around it.</p><blockquote>“Chai is less a single recipe than a language every home speaks in its own accent.”</blockquote><h2 id="every-home">Every home is different</h2><p>Some kitchens crush ginger against the counter. Others count cardamom pods or add them by instinct. Some let the tea simmer until it turns a deep caramel brown; others know the exact second to take it off the flame.</p><p>Those differences are not flaws in the recipe. They are the point. A familiar cup can still carry the distinct signature of a person, a home and a moment.</p><h2 id="shams">The Sham’s way</h2><p>At Sham’s, we begin with a balanced Masala Chai and leave room for the way you already brew. Make it strong. Make it milky. Sweeten it, or don’t. The best method is the one that brings the cup closest to home.</p><div className="journal-end"><i>〰</i><span>THE KETTLE IS ALWAYS WORTH PUTTING ON.</span></div></div></div>
  </article>
  <section className="journal-related"><div><Eyebrow>KEEP READING</Eyebrow><h2>Another story<br/>for the next cup.</h2></div><div>{related.map((a,i)=><JournalCard key={a.slug} article={a} index={i}/>)}</div></section>
  </>}
