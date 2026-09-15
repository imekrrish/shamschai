import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, ArrowRight } from 'lucide-react';
import { LEGAL_CONFIG } from '../data/legalConstants';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  intro?: ReactNode;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated = LEGAL_CONFIG.LAST_UPDATED,
  intro,
  children,
}: LegalPageLayoutProps) {
  return (
    <article className="legal-page">
      {/* Hero Header */}
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <div className="eyebrow">SHAMS LEGAL &amp; POLICIES</div>
          <h1 className="legal-title">{title}</h1>
          <div className="legal-meta">
            <span className="legal-updated-badge">Last Updated: {lastUpdated}</span>
          </div>
          {intro && <div className="legal-intro">{intro}</div>}
        </div>
      </header>

      {/* Reading Container */}
      <div className="legal-container">
        <div className="legal-body">
          {children}
        </div>
      </div>
    </article>
  );
}

interface LegalSectionProps {
  number?: number | string;
  title: string;
  children: ReactNode;
  id?: string;
}

export function LegalSection({ number, title, children, id }: LegalSectionProps) {
  return (
    <section className="legal-section" id={id}>
      <h2 className="legal-section-heading">
        {number !== undefined && <span className="legal-section-number">{number}. </span>}
        {title}
      </h2>
      <div className="legal-section-content">{children}</div>
    </section>
  );
}

interface LegalContactBoxProps {
  title?: string;
  description?: string;
  showBusinessAddress?: boolean;
  showFssai?: boolean;
  note?: string;
}

export function LegalContactBox({
  title = 'Contact Us',
  description = 'For any order-related issue, complaint or assistance, please contact us:',
  showBusinessAddress = false,
  showFssai = false,
  note,
}: LegalContactBoxProps) {
  return (
    <div className="legal-contact-card">
      <div className="legal-contact-header">
        <h3 className="legal-contact-title">{title}</h3>
        {description && <p className="legal-contact-desc">{description}</p>}
      </div>

      <div className="legal-contact-grid">
        <div className="legal-contact-item">
          <span className="legal-contact-label">Entity</span>
          <strong className="legal-contact-val">{LEGAL_CONFIG.BRAND_NAME}</strong>
        </div>

        <div className="legal-contact-item">
          <span className="legal-contact-label">Email</span>
          <a
            href={`mailto:${LEGAL_CONFIG.CUSTOMER_SUPPORT_EMAIL}`}
            className="legal-contact-link"
          >
            <Mail size={14} aria-hidden="true" />
            <span>{LEGAL_CONFIG.CUSTOMER_SUPPORT_EMAIL}</span>
          </a>
        </div>

        {showBusinessAddress && (
          <div className="legal-contact-item">
            <span className="legal-contact-label">Business Address</span>
            <span className="legal-contact-val legal-placeholder">
              {LEGAL_CONFIG.BUSINESS_ADDRESS}
            </span>
          </div>
        )}

        {showFssai && (
          <div className="legal-contact-item">
            <span className="legal-contact-label">FSSAI Licence / Registration Number</span>
            <span className="legal-contact-val legal-placeholder">
              {LEGAL_CONFIG.FSSAI_LICENSE_NUMBER}
            </span>
          </div>
        )}

        <div className="legal-contact-item">
          <span className="legal-contact-label">Website</span>
          <a
            href={LEGAL_CONFIG.WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="legal-contact-link"
          >
            <Globe size={14} aria-hidden="true" />
            <span>{LEGAL_CONFIG.WEBSITE_URL}</span>
          </a>
        </div>
      </div>

      {note && <p className="legal-contact-note">{note}</p>}

      <div className="legal-contact-actions">
        <Link to="/contact" className="btn btn-nav-shop legal-contact-btn">
          <span>Go to Contact Form</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
