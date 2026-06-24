module.exports = async function handler(req, res) {
  const MID = process.env.CLOVER_MERCHANT_ID || '';
  const TOKEN = process.env.CLOVER_API_TOKEN || '';
  const ENV = process.env.CLOVER_ENV || '';

  const base = ENV === 'sandbox'
    ? 'https://sandbox.dev.clover.com'
    : 'https://api.clover.com';

  const info = {
    env: ENV,
    base,
    merchantId: MID,
    tokenFirst8: TOKEN.substring(0, 8) + '...',
    tokenLength: TOKEN.length,
  };

  // Test 1: Bearer header auth
  const url1 = `${base}/v3/merchants/${MID}/categories?limit=1`;
  let test1;
  try {
    const r = await fetch(url1, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    test1 = { status: r.status, body: await r.text() };
  } catch (e) {
    test1 = { error: e.message };
  }

  // Test 2: access_token query param
  const url2 = `${base}/v3/merchants/${MID}/categories?limit=1&access_token=${TOKEN}`;
  let test2;
  try {
    const r = await fetch(url2);
    test2 = { status: r.status, body: await r.text() };
  } catch (e) {
    test2 = { error: e.message };
  }

  // Test 3: Try merchant endpoint
  const url3 = `${base}/v3/merchants/${MID}?access_token=${TOKEN}`;
  let test3;
  try {
    const r = await fetch(url3);
    test3 = { status: r.status, body: await r.text() };
  } catch (e) {
    test3 = { error: e.message };
  }

  return res.status(200).json({
    config: info,
    bearerAuth: test1,
    queryAuth: test2,
    merchantTest: test3,
  });
};
