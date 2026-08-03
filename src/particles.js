/**
 * QuantaForze - 3D Metallic Geometric Lattice Surface Canvas Engine
 * Renders a copper/rose-gold 3D wireframe landscape mesh with shiny sphere nodes & dark faceted polygons.
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
    tiltX: 0.35,
    tiltY: 0
  };

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Only track relative mouse position when canvas is visible in viewport
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const relX = Math.max(0, Math.min(width, e.clientX - rect.left));
      const relY = Math.max(0, Math.min(height, e.clientY - rect.top));
      mouse.targetX = relX;
      mouse.targetY = relY;
    }
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

    // Smooth lerp mouse positioning within bounded limits
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Strictly bounded tilt angles to prevent vertical stretching during scrolling
    const targetTiltX = 0.35 + (mouse.y - height / 2) * 0.0001;
    const targetTiltY = (mouse.x - width / 2) * 0.0001;
    mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
    mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const focalLength = 800;
    const centerY = height * 0.62;

    // Transform all 3D points
    const projected = gridPoints.map(p => {
      // Dynamic organic wave motion
      const waveY = p.baseY + Math.sin(time + p.c * 0.3 + p.r * 0.4) * 18;
      
      let rot = { x: p.x, y: waveY, z: p.z };
      rot = rotateX(rot, mouse.tiltX);
      rot = rotateY(rot, mouse.tiltY + Math.sin(time * 0.2) * 0.12);

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
      const faceAlpha = Math.max(0.02, Math.min(0.35, (avgZ + 400) / 700));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      // Shiny metallic gradient fill
      const grad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
      grad.addColorStop(0, `rgba(224, 150, 70, ${faceAlpha * 0.35})`);
      grad.addColorStop(0.5, `rgba(40, 30, 20, ${faceAlpha * 0.8})`);
      grad.addColorStop(1, `rgba(15, 20, 30, ${faceAlpha})`);

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });

    // 2. Draw Copper/Gold Wireframe Strut Lines
    edges.forEach(([i1, i2]) => {
      const p1 = projected[i1];
      const p2 = projected[i2];

      const avgZ = (p1.z + p2.z) / 2;
      const edgeAlpha = Math.max(0.1, Math.min(0.85, (avgZ + 450) / 600));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      // Gold/Bronze metallic stroke
      ctx.strokeStyle = `rgba(245, 175, 85, ${edgeAlpha * 0.75})`;
      ctx.lineWidth = Math.max(0.7, 1.3 * p1.scale);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw Shiny Nodes / Spheres at Vertices
    projected.forEach(p => {
      const nodeAlpha = Math.max(0.2, Math.min(1.0, (p.z + 450) / 550));
      const radius = Math.max(2, 4.5 * p.scale);

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 160, ${nodeAlpha})`;
      ctx.shadowColor = "rgba(255, 180, 80, 0.9)";
      ctx.shadowBlur = 12 * p.scale;
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
