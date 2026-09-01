# Deploying Shams Chai

## Local development

```bash
npm install
npm run dev
```

Vite prints the local preview URL. The frontend requires no backend; cart state is stored in the browser's `localStorage`.

## Production build

```bash
npm run build
```

The deployable output is generated in `dist/`.

## Vercel

1. Import this repository into Vercel.
2. Select the Vite framework preset if it is not detected automatically.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Deploy.

The included `vercel.json` sends direct requests such as `/products/masala`, `/founder`, and `/journal/chai-in-the-rain` to the React SPA so refreshed deep links do not return 404.

No environment variables are currently required. Before a real launch, connect the checkout, account, contact/newsletter and commerce services, then document their environment variables in Vercel.
