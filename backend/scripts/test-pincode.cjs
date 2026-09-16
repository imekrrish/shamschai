// Run from backend: node -r ts-node/register scripts/test-pincode.cjs
const assert = require('node:assert/strict');
const express = require('express');
const router = require('../src/routes/location.routes').default;
const realFetch = global.fetch;
const app = express();
app.use('/locations', router);
const office = (pincode, District, State) => ({ Pincode: pincode, District, State, Country: 'India' });
async function main() {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/locations/pincode/`;
  let calls = 0;
  global.fetch = async providerUrl => {
    calls++;
    const pin = providerUrl.split('/').pop();
    if (pin === '999999') return Response.json([{ Status: 'Error', PostOffice: null }]);
    if (pin === '400001') throw new Error('timeout');
    if (pin === '600001') return Response.json([{ Status: 'Success', PostOffice: [office('123456', 'Wrong', 'Wrong')] }]);
    return Response.json([{ Status: 'Success', PostOffice: [office(pin, 'Hyderabad', 'Telangana'), office(pin, 'Hyderabad', 'Telangana')] }]);
  };
  try {
    assert.equal((await realFetch(url + '123')).status, 400);
    assert.equal((await realFetch(url + '012345')).status, 400);
    assert.equal(calls, 0);
    assert.deepEqual(await (await realFetch(url + '500001')).json(), { pincode: '500001', places: [{ city: 'Hyderabad', state: 'Telangana' }] });
    assert.equal((await realFetch(url + '500001')).status, 200);
    assert.equal(calls, 1, 'Successful lookup is cached and duplicate districts are removed');
    assert.equal((await realFetch(url + '999999')).status, 404);
    assert.equal((await realFetch(url + '400001')).status, 503);
    assert.equal((await realFetch(url + '600001')).status, 503);
    console.log('PIN route: validation, provider mapping, deduplication, cache, not-found, timeout and mismatched PIN checks passed.');
  } finally { global.fetch = realFetch; await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
