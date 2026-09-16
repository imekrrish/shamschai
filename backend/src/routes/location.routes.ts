import { Router } from 'express';

const router = Router();
type Place = { city: string; state: string };
const cache = new Map<string, { expires: number; places: Place[] }>();

// Provider documentation: https://www.postalpincode.in/Api-Details
// Only the PIN is sent to the provider; no customer address or identity is shared.
router.get('/pincode/:pincode', async (req, res) => {
  const { pincode } = req.params;
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    res.status(400).json({ message: 'Enter a valid 6-digit Indian PIN code.' });
    return;
  }
  const cached = cache.get(pincode);
  if (cached && cached.expires > Date.now()) {
    res.json({ pincode, places: cached.places });
    return;
  }
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error('Provider unavailable');
    const data = await response.json() as unknown;
    const result = Array.isArray(data) ? data[0] : null;
    if (result?.Status === 'Error' && result.PostOffice == null) {
      res.status(404).json({ message: 'PIN code not found. Check it or enter your city and state manually.' });
      return;
    }
    if (result?.Status !== 'Success' || !Array.isArray(result.PostOffice)) throw new Error('Invalid provider response');
    const places: Place[] = [];
    for (const office of result.PostOffice) {
      if (office?.Pincode !== pincode || office.Country !== 'India' ||
        typeof office.District !== 'string' || typeof office.State !== 'string') continue;
      const city = office.District.trim();
      const state = office.State.trim();
      if (city && state && !places.some(place => place.city === city && place.state === state)) places.push({ city, state });
    }
    if (!places.length) throw new Error('No usable location');
    if (cache.size >= 500) cache.delete(cache.keys().next().value!);
    cache.set(pincode, { expires: Date.now() + 24 * 60 * 60 * 1000, places });
    res.json({ pincode, places });
  } catch {
    res.status(503).json({ message: 'PIN lookup is unavailable. Please enter your city and state manually.' });
  }
});

export default router;
