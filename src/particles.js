/**
 * QuantaForze Antigravity - Light Swirl Particle Canvas Engine
 * Recreates the exact Google Antigravity radial confetti dot animation
 */

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticleArray();
  });

  const colors = [
    '#3186ff', // Blue
    '#ea4335', // Red
    '#fbbc04', // Yellow
    '#34a853', // Green
    '#a855f7', // Purple
    '#0284c7'  // Cyan
  ];

  let particles = [];
  const particleCount = 180;

  class SwirlParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.radius = Math.random() * (Math.min(width, height) * 0.45) + 60;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = (Math.random() * 0.002 + 0.0008) * (Math.random() > 0.5 ? 1 : -1);
      this.size = Math.random() * 3.5 + 1.5;
      this.length = Math.random() * 8 + 3;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.7 + 0.3;
    }

    update() {
      this.angle += this.speed;
      this.radius += Math.sin(this.angle * 2) * 0.15;
    }

    draw() {
      const centerX = width / 2;
      const centerY = height / 2 - 40;

      const x = centerX + Math.cos(this.angle) * this.radius;
      const y = centerY + Math.sin(this.angle) * this.radius;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.angle + Math.PI / 2);
      
      ctx.beginPath();
      ctx.rect(-this.size / 2, -this.length / 2, this.size, this.length);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticleArray() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new SwirlParticle());
    }
  }

  initParticleArray();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
