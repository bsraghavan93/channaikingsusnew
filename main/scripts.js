
// ─── NAVBAR: START IN HERO-MODE ───
document.querySelector('.navbar').classList.add('hero-mode');

// ─── PARTICLE CANVAS ───
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -Math.random() * 0.4 - 0.1;
    this.opacity = Math.random() * 0.6 + 0.1;
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.life > this.maxLife || this.y < 0) this.reset();
  }
  draw() {
    const alpha = this.opacity * (1 - this.life / this.maxLife);
    ctx.fillStyle = `rgba(200, 146, 42, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── MENU BUILDER ───
function buildMenu() {
  const tabsWrapper   = document.getElementById('menu-tabs');
  const panelsWrapper = document.getElementById('menu-panels');
  if (!tabsWrapper || !panelsWrapper) return;

  MENU_DATA.forEach((category, idx) => {
    // Tab button
    const btn = document.createElement('button');
    btn.className = 'menu-tab' + (idx === 0 ? ' active' : '');
    btn.textContent = category.label;
    btn.addEventListener('click', function () { showMenu(category.id, this); });
    tabsWrapper.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.id        = 'm-' + category.id;
    panel.className = 'menu-panel' + (idx === 0 ? ' active reveal' : '');

    const card = document.createElement('div');
    card.className = 'menu-card';

    category.sections.forEach(section => {
      // Section header (Mochar style)
      const hdr = document.createElement('div');
      hdr.className = 'menu-sec-header';
      hdr.innerHTML = `<span class="menu-sec-title">${section.title}</span><span class="menu-sec-line"></span>`;
      card.appendChild(hdr);

      // Optional note
      if (section.note) {
        const noteEl = document.createElement('div');
        noteEl.className = 'menu-sec-note';
        noteEl.textContent = section.note;
        card.appendChild(noteEl);
      }

      // Items — single or multi-column
      if (!section.cols || section.cols === 1) {
        section.items.forEach(item => card.appendChild(buildMenuItem(item)));
      } else {
        const grid = document.createElement('div');
        grid.className = `menu-cols-grid cols-${section.cols}`;
        const perCol = Math.ceil(section.items.length / section.cols);
        for (let c = 0; c < section.cols; c++) {
          const col = document.createElement('div');
          section.items.slice(c * perCol, c * perCol + perCol)
            .forEach(item => col.appendChild(buildMenuItem(item)));
          grid.appendChild(col);
        }
        card.appendChild(grid);
      }
    });

    panel.appendChild(card);
    panelsWrapper.appendChild(panel);
  });
}

function buildMenuItem(item) {
  const isSpecial = item.price === 'Market Price' || item.price === 'Ask for Price';
  const div = document.createElement('div');
  div.className = 'menu-item';
  div.innerHTML = `
    <div class="menu-item-info">
      <div class="menu-item-name">${item.name}</div>
      ${item.desc ? `<div class="menu-item-desc">${item.desc}</div>` : ''}
    </div>
    <span class="menu-item-leader"></span>
    <div class="menu-item-price"${isSpecial ? ' style="font-size:0.78rem;color:var(--gold);letter-spacing:0.06em;"' : ''}>${item.price}</div>`;
  return div;
}

buildMenu();

// ─── MENU TABS ───
function showMenu(tab, el) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('m-' + tab).classList.add('active');
  el.classList.add('active');
}

// ─── DATA-ANIMATE: FLY IN + FLY OUT ───
function applyDelay(el) {
  const d = el.dataset.delay;
  el.style.transitionDelay = d ? d + 'ms' : '0ms';
}

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      applyDelay(el);
      el.classList.remove('anim-out');
      el.classList.add('anim-in');
    } else {
      // Only fly out if element has already flown in once
      if (el.classList.contains('anim-in')) {
        el.style.transitionDelay = '0ms';
        el.classList.remove('anim-in');
        el.classList.add('anim-out');
      }
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => {
  animObserver.observe(el);
});

// Legacy .reveal support (for any elements not yet migrated)
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(r => revealObserver.observe(r));

// ─── HERO SCROLL TRANSITION + NAVBAR ───
const navbar    = document.querySelector('.navbar');
const heroCont  = document.querySelector('.hero-content');
const heroScInd = document.querySelector('.hero-scroll-ind');
const heroLogo  = document.querySelector('.hc-logo');

let lastScrollY = 0;
let heroHeight  = window.innerHeight;
window.addEventListener('resize', () => { heroHeight = window.innerHeight; });

function driveHeroScroll() {
  const scrollY  = window.scrollY;
  const progress = Math.min(1, scrollY / heroHeight);

  // Hero content fades and rises
  if (heroCont) {
    heroCont.style.opacity   = Math.max(0, 1 - progress * 1.8).toString();
    heroCont.style.transform = 'translateY(' + (-progress * 80) + 'px)';
  }

  // Hero logo drifts toward top-left as it fades
  if (heroLogo) {
    const scale = Math.max(0.05, 1 - progress * 0.95);
    heroLogo.style.transform = 'translate(' + (-progress * 42) + 'vw, ' + (-progress * 44) + 'vh) scale(' + scale + ')';
    heroLogo.style.opacity   = Math.max(0, 1 - progress * 2.2).toString();
  }

  // Scroll indicator fades quickly
  if (heroScInd) {
    heroScInd.style.opacity = Math.max(0, 1 - progress * 5).toString();
  }

  // Navbar: hero-mode off at 38% scroll → items stagger in
  const heroGone = progress >= 0.38;
  navbar.classList.toggle('hero-mode', !heroGone);
  navbar.classList.toggle('scrolled',  scrollY > 60 && heroGone);

  // Post-hero: hide on scroll-down, show on scroll-up
  if (heroGone) {
    navbar.style.transform = (scrollY > lastScrollY && scrollY > heroHeight * 0.5)
      ? 'translateY(-100%)' : 'translateY(0)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }

  lastScrollY = scrollY;
}

window.addEventListener('scroll', driveHeroScroll, { passive: true });
driveHeroScroll();

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const text  = el.textContent.trim();
  const num   = parseFloat(text.replace(/[^0-9.]/g, ''));
  const suffix = text.replace(/[0-9.]/g, '');
  if (isNaN(num)) return;
  const duration = 1600;
  const start    = performance.now();
  const isDecimal = text.includes('.');
  (function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = isDecimal ? (num * eased).toFixed(1) : Math.floor(num * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  })(start);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.about-stat-num').forEach(el => counterObserver.observe(el));

// ─── STAGGER CHILDREN ───
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stagger-child').forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 100);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.stagger-wrap').forEach(el => staggerObserver.observe(el));

// ─── PARALLAX ───
const parallaxBg = document.querySelector('.parallax-bg');
window.addEventListener('scroll', () => {
  const banner = document.querySelector('.parallax-banner');
  if (banner) {
    const rect = banner.getBoundingClientRect();
    const offset = rect.top * 0.4;
    parallaxBg.style.transform = `translateY(${offset}px)`;
  }
});

// ─── SCROLL PROGRESS BAR ───
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total    = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
}, { passive: true });

// ─── CURSOR TRAIL ───
const cursorCanvas  = document.getElementById('cursor-canvas');
const cursorCtx     = cursorCanvas.getContext('2d');
let trails = [];
let mouse  = { x: -200, y: -200 };

function resizeCursorCanvas() {
  cursorCanvas.width  = window.innerWidth;
  cursorCanvas.height = window.innerHeight;
}
resizeCursorCanvas();
window.addEventListener('resize', resizeCursorCanvas);

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  trails.push({
    x: mouse.x, y: mouse.y,
    size: Math.random() * 3 + 1.5,
    life: 1,
    decay: Math.random() * 0.03 + 0.025,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -(Math.random() * 0.8 + 0.2)
  });
});

function drawTrails() {
  cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  trails = trails.filter(t => t.life > 0);
  trails.forEach(t => {
    t.x += t.vx;
    t.y += t.vy;
    t.life -= t.decay;
    t.size *= 0.97;
    const alpha = t.life * 0.7;
    cursorCtx.beginPath();
    cursorCtx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
    cursorCtx.fillStyle = `rgba(200, 146, 42, ${alpha})`;
    cursorCtx.shadowBlur = 6;
    cursorCtx.shadowColor = 'rgba(200,146,42,0.5)';
    cursorCtx.fill();
    cursorCtx.shadowBlur = 0;
  });
  requestAnimationFrame(drawTrails);
}
drawTrails();
