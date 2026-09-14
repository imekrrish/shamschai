import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
await mkdir('qa',{recursive:true});
const browser=await chromium.launch();
for(const width of [375,390,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.querySelectorAll('img')){img.loading='eager';await img.decode().catch(()=>{})}});
  await page.screenshot({path:`qa/home-${width}.png`,fullPage:true});
  console.log(width,await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main *,header *,footer *')].filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&!el.closest('.marquee-track')}).map(el=>({tag:el.tagName,class:el.className,right:el.getBoundingClientRect().right})).slice(0,12)})));
  if(width===390||width===1440){for(const [path,name] of [['/products/masala-chai','product'],['/checkout?size=500g&quantity=3','checkout']]){await page.goto('http://127.0.0.1:5173'+path);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`qa/${name}-${width}.png`,fullPage:true})}}
  await page.close();
}
await browser.close();
