// Usage: node backend/scripts/update-pack-prices.cjs <local|railway> [--apply]
// Only the published masala chai variants change; existing orders retain their prices.
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client } = require('../../admin/node_modules/pg');
const target = process.argv[2];
if (!['local', 'railway'].includes(target)) throw new Error('Choose local or railway');
const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env')));
const connectionString = env[target === 'local' ? 'DATABASE_URL_LOCAL' : 'DATABASE_URL_RAILWAY'];
if (!connectionString) throw new Error('Database target is not configured');
const client = new Client({ connectionString, connectionTimeoutMillis: 15000,
  ssl: target === 'railway' ? { rejectUnauthorized: false } : false });
const grams = weight => String(weight).toLowerCase().replace(/\s/g, '').replace(/^(\d+(?:\.\d+)?)kg$/, (_, kg) => `${Number(kg) * 1000}g`);
async function main() {
  await client.connect();
  await client.query('BEGIN');
  try {
    const { rows } = await client.query('SELECT id, slug, variants FROM products WHERE slug = $1 FOR UPDATE', ['recipe-01']);
    if (rows.length !== 1) throw new Error('Expected exactly one recipe-01 product');
    const product = rows[0];
    const variants = product.variants;
    if (!Array.isArray(variants)) throw new Error('Invalid variants');
    const updated = variants.map(v => {
      const price = { '500g': 449, '1000g': 860, '2000g': 1599 }[grams(v.weight)];
      return price ? { ...v, price } : v;
    });
    for (const [weight, key, price, sku] of [
      ['500 g', '500g', 449, 'SH-RECIPE-01-500'],
      ['1 kg', '1000g', 860, 'SH-RECIPE-01-1000'],
      ['2 kg', '2000g', 1599, 'SH-RECIPE-01-2000'],
    ]) {
      const matches = updated.filter(v => grams(v.weight) === key);
      if (matches.length > 1) throw new Error(`Duplicate pack: ${key}`);
      if (!matches.length) updated.push({ weight, price, sku, stock: true });
    }
    console.log(JSON.stringify({ target, slug: product.slug, before: variants, after: updated }, null, 2));
    if (process.argv.includes('--apply')) {
      await client.query('UPDATE products SET variants = $1::jsonb, "updatedAt" = NOW() WHERE id = $2', [JSON.stringify(updated), product.id]);
      const saved = await client.query('SELECT variants FROM products WHERE id = $1', [product.id]);
      if (JSON.stringify(saved.rows[0].variants) !== JSON.stringify(updated)) {
        for (const expected of updated) {
          if (!saved.rows[0].variants.some(v => v.sku === expected.sku && v.price === expected.price && v.weight === expected.weight)) throw new Error('Verification failed');
        }
      }
      await client.query('COMMIT');
      console.log(`${target}: saved and verified`);
    } else {
      await client.query('ROLLBACK');
      console.log('Preview only; pass --apply to save');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
