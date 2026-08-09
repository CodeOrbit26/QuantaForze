/**
 * Fluid Canvas Background Simulation
 * Recreates the organic fluid/metaball visual effect in Canvas 2D
 */
function initFluidCanvas(canvasElement) {
  if (!canvasElement) return;

  const ctx = canvasElement.getContext('2d');
  let width, height;
  let animationFrameId;

  // Blob particles definition
  const numBlobs = 6;
  const blobs = [];

  const colors = [
    { r: 252, g: 71, b: 120, a: 0.15 }, // Accent Pink
    { r: 240, g: 240, b: 240, a: 0.4 }, // Soft White
    { r: 220, g: 220, b: 220, a: 0.3 }, // Light Gray
    { r: 252, g: 71, b: 120, a: 0.08 }, // Soft Accent
    { r: 200, g: 200, b: 200, a: 0.25 },
    { r: 255, g: 255, b: 255, a: 0.5 }
  ];

  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    width = canvasElement.width = canvasElement.parentElement.clientWidth || window.innerWidth;
    height = canvasElement.height = canvasElement.parentElement.clientHeight || window.innerHeight;
    mouse.x = mouse.targetX = width / 2;
    mouse.y = mouse.targetY = height / 2;
  }

  function createBlobs() {
    blobs.length = 0;
    for (let i = 0; i < numBlobs; i++) {
      blobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.min(width, height) * (0.25 + Math.random() * 0.2),
        color: colors[i % colors.length]
      });
    }
  }

  function update() {
    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    blobs.forEach((blob, i) => {
      blob.x += blob.vx;
      blob.y += blob.vy;

      // Subtle mouse attraction for first few blobs
      if (i < 3) {
        blob.x += (mouse.x - blob.x) * 0.005;
        blob.y += (mouse.y - blob.y) * 0.005;
      }

      // Bounce at boundaries
      if (blob.x < -blob.radius * 0.5 || blob.x > width + blob.radius * 0.5) blob.vx *= -1;
      if (blob.y < -blob.radius * 0.5 || blob.y > height + blob.radius * 0.5) blob.vy *= -1;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    blobs.forEach(blob => {
      const gradient = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );

      const c = blob.color;
      gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
      gradient.addColorStop(0.7, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.3})`);
      gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvasElement.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  resize();
  createBlobs();
  loop();
}

window.initFluidCanvas = initFluidCanvas;
