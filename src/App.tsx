import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Seo from './components/Seo';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartPage from './CartPage';
import { LaunchHome, LaunchProducts, LaunchProduct, Availability, FounderLaunch } from './LaunchPages';
import { JournalLaunch, JournalArticleLaunch } from './JournalPages';
import { OurStory, BrewGuide, Gifting, Contact, Faq, SearchPage, NotFound } from './pages';
import { Checkout } from './OrderPages';
import { AuthPage, AccountPage } from './AccountPages';
import { OrderConfirmationPage } from './OrderConfirmationPage';
import { TheIdea } from './pages/TheIdea';
import { Corporate } from './pages/Corporate';
import { PackagingFeedback } from './pages/PackagingFeedback';
import { EmailVerificationPage } from './EmailVerificationPage';
import { ReturnRefundPolicy } from './pages/ReturnRefundPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <Layout>
        <Seo />
        <ScrollTop />
        <Routes>
          {/* Main Master Navigation Routes */}
          <Route path="/" element={<LaunchHome />} />
          <Route path="/the-idea" element={<TheIdea />} />
          <Route path="/the-collection" element={<LaunchProducts />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/the-edit" element={<JournalLaunch />} />
          <Route path="/the-edit/:slug" element={<JournalArticleLaunch />} />
          <Route path="/corporate" element={<Corporate />} />

          {/* Retired pages redirected gracefully to the collection */}
          <Route path="/the-lab" element={<Navigate to="/the-collection" replace />} />

          {/* Product and Catalog Aliases */}
          <Route path="/products" element={<LaunchProducts />} />
          <Route path="/products/:slug" element={<LaunchProduct />} />
          <Route path="/collections" element={<LaunchProducts />} />
          <Route path="/collections/:slug" element={<LaunchProducts />} />

          {/* Journal Aliases */}
          <Route path="/journal" element={<JournalLaunch />} />
          <Route path="/journal/:slug" element={<JournalArticleLaunch />} />

          {/* Packaging Feedback / QR Code Scanning */}
          <Route path="/recipe-feedback" element={<PackagingFeedback />} />
          <Route path="/qr" element={<PackagingFeedback />} />

          {/* Legacy / Auxiliary Pages */}
          <Route path="/founder" element={<FounderLaunch />} />
          <Route path="/brew-guide" element={<BrewGuide />} />
          <Route path="/gifting" element={<Gifting />} />
          <Route path="/where-to-buy" element={<Availability />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/register" element={<AuthPage initialMode="register" />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<AccountPage />} />
          <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<Navigate to="/return-refund-policy" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      </CartProvider>
    </AuthProvider>
  );
}
