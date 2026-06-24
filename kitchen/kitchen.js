/* ── Chennai Kings — Kitchen Display System ── */

let orders = [];
let knownOrderIds = new Set();
let soundEnabled = true;
let refreshInterval = null;

// ── Init ──
(async function init() {
  updateClock();
  setInterval(updateClock, 1000);
  await refreshOrders();
  // auto-refresh every 15 seconds
  refreshInterval = setInterval(refreshOrders, 15000);
  // update elapsed times every second
  setInterval(updateElapsedTimes, 1000);
})();

// ── Fetch Orders ──
async function refreshOrders() {
  try {
    const res = await fetch('/api/kitchen/orders');
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    const newOrders = data.orders || [];

    // detect genuinely new orders
    const newIds = newOrders.map(o => o.orderId);
    for (const o of newOrders) {
      if (!knownOrderIds.has(o.orderId)) {
        o._isNew = true;
        playSound();
      }
    }
    knownOrderIds = new Set(newIds);
    orders = newOrders;
    renderBoard();
  } catch (err) {
    console.error('Refresh error:', err);
  }
}

// ── Render ──
function renderBoard() {
  const board = document.getElementById('kds-board');
  const empty = document.getElementById('kds-empty');

  // filter out fully-bumped orders (all items printed) unless they're recent
  const visible = orders.filter(o => {
    const allDone = o.lineItems.length > 0 && o.lineItems.every(li => li.printed);
    if (allDone) {
      // keep visible for 60s after last modification so kitchen can see it
      const age = Date.now() - o.modifiedTime;
      return age < 60000;
    }
    return true;
  });

  if (visible.length === 0) {
    board.innerHTML = '';
    empty.style.display = 'flex';
    document.getElementById('hdr-count').textContent = '0 orders';
    return;
  }

  empty.style.display = 'none';
  document.getElementById('hdr-count').textContent =
    `${visible.length} order${visible.length !== 1 ? 's' : ''}`;

  board.innerHTML = visible.map(order => {
    const doneCount = order.lineItems.filter(li => li.printed).length;
    const totalCount = order.lineItems.length;
    const allDone = totalCount > 0 && doneCount === totalCount;
    const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const elapsed = elapsedStr(order.createdTime);
    const elapsedClass = elapsedClass_(order.createdTime);
    const orderTime = new Date(order.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="order-card ${order._isNew ? 'new-flash' : ''} ${allDone ? 'all-done' : ''}"
           data-order-id="${order.orderId}" id="card-${order.orderId}">
        <div class="oc-header">
          <span class="oc-table">${esc(order.table)}</span>
          <div class="oc-meta">
            <div class="oc-time">${orderTime}</div>
            <div class="oc-elapsed ${elapsedClass}" data-created="${order.createdTime}">${elapsed}</div>
          </div>
        </div>
        <div class="oc-items">
          ${order.lineItems.map(li => `
            <div class="oc-item ${li.printed ? 'done' : ''}"
                 onclick="toggleItem('${order.orderId}','${li.id}',${!li.printed})">
              <span class="oc-item-check"><i class="bi bi-check"></i></span>
              <div class="oc-item-info">
                <div class="oc-item-name">${esc(li.name)}</div>
                ${li.note ? `<div class="oc-item-note">${esc(li.note)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="oc-progress">
          <div class="oc-progress-bar"><div class="oc-progress-fill" style="width:${pct}%"></div></div>
          <div class="oc-progress-text">${doneCount}/${totalCount} items</div>
        </div>
        <button class="oc-bump ${allDone ? 'ready' : ''}" onclick="bumpOrder('${order.orderId}','${esc(order.table)}')">
          <i class="bi bi-check2-all"></i> ${allDone ? 'BUMP — READY' : 'BUMP ORDER'}
        </button>
      </div>
    `;
  }).join('');

  // clear new flash after animation
  setTimeout(() => {
    orders.forEach(o => o._isNew = false);
  }, 5000);
}

// ── Toggle Item Done ──
async function toggleItem(orderId, lineItemId, markDone) {
  // optimistic UI
  const order = orders.find(o => o.orderId === orderId);
  if (order) {
    const li = order.lineItems.find(l => l.id === lineItemId);
    if (li) li.printed = markDone;
    renderBoard();
  }

  try {
    await fetch('/api/kitchen/mark-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, lineItemId, printed: markDone }),
    });
  } catch (err) {
    console.error('Mark item error:', err);
    // revert on failure
    if (order) {
      const li = order.lineItems.find(l => l.id === lineItemId);
      if (li) li.printed = !markDone;
      renderBoard();
    }
  }
}

// ── Bump Order ──
async function bumpOrder(orderId, table) {
  try {
    await fetch('/api/kitchen/bump-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    // show bump confirmation
    document.getElementById('bump-table').textContent = table;
    document.getElementById('bump-overlay').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('bump-overlay').style.display = 'none';
    }, 1200);

    // update local state
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      order.lineItems.forEach(li => li.printed = true);
      order.modifiedTime = Date.now();
      renderBoard();
    }
  } catch (err) {
    console.error('Bump error:', err);
  }
}

// ── Elapsed Time ──
function elapsedStr(ts) {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function elapsedClass_(ts) {
  const mins = (Date.now() - ts) / 60000;
  if (mins < 10) return 'fresh';
  if (mins < 20) return 'warm';
  return 'hot';
}

function updateElapsedTimes() {
  document.querySelectorAll('.oc-elapsed[data-created]').forEach(el => {
    const ts = parseInt(el.dataset.created);
    el.textContent = elapsedStr(ts);
    el.className = 'oc-elapsed ' + elapsedClass_(ts);
  });
}

// ── Clock ──
function updateClock() {
  document.getElementById('hdr-clock').textContent =
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Sound ──
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
  btn.classList.toggle('muted', !soundEnabled);
  btn.querySelector('i').className = soundEnabled ? 'bi bi-bell-fill' : 'bi bi-bell-slash-fill';
}

function playSound() {
  if (!soundEnabled) return;
  try {
    const audio = document.getElementById('new-order-sound');
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
}

// ── Utils ──
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
