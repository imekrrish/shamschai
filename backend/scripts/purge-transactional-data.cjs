/**
 * Empties a database of transactional data, keeping only what the business
 * needs to operate: the ADMIN user and the product catalogue.
 *
 * Removed: payments, order_items, orders, addresses, and every non-ADMIN user.
 * Kept:    users WHERE role = 'ADMIN', products.
 *
 *   node backend/scripts/purge-transactional-data.cjs <local|railway|all>
 *   node backend/scripts/purge-transactional-data.cjs railway --apply
 *
 * Without --apply it prints the counts and changes nothing. A JSON snapshot is
 * written before any delete; keep it somewhere private, as it contains customer
 * names, emails, phone numbers and addresses. Do not commit it.
 */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

// The backend talks to Postgres through Prisma, so `pg` lives in the admin app.
function loadPg() {
  for (const from of [__filename, path.join(__dirname, '..', '..', 'admin', 'package.json')]) {
    try { return createRequire(from)('pg'); } catch { /* try the next location */ }
  }
  throw new Error('Could not resolve the "pg" driver.');
}
const { Client } = loadPg();

const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/);
const readEnv = key => {
  const line = env.find(l => l.startsWith(key + '='));
  return line ? line.slice(key.length + 1).trim().replace(/^"/, '').replace(/"$/, '') : null;
};

const TARGETS = {
  local: { url: readEnv('DATABASE_URL_LOCAL'), ssl: false },
  railway: { url: readEnv('DATABASE_URL_RAILWAY'), ssl: { rejectUnauthorized: false } },
};

async function run(name, apply) {
  const target = TARGETS[name];
  if (!target || !target.url) throw new Error(`No connection string for "${name}"`);

  const client = new Client({ connectionString: target.url, ssl: target.ssl, connectionTimeoutMillis: 15000 });
  await client.connect();
  console.log(`\n== ${name.toUpperCase()} ==`);

  try {
    const count = async table => (await client.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n;
    const before = {
      users: await count('users'), addresses: await count('addresses'), orders: await count('orders'),
      order_items: await count('order_items'), payments: await count('payments'), products: await count('products'),
    };
    console.log('before:', Object.entries(before).map(([k, v]) => `${k}=${v}`).join(' '));

    if (!apply) {
      console.log('would keep: ADMIN users and products; would delete everything else');
      console.log('dry run — pass --apply to write');
      return;
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, '..', `purge-snapshot-${name}-${stamp}.json`);
    const snapshot = {};
    for (const table of ['users', 'addresses', 'orders', 'order_items', 'payments', 'products']) {
      snapshot[table] = (await client.query(`SELECT * FROM ${table}`)).rows;
    }
    fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2));
    console.log('snapshot written to', backupFile);
    console.log('  (contains customer personal data — keep it private, do not commit)');

    await client.query('BEGIN');
    try {
      await client.query('DELETE FROM payments');
      await client.query('DELETE FROM order_items');
      await client.query('DELETE FROM orders');
      await client.query('DELETE FROM addresses');
      await client.query(`DELETE FROM users WHERE role <> 'ADMIN'`);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    const remaining = (await client.query('SELECT email, role FROM users ORDER BY email')).rows;
    console.log('after: ', `users=${await count('users')} orders=${await count('orders')} payments=${await count('payments')} products=${await count('products')}`);
    console.log('kept users:', remaining.map(u => `${u.email} (${u.role})`).join(', ') || '(none — set ADMIN_PASSWORD and sign in to create one)');
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
