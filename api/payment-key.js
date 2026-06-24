const { CLOVER_BASE, API_TOKEN, cors } = require('./_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pakmsRes = await fetch(`${CLOVER_BASE}/pakms/apikey`, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` },
    });

    if (!pakmsRes.ok) {
      const text = await pakmsRes.text();
      throw new Error(`PAKMS ${pakmsRes.status}: ${text}`);
    }

    const data = await pakmsRes.json();
    return res.status(200).json({ apiAccessKey: data.apiAccessKey });
  } catch (err) {
    console.error('PAKMS error:', err.message);
    return res.status(500).json({ error: 'Failed to get payment key' });
  }
};
