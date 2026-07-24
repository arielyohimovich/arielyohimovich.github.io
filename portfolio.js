// אותו רקע נוזלי בדיוק כמו בדף הבית, לעקביות מלאה בין הדפים
const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width, height;
let particles = [];
let mouse = { px: -1000, py: -1000 };
let hue = 0;
let animationId = null;
const MAX_PARTICLES = 300;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx * 0.8 + (Math.random() - 0.5) * 4;
    this.vy = vy * 0.8 + (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 80 + 40;
    this.color = `hsl(${hue}, 100%, 65%)`;
    this.alpha = 0.9;
    this.decay = Math.random() * 0.012 + 0.008;
    this.friction = 0.96;
  }
  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    this.radius += 1.2;
  }
  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.max(0, this.alpha);
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0, this.color);
    grad.addColorStop(0.5, this.color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function handlePointerMove(x, y) {
  const dx = x - mouse.px;
  const dy = y - mouse.py;
  const dist = Math.hypot(dx, dy);
  if (dist > 2) {
    const count = Math.min(Math.floor(dist / 3) + 2, 8);
    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      particles.push(new Particle(x, y, dx * 0.3, dy * 0.3));
    }
    hue = (hue + 2) % 360;
  }
  mouse.px = x;
  mouse.py = y;
}

if (!prefersReducedMotion) {
  window.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  });
}

function render() {
  ctx.fillStyle = 'rgba(8, 7, 12, 0.15)';
  ctx.fillRect(0, 0, width, height);
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }
  animationId = requestAnimationFrame(render);
}

function startRender() {
  if (animationId === null) animationId = requestAnimationFrame(render);
}
function stopRender() {
  if (animationId !== null) { cancelAnimationFrame(animationId); animationId = null; }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopRender();
  else startRender();
});

if (prefersReducedMotion) {
  ctx.fillStyle = 'rgba(8, 7, 12, 1)';
  ctx.fillRect(0, 0, width, height);
} else {
  startRender();
}
