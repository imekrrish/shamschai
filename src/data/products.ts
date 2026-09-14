export type Variant={weight:'200 g'|'500 g'|'1000 g';price:number;sku:string;stock:boolean};
export type Product={id:string;slug:string;name:string;subtitle:string;description:string;category:string;images:string[];variants:Variant[];flavourNotes:string[];ingredients:string[];brewInstructions:string[];stock:boolean;featured:boolean;marketplaces:string[]};

export const products:Product[]=[{
  id:'masala',slug:'masala-chai',name:'Sham’s Masala Chai',subtitle:'Bold · Aromatic · Comforting',
  description:'A warm, layered masala chai made for slow mornings, long conversations and one more cup.',
  category:'Masala Chai',images:['/assets/shams/products/sachet-front.png','/assets/shams/products/sachet-back.png'],
  variants:[
    {weight:'200 g',price:0,sku:'SH-MASALA-200',stock:true},
    {weight:'500 g',price:0,sku:'SH-MASALA-500',stock:true},
    {weight:'1000 g',price:0,sku:'SH-MASALA-1000',stock:true}
  ],flavourNotes:['WARM SPICE','RICH','AROMATIC'],
  ingredients:['Black tea leaves','Clove','Cinnamon','Cardamom','Nutmeg','Black pepper'],
  brewInstructions:['Boil 150 ml water.','Add 1 tsp Masala Chai.','Add sugar to taste.','Add milk as desired.','Simmer 3–5 minutes.','Strain & enjoy hot.'],
  stock:true,featured:true,marketplaces:[]
}];
export const getProduct=(slug?:string)=>products.find(p=>p.slug===slug);
