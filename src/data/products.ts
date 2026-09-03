export type Variant={weight:'200 g'|'500 g'|'1000 g';price:number;sku:string;stock:boolean};
export type Product={id:string;slug:string;name:string;subtitle:string;description:string;category:string;images:string[];variants:Variant[];flavourNotes:string[];ingredients:string[];brewInstructions:string[];stock:boolean;featured:boolean;marketplaces:string[]};

export const products:Product[]=[{
  id:'masala',slug:'masala-chai',name:'Sham’s Masala Chai',subtitle:'Bold · Aromatic · Comforting',
  description:'A warm, layered masala chai made for slow mornings, long conversations and one more cup.',
  category:'Masala Chai',images:['/assets/shams/products/masala-final-pack.png','/assets/shams/hero/hero-final-pack.png'],
  variants:[
    {weight:'200 g',price:0,sku:'SH-MASALA-200',stock:true},
    {weight:'500 g',price:0,sku:'SH-MASALA-500',stock:true},
    {weight:'1000 g',price:0,sku:'SH-MASALA-1000',stock:true}
  ],flavourNotes:['WARM SPICE','RICH','AROMATIC'],
  ingredients:['Premium tea leaves','Handpicked spices'],
  brewInstructions:['Bring water to a rolling boil.','Add Sham’s Chai and sweetener to taste.','Add milk, then simmer until rich and aromatic.','Strain into your favourite cup and serve hot.'],
  stock:true,featured:true,marketplaces:[]
}];
export const getProduct=(slug?:string)=>products.find(p=>p.slug===slug);
