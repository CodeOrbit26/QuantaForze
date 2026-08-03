/**
 * QuantaForze - Scroll-Driven Anthropic Node Canvas Engine
 * Card resizes on scroll into viewport; inner node network expands out as user scrolls down.
 */

export function initAnthropicNodes() {
  const card = document.getElementById('anthropic-research-card');
  const canvas = document.getElementById('anthropic-node-canvas');
  if (!card || !canvas) return;

  const ctx = canvas.getContext('2d');

  let width = (canvas.width = card.clientWidth);
  let height = (canvas.height = card.clientHeight);

  let mouse = {
    x: width / 2,
    y: height / 2,
    active: false
  };

  let targetScrollProgress = 0;
  let currentScrollProgress = 0;

  // IntersectionObserver to add in-view class for CSS scale transition
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        card.classList.add('in-view');
      } else {
        card.classList.remove('in-view');
      }
    });
  }, { threshold: 0.1 });

  observer.observe(card);

  function updateScrollProgress() {
    const rect = card.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Calculate progress as card scrolls into view (0 when at bottom of screen, 1 when centered)
    const raw = (windowH - rect.top) / (windowH * 0.75);
    targetScrollProgress = Math.min(1, Math.max(0, raw));
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  card.addEventListener('mouseenter', () => { mouse.active = true; });
  card.addEventListener('mouseleave', () => { mouse.active = false; });
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = card.clientWidth;
    height = canvas.height = card.clientHeight;
  });

  // Corner cluster positions
  const questions = [
    {
      text: "How does AI work?",
      xPct: 0.14,
      yPct: 0.30,
      nodes: [
        { dx: -45, dy: -50, color: "#38bdf8" },
        { dx: 45, dy: -45, color: "#4ade80" },
        { dx: -55, dy: 35, color: "#f43f5e" },
        { dx: 40, dy: 45, color: "#fbbf24" }
      ]
    },
    {
      text: "Who should govern AI?",
      xPct: 0.84,
      yPct: 0.22,
      nodes: [
        { dx: -45, dy: 40, color: "#a855f7" },
        { dx: 40, dy: -40, color: "#38bdf8" },
        { dx: 50, dy: 45, color: "#f97316" }
      ]
    },
    {
      text: "What is AI's impact on society?",
      xPct: 0.16,
      yPct: 0.76,
      nodes: [
        { dx: -40, dy: -45, color: "#e11d48" },
        { dx: 50, dy: -40, color: "#10b981" },
        { dx: 35, dy: 40, color: "#6366f1" }
      ]
    },
    {
      text: "How does AI affect the economy?",
      xPct: 0.82,
      yPct: 0.78,
      nodes: [
        { dx: -50, dy: -35, color: "#ec4899" },
        { dx: 40, dy: -40, color: "#06b6d4" },
        { dx: -35, dy: 45, color: "#8b5cf6" }
      ]
    }
  ];

  let currentExpand = 0;

  function animate() {
    // Lerp scroll progress
    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;

    ctx.clearRect(0, 0, width, height);

    // Expand factor driven by scroll position + hover state
    const targetExpand = (mouse.active ? 1.0 : 0.7) * currentScrollProgress;
    currentExpand += (targetExpand - currentExpand) * 0.06;

    if (currentExpand > 0.02) {
      const data = questions.map(q => {
        const qx = q.xPct * width;
        const qy = q.yPct * height;

        const children = q.nodes.map(n => ({
          x: qx + n.dx * currentExpand,
          y: qy + n.dy * currentExpand,
          color: n.color
        }));

        return { text: q.text, x: qx, y: qy, children };
      });

      data.forEach(group => {
        group.children.forEach(child => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(group.x, group.y);
          ctx.lineTo(child.x, child.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.22 * currentExpand})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          ctx.save();
          const tileW = 24 * Math.max(0.4, currentExpand);
          const tileH = 30 * Math.max(0.4, currentExpand);
          ctx.fillStyle = child.color;
          ctx.globalAlpha = 0.75 * currentExpand;
          ctx.fillRect(child.x - tileW / 2, child.y - tileH / 2, tileW, tileH);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(child.x - tileW / 2, child.y - tileH / 2, tileW, tileH);
          ctx.restore();
        });

        // Question Node Dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(group.x, group.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.fill();

        // Question Label Text
        ctx.font = "400 14px 'Times New Roman', Georgia, serif";
        ctx.fillStyle = `rgba(248, 250, 252, ${0.85 * currentExpand})`;
        ctx.textAlign = group.x < width / 2 ? "left" : "right";
        ctx.fillText(group.text, group.x + (group.x < width / 2 ? 12 : -12), group.y + 4);
        ctx.restore();
      });

      // Mouse Spring Line
      if (mouse.active) {
        data.forEach(group => {
          const dx = mouse.x - group.x;
          const dy = mouse.y - group.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(group.x, group.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - dist / 220)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
