// ── Build tab list ──
function buildMenuPage() {
  const tabList    = document.getElementById('menu-tab-list');
  const panelsWrap = document.getElementById('menu-panels');
  if (!tabList || !panelsWrap) return;

  MENU_DATA.forEach((cat, idx) => {
    // Tab button
    const btn = document.createElement('button');
    btn.className = 'menu-tab' + (idx === 0 ? ' active' : '');
    btn.textContent = cat.label;
    btn.addEventListener('click', () => showTab(cat.id, btn));
    tabList.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'mp-' + cat.id;
    panel.className = 'menu-panel' + (idx === 0 ? ' active' : '');

    cat.sections.forEach(sec => {
      // Section header
      const hdr = document.createElement('div');
      hdr.className = 'menu-sec-header';
      hdr.innerHTML = '<span class="menu-sec-title">' + sec.title + '</span><span class="menu-sec-line"></span>';
      panel.appendChild(hdr);

      if (sec.note) {
        const note = document.createElement('div');
        note.className = 'menu-sec-note';
        note.textContent = sec.note;
        panel.appendChild(note);
      }

      if (!sec.cols || sec.cols === 1) {
        sec.items.forEach(item => panel.appendChild(buildItem(item)));
      } else {
        const grid = document.createElement('div');
        grid.className = 'menu-cols-grid cols-' + sec.cols;
        const perCol = Math.ceil(sec.items.length / sec.cols);
        for (let c = 0; c < sec.cols; c++) {
          const col = document.createElement('div');
          sec.items.slice(c * perCol, c * perCol + perCol).forEach(item => col.appendChild(buildItem(item)));
          grid.appendChild(col);
        }
        panel.appendChild(grid);
      }
    });

    panelsWrap.appendChild(panel);
  });
}

function buildItem(item) {
  const isSpecial = item.price === 'Market Price' || item.price === 'Ask for Price';
  const div = document.createElement('div');
  div.className = 'menu-item';
  div.innerHTML =
    '<div class="menu-item-info">' +
      '<div class="menu-item-name">' + item.name + '</div>' +
      (item.desc ? '<div class="menu-item-desc">' + item.desc + '</div>' : '') +
    '</div>' +
    '<span class="menu-item-leader"></span>' +
    '<div class="menu-item-price"' + (isSpecial ? ' style="font-size:0.78rem;color:var(--gold);"' : '') + '>' + item.price + '</div>';
  return div;
}

function showTab(id, btn) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('mp-' + id).classList.add('active');
  btn.classList.add('active');
  // Scroll tab into view on mobile
  btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

buildMenuPage();
