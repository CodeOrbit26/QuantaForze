/**
 * QuantaForze - 3D Metallic Geometric Lattice Surface Canvas Engine
 * Performance-optimized: batched drawing, no per-element save/restore,
 * no per-edge gradients, visibility-paused via IntersectionObserver.
 */

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const parent = canvas.parentElement || document.body;

  let width = (canvas.width = parent.clientWidth || window.innerWidth);
  let height = (canvas.height = parent.clientHeight || 800);
  let isVisible = true;
  let animFrameId = null;

  let mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    tiltX: 0.32,
    tiltY: 0
  };

  // Pause animation when canvas is offscreen
  const visObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animFrameId) {
        animFrameId = requestAnimationFrame(animate);
      }
    });
  }, { threshold: 0 });
  visObserver.observe(canvas);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = Math.max(0, Math.min(width, e.clientX - rect.left));
    mouse.targetY = Math.max(0, Math.min(height, e.clientY - rect.top));
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      width = canvas.width = parent.clientWidth || window.innerWidth;
      height = canvas.height = parent.clientHeight || 800;
      initMesh();
    }, 150);
  });

  // Construct 3D Geometric Grid
  let gridPoints = [];
  let faces = [];
  let edges = [];

  const cols = 14;
  const rows = 9;
  const spacingX = 140;
  const spacingZ = 120;

  function initMesh() {
    gridPoints = [];
    faces = [];
    edges = [];

    const startX = -((cols - 1) * spacingX) / 2;
    const startZ = -((rows - 1) * spacingZ) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX;
        const z = startZ + r * spacingZ;
        const distFromCenter = Math.sqrt(x * x + z * z);
        const y = Math.cos(distFromCenter * 0.003) * 110 - Math.sin(c * 0.5) * 35;
        gridPoints.push({ x, y, z, baseY: y, c, r });
      }
    }

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const i1 = r * cols + c;
        const i2 = r * cols + (c + 1);
        const i3 = (r + 1) * cols + c;
        const i4 = (r + 1) * cols + (c + 1);
        faces.push([i1, i2, i3]);
        faces.push([i2, i4, i3]);
        edges.push([i1, i2]);
        edges.push([i1, i3]);
        edges.push([i2, i4]);
        edges.push([i3, i4]);
        edges.push([i2, i3]);
      }
    }
  }

  initMesh();

  // Pre-compute trig
  const cosTbl = new Float32Array(360);
  const sinTbl = new Float32Array(360);
  for (let i = 0; i < 360; i++) {
    const a = (i * Math.PI) / 180;
    cosTbl[i] = Math.cos(a);
    sinTbl[i] = Math.sin(a);
  }

  let time = 0;

  function animate() {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    time += 0.015;

    // Smooth lerp mouse positioning
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    const clampedY = Math.max(0, Math.min(height, mouse.y));
    const clampedX = Math.max(0, Math.min(width, mouse.x));

    const targetTiltX = 0.32 + (clampedY - height / 2) * 0.00015;
    const targetTiltY = (clampedX - width / 2) * 0.00015;

    mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
    mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const focalLength = 800;
    const centerY = height * 0.65;

    const cosX = Math.cos(mouse.tiltX);
    const sinX = Math.sin(mouse.tiltX);
    const rotYAngle = mouse.tiltY + Math.sin(time * 0.2) * 0.15;
    const cosY = Math.cos(rotYAngle);
    const sinY = Math.sin(rotYAngle);

    // Transform all 3D points (single pass, no per-point function calls)
    const projected = new Array(gridPoints.length);
    for (let i = 0; i < gridPoints.length; i++) {
      const p = gridPoints[i];
      const waveY = p.baseY + Math.sin(time + p.c * 0.3 + p.r * 0.4) * 18;

      // Inline rotateX
      const rx = p.x;
      const ry = waveY * cosX - p.z * sinX;
      const rz = waveY * sinX + p.z * cosX;

      // Inline rotateY
      const fx = rx * cosY + rz * sinY;
      const fy = ry;
      const fz = -rx * sinY + rz * cosY;

      const zWorld = fz + 750;
      const scale = focalLength / Math.max(zWorld, 100);

      projected[i] = {
        x: width / 2 + fx * scale,
        y: centerY + fy * scale,
        z: fz,
        scale: scale
      };
    }

    // 1. Batch draw all faces in a single path (no save/restore per face)
    for (let f = 0; f < faces.length; f++) {
      const [i1, i2, i3] = faces[f];
      const p1 = projected[i1];
      const p2 = projected[i2];
      const p3 = projected[i3];

      const avgZ = (p1.z + p2.z + p3.z) / 3;
      const faceAlpha = Math.max(0.02, Math.min(0.4, (avgZ + 400) / 700));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(18,22,32,${faceAlpha.toFixed(2)})`;
      ctx.fill();
    }

    // 2. Draw wireframe edges — flat color instead of per-edge gradient
    for (let e = 0; e < edges.length; e++) {
      const [i, j] = edges[e];
      const p1 = projected[i];
      const p2 = projected[j];

      const avgZ = (p1.z + p2.z) / 2;
      const lineAlpha = Math.max(0.1, Math.min(0.85, (avgZ + 400) / 650));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(217,119,6,${lineAlpha.toFixed(2)})`;
      ctx.lineWidth = Math.max(1, 2.8 * ((p1.scale + p2.scale) / 2));
      ctx.stroke();
    }

    // 3. Draw nodes — NO shadowBlur (biggest perf killer), simple filled circles
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const nodeAlpha = Math.max(0.2, Math.min(0.95, (p.z + 400) / 600));
      const radius = Math.max(2, 5 * p.scale);

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251,191,36,${nodeAlpha.toFixed(2)})`;
      ctx.fill();

      // Small specular highlight (no shadow)
      ctx.beginPath();
      ctx.arc(p.x - radius * 0.25, p.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(nodeAlpha * 0.6).toFixed(2)})`;
      ctx.fill();
    }

    animFrameId = requestAnimationFrame(animate);
  }

  animFrameId = requestAnimationFrame(animate);
}
