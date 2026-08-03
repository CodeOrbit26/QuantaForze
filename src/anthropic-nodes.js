/**
 * QuantaForze - Anthropic-Style Interactive Research Node Map Canvas
 * Interactive mind-map node network connecting research questions and floating thumbnails.
 */

export function initAnthropicNodes() {
  const card = document.getElementById('anthropic-research-card');
  const canvas = document.getElementById('anthropic-node-canvas');
  if (!card || !canvas) return;

  const ctx = canvas.getContext('2d');

  let width = (canvas.width = card.clientWidth);
  let height = (canvas.height = card.clientHeight);

  let mouse = {
    x: -1000,
    y: -1000,
    active: false
  };

  card.addEventListener('mouseenter', () => { mouse.active = true; });
  card.addEventListener('mouseleave', () => { mouse.active = false; mouse.x = -1000; mouse.y = -1000; });
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = card.clientWidth;
    height = canvas.height = card.clientHeight;
  });

  // Nodes dataset matching Anthropic research questions structure
  const questions = [
    {
      text: "How do parallel agents collaborate?",
      xPct: 0.18,
      yPct: 0.38,
      nodes: [
        { dx: -60, dy: -50, label: "Harness Sync", icon: "⚡" },
        { dx: 50, dy: -65, label: "Agent Lock", icon: "🔒" },
        { dx: 60, dy: 45, label: "Memory Pool", icon: "🧠" },
        { dx: -70, dy: 55, label: "IPC Pipeline", icon: "🔄" }
      ]
    },
    {
      text: "Who governs AI execution?",
      xPct: 0.78,
      yPct: 0.22,
      nodes: [
        { dx: -55, dy: 40, label: "Sandbox Policy", icon: "🛡️" },
        { dx: 60, dy: -35, label: "Audit Log", icon: "📜" },
        { dx: 65, dy: 45, label: "Rate Limit", icon: "⏱️" }
      ]
    },
    {
      text: "What is AI's impact on software?",
      xPct: 0.25,
      yPct: 0.78,
      nodes: [
        { dx: -65, dy: -45, label: "Zero Friction", icon: "🚀" },
        { dx: 60, dy: -50, label: "Code Quality", icon: "✨" },
        { dx: 55, dy: 40, label: "Developer Velocity", icon: "📈" }
      ]
    },
    {
      text: "How does agent memory scale?",
      xPct: 0.80,
      yPct: 0.78,
      nodes: [
        { dx: -50, dy: -45, label: "Context Window", icon: "🗂️" },
        { dx: 55, dy: -50, label: "Vector Search", icon: "🔍" },
        { dx: -55, dy: 40, label: "State Graph", icon: "🌐" }
      ]
    }
  ];

  // Calculate pixel positions
  function getPositions() {
    return questions.map(q => {
      const qx = q.xPct * width;
      const qy = q.yPct * height;

      const children = q.nodes.map(n => ({
        x: qx + n.dx,
        y: qy + n.dy,
        label: n.label,
        icon: n.icon
      }));

      return { text: q.text, x: qx, y: qy, children };
    });
  }

  let hoverAlpha = 0.35;

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Fade in line opacity when hovered
    const targetAlpha = mouse.active ? 0.9 : 0.4;
    hoverAlpha += (targetAlpha - hoverAlpha) * 0.08;

    const data = getPositions();

    data.forEach(group => {
      // Draw line connecting question to central area
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(group.x, group.y);
      ctx.lineTo(width / 2, height / 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${hoverAlpha * 0.15})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();

      // Draw child node connecting lines & icons
      group.children.forEach(child => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(group.x, group.y);
        ctx.lineTo(child.x, child.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${hoverAlpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Draw child thumbnail badge
        ctx.save();
        ctx.beginPath();
        ctx.arc(child.x, child.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(child.icon, child.x, child.y);
        ctx.restore();
      });

      // Draw question node label
      ctx.save();
      ctx.font = "400 15px 'Instrument Serif', Georgia, serif";
      ctx.fillStyle = `rgba(248, 250, 252, ${hoverAlpha * 0.9})`;
      ctx.textAlign = "center";
      ctx.fillText(group.text, group.x, group.y + 24);

      // Node point
      ctx.beginPath();
      ctx.arc(group.x, group.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    });

    // Draw mouse interaction spring line
    if (mouse.active) {
      data.forEach(group => {
        const dx = mouse.x - group.x;
        const dy = mouse.y - group.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(group.x, group.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - dist / 180)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    requestAnimationFrame(animate);
  }

  animate();
}
