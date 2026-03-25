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

// ─── MENU TABS ───
function showMenu(tab) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('m-' + tab).classList.add('active');
  event.currentTarget.classList.add('active');
}

// ─── SCROLL REVEAL ───
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(r => observer.observe(r));

// ─── SMOOTH NAVBAR HIDE/SHOW ───
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > lastScroll && current > 80) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScroll = current;
});
navbar.style.transition = 'transform 0.3s ease';

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
