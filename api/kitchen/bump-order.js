const { cloverFetch, cors } = require('../_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

  try {
    // Mark all line items as printed
    const order = await cloverFetch(`/orders/${orderId}?expand=lineItems`);
    const items = order.lineItems?.elements || [];

    await Promise.all(
      items.filter(li => !li.printed).map(li =>
        cloverFetch(`/orders/${orderId}/line_items/${li.id}`, {
          method: 'POST',
          body: JSON.stringify({ printed: true }),
        })
      )
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Bump order error:', err.message);
    return res.status(500).json({ error: 'Failed to bump order' });
  }
};
