const { cloverFetch, cors } = require('../_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, lineItemId, printed } = req.body || {};
  if (!orderId || !lineItemId) {
    return res.status(400).json({ error: 'Missing orderId or lineItemId' });
  }

  try {
    await cloverFetch(`/orders/${orderId}/line_items/${lineItemId}`, {
      method: 'POST',
      body: JSON.stringify({ printed: printed !== false }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mark item error:', err.message);
    return res.status(500).json({ error: 'Failed to update item' });
  }
};
