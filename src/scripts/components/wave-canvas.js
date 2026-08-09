/* ================================================================
   3D LIGHT THEME WAVE TERRAIN CANVAS (quantaforze.vercel.app exact)
   Wide-screen grid terrain with crisp #373737 wireframe & #fc4778 pink nodes
   ================================================================ */

function initParticleCanvas() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const container = canvas.parentElement || document.body;

  let width = canvas.width = container.clientWidth || window.innerWidth;
  let height = canvas.height = container.clientHeight || 800;
  let isVisible = true;
  let animFrame = null;

  let mouseState = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    tiltX: 0.35,
    tiltY: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animFrame) {
        animFrame = requestAnimationFrame(renderFrame);
      }
    });
  }, { threshold: 0 });
  observer.observe(canvas);

  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseState.targetX = Math.max(0, Math.min(width, e.clientX - rect.left));
    mouseState.targetY = Math.max(0, Math.min(height, e.clientY - rect.top));
  }, { passive: true });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = container.clientWidth || window.innerWidth;
      height = canvas.height = container.clientHeight || 800;
      buildGrid();
    }, 150);
  });

  let points = [];
  let triangles = [];
  let lines = [];

  // Expanded 16x10 grid matrix for full-width coverage
  const cols = 16;
  const rows = 10;
  const spacingX = 155;
  const spacingZ = 125;

  function buildGrid() {
    points = [];
    triangles = [];
    lines = [];

    const totalW = (cols - 1) * spacingX;
    const totalH = (rows - 1) * spacingZ;
    const startX = -totalW / 2;
    const startZ = -totalH / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX;
        const z = startZ + r * spacingZ;
        const dist = Math.sqrt(x * x + z * z);
        const baseY = Math.cos(dist * 0.0028) * 115 - Math.sin(c * 0.45) * 38;
        points.push({ x, y: baseY, z, baseY, c, r });
      }
    }

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const p1 = r * cols + c;
        const p2 = r * cols + (c + 1);
        const p3 = (r + 1) * cols + c;
        const p4 = (r + 1) * cols + (c + 1);

        triangles.push([p1, p2, p3]);
        triangles.push([p2, p4, p3]);

        lines.push([p1, p2]);
        lines.push([p1, p3]);
        lines.push([p2, p4]);
        lines.push([p3, p4]);
        lines.push([p2, p3]);
      }
    }
  }

  buildGrid();

  let time = 0;

  function renderFrame() {
    if (!isVisible) {
      animFrame = null;
      return;
    }

    time += 0.015;

    mouseState.x += (mouseState.targetX - mouseState.x) * 0.05;
    mouseState.y += (mouseState.targetY - mouseState.y) * 0.05;

    const clampedY = Math.max(0, Math.min(height, mouseState.y));
    const clampedX = Math.max(0, Math.min(width, mouseState.x));
    const targetTiltX = 0.34 + (clampedY - height / 2) * 0.00016;
    const targetTiltY = (clampedX - width / 2) * 0.00016;

    mouseState.tiltX += (targetTiltX - mouseState.tiltX) * 0.05;
    mouseState.tiltY += (targetTiltY - mouseState.tiltY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const fov = 850;
    const centerY = height * 0.54;

    const cosX = Math.cos(mouseState.tiltX);
    const sinX = Math.sin(mouseState.tiltX);
    const rotY = mouseState.tiltY + Math.sin(time * 0.2) * 0.15;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const projected = new Array(points.length);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const animatedY = p.baseY + Math.sin(time + p.c * 0.28 + p.r * 0.38) * 22;

      const px = p.x;
      const py = animatedY * cosX - p.z * sinX;
      const pz = animatedY * sinX + p.z * cosX;

      const worldX = px * cosY + pz * sinY;
      const worldY = py;
      const worldZ = -px * sinY + pz * cosY;

      const distZ = worldZ + 720;
      const scale = fov / Math.max(distZ, 100);

      projected[i] = {
        x: width / 2 + worldX * scale,
        y: centerY + worldY * scale,
        z: worldZ,
        scale
      };
    }

    // 1. Light Facet Fill
    for (let i = 0; i < triangles.length; i++) {
      const [idxA, idxB, idxC] = triangles[i];
      const pA = projected[idxA];
      const pB = projected[idxB];
      const pC = projected[idxC];

      const avgZ = (pA.z + pB.z + pC.z) / 3;
      const alpha = Math.max(0.02, Math.min(0.2, (avgZ + 400) / 950));

      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.fill();
    }

    // 2. Wireframe Warm Bronze/Amber Grid Lines
    for (let i = 0; i < lines.length; i++) {
      const [idxA, idxB] = lines[i];
      const pA = projected[idxA];
      const pB = projected[idxB];

      const avgZ = (pA.z + pB.z) / 2;
      const alpha = Math.max(0.12, Math.min(0.55, (avgZ + 450) / 750));
      const avgScale = (pA.scale + pB.scale) / 2;

      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.strokeStyle = `rgba(212, 125, 20, ${alpha.toFixed(2)})`;
      ctx.lineWidth = Math.max(1, 2.4 * avgScale);
      ctx.stroke();
    }

    // 3. Glowing Amber/Gold Node Dots
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const alpha = Math.max(0.35, Math.min(0.98, (p.z + 450) / 600));
      const radius = Math.max(2.8, 6.2 * p.scale);

      // Amber/Gold Accent Outer Glow Circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 165, 30, ${alpha.toFixed(2)})`;
      ctx.fill();

      // Inner Warm Gold Core Highlight Spot
      ctx.beginPath();
      ctx.arc(p.x - radius * 0.25, p.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 175, ${(alpha * 0.9).toFixed(2)})`;
      ctx.fill();
    }

    animFrame = requestAnimationFrame(renderFrame);
  }

  animFrame = requestAnimationFrame(renderFrame);
}

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
});
