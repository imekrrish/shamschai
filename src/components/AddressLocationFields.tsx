import { useEffect, useId, useRef, useState } from 'react';
import { API_BASE_URL } from '../utils/api';

type Location = { postalCode: string; city: string; state: string };
type Place = { city: string; state: string };

/** Shared by checkout and the account address book. District is a city fallback. */
export default function AddressLocationFields({ value, onChange }: {
  value: Location;
  onChange: (patch: Partial<Location>) => void;
}) {
  const id = useId();
  const [lookupPin, setLookupPin] = useState('');
  const [message, setMessage] = useState('Enter your PIN code to fill city/district and state.');
  const [places, setPlaces] = useState<Place[]>([]);
  const edited = useRef({ city: false, state: false });
  const change = useRef(onChange);
  change.current = onChange;

  useEffect(() => {
    if (!/^[1-9][0-9]{5}$/.test(lookupPin) || lookupPin !== value.postalCode) return;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 9000);
    const debounce = setTimeout(async () => {
      setMessage('Finding your city/district and state…');
      try {
        const response = await fetch(`${API_BASE_URL}/locations/pincode/${lookupPin}`, { signal: controller.signal });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) throw new Error(response.status === 404
          ? 'PIN code not found. Check it or enter city/district and state manually.'
          : 'PIN lookup is unavailable. Enter city/district and state manually.');
        if (data.pincode !== lookupPin || !Array.isArray(data.places) || !data.places.length ||
          !data.places.every((p: Place) => typeof p.city === 'string' && typeof p.state === 'string')) throw new Error('Invalid lookup');
        const found: Place[] = data.places;
        setPlaces(found);
        const cities = [...new Set(found.map(p => p.city))];
        const states = [...new Set(found.map(p => p.state))];
        change.current({
          ...(!edited.current.city && cities.length === 1 ? { city: cities[0] } : {}),
          ...(!edited.current.state && states.length === 1 ? { state: states[0] } : {}),
        });
        setMessage(cities.length === 1 && states.length === 1
          ? 'Location found. Check your city/district and state; you can edit both.'
          : 'This PIN covers multiple locations. Choose or enter your city/district and state.');
      } catch (error) {
        if (active) setMessage(error instanceof Error && error.message.startsWith('PIN ')
          ? error.message : 'PIN lookup is unavailable. Enter city/district and state manually.');
      } finally { clearTimeout(timeout); }
    }, 350);
    return () => { active = false; clearTimeout(timeout); clearTimeout(debounce); controller.abort(); };
  }, [lookupPin, value.postalCode]);

  return <>
    <label>
      PIN CODE
      <input name="pincode" autoComplete="postal-code" inputMode="numeric" required
        pattern="[1-9][0-9]{5}" maxLength={6} placeholder="6 digits" value={value.postalCode}
        aria-describedby={`${id}-status`}
        onChange={event => {
          const postalCode = event.target.value.replace(/\D/g, '').slice(0, 6);
          edited.current = { city: false, state: false };
          setPlaces([]);
          setLookupPin(postalCode);
          setMessage(postalCode.length === 6 && postalCode[0] !== '0'
            ? 'Finding your city/district and state…' : 'Enter a valid 6-digit Indian PIN code, or fill the location manually.');
          change.current({ postalCode, city: '', state: '' });
        }} />
    </label>
    <label>
      CITY / DISTRICT
      <input name="city" autoComplete="address-level2" required value={value.city} list={`${id}-cities`}
        onChange={event => { edited.current.city = true; onChange({ city: event.target.value }); }} />
      <datalist id={`${id}-cities`}>{[...new Set(places.map(p => p.city))].map(city => <option key={city} value={city} />)}</datalist>
    </label>
    <label>
      STATE
      <input name="state" autoComplete="address-level1" required value={value.state} list={`${id}-states`}
        onChange={event => { edited.current.state = true; onChange({ state: event.target.value }); }} />
      <datalist id={`${id}-states`}>{[...new Set(places.map(p => p.state))].map(state => <option key={state} value={state} />)}</datalist>
    </label>
    <p className="address-location-status" id={`${id}-status`} role="status" aria-live="polite">{message}</p>
  </>;
}
