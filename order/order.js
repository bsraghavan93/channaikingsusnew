/* ── Chennai Kings — QR Table Ordering ── */

// ── State ──
let tableNumber = '';
let orderId = '';
let menuData = [];   // [{id, name, items: [{id, name, price, description, modifierGroups}]}]
let cart = [];        // [{itemId, name, price, qty, modifiers:[], specialInstructions, modifierGroups}]
let selectedItem = null;
let modalQty = 1;
let modalModifiers = {}; // groupId -> [modifierId]
let billData = null;
let tipPct = 18;
let cloverInstance = null;
let cardElement = null;

// ── Init ──
(async function init() {
  tableNumber = extractTable();
  if (!tableNumber) {
    showView('invalid');
    return;
  }

  document.getElementById('hdr-table').textContent = tableNumber;
  loadCartFromStorage();
  updateCartBadge();

  try {
    await loadMenu();
    await initTableSession();
    renderMenu();
    showView('menu');
  } catch (err) {
    console.error('Init error:', err);
    document.getElementById('view-loading').querySelector('.load-text').textContent =
      'Failed to load. Please refresh.';
  }
})();

function extractTable() {
  const parts = window.location.pathname.split('/');
  const idx = parts.indexOf('table');
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].toUpperCase();
  return '';
}

// ── View Management ──
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const el = document.getElementById('view-' + name);
  if (el) {
    el.style.display = name === 'loading' || name === 'invalid' ||
      name === 'ordered' || name === 'success' || name === 'counter-pay'
      ? 'flex' : 'block';
    if (name === 'card-pay') initCloverPayment();
  }
  if (name === 'cart') renderCart();
  window.scrollTo(0, 0);
}

// ── Menu Loading ──
async function loadMenu() {
  const cached = localStorage.getItem('ck_menu');
  const cachedAt = parseInt(localStorage.getItem('ck_menu_ts') || '0');
  if (cached && Date.now() - cachedAt < 30 * 60 * 1000) {
    menuData = JSON.parse(cached);
    return;
  }

  const res = await fetch('/api/menu');
  if (!res.ok) throw new Error('Menu fetch failed');
  const data = await res.json();
  menuData = data.categories || [];
  localStorage.setItem('ck_menu', JSON.stringify(menuData));
  localStorage.setItem('ck_menu_ts', String(Date.now()));
}

// ── Table Session ──
async function initTableSession() {
  const res = await fetch(`/api/table-session?table=${tableNumber}`);
  const data = await res.json();

  if (data.status === 'active') {
    orderId = data.orderId;
    saveSession();
  } else if (data.status === 'none') {
    const stored = getStoredSession();
    if (stored && stored.table === tableNumber) {
      orderId = stored.orderId;
    }
  }
}

function saveSession() {
  localStorage.setItem('ck_session', JSON.stringify({ table: tableNumber, orderId }));
}

function getStoredSession() {
  try { return JSON.parse(localStorage.getItem('ck_session')); } catch { return null; }
}

// ── Render Menu ──
function renderMenu() {
  const tabsEl = document.getElementById('cat-tabs');
  const itemsEl = document.getElementById('menu-items');
  tabsEl.innerHTML = '';
  itemsEl.innerHTML = '';

  menuData.forEach((cat, i) => {
    const tab = document.createElement('button');
    tab.className = 'cat-tab' + (i === 0 ? ' active' : '');
    tab.textContent = cat.name;
    tab.onclick = () => scrollToCategory(cat.id, tab);
    tabsEl.appendChild(tab);

    const section = document.createElement('div');
    section.id = 'cat-' + cat.id;
    section.innerHTML = `<div class="cat-section-title">${esc(cat.name)}</div>`;

    cat.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.onclick = () => openItemModal(item);
      const hasMods = item.modifierGroups && item.modifierGroups.length > 0;
      card.innerHTML = `
        <div class="item-info">
          <div class="item-name">${esc(item.name)}</div>
          ${item.description ? `<div class="item-desc">${esc(item.description)}</div>` : ''}
          ${hasMods ? '<div class="item-mod-hint">Customizable</div>' : ''}
        </div>
        <div class="item-price">${formatPrice(item.price)}</div>
      `;
      section.appendChild(card);
    });

    itemsEl.appendChild(section);
  });
}

function scrollToCategory(catId, tabEl) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  const section = document.getElementById('cat-' + catId);
  if (section) {
    const top = section.offsetTop - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// highlight active tab on scroll
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => {
    scrollTick = false;
    const tabs = document.querySelectorAll('.cat-tab');
    const sections = menuData.map(c => document.getElementById('cat-' + c.id)).filter(Boolean);
    let activeIdx = 0;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop - 130 <= window.scrollY) { activeIdx = i; break; }
    }
    tabs.forEach((t, i) => t.classList.toggle('active', i === activeIdx));
  });
});

// ── Item Modal ──
function openItemModal(item) {
  selectedItem = item;
  modalQty = 1;
  modalModifiers = {};

  document.getElementById('modal-name').textContent = item.name;
  document.getElementById('modal-desc').textContent = item.description || '';
  document.getElementById('modal-price').textContent = formatPrice(item.price);
  document.getElementById('modal-qty').textContent = '1';
  document.getElementById('modal-notes').value = '';

  const modsEl = document.getElementById('modal-modifiers');
  modsEl.innerHTML = '';

  if (item.modifierGroups) {
    item.modifierGroups.forEach(group => {
      modalModifiers[group.id] = [];
      const div = document.createElement('div');
      div.className = 'mod-group';

      const isRequired = group.minRequired > 0;
      const isSingle = group.maxAllowed === 1;

      div.innerHTML = `
        <div class="mod-group-header">
          <span>${esc(group.name)}</span>
          ${isRequired ? '<span class="mod-required">Required</span>' : ''}
        </div>
      `;

      group.modifiers.forEach(mod => {
        const opt = document.createElement('div');
        opt.className = 'mod-option';
        opt.dataset.groupId = group.id;
        opt.dataset.modId = mod.id;
        opt.onclick = () => toggleModifier(group, mod, opt, isSingle);
        opt.innerHTML = `
          <div class="mod-option-left">
            <span class="mod-check"><i class="bi bi-check"></i></span>
            <span class="mod-option-name">${esc(mod.name)}</span>
          </div>
          ${mod.price > 0 ? `<span class="mod-option-price">+${formatPrice(mod.price)}</span>` : ''}
        `;
        div.appendChild(opt);
      });

      modsEl.appendChild(div);
    });
  }

  updateAddBtnPrice();
  document.getElementById('item-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeItemModal() {
  document.getElementById('item-modal').style.display = 'none';
  document.body.style.overflow = '';
  selectedItem = null;
}

function toggleModifier(group, mod, optEl, isSingle) {
  const selected = modalModifiers[group.id] || [];
  const idx = selected.findIndex(m => m.id === mod.id);

  if (idx >= 0) {
    selected.splice(idx, 1);
    optEl.classList.remove('selected');
  } else {
    if (isSingle) {
      modalModifiers[group.id] = [];
      optEl.parentElement.querySelectorAll('.mod-option').forEach(o => o.classList.remove('selected'));
    }
    if (group.maxAllowed > 0 && selected.length >= group.maxAllowed && !isSingle) {
      toast(`Max ${group.maxAllowed} selections for ${group.name}`);
      return;
    }
    selected.push({ id: mod.id, name: mod.name, price: mod.price || 0 });
    optEl.classList.add('selected');
  }

  modalModifiers[group.id] = selected;
  updateAddBtnPrice();
}

function changeQty(delta) {
  modalQty = Math.max(1, Math.min(20, modalQty + delta));
  document.getElementById('modal-qty').textContent = modalQty;
  updateAddBtnPrice();
}

function updateAddBtnPrice() {
  if (!selectedItem) return;
  let modTotal = 0;
  for (const mods of Object.values(modalModifiers)) {
    for (const m of mods) modTotal += m.price || 0;
  }
  const total = (selectedItem.price + modTotal) * modalQty;
  document.getElementById('modal-add-btn').textContent =
    `Add to Cart — ${formatPrice(total)}`;
}

// ── Cart ──
function onCartClick() {
  if (cart.length === 0 && orderId) {
    loadBillAndShowPayment();
  } else {
    showView('cart');
  }
}

function addToCart() {
  if (!selectedItem) return;

  // validate required modifiers
  if (selectedItem.modifierGroups) {
    for (const group of selectedItem.modifierGroups) {
      if (group.minRequired > 0) {
        const sel = modalModifiers[group.id] || [];
        if (sel.length < group.minRequired) {
          toast(`Please select ${group.name}`);
          return;
        }
      }
    }
  }

  const allMods = [];
  for (const mods of Object.values(modalModifiers)) allMods.push(...mods);

  cart.push({
    itemId: selectedItem.id,
    name: selectedItem.name,
    price: selectedItem.price,
    qty: modalQty,
    modifiers: allMods,
    specialInstructions: document.getElementById('modal-notes').value.trim(),
  });

  saveCartToStorage();
  updateCartBadge();
  closeItemModal();
  toast(`${selectedItem.name} added to cart`);
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCartToStorage();
  updateCartBadge();
  renderCart();
}

function updateCartItemQty(index, delta) {
  cart[index].qty = Math.max(1, Math.min(20, cart[index].qty + delta));
  saveCartToStorage();
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    footerEl.style.display = 'none';
    if (orderId) {
      emptyEl.innerHTML = `
        <i class="bi bi-receipt big-icon gold"></i>
        <p class="view-sub">No new items in cart</p>
        <div class="btn-row mt2">
          <button class="btn-gold" onclick="showView('menu')">Order More</button>
          <button class="btn-outline" onclick="loadBillAndShowPayment()">View Bill</button>
        </div>
      `;
    } else {
      emptyEl.innerHTML = `
        <i class="bi bi-bag big-icon muted"></i>
        <p class="view-sub">Your cart is empty</p>
        <button class="btn-gold mt2" onclick="showView('menu')">Browse Menu</button>
      `;
    }
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  let subtotal = 0;
  itemsEl.innerHTML = cart.map((item, i) => {
    let modPrice = item.modifiers.reduce((s, m) => s + (m.price || 0), 0);
    let lineTotal = (item.price + modPrice) * item.qty;
    subtotal += lineTotal;

    const modNames = item.modifiers.map(m => m.name).join(', ');

    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${esc(item.name)}</div>
          ${modNames ? `<div class="cart-item-mods">${esc(modNames)}</div>` : ''}
          ${item.specialInstructions ? `<div class="cart-item-notes">"${esc(item.specialInstructions)}"</div>` : ''}
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="updateCartItemQty(${i},-1)"><i class="bi bi-dash"></i></button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" onclick="updateCartItemQty(${i},1)"><i class="bi bi-plus"></i></button>
            <button class="cart-item-remove" onclick="removeCartItem(${i})">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">${formatPrice(lineTotal)}</div>
      </div>
    `;
  }).join('');

  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
}

function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function saveCartToStorage() {
  localStorage.setItem('ck_cart_' + tableNumber, JSON.stringify(cart));
}

function loadCartFromStorage() {
  if (!tableNumber) return;
  try {
    const stored = localStorage.getItem('ck_cart_' + tableNumber);
    if (stored) cart = JSON.parse(stored);
  } catch { cart = []; }
}

// ── Order Submission ──
async function submitOrder() {
  if (cart.length === 0) return;

  showOverlay('Sending order to kitchen...');

  try {
    // ensure we have an order on Clover
    if (!orderId) {
      const sessionRes = await fetch(`/api/table-session?table=${tableNumber}`, { method: 'POST' });
      const sessionData = await sessionRes.json();
      orderId = sessionData.orderId;
      saveSession();
    }

    const items = cart.map(item => ({
      itemId: item.itemId,
      qty: item.qty,
      modifiers: item.modifiers.map(m => ({ id: m.id })),
      specialInstructions: item.specialInstructions,
    }));

    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: tableNumber, orderId, items }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Order failed');
    }

    cart = [];
    saveCartToStorage();
    updateCartBadge();
    hideOverlay();
    showView('ordered');
  } catch (err) {
    hideOverlay();
    toast('Order failed: ' + err.message);
  }
}

// ── Payment ──
async function loadBillAndShowPayment() {
  if (!orderId) {
    toast('No active order found');
    return;
  }

  showOverlay('Loading bill...');

  try {
    const res = await fetch(`/api/order-status?orderId=${orderId}`);
    if (!res.ok) throw new Error('Failed to load bill');
    billData = await res.json();

    renderBill();
    hideOverlay();
    showView('payment');
  } catch (err) {
    hideOverlay();
    toast('Could not load bill: ' + err.message);
  }
}

function renderBill() {
  if (!billData) return;

  const itemsEl = document.getElementById('bill-items');
  itemsEl.innerHTML = billData.lineItems.map(li => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${esc(li.name)}</div>
        ${li.note ? `<div class="cart-item-notes">"${esc(li.note)}"</div>` : ''}
      </div>
      <div class="cart-item-price">${formatPrice(li.price)}</div>
    </div>
  `).join('');

  const subtotal = billData.total || 0;
  document.getElementById('bill-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('bill-total').textContent = formatPrice(subtotal);
  updateTipDisplay();
}

function selectTip(pct) {
  tipPct = pct;
  document.querySelectorAll('.tip-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.pct) === pct)
  );
  updateTipDisplay();
}

function updateTipDisplay() {
  if (!billData) return;
  const subtotal = billData.total || 0;
  const tip = Math.round(subtotal * tipPct / 100);
  const grand = subtotal + tip;
  document.getElementById('bill-tip').textContent = formatPrice(tip);
  document.getElementById('bill-grand').textContent = formatPrice(grand);
  document.getElementById('pay-amount').textContent = formatPrice(grand);
}

function goToCardPay() {
  if (!billData) return;
  const subtotal = billData.total || 0;
  const tip = Math.round(subtotal * tipPct / 100);
  const grand = subtotal + tip;
  document.getElementById('card-pay-total').textContent = formatPrice(grand);
  document.getElementById('pay-btn-amount').textContent = formatPrice(grand);
  showView('card-pay');
}

let cloverInitDone = false;

async function initCloverPayment() {
  if (cloverInitDone) return;

  try {
    const keyRes = await fetch('/api/payment-key');
    if (!keyRes.ok) throw new Error('Could not get payment key');
    const { apiAccessKey } = await keyRes.json();
    if (!apiAccessKey) throw new Error('No key returned');

    if (!window.Clover) {
      await loadScript('https://checkout.clover.com/sdk.js');
    }

    cloverInstance = new window.Clover(apiAccessKey);
    const elements = cloverInstance.elements();

    const fieldStyle = {
      input: {
        fontSize: '16px',
        fontFamily: 'Lato, sans-serif',
        color: '#f5e6c8',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        padding: '10px 12px',
      },
      'input::placeholder': {
        color: '#9a8b78',
      },
    };

    const cardNumber = elements.create('CARD_NUMBER', { style: fieldStyle });
    const cardDate = elements.create('CARD_DATE', { style: fieldStyle });
    const cardCvv = elements.create('CARD_CVV', { style: fieldStyle });
    const cardPostal = elements.create('CARD_POSTAL_CODE', { style: fieldStyle });

    cardNumber.mount('#card-number');
    cardDate.mount('#card-date');
    cardCvv.mount('#card-cvv');
    cardPostal.mount('#card-postal');

    cardElement = cardNumber;
    cloverInitDone = true;
  } catch (err) {
    console.error('Clover init failed:', err);
    document.getElementById('card-number').innerHTML =
      `<p style="color:#9a8b78;font-size:.8rem;padding:12px;">Could not load card form. Please go back and use Pay at Counter.</p>`;
  }
}

async function processPayment() {
  if (!cloverInstance || !cardElement) {
    toast('Card payment not available. Please pay at counter.');
    return;
  }

  showOverlay('Processing payment...');

  try {
    const result = await cloverInstance.createToken(cardElement);
    if (result.errors) {
      const msg = Object.values(result.errors).join(', ');
      throw new Error(msg);
    }

    const token = result.token;
    const subtotal = billData.total || 0;
    const tip = Math.round(subtotal * tipPct / 100);

    const res = await fetch('/api/payment-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        token,
        tipAmount: tip,
        email: document.getElementById('pay-email').value.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Payment failed');
    }

    clearSession();
    hideOverlay();
    showView('success');
  } catch (err) {
    hideOverlay();
    toast('Payment error: ' + err.message);
  }
}

function requestCounterPay() {
  showView('counter-pay');
}

function clearSession() {
  orderId = '';
  cart = [];
  billData = null;
  localStorage.removeItem('ck_session');
  localStorage.removeItem('ck_cart_' + tableNumber);
  updateCartBadge();
}

// ── Utilities ──
function formatPrice(cents) {
  if (typeof cents !== 'number' || cents <= 0) return '$0.00';
  return '$' + (cents / 100).toFixed(2);
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function toast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function showOverlay(msg) {
  document.getElementById('overlay-msg').textContent = msg || 'Processing...';
  document.getElementById('overlay-loading').style.display = 'flex';
}

function hideOverlay() {
  document.getElementById('overlay-loading').style.display = 'none';
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
