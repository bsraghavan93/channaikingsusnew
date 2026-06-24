const { cloverFetch, cors } = require('./_lib/clover');
const { isValidTable } = require('./_lib/tables');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { table, orderId, items } = req.body || {};

  if (!isValidTable(table)) return res.status(400).json({ error: 'Invalid table' });
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  try {
    const order = await cloverFetch(`/orders/${orderId}`);
    if (order.state !== 'open') {
      return res.status(400).json({ error: 'Order is no longer open' });
    }

    for (const item of items) {
      const qty = Math.min(Math.max(parseInt(item.qty) || 1, 1), 20);

      for (let i = 0; i < qty; i++) {
        const lineItem = await cloverFetch(`/orders/${orderId}/line_items`, {
          method: 'POST',
          body: JSON.stringify({
            item: { id: item.itemId },
            note: item.specialInstructions || '',
          }),
        });

        if (Array.isArray(item.modifiers)) {
          for (const mod of item.modifiers) {
            await cloverFetch(
              `/orders/${orderId}/line_items/${lineItem.id}/modifications`,
              {
                method: 'POST',
                body: JSON.stringify({ modifier: { id: mod.id } }),
              }
            );
          }
        }
      }
    }

    const updated = await cloverFetch(`/orders/${orderId}?expand=lineItems`);
    const lineItems = updated.lineItems?.elements || [];
    const calcTotal = lineItems.reduce((sum, li) => sum + (li.price || 0), 0);

    // Sync the order total on Clover
    if (calcTotal > 0 && updated.total !== calcTotal) {
      await cloverFetch(`/orders/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ total: calcTotal }),
      });
    }

    return res.status(200).json({
      success: true,
      orderId,
      total: calcTotal,
      lineItems: lineItems.map(li => ({
        id: li.id,
        name: li.name,
        price: li.price || 0,
        unitQty: li.unitQty ? li.unitQty / 1000 : 1,
        note: li.note || '',
      })),
    });
  } catch (err) {
    console.error('Order error:', err.message);
    return res.status(500).json({ error: 'Failed to submit order' });
  }
};
