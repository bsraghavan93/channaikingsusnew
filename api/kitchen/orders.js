const { cloverFetch, cors } = require('../_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Fetch open orders (without expand to avoid filter issues)
    const ordersRes = await cloverFetch('/orders?filter=state%3Dopen&limit=200');
    const rawOrders = ordersRes.elements || [];

    // Fetch line items for each order in parallel
    const orders = (await Promise.all(
      rawOrders.map(async (o) => {
        try {
          const liRes = await cloverFetch(`/orders/${o.id}/line_items?limit=200`);
          const items = liRes.elements || [];
          if (items.length === 0) return null;

          let table = '';
          if (o.note && o.note.startsWith('TABLE:')) {
            table = o.note.replace('TABLE:', '');
          } else if (o.title) {
            table = o.title;
          } else {
            table = 'Order #' + (o.id || '').slice(-4);
          }

          return {
            orderId: o.id,
            table,
            title: o.title || '',
            total: items.reduce((s, li) => s + (li.price || 0), 0),
            createdTime: o.createdTime,
            modifiedTime: o.modifiedTime,
            lineItems: items.map(li => ({
              id: li.id,
              name: li.name,
              price: li.price || 0,
              note: li.note || '',
              printed: li.printed || false,
            })),
          };
        } catch (e) {
          return null;
        }
      })
    )).filter(Boolean).sort((a, b) => a.createdTime - b.createdTime);

    return res.status(200).json({ orders, debug: { rawCount: rawOrders.length } });
  } catch (err) {
    console.error('Kitchen orders error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch kitchen orders', detail: err.message });
  }
};
