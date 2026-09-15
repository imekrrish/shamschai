import { LegalPageLayout, LegalSection, LegalContactBox } from '../components/LegalPageLayout';
import { LEGAL_CONFIG } from '../data/legalConstants';

export function ReturnRefundPolicy() {
  return (
    <LegalPageLayout
      title="Return, Refund &amp; Cancellation Policy"
      lastUpdated={LEGAL_CONFIG.LAST_UPDATED}
      intro={
        <>
          <p className="legal-lead">
            At Shams Chai, we take great care in preparing, packing and delivering our products so that they reach our customers in excellent condition.
          </p>
          <p>
            Because our products are consumable food products, we currently do not accept general returns or exchanges once an order has been delivered.
          </p>
          <p>
            However, if there is a genuine problem with an order, customers may contact us and we will review the issue and provide an appropriate resolution where applicable.
          </p>
        </>
      }
    >
      <LegalSection number={1} title="No Returns for Change of Mind">
        <p>Shams Chai currently does not accept returns or exchanges for reasons including:</p>
        <ul className="legal-list">
          <li>Change of mind after placing or receiving an order</li>
          <li>Dislike of taste, aroma, strength or personal preference</li>
          <li>Ordering the incorrect product, quantity or variant by mistake</li>
          <li>Product no longer being required</li>
          <li>Products that have been opened, consumed, used or tampered with after delivery</li>
        </ul>
        <p>
          Because tea and related products are consumable food items, returned products generally cannot be resold due to hygiene, food safety and quality-control requirements.
        </p>
        <p>
          Nothing in this policy limits any rights available to customers under applicable consumer-protection laws.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Damaged, Defective, Incorrect or Tampered Orders">
        <p>Customers should contact Shams Chai if:</p>
        <ul className="legal-list">
          <li>The wrong product was delivered</li>
          <li>A product or its packaging arrives damaged</li>
          <li>The package appears opened, leaking or tampered with</li>
          <li>An item from the order is missing</li>
          <li>An incorrect quantity was delivered</li>
          <li>The product has a genuine manufacturing or quality issue</li>
          <li>The product received is materially different from what was described on the website</li>
        </ul>
        <p>
          Customers should contact us as soon as reasonably possible after receiving the order.
        </p>
        <p>For quicker resolution, customers should provide:</p>
        <ul className="legal-list">
          <li>Order number</li>
          <li>Name used while placing the order</li>
          <li>Registered phone number or email address</li>
          <li>A clear description of the issue</li>
          <li>Photographs or videos of the affected product</li>
          <li>Photographs of the outer packaging</li>
          <li>Photograph of the shipping label, where applicable</li>
        </ul>
        <p>
          Customers may be requested to retain the product and original packaging until the complaint has been reviewed.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Resolution of Eligible Issues">
        <p>
          After receiving a complaint, Shams Chai will review the information provided.
        </p>
        <p>
          Depending on the circumstances, available evidence and applicable law, an eligible issue may be resolved through one of the following:
        </p>
        <ul className="legal-list">
          <li>Replacement of the affected product</li>
          <li>Re-shipment of a missing or incorrect product</li>
          <li>Store credit where mutually agreed</li>
          <li>Partial refund</li>
          <li>Full refund</li>
        </ul>
        <p>
          The resolution offered will depend on the nature of the issue.
        </p>
        <p>
          Submitting a complaint does not automatically guarantee a refund.
        </p>
        <p>
          Each request will be reviewed individually.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Refund Processing">
        <p>
          Where a refund is approved, it will generally be issued to the original payment method used while placing the order.
        </p>
        <p>
          Once Shams Chai initiates a refund, the time taken for the refund to appear in the customer&apos;s account may depend on:
        </p>
        <ul className="legal-list">
          <li>Bank processing time</li>
          <li>Card issuer</li>
          <li>UPI provider</li>
          <li>Payment gateway</li>
          <li>Other payment service providers</li>
        </ul>
        <p>
          Shams Chai is not responsible for delays caused solely by banks, payment gateways or other payment-service infrastructure after the refund has been successfully initiated.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Order Cancellation">
        <p>
          Customers who wish to cancel an order should contact Shams Chai as soon as possible.
        </p>
        <p>
          An order may be cancelled only if it has not yet been processed, packed or handed over for shipping.
        </p>
        <p>
          Once an order has been processed or dispatched, cancellation may no longer be possible.
        </p>
        <p>
          Shams Chai may also cancel an order due to circumstances such as:
        </p>
        <ul className="legal-list">
          <li>Product unavailability</li>
          <li>Payment verification problems</li>
          <li>Delivery restrictions</li>
          <li>Incorrect pricing</li>
          <li>Technical errors</li>
          <li>Suspected fraudulent activity</li>
          <li>Operational issues</li>
          <li>Circumstances beyond reasonable control</li>
        </ul>
        <p>
          If Shams Chai cancels an order after payment has already been received, the applicable amount will be refunded.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Refused or Undeliverable Orders">
        <p>
          Customers are responsible for providing accurate and complete shipping information.
        </p>
        <p>
          An order may become undeliverable due to:
        </p>
        <ul className="legal-list">
          <li>Incorrect address</li>
          <li>Incomplete address</li>
          <li>Incorrect phone number</li>
          <li>Customer being unavailable</li>
          <li>Multiple unsuccessful delivery attempts</li>
          <li>Refusal to accept delivery without a valid reason</li>
        </ul>
        <p>
          If an order is returned to Shams Chai because of such circumstances, any decision regarding re-shipment or refund will be evaluated on a case-by-case basis.
        </p>
        <p>
          Reasonable delivery, return-shipping or handling costs may be deducted where permitted by law.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Food Safety or Product Quality Concerns">
        <p>
          If a customer believes a product may have a genuine food-safety, contamination, manufacturing or quality issue, the product should not be consumed.
        </p>
        <p>
          Customers should retain:
        </p>
        <ul className="legal-list">
          <li>The affected product</li>
          <li>Product packaging</li>
          <li>Batch information</li>
          <li>Manufacturing or packing details</li>
          <li>Photographs or videos</li>
          <li>Order information</li>
        </ul>
        <p>
          Shams Chai may request additional information so the issue can be reviewed properly.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Contact Us">
        <p>
          For any order-related issue, complaint or refund request, please contact:
        </p>
        <LegalContactBox
          title="Shams Chai Customer Support"
          description="For any order-related issue, complaint or refund request, please contact us:"
          note="Customers should include their order number when contacting us regarding an order. Shams Chai will make reasonable efforts to review genuine customer concerns and provide an appropriate resolution in accordance with this policy and applicable Indian law."
        />
      </LegalSection>
    </LegalPageLayout>
  );
}

export default ReturnRefundPolicy;
