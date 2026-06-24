const { cloverFetch, cors } = require('./_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, token, tipAmount, email } = req.body || {};
  if (!orderId || !token) {
    return res.status(400).json({ error: 'Missing orderId or payment token' });
  }

  try {
    const order = await cloverFetch(`/orders/${orderId}?expand=lineItems`);
    if (!order || order.state !== 'open') {
      return res.status(400).json({ error: 'Order not found or already paid' });
    }

    const lineItems = order.lineItems?.elements || [];
    let amount = lineItems.reduce((sum, li) => sum + (li.price || 0), 0);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Order total is zero' });
    }

    const tip = Math.max(0, parseInt(tipAmount) || 0);
    amount += tip;

    const chargeBody = {
      amount,
      currency: 'usd',
      source: token,
      description: `${order.title || 'Table Order'} — Chennai Kings`,
      external_reference_id: orderId,
    };
    if (tip > 0) chargeBody.tip_amount = tip;
    if (email) chargeBody.receipt_email = email;

    const ECOM_PRIVATE = process.env.CLOVER_ECOM_PRIVATE_KEY;
    if (!ECOM_PRIVATE) {
      return res.status(500).json({ error: 'Payment not configured' });
    }

    const ecomBase = process.env.CLOVER_ENV === 'sandbox'
      ? 'https://scl-sandbox.dev.clover.com'
      : 'https://scl.clover.com';

    const chargeRes = await fetch(`${ecomBase}/v1/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ECOM_PRIVATE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargeBody),
    });

    if (!chargeRes.ok) {
      const errText = await chargeRes.text();
      throw new Error(`Charge failed ${chargeRes.status}: ${errText}`);
    }

    const charge = await chargeRes.json();

    await cloverFetch(`/orders/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ state: 'locked', paymentState: 'PAID' }),
    });

    return res.status(200).json({
      success: true,
      chargeId: charge.id,
      amount: charge.amount,
      status: charge.status,
    });
  } catch (err) {
    console.error('Payment error:', err.message);
    return res.status(500).json({
      error: 'Payment failed. Please try again or ask staff for help.',
    });
  }
};
