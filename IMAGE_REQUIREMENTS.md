# Sham’s Chai image assets

## Original packaging

The user’s supplied front/back image is preserved at `public/assets/shams/products/original-sachets.png`.

- `sachet-front.png`: left panel, x=0, y=230, width=505, height=1080.
- `sachet-back.png`: right panel, x=514, y=230, width=509, height=1080.

These are lossless rectangular crops of the original. The central divider and excess background are removed; lettering, artwork, colours and sachet pixels are unchanged. Both decoded crops were verified against the corresponding original pixels.

The front is used in the hero, shop, product page and gifting enquiry. The homepage also shows the back; the product gallery provides front/back controls and full-size links. The photograph shows a 500 g sachet. Existing ordering variants remain 200 g, 500 g and 1000 g; no alternate size artwork has been fabricated.

Run `npm run images:prepare` to reproduce the crops and optimized photographs.

## Lifestyle images

Existing photographs without invented packaging are reused. WebP derivatives live in `public/assets/shams/optimized/`; original assets remain intact. The live application no longer references the previous generated packaging compositions.

## Founder

The repository confirms the name **Sharmila Krishna**, but contains no real founder photograph. The design uses a brand wordmark panel and the existing short brand story. Replace the panel with a real, approved portrait when supplied. Do not create a synthetic founder portrait or attributed quotations.
