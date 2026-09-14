# Running and deploying Sham’s Chai

## Development

```sh
npm ci
npm run dev
```

This is a React/Vite SPA. WhatsApp checkout runs entirely in the browser; no backend or online payment gateway is required. Delivery details are used to prepare the WhatsApp message and are not stored by this application.

## Checks

```sh
npx playwright install chromium
npm test
npm run build
```

Browser checks cover the routes at 375, 390, 430, 768, 1024 and 1440 px, the original packaging gallery, size/quantity transfer, checkout validation, the encoded WhatsApp message, mobile keyboard navigation and reduced motion. Tests intercept the outgoing WhatsApp URL; they do not send any messages.

`node scripts/capture-preview.mjs` saves local desktop/mobile captures in the ignored `qa/` directory while the dev server is running.

## Production

`npm run build` creates `dist/`. Vercel remains configured for Vite with the existing SPA rewrite, so direct requests such as `/products/masala-chai` and `/journal/chai-in-the-rain` work.

Fonts are bundled locally, and lifestyle photographs use optimized WebP copies. Packaging remains lossless.

## Content configuration

- Product sizes, ingredients and brewing instructions: `src/data/products.ts`.
- Existing WhatsApp number and order helpers: `src/utils/whatsapp.ts`.
- Email enquiries/launch list: existing `support@shamschai.com` mailto flow.
- Design tokens and responsive styles: `src/styles.css`.
- Route metadata: `src/components/Seo.tsx`; default sharing metadata: `index.html`.

Prices remain confirmed by the team on WhatsApp. The source data uses zero as an unavailable-price sentinel; the UI does not present it as a free product. No marketplace listings are implied.

The SPA updates metadata after client navigation; `index.html` supplies the default tags for crawlers that do not run JavaScript. No fake offers or review schema are included.

A deployment has not been performed as part of the local redesign.
