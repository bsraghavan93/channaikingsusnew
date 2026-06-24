const VALID_TABLES = [
  'A1','A2','A3','A4','A5','A6',
  'B1','B2','B3','B4','B5',
  'D1','D2','D3','D4',
];

function isValidTable(t) {
  return VALID_TABLES.includes((t || '').toUpperCase());
}

function noteTag(table) {
  return `TABLE:${table.toUpperCase()}`;
}

module.exports = { VALID_TABLES, isValidTable, noteTag };
