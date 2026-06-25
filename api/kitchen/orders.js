const { cloverFetch, cors } = require('../_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const ordersRes = await cloverFetch('/orders?filter=state=open&limit=200&expand=lineItems');
    const orders = (ordersRes.elements || [])
      .filter(o => {
        const items = o.lineItems?.elements || [];
        return items.length > 0;
      })
      .map(o => {
        const items = o.lineItems?.elements || [];
        let table = '';
        if (o.note && o.note.startsWith('TABLE:')) {
          table = o.note.replace('TABLE:', '');
        } else if (o.title) {
          table = o.title;
        } else {
          table = 'POS #' + (o.id || '').slice(-4);
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
      })
      .sort((a, b) => a.createdTime - b.createdTime);

    return res.status(200).json({ orders });
  } catch (err) {
    console.error('Kitchen orders error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch kitchen orders' });
  }
};
