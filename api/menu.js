const { cloverFetch, cors } = require('./_lib/clover');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [categoriesRes, itemsRes, modGroupsRes] = await Promise.all([
      cloverFetch('/categories?orderBy=sortOrder&limit=100'),
      cloverFetch('/items?expand=categories%2CmodifierGroups&limit=500'),
      cloverFetch('/modifier_groups?expand=modifiers&limit=100'),
    ]);

    const categories = categoriesRes.elements || [];
    const items = itemsRes.elements || [];
    const modGroups = modGroupsRes.elements || [];

    const modGroupMap = {};
    for (const mg of modGroups) {
      modGroupMap[mg.id] = {
        id: mg.id,
        name: mg.name,
        minRequired: mg.minRequired || 0,
        maxAllowed: mg.maxAllowed || 0,
        modifiers: (mg.modifiers?.elements || []).map(m => ({
          id: m.id,
          name: m.name,
          price: m.price || 0,
        })),
      };
    }

    const catItemsMap = {};
    for (const item of items) {
      if (item.hidden) continue;
      const itemData = {
        id: item.id,
        name: item.name,
        price: item.price || 0,
        description: item.description || '',
        modifierGroups: (item.modifierGroups?.elements || [])
          .map(mg => modGroupMap[mg.id])
          .filter(Boolean),
      };
      for (const cat of (item.categories?.elements || [])) {
        if (!catItemsMap[cat.id]) catItemsMap[cat.id] = [];
        catItemsMap[cat.id].push(itemData);
      }
    }

    const menu = categories
      .filter(cat => catItemsMap[cat.id]?.length > 0)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        sortOrder: cat.sortOrder || 0,
        items: catItemsMap[cat.id],
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ categories: menu });
  } catch (err) {
    console.error('Menu error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch menu', detail: err.message });
  }
};
