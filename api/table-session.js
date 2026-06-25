const { cloverFetch, cors } = require('./_lib/clover');
const { isValidTable, noteTag } = require('./_lib/tables');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const table = (req.query.table || '').toUpperCase();
  if (!isValidTable(table)) {
    return res.status(400).json({ error: 'Invalid table number' });
  }

  const tag = noteTag(table);

  try {
    const ordersRes = await cloverFetch('/orders?filter=state%3Dopen&limit=200&expand=lineItems');
    const orders = ordersRes.elements || [];
    const tableOrder = orders.find(o => o.note && o.note === tag);

    if (tableOrder) {
      return res.status(200).json({
        status: 'active',
        orderId: tableOrder.id,
        table,
        total: tableOrder.total || 0,
        lineItems: (tableOrder.lineItems?.elements || []).map(li => ({
          id: li.id,
          name: li.name,
          price: li.price || 0,
          unitQty: li.unitQty ? li.unitQty / 1000 : 1,
          note: li.note || '',
        })),
        createdTime: tableOrder.createdTime,
        modifiedTime: tableOrder.modifiedTime,
      });
    }

    if (req.method === 'POST') {
      // Find dine-in order type
      let orderTypeId = null;
      try {
        const typesRes = await cloverFetch('/order_types?limit=50');
        const types = typesRes.elements || [];
        const dineIn = types.find(t =>
          /dine.?in/i.test(t.label || t.name || '')
        ) || types[0];
        if (dineIn) orderTypeId = dineIn.id;
      } catch (e) { /* proceed without order type */ }

      const orderBody = {
        state: 'open',
        note: tag,
        title: `Table ${table}`,
      };
      if (orderTypeId) orderBody.orderType = { id: orderTypeId };

      const newOrder = await cloverFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderBody),
      });

      return res.status(201).json({
        status: 'new',
        orderId: newOrder.id,
        table,
        total: 0,
        lineItems: [],
        createdTime: newOrder.createdTime,
      });
    }

    return res.status(200).json({ status: 'none', table });
  } catch (err) {
    console.error('Table session error:', err.message);
    return res.status(500).json({ error: 'Failed to manage table session' });
  }
};
