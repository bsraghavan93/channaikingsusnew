const { cloverFetch, cors } = require('./_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

  try {
    const order = await cloverFetch(`/orders/${orderId}?expand=lineItems`);
    const lineItems = order.lineItems?.elements || [];
    const calcTotal = lineItems.reduce((sum, li) => sum + (li.price || 0), 0);

    return res.status(200).json({
      orderId: order.id,
      state: order.state,
      total: calcTotal,
      note: order.note || '',
      title: order.title || '',
      lineItems: (order.lineItems?.elements || []).map(li => ({
        id: li.id,
        name: li.name,
        price: li.price || 0,
        unitQty: li.unitQty ? li.unitQty / 1000 : 1,
        note: li.note || '',
      })),
      createdTime: order.createdTime,
      modifiedTime: order.modifiedTime,
    });
  } catch (err) {
    console.error('Order status error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch order status' });
  }
};
