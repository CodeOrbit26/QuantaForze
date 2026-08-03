/**
 * QuantaForze - 3D Metallic Geometric Lattice Surface Canvas Engine
 * Renders a copper/rose-gold 3D wireframe landscape mesh with shiny sphere nodes & dark faceted polygons.
 * Fixed mouse target bounding to prevent vertical grid tilting during page scroll.
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
    tiltX: 0.32,
    tiltY: 0
  };

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Clamp mouse positions strictly within canvas bounds so scroll position never distorts the tilt!
    mouse.targetX = Math.max(0, Math.min(width, e.clientX - rect.left));
    mouse.targetY = Math.max(0, Math.min(height, e.clientY - rect.top));
  });

  window.addEventListener('resize', () => {
    width = canvas.width = parent.clientWidth || window.innerWidth;
    height = canvas.height = parent.clientHeight || 800;
    initMesh();
  });

  // Construct 3D Geometric Terrain/Structure Grid
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
        
        // Geometric dome/wave elevation
        const distFromCenter = Math.sqrt(x * x + z * z);
        const y = Math.cos(distFromCenter * 0.003) * 110 - Math.sin(c * 0.5) * 35;

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
        edges.push([i2, i3]); // Diagonal strut
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
    time += 0.015;

    // Smooth lerp mouse positioning
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Strictly bounded tilt angles (prevents grid from standing up vertically on scroll)
    const clampedY = Math.max(0, Math.min(height, mouse.y));
    const clampedX = Math.max(0, Math.min(width, mouse.x));

    const targetTiltX = 0.32 + (clampedY - height / 2) * 0.00015;
    const targetTiltY = (clampedX - width / 2) * 0.00015;
    
    mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
    mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const focalLength = 800;
    const centerY = height * 0.65;

    // Transform all 3D points
    const projected = gridPoints.map(p => {
      // Dynamic organic wave motion
      const waveY = p.baseY + Math.sin(time + p.c * 0.3 + p.r * 0.4) * 18;
      
      let rot = { x: p.x, y: waveY, z: p.z };
      rot = rotateX(rot, mouse.tiltX);
      rot = rotateY(rot, mouse.tiltY + Math.sin(time * 0.2) * 0.15);

      const zWorld = rot.z + 750;
      const scale = focalLength / Math.max(zWorld, 100);

      return {
        x: width / 2 + rot.x * scale,
        y: centerY + rot.y * scale,
        z: rot.z,
        scale: scale
      };
    });

    // 1. Draw Dark Faceted Geometric Polygons (Depth Faces)
    faces.forEach(([i1, i2, i3]) => {
      const p1 = projected[i1];
      const p2 = projected[i2];
      const p3 = projected[i3];

      const avgZ = (p1.z + p2.z + p3.z) / 3;
      const faceAlpha = Math.max(0.02, Math.min(0.4, (avgZ + 400) / 700));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      ctx.fillStyle = `rgba(18, 22, 32, ${faceAlpha})`;
      ctx.fill();
      ctx.restore();
    });

    // 2. Draw Copper / Rose-Gold Metallic Wireframe Lines
    edges.forEach(([i, j]) => {
      const p1 = projected[i];
      const p2 = projected[j];

      const avgZ = (p1.z + p2.z) / 2;
      const lineAlpha = Math.max(0.1, Math.min(0.85, (avgZ + 400) / 650));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      // Rose Gold Metallic Gradient
      const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      lineGrad.addColorStop(0, `rgba(217, 119, 6, ${lineAlpha})`);
      lineGrad.addColorStop(0.5, `rgba(245, 158, 11, ${lineAlpha * 0.9})`);
      lineGrad.addColorStop(1, `rgba(180, 83, 9, ${lineAlpha})`);

      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = Math.max(1, 2.8 * ((p1.scale + p2.scale) / 2));
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw Shiny Metallic Joint Spheres (Beads)
    projected.forEach(p => {
      const nodeAlpha = Math.max(0.2, Math.min(0.95, (p.z + 400) / 600));
      const radius = Math.max(2, 5 * p.scale);

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

      // Copper/Gold Metallic Shading
      ctx.fillStyle = `rgba(251, 191, 36, ${nodeAlpha})`;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowBlur = 10 * p.scale;
      ctx.fill();

      // Specular Highlight Bead
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
