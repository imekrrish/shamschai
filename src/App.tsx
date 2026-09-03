import {Route,Routes,useLocation} from 'react-router-dom';
import {useEffect} from 'react';
import Layout from './components/Layout';
import {LaunchHome,LaunchProducts,LaunchProduct,Availability,FounderLaunch} from './LaunchPages';
import {JournalLaunch,JournalArticleLaunch} from './JournalPages';
import {OurStory,BrewGuide,Gifting,Contact,Faq,SearchPage,NotFound} from './pages';
import {Checkout,RefundPolicy} from './OrderPages';
function ScrollTop(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,left:0,behavior:'auto'});},[pathname]);return null}
export default function App(){return <Layout><ScrollTop/><Routes>
  <Route path="/" element={<LaunchHome/>}/>
  <Route path="/products" element={<LaunchProducts/>}/>
  <Route path="/products/:slug" element={<LaunchProduct/>}/>
  <Route path="/collections" element={<LaunchProducts/>}/>
  <Route path="/collections/:slug" element={<LaunchProducts/>}/>
  <Route path="/our-story" element={<OurStory/>}/>
  <Route path="/founder" element={<FounderLaunch/>}/>
  <Route path="/brew-guide" element={<BrewGuide/>}/>
  <Route path="/gifting" element={<Gifting/>}/>
  <Route path="/where-to-buy" element={<Availability/>}/>
  <Route path="/journal" element={<JournalLaunch/>}/>
  <Route path="/journal/:slug" element={<JournalArticleLaunch/>}/>
  <Route path="/contact" element={<Contact/>}/>
  <Route path="/faq" element={<Faq/>}/>
  <Route path="/search" element={<SearchPage/>}/>
  <Route path="/checkout" element={<Checkout/>}/>
  <Route path="/refund-policy" element={<RefundPolicy/>}/>
  <Route path="*" element={<NotFound/>}/>
</Routes></Layout>}
