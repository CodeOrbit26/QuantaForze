/**
 * 3D Sheet / Mesh Wave Canvas Animation Engine
 * Copied directly from /Users/abhay/Desktop/QuantaForze/QuantaForze/sheet/sheet-animation.js
 */

class SheetAnimation {
  constructor(canvasIdOrElement, options = {}) {
    this.canvas = typeof canvasIdOrElement === 'string'
      ? document.getElementById(canvasIdOrElement)
      : canvasIdOrElement;

    if (!this.canvas) {
      console.error(`SheetAnimation: Canvas element '${canvasIdOrElement}' not found.`);
      return;
    }

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.parent = this.canvas.parentElement || document.body;

    // Full configuration options with defaults
    this.config = Object.assign({
      // 1. Grid Dimensions & Spacing (Size of the Sheet)
      cols: 16,                   // Number of columns in 3D grid
      rows: 10,                   // Number of rows in 3D grid
      spacingX: 155,              // Horizontal spacing between grid nodes
      spacingZ: 125,              // Depth spacing between grid nodes
      
      // 2. Color Palette (RGB format)
      nodeColor: '14, 165, 233',   // Electric Blue accent (#0ea5e9)
      lineColor: '43, 43, 43',     // Dark wireframe edge (#2b2b2b)
      faceColor: '255, 255, 255',  // Mesh face fill (White)
      
      // 3. Node (Point) Properties
      nodeRadius: 5.5,            // Base node circle radius (px)
      nodeMinAlpha: 0.35,         // Minimum transparency for distant nodes
      nodeMaxAlpha: 0.98,         // Maximum transparency for close nodes
      
      // 4. Line / Edge Properties
      lineWidth: 2.4,             // Edge stroke width scaling multiplier
      lineMinAlpha: 0.12,         // Minimum transparency for distant lines
      lineMaxAlpha: 0.55,         // Maximum transparency for close lines
      
      // 5. Mesh Surface Fill Properties
      faceMinAlpha: 0.02,         // Minimum transparency for mesh face fills
      faceMaxAlpha: 0.2,          // Maximum transparency for mesh face fills
      
      // 6. Motion & Wave Physics
      speed: 0.015,               // Wave animation speed multiplier
      waveAmplitude: 22,          // Undulating wave height (px)
      baseWaveHeight: 115,        // Static 3D curve height offset
      
      // 7. Camera & Perspective Layout
      focalLength: 850,           // 3D perspective depth focal length
      centerYRatio: 0.54,         // Vertical positioning ratio of mesh
      
      // 8. Interaction & Performance
      interactive: true,          // Enable mouse tilt interaction
      tiltSensitivity: 0.00016,   // Mouse tilt responsiveness
      autoResize: true            // Handle window resize automatically
    }, options);

    this.width = 0;
    this.height = 0;
    this.isVisible = true;
    this.animFrameId = null;
    this.time = 0;

    this.mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      tiltX: 0.34,
      tiltY: 0
    };

    this.gridPoints = [];
    this.faces = [];
    this.edges = [];

    this.init();
  }

  init() {
    this.updateDimensions();
    this.initMesh();
    this.setupEvents();
    this.start();
  }

  updateDimensions() {
    this.width = this.canvas.width = this.parent.clientWidth || window.innerWidth;
    this.height = this.canvas.height = this.parent.clientHeight || 800;
    this.mouse.x = this.mouse.targetX = this.width / 2;
    this.mouse.y = this.mouse.targetY = this.height / 2;
  }

  // Construct 3D Mesh Grid Architecture
  initMesh() {
    this.gridPoints = [];
    this.faces = [];
    this.edges = [];

    const { cols, rows, spacingX, spacingZ, baseWaveHeight } = this.config;
    const startX = -((cols - 1) * spacingX) / 2;
    const startZ = -((rows - 1) * spacingZ) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX;
        const z = startZ + r * spacingZ;
        const distFromCenter = Math.sqrt(x * x + z * z);
        const y = Math.cos(distFromCenter * 0.0028) * baseWaveHeight - Math.sin(c * 0.45) * 38;
        this.gridPoints.push({ x, y, z, baseY: y, c, r });
      }
    }

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const i1 = r * cols + c;
        const i2 = r * cols + (c + 1);
        const i3 = (r + 1) * cols + c;
        const i4 = (r + 1) * cols + (c + 1);

        this.faces.push([i1, i2, i3]);
        this.faces.push([i2, i4, i3]);

        this.edges.push([i1, i2]);
        this.edges.push([i1, i3]);
        this.edges.push([i2, i4]);
        this.edges.push([i3, i4]);
        this.edges.push([i2, i3]);
      }
    }
  }

  setupEvents() {
    // 1. Intersection Observer (Pause animation when off-screen to save GPU/CPU)
    if ('IntersectionObserver' in window) {
      this.visObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !this.animFrameId) {
            this.animate();
          }
        });
      }, { threshold: 0 });
      this.visObserver.observe(this.canvas);
    }

    // 2. Mouse move listener for interactive tilt
    if (this.config.interactive) {
      this.mouseMoveHandler = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.targetX = Math.max(0, Math.min(this.width, e.clientX - rect.left));
        this.mouse.targetY = Math.max(0, Math.min(this.height, e.clientY - rect.top));
      };
      window.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    }

    // 3. Window resize listener
    if (this.config.autoResize) {
      let resizeTimer;
      this.resizeHandler = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.updateDimensions();
          this.initMesh();
        }, 150);
      };
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  // Render loop
  animate() {
    if (!this.isVisible) {
      this.animFrameId = null;
      return;
    }

    const {
      speed, waveAmplitude, focalLength, centerYRatio,
      tiltSensitivity, nodeColor, lineColor, faceColor,
      nodeRadius, nodeMinAlpha, nodeMaxAlpha,
      lineWidth, lineMinAlpha, lineMaxAlpha,
      faceMinAlpha, faceMaxAlpha
    } = this.config;

    this.time += speed;

    // Smooth mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    const clampedY = Math.max(0, Math.min(this.height, this.mouse.y));
    const clampedX = Math.max(0, Math.min(this.width, this.mouse.x));

    const targetTiltX = 0.34 + (clampedY - this.height / 2) * tiltSensitivity;
    const targetTiltY = (clampedX - this.width / 2) * tiltSensitivity;

    this.mouse.tiltX += (targetTiltX - this.mouse.tiltX) * 0.05;
    this.mouse.tiltY += (targetTiltY - this.mouse.tiltY) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerY = this.height * centerYRatio;

    const cosX = Math.cos(this.mouse.tiltX);
    const sinX = Math.sin(this.mouse.tiltX);
    const rotYAngle = this.mouse.tiltY + Math.sin(this.time * 0.2) * 0.15;
    const cosY = Math.cos(rotYAngle);
    const sinY = Math.sin(rotYAngle);

    // Transform 3D points to 2D projection
    const projected = new Array(this.gridPoints.length);
    for (let i = 0; i < this.gridPoints.length; i++) {
      const p = this.gridPoints[i];
      const waveY = p.baseY + Math.sin(this.time + p.c * 0.28 + p.r * 0.38) * waveAmplitude;

      // Rotate X
      const rx = p.x;
      const ry = waveY * cosX - p.z * sinX;
      const rz = waveY * sinX + p.z * cosX;

      // Rotate Y
      const fx = rx * cosY + rz * sinY;
      const fy = ry;
      const fz = -rx * sinY + rz * cosY;

      const zWorld = fz + 720;
      const scale = focalLength / Math.max(zWorld, 100);

      projected[i] = {
        x: this.width / 2 + fx * scale,
        y: centerY + fy * scale,
        z: fz,
        scale: scale
      };
    }

    // Step 1: Draw Mesh Polygon Faces
    for (let f = 0; f < this.faces.length; f++) {
      const [i1, i2, i3] = this.faces[f];
      const p1 = projected[i1];
      const p2 = projected[i2];
      const p3 = projected[i3];

      const avgZ = (p1.z + p2.z + p3.z) / 3;
      const faceAlpha = Math.max(faceMinAlpha, Math.min(faceMaxAlpha, (avgZ + 400) / 950));

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.lineTo(p3.x, p3.y);
      this.ctx.closePath();
      this.ctx.fillStyle = `rgba(${faceColor},${faceAlpha.toFixed(2)})`;
      this.ctx.fill();
    }

    // Step 2: Draw Wireframe Edges
    for (let e = 0; e < this.edges.length; e++) {
      const [i, j] = this.edges[e];
      const p1 = projected[i];
      const p2 = projected[j];

      const avgZ = (p1.z + p2.z) / 2;
      const lineAlpha = Math.max(lineMinAlpha, Math.min(lineMaxAlpha, (avgZ + 450) / 750));

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.strokeStyle = `rgba(${lineColor},${lineAlpha.toFixed(2)})`;
      this.ctx.lineWidth = Math.max(1, lineWidth * ((p1.scale + p2.scale) / 2));
      this.ctx.stroke();
    }

    // Step 3: Draw Glowing Nodes (Dots)
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const nodeAlpha = Math.max(nodeMinAlpha, Math.min(nodeMaxAlpha, (p.z + 450) / 600));
      const radius = Math.max(2.8, nodeRadius * p.scale);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${nodeColor},${nodeAlpha.toFixed(2)})`;
      this.ctx.fill();

      // Core Highlight
      this.ctx.beginPath();
      this.ctx.arc(p.x - radius * 0.25, p.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255,255,255,${(nodeAlpha * 0.9).toFixed(2)})`;
      this.ctx.fill();
    }

    this.animFrameId = requestAnimationFrame(() => this.animate());
  }

  updateConfig(newOptions) {
    Object.assign(this.config, newOptions);
    this.initMesh();
  }

  start() {
    if (!this.animFrameId) {
      this.animate();
    }
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.visObserver) this.visObserver.disconnect();
    if (this.mouseMoveHandler) window.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
  }
}

// Auto-initialize on particle-canvas element
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('particle-canvas')) {
    window.sheetAnimInstance = new SheetAnimation('particle-canvas');
  }
});

if (typeof window !== 'undefined') {
  window.SheetAnimation = SheetAnimation;
}
