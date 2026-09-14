import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';

const root='public/assets/shams';
// Exact rectangular crops; no generative changes, resizing or retouching.
for(const [name,left,width] of [['sachet-front',0,505],['sachet-back',514,509]]){
  await sharp(`${root}/products/original-sachets.png`).extract({left,top:230,width,height:1080}).png().toFile(`${root}/products/${name}.png`);
  await sharp(`${root}/products/${name}.png`).webp({lossless:true,effort:6}).toFile(`${root}/products/${name}.webp`);
}
await mkdir(`${root}/optimized`,{recursive:true});
for(const [folder,name] of [['lifestyle','lifestyle-home-v2'],['journal','journal-rain-v2'],['journal','journal-every-home-v2'],['journal','journal-rules-v2'],['journal','journal-ginger-cardamom-v2']]){
  await sharp(`${root}/${folder}/${name}.png`).resize({width:1280,withoutEnlargement:true}).webp({quality:83}).toFile(`${root}/optimized/${name}.webp`);
}
console.log('Original sachet crops and optimized lifestyle photographs prepared.');
