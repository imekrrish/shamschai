/**
 * Collapses the catalogue to the one product that actually exists: Sham's
 * Masala Chai. Deletes recipe-02/03/04 and rewrites recipe-01 so every field
 * matches the printed sachet. Orders are untouched — order_items carry their
 * own title/size/price snapshot and have no foreign key to products.
 *
 *   node backend/scripts/single-product-migration.cjs <local|railway> [--apply]
 *
 * Without --apply it prints the plan and changes nothing.
 */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

// The backend talks to Postgres through Prisma, so `pg` lives in the admin app.
function loadPg() {
  for (const from of [__filename, path.join(__dirname, '..', '..', 'admin', 'package.json')]) {
    try { return createRequire(from)('pg'); } catch { /* try the next location */ }
  }
  throw new Error('Could not resolve the "pg" driver. Run this from a workspace where it is installed.');
}
const { Client } = loadPg();

const envPath = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
const readEnv = key => {
  const line = env.find(l => l.startsWith(key + '='));
  return line ? line.slice(key.length + 1).trim().replace(/^"/, '').replace(/"$/, '') : null;
};

const TARGETS = {
  local: { url: readEnv('DATABASE_URL_LOCAL'), ssl: false },
  railway: { url: readEnv('DATABASE_URL_RAILWAY'), ssl: { rejectUnauthorized: false } },
};

const KEEP = 'recipe-01';
const REMOVE = ['recipe-02', 'recipe-03', 'recipe-04'];

/** Every value below is printed on the sachet, front or back. */
const PACK = {
  name: "Sham's Masala Chai",
  recipeNumber: 'RECIPE 01',
  code: '001',
  variantNameSlot: 'Masala Chai',
  subtitle: "It's a modern woman's recipe",
  description:
    'Aromatic black tea leaves blended with handpicked spices for a bold, warming cup of masala chai.',
  cup: 'Aromatic black tea leaves blended with handpicked spices for a bold, warming cup of masala chai.',
  category: 'The Collection',
  ingredients: ['Black Tea Leaves', 'Clove', 'Cinnamon', 'Cardamom', 'Nutmeg', 'Black Pepper'],
  brewInstructions: [
    'Boil 150 ml water.',
    'Add 1 tsp Masala Chai.',
    'Add sugar to taste.',
    'Add milk as desired.',
    'Simmer 3–5 minutes.',
    'Strain & enjoy hot.',
  ],
  flavourNotes: ['BLACK TEA', 'CARDAMOM', 'BLACK PEPPER'],
  /** Current selling prices approved for the published pack sizes. */
  variants: [
    { weight: '500 g', price: 449, sku: 'SH-RECIPE-01-500', stock: true },
    { weight: '1 kg', price: 860, sku: 'SH-RECIPE-01-1000', stock: true },
    { weight: '2 kg', price: 1599, sku: 'SH-RECIPE-01-2000', stock: true },
  ],
};

async function run(targetName, apply) {
  const target = TARGETS[targetName];
  if (!target || !target.url) throw new Error(`No connection string for "${targetName}"`);

  const client = new Client({ connectionString: target.url, ssl: target.ssl, connectionTimeoutMillis: 15000 });
  await client.connect();
  console.log(`\n== ${targetName.toUpperCase()} ==`);

  try {
    const before = (await client.query('SELECT slug, name, variants FROM products ORDER BY "createdAt" ASC')).rows;
    console.log('before:', before.map(r => r.slug).join(', ') || '(empty)');

    if (!apply) {
      console.log(`would delete: ${REMOVE.join(', ')}`);
      console.log(`would rewrite ${KEEP} to: ${PACK.name} / ${PACK.variants.map(v => `${v.weight} ₹${v.price}`).join(' · ')}`);
      return;
    }

    await client.query('BEGIN');

    const deleted = await client.query('DELETE FROM products WHERE slug = ANY($1) OR id = ANY($1) RETURNING slug', [REMOVE]);
    console.log('deleted:', deleted.rows.map(r => r.slug).join(', ') || '(none)');

    const updated = await client.query(
      `UPDATE products SET
         name = $2, "recipeNumber" = $3, code = $4, "variantNameSlot" = $5,
         subtitle = $6, description = $7, cup = $8, category = $9,
         ingredients = $10::jsonb, "brewInstructions" = $11::jsonb,
         "flavourNotes" = $12::jsonb, variants = $13::jsonb,
         stock = true, featured = true, "updatedAt" = NOW()
       WHERE slug = $1 OR id = $1
       RETURNING slug, name, variants`,
      [
        KEEP, PACK.name, PACK.recipeNumber, PACK.code, PACK.variantNameSlot,
        PACK.subtitle, PACK.description, PACK.cup, PACK.category,
        JSON.stringify(PACK.ingredients), JSON.stringify(PACK.brewInstructions),
        JSON.stringify(PACK.flavourNotes), JSON.stringify(PACK.variants),
      ]
    );

    if (updated.rowCount !== 1) {
      await client.query('ROLLBACK');
      throw new Error(`Expected to update exactly 1 row for ${KEEP}, updated ${updated.rowCount}. Rolled back.`);
    }

    await client.query('COMMIT');

    const after = (await client.query('SELECT slug, name, variants FROM products')).rows;
    console.log('after: ', after.map(r => `${r.slug} (${r.name}) ${JSON.stringify(r.variants)}`).join('\n        '));
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

const [targetArg, ...flags] = process.argv.slice(2);
const apply = flags.includes('--apply');
const targets = targetArg === 'all' ? ['local', 'railway'] : [targetArg];

(async () => {
  for (const t of targets) await run(t, apply);
  console.log(apply ? '\nApplied.' : '\nDry run only — pass --apply to write.');
})().catch(error => {
  console.error('FAILED:', error.message);
  process.exit(1);
});
