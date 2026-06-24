const { cors } = require('./_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const publicKey = process.env.CLOVER_ECOM_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: 'eCommerce public key not configured' });
  }

  return res.status(200).json({ apiAccessKey: publicKey });
};
