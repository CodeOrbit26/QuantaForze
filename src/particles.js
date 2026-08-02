/**
 * QuantaForze - Elegant 3D Geodesic Metallic Wireframe Canvas Engine
 * Smooth constant rotation with bounded elastic mouse tilt (no infinite acceleration)
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
  });

  // Generate Subdivided Geodesic 3D Polyhedron Sphere Vertices & Edges
  function createGeodesicSphere(radius) {
    const t = (1 + Math.sqrt(5)) / 2;
    let baseVerts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];

    // Add midpoints for higher geometric density
    let vertices = [];
    baseVerts.forEach(v => {
      const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      vertices.push([ (v[0] / len) * radius, (v[1] / len) * radius, (v[2] / len) * radius ]);
    });

    // Add secondary layer vertices for rich wireframe complexity
    const count = vertices.length;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = vertices[i][0] - vertices[j][0];
        const dy = vertices[i][1] - vertices[j][1];
        const dz = vertices[i][2] - vertices[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < radius * 1.3) {
          const mx = (vertices[i][0] + vertices[j][0]) / 2;
          const my = (vertices[i][1] + vertices[j][1]) / 2;
          const mz = (vertices[i][2] + vertices[j][2]) / 2;
          const len = Math.sqrt(mx * mx + my * my + mz * mz);
          if (len > 0) {
            vertices.push([ (mx / len) * radius, (my / len) * radius, (mz / len) * radius ]);
          }
        }
      }
    }

    // Build unique edges between close vertices
    let edges = [];
    const threshold = radius * 0.72;
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

  const radiusLeft = Math.min(width, height) * 0.28;
  const radiusRight = Math.min(width, height) * 0.30;
  const polyLeft = createGeodesicSphere(radiusLeft);
  const polyRight = createGeodesicSphere(radiusRight);

  let baseAngleX = 0;
  let baseAngleY = 0;

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
    // Smooth lerp mouse positioning
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Calculate bounded tilt (fixed max angle, NO infinite acceleration)
    const targetTiltY = (mouse.x - width / 2) * 0.0004;
    const targetTiltX = (mouse.y - height / 2) * 0.0004;
    mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
    mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

    // Smooth steady constant base rotation speed
    baseAngleX += 0.0025;
    baseAngleY += 0.0035;

    ctx.clearRect(0, 0, width, height);

    const focalLength = 700;

    function renderPolyhedron(poly, centerX, centerY, speedMultX, speedMultY, isGold) {
      const currentRotX = baseAngleX * speedMultX + mouse.tiltX;
      const currentRotY = baseAngleY * speedMultY + mouse.tiltY;

      // Transform 3D Vertices
      const projected = poly.vertices.map(v => {
        let r = rotateX(v, currentRotX);
        r = rotateY(r, currentRotY);
        r = rotateZ(r, baseAngleX * 0.3);

        const z = r[2] + 450;
        const scale = focalLength / z;
        return {
          x: centerX + r[0] * scale,
          y: centerY + r[1] * scale,
          z: r[2],
          scale: scale
        };
      });

      // Draw metallic lattice connecting edges
      poly.edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        const avgZ = (p1.z + p2.z) / 2;
        const depthAlpha = Math.max(0.04, Math.min(0.7, (avgZ + 200) / 380));

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isGold) {
          ctx.strokeStyle = `rgba(217, 119, 6, ${depthAlpha})`;
        } else {
          ctx.strokeStyle = `rgba(226, 232, 240, ${depthAlpha * 0.85})`;
        }

        ctx.lineWidth = Math.max(0.8, 1.8 * ((p1.scale + p2.scale) / 2));
        ctx.stroke();
        ctx.restore();
      });

      // Draw shiny joint sphere nodes
      projected.forEach(p => {
        const nodeAlpha = Math.max(0.1, Math.min(0.95, (p.z + 200) / 350));
        const nodeRadius = Math.max(1.5, 3.8 * p.scale);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);

        if (isGold) {
          ctx.fillStyle = `rgba(251, 191, 36, ${nodeAlpha})`;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        }

        ctx.shadowBlur = 8 * p.scale;
        ctx.fill();

        // Inner specular highlight point
        ctx.beginPath();
        ctx.arc(p.x - nodeRadius * 0.2, p.y - nodeRadius * 0.2, nodeRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      });
    }

    // Render left 3D Polyhedron (framed on left side)
    renderPolyhedron(polyLeft, -width * 0.08, height * 0.48, 1, 1.1, true);

    // Render right 3D Polyhedron (framed on right side)
    renderPolyhedron(polyRight, width * 1.08, height * 0.52, -0.9, -1, false);

    requestAnimationFrame(animate);
  }

  animate();
}
