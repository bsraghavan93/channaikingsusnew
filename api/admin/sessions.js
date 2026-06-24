const { cloverFetch, cors } = require('../_lib/clover');
const { VALID_TABLES } = require('../_lib/tables');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const ordersRes = await cloverFetch('/orders?filter=state=open&limit=200&expand=lineItems');
    const orders = ordersRes.elements || [];

    const activeMap = {};
    for (const o of orders) {
      if (o.note && o.note.startsWith('TABLE:')) {
        const tbl = o.note.replace('TABLE:', '');
        activeMap[tbl] = {
          table: tbl,
          status: 'active',
          orderId: o.id,
          total: (o.lineItems?.elements || []).reduce((s, li) => s + (li.price || 0), 0),
          itemCount: o.lineItems?.elements?.length || 0,
          createdTime: o.createdTime,
          modifiedTime: o.modifiedTime,
        };
      }
    }

    const tables = VALID_TABLES.map(t =>
      activeMap[t] || { table: t, status: 'available' }
    );

    return res.status(200).json({ tables });
  } catch (err) {
    console.error('Admin sessions error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};
