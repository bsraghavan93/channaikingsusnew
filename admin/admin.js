/* ── Chennai Kings Staff Dashboard ── */

let tablesData = [];
let pendingClose = null;

// ── PIN Gate ──
const STORED_PIN_KEY = 'ck_admin_auth';

(function init() {
  if (sessionStorage.getItem(STORED_PIN_KEY) === '1') {
    showDashboard();
  }
})();

function checkPin() {
  const pin = document.getElementById('pin-input').value;
  // Simple client-side PIN; the real security is that admin API endpoints
  // only manage Clover orders (no sensitive data exposed)
  const validPins = ['1234', '0000', '9999'];
  if (validPins.includes(pin)) {
    sessionStorage.setItem(STORED_PIN_KEY, '1');
    showDashboard();
  } else {
    document.getElementById('pin-error').style.display = 'block';
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-input').focus();
  }
}

function showDashboard() {
  document.getElementById('pin-gate').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  refreshSessions();
}

// ── Sessions ──
async function refreshSessions() {
  try {
    const res = await fetch('/api/admin/sessions');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    tablesData = data.tables || [];
    renderTables();
  } catch (err) {
    console.error('Refresh error:', err);
  }
}

function renderTables() {
  const grid = document.getElementById('table-grid');
  let activeCount = 0;
  let totalRevenue = 0;

  grid.innerHTML = tablesData.map(t => {
    const isActive = t.status === 'active';
    if (isActive) {
      activeCount++;
      totalRevenue += t.total || 0;
    }

    if (isActive) {
      const created = t.createdTime ? new Date(t.createdTime).toLocaleTimeString() : '';
      const modified = t.modifiedTime ? new Date(t.modifiedTime).toLocaleTimeString() : '';
      return `
        <div class="table-card active">
          <div class="tc-header">
            <span class="tc-name">${t.table}</span>
            <span class="tc-status active">Active</span>
          </div>
          <div class="tc-total">${formatPrice(t.total)}</div>
          <div class="tc-detail">
            ${t.itemCount || 0} items<br>
            Opened: ${created}<br>
            Updated: ${modified}
          </div>
          <button class="tc-close" onclick="openCloseModal('${t.table}','${t.orderId}')">
            Close Table
          </button>
        </div>
      `;
    }

    return `
      <div class="table-card available">
        <div class="tc-header">
          <span class="tc-name">${t.table}</span>
          <span class="tc-status available">Open</span>
        </div>
        <div class="tc-detail" style="color:var(--green);">Available</div>
      </div>
    `;
  }).join('');

  document.getElementById('stat-active').textContent = activeCount;
  document.getElementById('stat-available').textContent = tablesData.length - activeCount;
  document.getElementById('stat-revenue').textContent = formatPrice(totalRevenue);
}

// ── Close Table ──
function openCloseModal(table, orderId) {
  pendingClose = { table, orderId };
  document.getElementById('close-table-name').textContent = table;
  document.getElementById('close-modal').style.display = 'flex';
}

function closeCloseModal() {
  document.getElementById('close-modal').style.display = 'none';
  pendingClose = null;
}

async function confirmCloseTable() {
  if (!pendingClose) return;
  const btn = document.getElementById('close-confirm-btn');
  btn.textContent = 'Closing...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/admin/close-table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendingClose),
    });

    if (!res.ok) throw new Error('Close failed');

    closeCloseModal();
    await refreshSessions();
  } catch (err) {
    alert('Failed to close table: ' + err.message);
  } finally {
    btn.textContent = 'Close Table';
    btn.disabled = false;
  }
}

// ── QR Codes ──
async function loadQRCodes() {
  try {
    const res = await fetch('/api/admin/qr-codes');
    if (!res.ok) throw new Error('QR generation failed');
    const data = await res.json();
    const codes = data.codes || [];

    const grid = document.getElementById('qr-grid');
    grid.innerHTML = codes.map(c => `
      <div class="qr-card">
        ${c.svg}
        <div class="qr-table-label">Table ${c.table}</div>
        <div class="qr-url">${c.url}</div>
      </div>
    `).join('');

    document.getElementById('qr-actions').style.display = 'block';
  } catch (err) {
    alert('Failed to generate QR codes: ' + err.message);
  }
}

function printQRCodes() {
  window.print();
}

// ── Utils ──
function formatPrice(cents) {
  if (typeof cents !== 'number' || cents <= 0) return '$0.00';
  return '$' + (cents / 100).toFixed(2);
}

// Auto-refresh every 30 seconds
setInterval(() => {
  if (document.getElementById('dashboard').style.display !== 'none') {
    refreshSessions();
  }
}, 30000);
