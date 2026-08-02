/**
 * QuantaForze - Interactive Quantum Field Canvas Engine
 * Depicts a morphing quantum energy grid & constellation field tracked dynamically by cursor movement.
 */

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    radius: 220,
    active: false
  };

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNodes();
  });

  let nodes = [];
  const columns = Math.floor(width / 60);
  const rows = Math.floor(height / 60);

  class QuantumNode {
    constructor(originX, originY) {
      this.originX = originX;
      this.originY = originY;
      this.x = originX;
      this.y = originY;
      this.size = 2 + Math.random() * 2;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = 0.01 + Math.random() * 0.015;
      this.baseAlpha = 0.15 + Math.random() * 0.35;
      this.alpha = this.baseAlpha;
      this.glow = 0;
    }

    update() {
      // Natural floating oscillation
      this.angle += this.speed;
      const oscX = Math.cos(this.angle) * 12;
      const oscY = Math.sin(this.angle) * 12;

      const targetX = this.originX + oscX;
      const targetY = this.originY + oscY;

      // Mouse attraction and dynamic displacement tracking
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const pull = force * 60;
        const angle = Math.atan2(dy, dx);
        
        // Dynamic magnetic elastic pull towards cursor
        this.x += (this.originX + Math.cos(angle) * pull - this.x) * 0.1;
        this.y += (this.originY + Math.sin(angle) * pull - this.y) * 0.1;
        this.glow = force;
        this.alpha = this.baseAlpha + force * 0.6;
      } else {
        this.x += (targetX - this.x) * 0.05;
        this.y += (targetY - this.y) * 0.05;
        this.glow *= 0.92;
        this.alpha += (this.baseAlpha - this.alpha) * 0.05;
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + this.glow * 2, 0, Math.PI * 2);
      
      const intensity = Math.floor(200 + this.glow * 55);
      ctx.fillStyle = `rgba(${intensity}, ${intensity}, ${intensity}, ${this.alpha})`;
      
      if (this.glow > 0.1) {
        ctx.shadowBlur = 15 * this.glow;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      }
      
      ctx.fill();
      ctx.restore();
    }
  }

  function initNodes() {
    nodes = [];
    for (let x = 0; x <= width + 60; x += 60) {
      for (let y = 0; y <= height + 60; y += 60) {
        nodes.push(new QuantumNode(x, y));
      }
    }
  }

  initNodes();

  let time = 0;

  function animate() {
    time += 0.02;
    // Smooth lerp mouse positioning
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, width, height);

    // Render dynamic connecting geometric lattice lines
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      nodeA.update();

      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 85) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          
          const avgGlow = (nodeA.glow + nodeB.glow) / 2;
          const alpha = (1 - dist / 85) * (0.1 + avgGlow * 0.4);
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.7 + avgGlow;
          ctx.stroke();
          ctx.restore();
        }
      }

      nodeA.draw();
    }

    // Draw cursor magnetic halo depiction
    if (mouse.active || mouse.glow > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer orbit ring
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.setLineDash([6, 12]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  animate();
}
