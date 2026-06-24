const { cloverFetch, cors } = require('../_lib/clover');
const { isValidTable } = require('../_lib/tables');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { table, orderId } = req.body || {};
  if (!isValidTable(table)) return res.status(400).json({ error: 'Invalid table' });
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

  try {
    await cloverFetch(`/orders/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ state: 'locked' }),
    });

    return res.status(200).json({ success: true, table });
  } catch (err) {
    console.error('Close table error:', err.message);
    return res.status(500).json({ error: 'Failed to close table' });
  }
};
