/**
 * QuantaForze - Minimalist 3D Geometric Mesh Canvas Engine
 * Ultra-sleek Monochrome Silver & Diamond White 3D Wireframe Surface
 */

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement || document.body;

  let width = (canvas.width = parent.clientWidth || window.innerWidth);
  let height = (canvas.height = parent.clientHeight || 800);

  let mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    tiltX: 0,
    tiltY: 0
  };

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = parent.clientWidth || window.innerWidth;
    height = canvas.height = parent.clientHeight || 800;
    initMesh();
  });

  // Construct 3D Geometric Mesh Terrain
  let gridPoints = [];
  let faces = [];
  let edges = [];

  const cols = 15;
  const rows = 10;
  const spacingX = 135;
  const spacingZ = 115;

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
        
        // Dynamic wave elevation
        const distFromCenter = Math.sqrt(x * x + z * z);
        const y = Math.cos(distFromCenter * 0.0032) * 110 - Math.sin(c * 0.45) * 32;

        gridPoints.push({ x, y, z, baseY: y, c, r });
      }
    }

    // Build triangular faces & wireframe edges
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const i1 = r * cols + c;
        const i2 = r * cols + (c + 1);
        const i3 = (r + 1) * cols + c;
        const i4 = (r + 1) * cols + (c + 1);

        // Triangles
        faces.push([i1, i2, i3]);
        faces.push([i2, i4, i3]);

        // Edges
        edges.push([i1, i2]);
        edges.push([i1, i3]);
        edges.push([i2, i4]);
        edges.push([i3, i4]);
        edges.push([i2, i3]);
      }
    }
  }

  initMesh();

  let time = 0;

  function rotateX(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: p.x,
      y: p.y * cos - p.z * sin,
      z: p.y * sin + p.z * cos
    };
  }

  function rotateY(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: p.x * cos + p.z * sin,
      y: p.y,
      z: -p.x * sin + p.z * cos
    };
  }

  function animate() {
    time += 0.012;

    // Smooth lerp mouse positioning
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Bounded tilt angle
    const targetTiltX = 0.38 + (mouse.y - height / 2) * 0.0003;
    const targetTiltY = (mouse.x - width / 2) * 0.0003;
    mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
    mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const focalLength = 850;
    const centerY = height * 0.62;

    // Transform 3D points
    const projected = gridPoints.map(p => {
      const waveY = p.baseY + Math.sin(time + p.c * 0.25 + p.r * 0.35) * 14;
      
      let rot = { x: p.x, y: waveY, z: p.z };
      rot = rotateX(rot, mouse.tiltX);
      rot = rotateY(rot, mouse.tiltY + Math.sin(time * 0.18) * 0.1);

      const zWorld = rot.z + 780;
      const scale = focalLength / Math.max(zWorld, 100);

      return {
        x: width / 2 + rot.x * scale,
        y: centerY + rot.y * scale,
        z: rot.z,
        scale: scale
      };
    });

    // 1. Draw Subtle Facet Shades
    faces.forEach(([i1, i2, i3]) => {
      const p1 = projected[i1];
      const p2 = projected[i2];
      const p3 = projected[i3];

      const avgZ = (p1.z + p2.z + p3.z) / 3;
      const faceAlpha = Math.max(0.015, Math.min(0.2, (avgZ + 400) / 750));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      ctx.fillStyle = `rgba(255, 255, 255, ${faceAlpha})`;
      ctx.fill();
      ctx.restore();
    });

    // 2. Draw Pristine Silver-White Metallic Wireframe Lines
    edges.forEach(([i, j]) => {
      const p1 = projected[i];
      const p2 = projected[j];

      const avgZ = (p1.z + p2.z) / 2;
      const lineAlpha = Math.max(0.1, Math.min(0.85, (avgZ + 400) / 620));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      // Silver White Metallic Gradient
      const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      lineGrad.addColorStop(0, `rgba(255, 255, 255, ${lineAlpha})`);
      lineGrad.addColorStop(0.5, `rgba(226, 232, 240, ${lineAlpha * 0.85})`);
      lineGrad.addColorStop(1, `rgba(148, 163, 184, ${lineAlpha * 0.7})`);

      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = Math.max(1, 2.4 * ((p1.scale + p2.scale) / 2));
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw Specular Diamond White Joint Beads
    projected.forEach(p => {
      const nodeAlpha = Math.max(0.25, Math.min(0.95, (p.z + 400) / 580));
      const radius = Math.max(2, 4.8 * p.scale);

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha})`;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10 * p.scale;
      ctx.fill();

      // Specular Highlight
      ctx.beginPath();
      ctx.arc(p.x - radius * 0.25, p.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
