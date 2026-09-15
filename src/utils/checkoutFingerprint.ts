export async function checkoutFingerprint(items: { title: string; size: string; unitPrice: number; quantity: number }[], delivery: { recipientName: string; phone: string; streetAddress: string; landmark?: string | null; city: string; state: string; postalCode: string; country?: string }, notes = '') {
  const address = { recipientName: delivery.recipientName, phone: delivery.phone, streetAddress: delivery.streetAddress, landmark: delivery.landmark || null, city: delivery.city, state: delivery.state, postalCode: delivery.postalCode, country: delivery.country || 'India' };
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ items, address, notes })));
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
}
