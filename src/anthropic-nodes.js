/**
 * QuantaForze - Anthropic Full-Screen Scroll Expansion Canvas Engine
 * Unscrolled: Compact card with headline text.
 * Scrolled into View / Hovered: Seamlessly expands to 100% full screen with ultra-smooth node network physics.
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

  let scrollRatio = 0;

  function updateScroll() {
    const rect = card.getBoundingClientRect();
    const windowH = window.innerHeight;
    
    // Calculate how far card is scrolled into center of screen
    const cardCenter = rect.top + rect.height / 2;
    const distFromCenter = Math.abs(windowH / 2 - cardCenter);
    const maxDist = windowH / 2 + rect.height / 2;

    if (rect.top < windowH && rect.bottom > 0) {
      scrollRatio = Math.max(0, Math.min(1, 1 - distFromCenter / (maxDist * 0.75)));
      if (scrollRatio > 0.25) {
        card.classList.add('in-view');
      } else {
        card.classList.remove('in-view');
      }
    } else {
      scrollRatio = 0;
      card.classList.remove('in-view');
    }
  }

  window.addEventListener('scroll', updateScroll);
  updateScroll();

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

  // Questions and node clusters
  const questions = [
    {
      text: "How does AI work?",
      xPct: 0.16,
      yPct: 0.32,
      nodes: [
        { dx: -50, dy: -60, color: "#38bdf8" },
        { dx: 55, dy: -50, color: "#4ade80" },
        { dx: -65, dy: 40, color: "#f43f5e" },
        { dx: 50, dy: 55, color: "#fbbf24" }
      ]
    },
    {
      text: "Who should govern AI?",
      xPct: 0.84,
      yPct: 0.24,
      nodes: [
        { dx: -55, dy: 50, color: "#a855f7" },
        { dx: 50, dy: -45, color: "#38bdf8" },
        { dx: 60, dy: 50, color: "#f97316" }
      ]
    },
    {
      text: "What is AI's impact on society?",
      xPct: 0.18,
      yPct: 0.78,
      nodes: [
        { dx: -50, dy: -55, color: "#e11d48" },
        { dx: 60, dy: -45, color: "#10b981" },
        { dx: 45, dy: 50, color: "#6366f1" }
      ]
    },
    {
      text: "How does AI affect the economy?",
      xPct: 0.82,
      yPct: 0.78,
      nodes: [
        { dx: -60, dy: -45, color: "#ec4899" },
        { dx: 50, dy: -50, color: "#06b6d4" },
        { dx: -45, dy: 50, color: "#8b5cf6" }
      ]
    }
  ];

  let expand = 0;

  function animate() {
    // Dynamic canvas resize check during smooth card transition
    if (canvas.width !== card.clientWidth || canvas.height !== card.clientHeight) {
      width = canvas.width = card.clientWidth;
      height = canvas.height = card.clientHeight;
    }

    ctx.clearRect(0, 0, width, height);

    // Smooth expand interpolation
    const targetExpand = mouse.active ? 1.0 : Math.max(0, (scrollRatio - 0.15) * 1.3);
    expand += (targetExpand - expand) * 0.05;

    if (expand > 0.02) {
      const data = questions.map(q => {
        const qx = q.xPct * width;
        const qy = q.yPct * height;

        const children = q.nodes.map(n => ({
          x: qx + n.dx * expand,
          y: qy + n.dy * expand,
          color: n.color
        }));

        return { text: q.text, x: qx, y: qy, children };
      });

      data.forEach(group => {
        // Connecting line web
        group.children.forEach(child => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(group.x, group.y);
          ctx.lineTo(child.x, child.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * expand})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // Thumbnail tiles
          ctx.save();
          const tileW = 28 * Math.max(0.4, expand);
          const tileH = 34 * Math.max(0.4, expand);
          ctx.fillStyle = child.color;
          ctx.globalAlpha = 0.75 * expand;
          ctx.fillRect(child.x - tileW / 2, child.y - tileH / 2, tileW, tileH);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(child.x - tileW / 2, child.y - tileH / 2, tileW, tileH);
          ctx.restore();
        });

        // Question Node Dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(group.x, group.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${expand})`;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10 * expand;
        ctx.fill();

        // Question Text Label
        ctx.font = "400 15px 'Times New Roman', Georgia, serif";
        ctx.fillStyle = `rgba(248, 250, 252, ${expand * 0.9})`;
        ctx.textAlign = group.x < width / 2 ? "left" : "right";
        ctx.fillText(group.text, group.x + (group.x < width / 2 ? 14 : -14), group.y + 4);
        ctx.restore();
      });

      // Interactive spring line to cursor
      if (mouse.active) {
        data.forEach(group => {
          const dx = mouse.x - group.x;
          const dy = mouse.y - group.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 240) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(group.x, group.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * (1 - dist / 240)})`;
            ctx.lineWidth = 1.2;
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
