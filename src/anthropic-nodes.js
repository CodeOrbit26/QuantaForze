/**
 * QuantaForze - Anthropic-Style Interactive Node Map Canvas
 * Recreates the exact Anthropic research mind-map layout with earthy muted tones & organic spring interaction.
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

  // Anthropic exact questions & earthy color palette
  const questions = [
    {
      text: "How does AI work?",
      xPct: 0.15,
      yPct: 0.35,
      nodes: [
        { dx: -45, dy: -55, color: "#cc785c" },
        { dx: 50, dy: -45, color: "#849670" },
        { dx: -55, dy: 40, color: "#607d8b" },
        { dx: 45, dy: 50, color: "#d4a359" }
      ]
    },
    {
      text: "Who should govern AI?",
      xPct: 0.82,
      yPct: 0.22,
      nodes: [
        { dx: -45, dy: 45, color: "#cc785c" },
        { dx: 40, dy: -40, color: "#849670" },
        { dx: 50, dy: 45, color: "#d4a359" }
      ]
    },
    {
      text: "What is AI's impact on society?",
      xPct: 0.16,
      yPct: 0.78,
      nodes: [
        { dx: -40, dy: -45, color: "#607d8b" },
        { dx: 50, dy: -40, color: "#849670" },
        { dx: 35, dy: 40, color: "#cc785c" }
      ]
    },
    {
      text: "How does AI affect the economy?",
      xPct: 0.83,
      yPct: 0.78,
      nodes: [
        { dx: -50, dy: -35, color: "#d4a359" },
        { dx: 40, dy: -40, color: "#607d8b" },
        { dx: -35, dy: 45, color: "#849670" }
      ]
    }
  ];

  let expand = 0.35;

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const targetExpand = mouse.active ? 1 : 0.4;
    expand += (targetExpand - expand) * 0.05;

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
      // Connect line to corner nodes
      group.children.forEach(child => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(group.x, group.y);
        ctx.lineTo(child.x, child.y);
        ctx.strokeStyle = `rgba(245, 244, 239, ${0.18 * expand})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Draw Anthropic image thumbnail card
        ctx.save();
        const tileW = 26 * Math.max(0.6, expand);
        const tileH = 32 * Math.max(0.6, expand);
        ctx.fillStyle = child.color;
        ctx.globalAlpha = 0.7 * expand;
        ctx.fillRect(child.x - tileW / 2, child.y - tileH / 2, tileW, tileH);
        ctx.strokeStyle = "rgba(245, 244, 239, 0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(child.x - tileW / 2, child.y - tileH / 2, tileW, tileH);
        ctx.restore();
      });

      // Question Node Dot
      ctx.save();
      ctx.beginPath();
      ctx.arc(group.x, group.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f5f4ef";
      ctx.shadowColor = "#f5f4ef";
      ctx.shadowBlur = 6;
      ctx.fill();

      // Question Label Text
      ctx.font = "400 14px 'Times New Roman', Georgia, serif";
      ctx.fillStyle = `rgba(245, 244, 239, ${0.45 + 0.45 * expand})`;
      ctx.textAlign = group.x < width / 2 ? "left" : "right";
      ctx.fillText(group.text, group.x + (group.x < width / 2 ? 12 : -12), group.y + 4);
      ctx.restore();
    });

    // Spring line to mouse cursor
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
          ctx.strokeStyle = `rgba(245, 244, 239, ${0.3 * (1 - dist / 220)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    requestAnimationFrame(animate);
  }

  animate();
}
