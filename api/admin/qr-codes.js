const QRCode = require('qrcode');
const { cors } = require('../_lib/clover');
const { VALID_TABLES } = require('../_lib/tables');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const base = process.env.BASE_URL || 'https://channaikingsusnew.vercel.app';

  try {
    const codes = await Promise.all(
      VALID_TABLES.map(async (table) => {
        const url = `${base}/order/table/${table}`;
        const svg = await QRCode.toString(url, { type: 'svg', margin: 1, width: 200 });
        return { table, url, svg };
      })
    );

    return res.status(200).json({ codes });
  } catch (err) {
    console.error('QR error:', err.message);
    return res.status(500).json({ error: 'Failed to generate QR codes' });
  }
};
