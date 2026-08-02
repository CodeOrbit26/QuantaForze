/**
 * QuantaForze - 3D Wireframe Geometric Polyhedron Canvas Engine
 * Renders rotating 3D geodesic wireframe structures with metallic joint nodes and interactive mouse tilt tracking.
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
    targetY: height / 2
  };

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = parent.clientWidth || window.innerWidth;
    height = canvas.height = parent.clientHeight || 800;
  });

  // Generate 3D Geodesic Icosahedron Vertices & Edges
  function createPolyhedron(radius, detail = 1) {
    const t = (1 + Math.sqrt(5)) / 2;
    let rawVerts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];

    // Normalize vertices to radius
    let vertices = rawVerts.map(v => {
      const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      return [ (v[0] / len) * radius, (v[1] / len) * radius, (v[2] / len) * radius ];
    });

    // Build edges array
    let edges = [];
    const threshold = radius * 1.15;
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dx = vertices[i][0] - vertices[j][0];
        const dy = vertices[i][1] - vertices[j][1];
        const dz = vertices[i][2] - vertices[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          edges.push([i, j]);
        }
      }
    }

    return { vertices, edges };
  }

  const polyLeft = createPolyhedron(Math.min(width, height) * 0.38);
  const polyRight = createPolyhedron(Math.min(width, height) * 0.42);

  let angleX = 0;
  let angleY = 0;

  function rotateX(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
  }

  function rotateY(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
  }

  function rotateZ(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos, v[2]];
  }

  function animate() {
    // Smooth lerp mouse target
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // Continuous rotation influenced by mouse cursor position
    const mouseOffsetX = (mouse.x - width / 2) * 0.0003;
    const mouseOffsetY = (mouse.y - height / 2) * 0.0003;

    angleX += 0.003 + mouseOffsetY;
    angleY += 0.004 + mouseOffsetX;

    const focalLength = 800;

    function drawPolyhedronMesh(poly, centerX, centerY, rotXSpeed, rotYSpeed, isLeft) {
      const rotVerts = poly.vertices.map(v => {
        let r = rotateX(v, angleX * rotXSpeed);
        r = rotateY(r, angleY * rotYSpeed);
        r = rotateZ(r, angleX * 0.5);
        return r;
      });

      // Project 3D points to 2D
      const projPoints = rotVerts.map(v => {
        const z = v[2] + 400;
        const scale = focalLength / z;
        return {
          x: centerX + v[0] * scale,
          y: centerY + v[1] * scale,
          z: v[2],
          scale: scale
        };
      });

      // Draw wireframe connecting lines
      poly.edges.forEach(([i, j]) => {
        const p1 = projPoints[i];
        const p2 = projPoints[j];

        // Depth sorting opacity calculation
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.08, Math.min(0.85, (avgZ + 250) / 400));

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        // Metallic Silver/Rose Bronze gradient line
        const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        lineGrad.addColorStop(0, `rgba(226, 232, 240, ${alpha})`);
        lineGrad.addColorStop(0.5, `rgba(203, 213, 225, ${alpha * 0.9})`);
        lineGrad.addColorStop(1, `rgba(148, 163, 184, ${alpha})`);

        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = Math.max(1, 2.5 * ((p1.scale + p2.scale) / 2));
        ctx.stroke();
        ctx.restore();
      });

      // Draw glowing joint sphere nodes
      projPoints.forEach(p => {
        const nodeAlpha = Math.max(0.2, Math.min(0.95, (p.z + 250) / 380));
        const nodeRadius = Math.max(2, 5.5 * p.scale);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha})`;
        ctx.shadowBlur = 12 * p.scale;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        // Inner core highlight
        ctx.beginPath();
        ctx.arc(p.x - nodeRadius * 0.25, p.y - nodeRadius * 0.25, nodeRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      });
    }

    // Render left 3D polyhedron structure (partially extending off left edge)
    drawPolyhedronMesh(polyLeft, -width * 0.05, height * 0.45, 1, 1.2, true);

    // Render right 3D polyhedron structure (partially extending off right edge)
    drawPolyhedronMesh(polyRight, width * 1.05, height * 0.55, -0.8, -1, false);

    requestAnimationFrame(animate);
  }

  animate();
}
