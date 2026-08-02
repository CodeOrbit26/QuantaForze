/**
 * QuantaForze - Interactive Quantum Field Canvas Engine
 * Ultra-sleek, organic lattice grid tracked by cursor movement in monochrome silver-white tones.
 */

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement || document.body;

  let width = (canvas.width = parent.clientWidth || window.innerWidth);
  let height = (canvas.height = parent.clientHeight || 700);

  let mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    radius: 240,
    active: false
  };

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = parent.clientWidth || window.innerWidth;
    height = canvas.height = parent.clientHeight || 700;
    initNodes();
  });

  let nodes = [];
  const nodeSpacing = 85;

  class QuantumNode {
    constructor(originX, originY) {
      this.originX = originX;
      this.originY = originY;
      this.x = originX;
      this.y = originY;
      this.size = 1.5 + Math.random() * 1.5;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = 0.008 + Math.random() * 0.012;
      this.baseAlpha = 0.12 + Math.random() * 0.25;
      this.alpha = this.baseAlpha;
      this.glow = 0;
    }

    update() {
      // Natural organic floating movement
      this.angle += this.speed;
      const oscX = Math.cos(this.angle) * 10;
      const oscY = Math.sin(this.angle) * 10;

      const targetX = this.originX + oscX;
      const targetY = this.originY + oscY;

      // Smooth elastic displacement towards cursor
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const pull = force * 45;
        const angle = Math.atan2(dy, dx);
        
        this.x += (this.originX + Math.cos(angle) * pull - this.x) * 0.08;
        this.y += (this.originY + Math.sin(angle) * pull - this.y) * 0.08;
        this.glow = force;
        this.alpha = this.baseAlpha + force * 0.5;
      } else {
        this.x += (targetX - this.x) * 0.04;
        this.y += (targetY - this.y) * 0.04;
        this.glow *= 0.92;
        this.alpha += (this.baseAlpha - this.alpha) * 0.04;
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + this.glow * 1.5, 0, Math.PI * 2);
      
      const intensity = Math.floor(220 + this.glow * 35);
      ctx.fillStyle = `rgba(${intensity}, ${intensity}, ${intensity}, ${this.alpha})`;
      
      if (this.glow > 0.15) {
        ctx.shadowBlur = 12 * this.glow;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      }
      
      ctx.fill();
      ctx.restore();
    }
  }

  function initNodes() {
    nodes = [];
    for (let x = -40; x <= width + 85; x += nodeSpacing) {
      for (let y = -40; y <= height + 85; y += nodeSpacing) {
        // Subtle random offset for organic constellation layout
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        nodes.push(new QuantumNode(x + offsetX, y + offsetY));
      }
    }
  }

  initNodes();

  function animate() {
    // Smooth lerp mouse positioning
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, width, height);

    // Render subtle connecting lattice lines
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      nodeA.update();

      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          
          const avgGlow = (nodeA.glow + nodeB.glow) / 2;
          const alpha = (1 - dist / 110) * (0.08 + avgGlow * 0.35);
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.6 + avgGlow * 0.6;
          ctx.stroke();
          ctx.restore();
        }
      }

      nodeA.draw();
    }

    // Elegant subtle magnetic halo around cursor
    if (mouse.active || mouse.glow > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer orbit dashed ring
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.setLineDash([4, 12]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  animate();
}
