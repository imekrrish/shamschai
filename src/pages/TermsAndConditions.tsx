import { Link } from 'react-router-dom';
import { LegalPageLayout, LegalSection, LegalContactBox } from '../components/LegalPageLayout';
import { LEGAL_CONFIG } from '../data/legalConstants';

export function TermsAndConditions() {
  return (
    <LegalPageLayout
      title="Terms &amp; Conditions"
      lastUpdated={LEGAL_CONFIG.LAST_UPDATED}
      intro={
        <>
          <p className="legal-lead">Welcome to Shams Chai.</p>
          <p>
            These Terms &amp; Conditions govern your access to and use of the Shams Chai website, including any purchases made through:{' '}
            <a href={LEGAL_CONFIG.WEBSITE_URL} target="_blank" rel="noopener noreferrer">
              {LEGAL_CONFIG.WEBSITE_URL}
            </a>
          </p>
          <p>
            By accessing the website, placing an order or using our services, you acknowledge that you have read, understood and agreed to these Terms &amp; Conditions.
          </p>
          <p>
            If you do not agree with these Terms, please do not use the website.
          </p>
        </>
      }
    >
      <LegalSection number={1} title="About Shams Chai">
        <p>
          Shams Chai provides tea and related products through its website and other authorised sales channels.
        </p>
        <p>
          Applicable business information, registrations, licences and contact details may be displayed on the website, invoices, product packaging or other official Shams Chai materials.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Eligibility">
        <p>
          By using this website or placing an order, you confirm that you are legally capable of entering into a binding agreement under applicable Indian law.
        </p>
        <p>
          If you use the website on behalf of another person, organisation or business, you confirm that you have authority to act on their behalf.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Product Information">
        <p>
          Shams Chai makes reasonable efforts to ensure that product information displayed on the website is accurate.
        </p>
        <p>This may include:</p>
        <ul className="legal-list">
          <li>Product names</li>
          <li>Product descriptions</li>
          <li>Product photographs</li>
          <li>Quantity</li>
          <li>Weight</li>
          <li>Packaging details</li>
          <li>Ingredients</li>
          <li>Pricing</li>
          <li>Other relevant information</li>
        </ul>
        <p>However:</p>
        <ul className="legal-list">
          <li>Packaging may occasionally change</li>
          <li>Colours may differ slightly because of photography or screen settings</li>
          <li>Product imagery may be representational</li>
          <li>Availability may change</li>
          <li>Minor packaging variations may occur</li>
        </ul>
        <p>
          Customers should review the information printed on the physical product packaging before consumption.
        </p>
        <p>
          Customers with allergies, ingredient sensitivities, dietary restrictions or other specific concerns should carefully review product information before consuming the product.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Product Availability">
        <p>All products are subject to availability.</p>
        <p>Shams Chai may:</p>
        <ul className="legal-list">
          <li>Limit quantities</li>
          <li>Discontinue products</li>
          <li>Temporarily remove products</li>
          <li>Replace product images</li>
          <li>Update packaging</li>
          <li>Change available sizes</li>
        </ul>
        <p>without prior notice.</p>
      </LegalSection>

      <LegalSection number={5} title="Pricing">
        <p>
          All prices shown on the website are displayed in Indian Rupees unless stated otherwise.
        </p>
        <p>Prices may be changed at any time before an order is placed.</p>
        <p>Applicable:</p>
        <ul className="legal-list">
          <li>Taxes</li>
          <li>Delivery charges</li>
          <li>Discounts</li>
          <li>Promotional adjustments</li>
          <li>Other charges</li>
        </ul>
        <p>will be displayed during checkout where applicable.</p>
        <p>
          If an obvious pricing, typographical, technical or system error occurs, Shams Chai reserves the right to cancel the affected order.
        </p>
        <p>Where payment has already been collected, the relevant amount will be refunded.</p>
      </LegalSection>

      <LegalSection number={6} title="Orders">
        <p>
          Submitting an order does not automatically mean that the order has been finally accepted.
        </p>
        <p>Shams Chai may reject or cancel an order due to circumstances including:</p>
        <ul className="legal-list">
          <li>Product unavailability</li>
          <li>Incorrect pricing</li>
          <li>Payment failure</li>
          <li>Payment verification issues</li>
          <li>Suspected fraudulent activity</li>
          <li>Invalid delivery information</li>
          <li>Delivery limitations</li>
          <li>Technical issues</li>
          <li>Operational issues</li>
          <li>Quantity restrictions</li>
          <li>Circumstances beyond reasonable control</li>
        </ul>
        <p>
          If payment has already been received for a cancelled order, the applicable amount will be refunded.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Payment">
        <p>
          Payments may be processed using third-party payment gateways and payment-service providers.
        </p>
        <p>
          Customers agree to comply with any applicable terms imposed by such payment providers.
        </p>
        <p>Shams Chai does not directly operate or control external:</p>
        <ul className="legal-list">
          <li>Banks</li>
          <li>UPI networks</li>
          <li>Card networks</li>
          <li>Payment gateways</li>
          <li>Payment infrastructure</li>
        </ul>
        <p>
          Shams Chai is not responsible for failures or delays caused solely by such external systems, except where otherwise required by law.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Shipping and Delivery">
        <p>
          Shipping and delivery timelines displayed on the website are estimates unless expressly stated otherwise.
        </p>
        <p>Delivery may be affected by circumstances including:</p>
        <ul className="legal-list">
          <li>Courier delays</li>
          <li>Weather conditions</li>
          <li>Public holidays</li>
          <li>Government restrictions</li>
          <li>Transportation disruption</li>
          <li>Natural disasters</li>
          <li>Incorrect shipping information</li>
          <li>Remote delivery locations</li>
          <li>Events beyond reasonable control</li>
        </ul>
        <p>Customers are responsible for providing accurate shipping and contact information.</p>
        <p>Customers should inspect packages on delivery where reasonably possible.</p>
        <p>
          If a package appears damaged, opened or tampered with, customers should contact Shams Chai promptly.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Returns, Refunds and Cancellations">
        <p>
          All purchases are also subject to the Shams Chai{' '}
          <Link to="/return-refund-policy">Return, Refund &amp; Cancellation Policy</Link>.
        </p>
        <p>
          Because Shams Chai sells consumable food products, general returns or exchanges are not accepted merely because of:
        </p>
        <ul className="legal-list">
          <li>Change of mind</li>
          <li>Personal preference</li>
          <li>Dislike of flavour or aroma</li>
          <li>Ordering the wrong item by mistake</li>
        </ul>
        <p>However, genuine cases involving:</p>
        <ul className="legal-list">
          <li>Damaged products</li>
          <li>Defective products</li>
          <li>Incorrect products</li>
          <li>Missing products</li>
          <li>Tampered packaging</li>
          <li>Manufacturing issues</li>
          <li>Materially misdescribed products</li>
        </ul>
        <p>
          will be reviewed in accordance with the Return, Refund &amp; Cancellation Policy and applicable law.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Food and Health Information">
        <p>
          Content on the Shams Chai website relating to tea, ingredients, lifestyle, wellness or similar topics is provided for general informational purposes only.
        </p>
        <p>It should not be treated as:</p>
        <ul className="legal-list">
          <li>Medical advice</li>
          <li>Diagnosis</li>
          <li>Treatment</li>
          <li>Medical recommendation</li>
        </ul>
        <p>Customers with:</p>
        <ul className="legal-list">
          <li>Medical conditions</li>
          <li>Allergies</li>
          <li>Pregnancy-related concerns</li>
          <li>Medication interactions</li>
          <li>Dietary restrictions</li>
        </ul>
        <p>
          should obtain appropriate professional guidance where necessary before consuming products.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Intellectual Property">
        <p>
          Unless otherwise stated, all content available on the Shams Chai website is owned by, licensed to or authorised for use by Shams Chai.
        </p>
        <p>This includes:</p>
        <ul className="legal-list">
          <li>Brand names</li>
          <li>Logos</li>
          <li>Product names</li>
          <li>Packaging designs</li>
          <li>Product photographs</li>
          <li>Graphics</li>
          <li>Illustrations</li>
          <li>Website design</li>
          <li>Website content</li>
          <li>Videos</li>
          <li>Marketing materials</li>
          <li>Written content</li>
        </ul>
        <p>
          Users may not copy, reproduce, distribute, republish, modify, exploit or commercially use Shams Chai intellectual property without prior written permission.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Acceptable Use">
        <p>Users agree not to:</p>
        <ul className="legal-list">
          <li>Use the website for illegal activities</li>
          <li>Commit fraud</li>
          <li>Misrepresent their identity</li>
          <li>Provide false payment information</li>
          <li>Provide intentionally false delivery information</li>
          <li>Attempt unauthorised access to systems</li>
          <li>Interfere with website security</li>
          <li>Introduce viruses or malicious software</li>
          <li>Attempt to disrupt website functionality</li>
          <li>Abuse discounts or promotional offers</li>
          <li>Make knowingly fraudulent refund claims</li>
          <li>Make fraudulent chargebacks</li>
          <li>Scrape substantial portions of the website without permission</li>
          <li>Infringe intellectual-property rights</li>
        </ul>
        <p>
          Shams Chai may restrict access to the website where there is reasonable evidence of abuse, fraud or unlawful activity.
        </p>
      </LegalSection>

      <LegalSection number={13} title="Third-Party Services">
        <p>The website may rely on third-party services including:</p>
        <ul className="legal-list">
          <li>Payment gateways</li>
          <li>Delivery partners</li>
          <li>Analytics platforms</li>
          <li>Hosting providers</li>
          <li>Social-media services</li>
          <li>Cloud infrastructure</li>
          <li>Communication services</li>
        </ul>
        <p>These services may operate under their own terms and privacy policies.</p>
        <p>
          Shams Chai is not responsible for independent third-party services outside its reasonable control, subject to applicable law.
        </p>
      </LegalSection>

      <LegalSection number={14} title="Promotions and Discount Codes">
        <p>
          Promotions, offers, coupon codes, free products and discounts may be subject to additional terms.
        </p>
        <p>Unless explicitly stated otherwise:</p>
        <ul className="legal-list">
          <li>Offers cannot be combined</li>
          <li>Promotions may have expiry dates</li>
          <li>Promotions may apply only to selected products</li>
          <li>Promotions may have quantity limits</li>
          <li>Promotions may be restricted to selected customers</li>
          <li>Offers may be changed before an order is placed</li>
        </ul>
        <p>
          Shams Chai may cancel transactions involving fraudulent or abusive use of promotions.
        </p>
      </LegalSection>

      <LegalSection number={15} title="Reviews and Customer Content">
        <p>Customers may occasionally submit:</p>
        <ul className="legal-list">
          <li>Reviews</li>
          <li>Testimonials</li>
          <li>Photographs</li>
          <li>Comments</li>
          <li>Feedback</li>
          <li>Other content</li>
        </ul>
        <p>By submitting such content, customers confirm that:</p>
        <ul className="legal-list">
          <li>They have the right to submit it</li>
          <li>It is not unlawful</li>
          <li>It is not defamatory</li>
          <li>It is not intentionally misleading</li>
          <li>It does not infringe third-party rights</li>
          <li>It does not violate privacy rights</li>
        </ul>
        <p>
          Shams Chai may use customer content only where the customer has provided appropriate permission or where otherwise permitted by law.
        </p>
      </LegalSection>

      <LegalSection number={16} title="Website Availability">
        <p>Shams Chai does not guarantee that the website will always be:</p>
        <ul className="legal-list">
          <li>Available</li>
          <li>Error-free</li>
          <li>Uninterrupted</li>
          <li>Free from temporary technical issues</li>
        </ul>
        <p>The website may occasionally be unavailable due to:</p>
        <ul className="legal-list">
          <li>Maintenance</li>
          <li>Server issues</li>
          <li>Software updates</li>
          <li>Hosting failures</li>
          <li>Network disruptions</li>
          <li>Security incidents</li>
          <li>Third-party outages</li>
        </ul>
        <p>Shams Chai may modify, suspend or discontinue website features where reasonably necessary.</p>
      </LegalSection>

      <LegalSection number={17} title="Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, Shams Chai will not be liable for indirect, incidental, special or consequential losses caused by circumstances outside its reasonable control.
        </p>
        <p>Nothing in these Terms excludes or limits:</p>
        <ul className="legal-list">
          <li>Rights that cannot legally be excluded</li>
          <li>Consumer protections provided under applicable Indian law</li>
          <li>Liability that cannot legally be limited</li>
        </ul>
      </LegalSection>

      <LegalSection number={18} title="Indemnity">
        <p>
          To the extent permitted by law, users agree to be responsible for losses, damages or claims arising directly from:
        </p>
        <ul className="legal-list">
          <li>Illegal use of the website</li>
          <li>Fraudulent behaviour</li>
          <li>Infringement of third-party rights</li>
          <li>Material violation of these Terms</li>
          <li>Malicious activity directed at the website</li>
        </ul>
      </LegalSection>

      <LegalSection number={19} title="Force Majeure">
        <p>
          Shams Chai will not be responsible for delays or failures resulting from events beyond reasonable control.
        </p>
        <p>Such events may include:</p>
        <ul className="legal-list">
          <li>Natural disasters</li>
          <li>Severe weather</li>
          <li>Flooding</li>
          <li>Fire</li>
          <li>Strikes</li>
          <li>Transportation disruption</li>
          <li>Telecommunications failure</li>
          <li>Government action</li>
          <li>Epidemic or pandemic restrictions</li>
          <li>War</li>
          <li>Civil disturbance</li>
          <li>Major infrastructure failure</li>
          <li>Similar unavoidable events</li>
        </ul>
      </LegalSection>

      <LegalSection number={20} title="Privacy">
        <p>
          Use of the Shams Chai website is also subject to the Shams Chai Privacy Policy.
        </p>
        <p>
          Customers should review the Privacy Policy to understand how personal information may be collected, processed, stored and used.
        </p>
      </LegalSection>

      <LegalSection number={21} title="Changes to These Terms">
        <p>Shams Chai may update these Terms &amp; Conditions when necessary due to:</p>
        <ul className="legal-list">
          <li>Changes in business operations</li>
          <li>Changes in website functionality</li>
          <li>Changes in products</li>
          <li>Changes in services</li>
          <li>Legal requirements</li>
          <li>Regulatory requirements</li>
        </ul>
        <p>The updated version will be published on this page.</p>
        <p>The &ldquo;Last Updated&rdquo; date will also be revised.</p>
        <p>
          Unless otherwise required by law, changes will apply prospectively from the date they are published.
        </p>
      </LegalSection>

      <LegalSection number={22} title="Severability">
        <p>
          If any provision in these Terms is determined to be invalid, illegal or unenforceable, the remaining provisions will continue to remain effective to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection number={23} title="Governing Law">
        <p>
          These Terms &amp; Conditions are governed by the laws of India.
        </p>
        <p>
          Any dispute arising from the use of the website or transactions with Shams Chai will be handled in accordance with applicable Indian law.
        </p>
        <p>
          Subject to applicable consumer-protection rights and mandatory legal jurisdiction, disputes shall be subject to the jurisdiction of competent courts located in:{' '}
          <span className="legal-placeholder">{LEGAL_CONFIG.BUSINESS_CITY_STATE}</span>.
        </p>
      </LegalSection>

      <LegalSection number={24} title="Contact Us">
        <p>
          For questions, complaints, concerns or order-related assistance, customers may contact:
        </p>
        <LegalContactBox
          title="Shams Chai Official Contact"
          description="For questions, complaints, concerns or order-related assistance, customers may contact:"
          showBusinessAddress={true}
          showFssai={true}
        />
      </LegalSection>
    </LegalPageLayout>
  );
}

export default TermsAndConditions;
