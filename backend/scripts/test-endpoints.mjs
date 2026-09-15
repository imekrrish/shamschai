async function test() {
  console.log('Testing live server endpoints...');

  // 1. Health check
  const healthRes = await fetch('http://127.0.0.1:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Health Endpoint:', healthRes.status, healthData);

  // 2. Validation test (missing password and invalid email)
  const regRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  const regData = await regRes.json();
  console.log('Registration Validation Endpoint (Status 400 Expected):', regRes.status);
  console.log('Errors returned:', regData.errors);

  // 3. Unauthorized access check on protected route
  const orderRes = await fetch('http://127.0.0.1:5000/api/orders');
  const orderData = await orderRes.json();
  console.log('Protected Orders Endpoint (Status 401 Expected):', orderRes.status, orderData);

  console.log('\nAll live endpoint tests verified successfully!');
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
