const CLOVER_BASE = process.env.CLOVER_ENV === 'sandbox'
  ? 'https://sandbox.dev.clover.com'
  : 'https://api.clover.com';

const CLOVER_ECOM_BASE = process.env.CLOVER_ENV === 'sandbox'
  ? 'https://scl-sandbox.dev.clover.com'
  : 'https://scl.clover.com';

const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const API_TOKEN = process.env.CLOVER_API_TOKEN;

async function cloverFetch(path, options = {}) {
  if (!MERCHANT_ID || !API_TOKEN) {
    throw new Error(`Missing config: MID=${!!MERCHANT_ID} TOKEN=${!!API_TOKEN}`);
  }
  const sep = path.includes('?') ? '&' : '?';
  const url = `${CLOVER_BASE}/v3/merchants/${MERCHANT_ID}${path}${sep}access_token=${API_TOKEN}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Clover ${res.status}: ${text}`);
  }
  return res.json();
}

async function cloverEcomFetch(path, options = {}) {
  const url = `${CLOVER_ECOM_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Clover eCom ${res.status}: ${text}`);
  }
  return res.json();
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { cloverFetch, cloverEcomFetch, CLOVER_BASE, API_TOKEN, MERCHANT_ID, cors };
