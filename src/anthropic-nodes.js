/**
 * QuantaForze - Anthropic Full-Screen Scroll Expansion Canvas Engine
 * Performance-optimized: visibility-paused, no per-element save/restore.
 */

export function initAnthropicNodes() {
  const card = document.getElementById('anthropic-research-card');
  const canvas = document.getElementById('anthropic-node-canvas');
  if (!card || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });

  let width = (canvas.width = card.clientWidth);
  let height = (canvas.height = card.clientHeight);
  let isVisible = false;
  let animFrameId = null;

  let mouse = {
    x: width / 2,
    y: height / 2,
    active: false
  };

  let scrollRatio = 0;

  // IntersectionObserver for visibility & scroll detection
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
        scrollRatio = 1;
        card.classList.add('in-view');
      } else if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
        scrollRatio = 0;
        card.classList.remove('in-view');
      }
      // Start animation if visible and not already running
      if (isVisible && !animFrameId) {
        animFrameId = requestAnimationFrame(animate);
      }
    });
  }, {
    threshold: [0, 0.2, 0.45, 0.6, 0.8, 1.0]
  });

  observer.observe(card);

  card.addEventListener('mouseenter', () => { mouse.active = true; });
  card.addEventListener('mouseleave', () => { mouse.active = false; });
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      width = canvas.width = card.clientWidth;
      height = canvas.height = card.clientHeight;
    }, 150);
  });

  // Questions and node clusters
  const questions = [
    {
      text: "How does AI work?",
      xPct: 0.16, yPct: 0.32,
      nodes: [
        { dx: -50, dy: -60, color: "#38bdf8" },
        { dx: 55, dy: -50, color: "#4ade80" },
        { dx: -65, dy: 40, color: "#f43f5e" },
        { dx: 50, dy: 55, color: "#fbbf24" }
      ]
    },
    {
      text: "Who should govern AI?",
      xPct: 0.84, yPct: 0.24,
      nodes: [
        { dx: -55, dy: 50, color: "#a855f7" },
        { dx: 50, dy: -45, color: "#38bdf8" },
        { dx: 60, dy: 50, color: "#f97316" }
      ]
    },
    {
      text: "What is AI's impact on society?",
      xPct: 0.18, yPct: 0.78,
      nodes: [
        { dx: -50, dy: -55, color: "#e11d48" },
        { dx: 60, dy: -45, color: "#10b981" },
        { dx: 45, dy: 50, color: "#6366f1" }
      ]
    },
    {
      text: "How does AI affect the economy?",
      xPct: 0.82, yPct: 0.78,
      nodes: [
        { dx: -60, dy: -45, color: "#ec4899" },
        { dx: 50, dy: -50, color: "#06b6d4" },
        { dx: -45, dy: 50, color: "#8b5cf6" }
      ]
    }
  ];

  let expand = 0;

  // Throttled canvas resize (only check every ~60 frames instead of every frame)
  let resizeCheckCounter = 0;

  function animate() {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    // Check canvas size every 60 frames instead of every frame
    resizeCheckCounter++;
    if (resizeCheckCounter >= 60) {
      resizeCheckCounter = 0;
      if (canvas.width !== card.clientWidth || canvas.height !== card.clientHeight) {
        width = canvas.width = card.clientWidth;
        height = canvas.height = card.clientHeight;
      }
    }

    ctx.clearRect(0, 0, width, height);

    // Smooth expand interpolation
    const targetExpand = mouse.active ? 1.0 : (scrollRatio > 0 ? scrollRatio : 0);
    expand += (targetExpand - expand) * 0.05;

    if (expand > 0.02) {
      // Batch connecting lines
      ctx.lineWidth = 1;
      for (let q = 0; q < questions.length; q++) {
        const group = questions[q];
        const qx = group.xPct * width;
        const qy = group.yPct * height;

        // Draw connecting lines
        ctx.strokeStyle = `rgba(255,255,255,${(0.25 * expand).toFixed(2)})`;
        ctx.beginPath();
        for (let n = 0; n < group.nodes.length; n++) {
          const node = group.nodes[n];
          const cx = qx + node.dx * expand;
          const cy = qy + node.dy * expand;
          ctx.moveTo(qx, qy);
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Draw tiles
        const tileW = 28 * Math.max(0.4, expand);
        const tileH = 34 * Math.max(0.4, expand);
        const tileAlpha = 0.75 * expand;

        for (let n = 0; n < group.nodes.length; n++) {
          const node = group.nodes[n];
          const cx = qx + node.dx * expand;
          const cy = qy + node.dy * expand;

          ctx.globalAlpha = tileAlpha;
          ctx.fillStyle = node.color;
          ctx.fillRect(cx - tileW / 2, cy - tileH / 2, tileW, tileH);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "rgba(255,255,255,0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - tileW / 2, cy - tileH / 2, tileW, tileH);
        }

        // Question dot
        ctx.beginPath();
        ctx.arc(qx, qy, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${expand.toFixed(2)})`;
        ctx.fill();

        // Question text
        ctx.font = "400 15px 'Times New Roman', Georgia, serif";
        ctx.fillStyle = `rgba(248,250,252,${(expand * 0.9).toFixed(2)})`;
        ctx.textAlign = qx < width / 2 ? "left" : "right";
        ctx.fillText(group.text, qx + (qx < width / 2 ? 14 : -14), qy + 4);
      }

      // Interactive spring line to cursor
      if (mouse.active) {
        for (let q = 0; q < questions.length; q++) {
          const qx = questions[q].xPct * width;
          const qy = questions[q].yPct * height;
          const dx = mouse.x - qx;
          const dy = mouse.y - qy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 240) {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(qx, qy);
            ctx.strokeStyle = `rgba(255,255,255,${(0.45 * (1 - dist / 240)).toFixed(2)})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
    }

    animFrameId = requestAnimationFrame(animate);
  }

  // Start only if visible
  if (isVisible) {
    animFrameId = requestAnimationFrame(animate);
  }
}
