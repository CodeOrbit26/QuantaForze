/* ================================================================
   USP CARD SVG ASSET GENERATORS & GSAP ANIMATIONS
   Extracted directly from incredibles.dev
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Custom Easing definition matching Nuxt backExpoInOut
  const backExpoInOut = 'M0,0 C0.1,0 0.2,1.2 0.5,1.2 C0.8,1.2 0.9,0 1,1';

  const HSL_COLORS = Array.from({ length: 5 }, (_, i) => `hsl(344, 100%, ${86 + (4 - i) * 2}%)`);
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function fmt(n) {
    return Number(n).toFixed(2);
  }

  // Create dot grid pattern inside SVG
  function createDotPattern(svg, id) {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    if (!svg.querySelector(`#${id}`)) {
      const pattern = document.createElementNS(SVG_NS, 'pattern');
      pattern.setAttribute('id', id);
      pattern.setAttribute('x', '0');
      pattern.setAttribute('y', '0');
      pattern.setAttribute('width', '12');
      pattern.setAttribute('height', '12');
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');

      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', '1.5');
      circle.setAttribute('cy', '1.5');
      circle.setAttribute('r', '1');
      circle.setAttribute('fill', '#d7d7d7');
      pattern.appendChild(circle);
      defs.appendChild(pattern);
    }

    if (!svg.querySelector('.b__dot-bg')) {
      const bg = document.createElementNS(SVG_NS, 'rect');
      bg.setAttribute('class', 'b__dot-bg');
      bg.setAttribute('width', '100%');
      bg.setAttribute('height', '100%');
      bg.setAttribute('fill', `url(#${id})`);
      svg.insertBefore(bg, svg.firstChild);
    }
  }

  // ================================================================
  // 1. CARD 1: CONTINUITY (Start to Finish) — Diagonal Squares
  // ================================================================
  function initContinuityAsset() {
    const container = document.querySelector('.b-usp-asset-continuity');
    if (!container) return;
    const svg = container.querySelector('.b__svg');
    const group = container.querySelector('.b__svg__squares');
    if (!svg || !group) return;

    createDotPattern(svg, 'dotGridContinuity');

    const rectSize = 100;
    const step = 25;
    const extra = 5;
    const colors = HSL_COLORS;

    function render() {
      const rect = container.getBoundingClientRect();
      const w = rect.width || 400;
      const h = rect.height || 300;

      svg.setAttribute('viewBox', `0 0 ${fmt(w)} ${fmt(h)}`);
      group.innerHTML = '';

      const count = Math.max(Math.ceil((w - rectSize) / step) + 1, Math.ceil((h - rectSize) / step) + 1);
      const totalSpan = (count - 1) * step + rectSize;
      const tx = (w - totalSpan) / 2;
      const ty = (h - totalSpan) / 2;

      group.setAttribute('transform', `translate(${fmt(tx)}, ${fmt(ty)})`);

      const rects = [];
      for (let i = -extra; i <= count; i++) {
        const r = document.createElementNS(SVG_NS, 'rect');
        const posX = i * step;
        const posY = i * step;
        const color = colors[(i % 5 + 5) % 5];

        r.setAttribute('x', fmt(posX));
        r.setAttribute('y', fmt(posY));
        r.setAttribute('width', fmt(rectSize));
        r.setAttribute('height', fmt(rectSize));
        r.setAttribute('rx', '8');
        r.setAttribute('fill', color);
        group.appendChild(r);
        rects.push({ el: r, origX: posX, origY: posY });
      }

      // Infinite loop animation moving rects along diagonal
      if (typeof gsap !== 'undefined') {
        rects.forEach((item, idx) => {
          gsap.to(item.el, {
            x: `+=${step}`,
            y: `+=${step}`,
            duration: 1.5,
            delay: (rects.length - idx) * 0.05,
            repeat: -1,
            ease: 'power2.inOut'
          });
        });
      }
    }

    render();
    window.addEventListener('resize', render);
  }

  // ================================================================
  // 2. CARD 2: CAPACITY (Higher Potential) — Inverted Pyramid/Funnel
  // ================================================================
  function initCapacityAsset() {
    const container = document.querySelector('.b-usp-asset-capacity');
    if (!container) return;
    const svg = container.querySelector('.b__svg');
    const group = container.querySelector('.b__svg__rects');
    if (!svg || !group) return;

    createDotPattern(svg, 'dotGridCapacity');

    const baseW = 100;
    const baseH = 100;
    const widthStep = 30;
    const heightSub = 15;
    const spacing = 30;
    const colors = HSL_COLORS;

    function calcH(level) { return Math.max(20, baseH - heightSub * Math.sqrt(level)); }
    function calcW(level) { return baseW + level * widthStep; }
    function calcY(level, screenH) {
      let y = screenH - baseH / 2;
      for (let i = 1; i <= level; i++) y += spacing - calcH(i);
      return y;
    }

    function render() {
      const rect = container.getBoundingClientRect();
      const w = rect.width || 400;
      const h = rect.height || 300;

      svg.setAttribute('viewBox', `0 0 ${fmt(w)} ${fmt(h)}`);
      group.innerHTML = '';

      let maxLevel = 0;
      for (let i = 0; i < 200; i++) {
        maxLevel = i;
        if (calcY(i, h) < -100) break;
      }

      const rects = [];
      for (let level = maxLevel; level >= 0; level--) {
        const r = document.createElementNS(SVG_NS, 'rect');
        const rW = calcW(level);
        const rH = calcH(level);
        const rX = (w - rW) / 2;
        const rY = calcY(level, h);
        const color = colors[((level - 1) % 5 + 5) % 5];

        r.setAttribute('x', fmt(rX));
        r.setAttribute('y', fmt(rY));
        r.setAttribute('width', fmt(rW));
        r.setAttribute('height', fmt(rH));
        r.setAttribute('rx', '6');
        r.setAttribute('fill', color);
        group.appendChild(r);
        rects.push({ el: r, level, w: rW, h: rH, x: rX, y: rY });
      }

      // Animate levels shifting up
      if (typeof gsap !== 'undefined') {
        rects.forEach((item, idx) => {
          const nextLevel = item.level - 1;
          if (nextLevel >= 0) {
            const newW = calcW(nextLevel);
            const newH = calcH(nextLevel);
            const newY = calcY(nextLevel, h);
            const newX = (w - newW) / 2;

            gsap.to(item.el, {
              x: newX,
              y: newY,
              width: newW,
              height: newH,
              duration: 1.5,
              delay: item.level * 0.025,
              repeat: -1,
              yoyo: true,
              ease: 'power2.inOut'
            });
          }
        });
      }
    }

    render();
    window.addEventListener('resize', render);
  }

  // ================================================================
  // 3. CARD 3: COLLABORATION (Experienced Pros) — Overlapping Circles
  // ================================================================
  function initCollaborationAsset() {
    const container = document.querySelector('.b-usp-asset-collaboration');
    if (!container) return;
    const svg = container.querySelector('.b__svg');
    const group = container.querySelector('.b__svg__circles');
    if (!svg || !group) return;

    createDotPattern(svg, 'dotGridCollaboration');

    const radius = 80;
    const step = 80;
    const colors = HSL_COLORS;

    function render() {
      const rect = container.getBoundingClientRect();
      const w = rect.width || 400;
      const h = rect.height || 300;

      svg.setAttribute('viewBox', `0 0 ${fmt(w)} ${fmt(h)}`);
      group.innerHTML = '';

      const cy = h / 2;
      const count = Math.ceil((w + radius * 2) / step) + 6;
      const startX = w - (count - 1) * step;

      const circles = [];
      for (let i = 0; i < count; i++) {
        const c = document.createElementNS(SVG_NS, 'circle');
        const cx = startX + i * step;
        const color = colors[i % 5];

        c.setAttribute('cx', fmt(cx));
        c.setAttribute('cy', fmt(cy));
        c.setAttribute('r', fmt(radius));
        c.setAttribute('fill', color);
        group.appendChild(c);
        circles.push({ el: c, cx });
      }

      // Smooth horizontal shift
      if (typeof gsap !== 'undefined') {
        circles.forEach((item, idx) => {
          gsap.to(item.el, {
            cx: `+=${step}`,
            duration: 1.5,
            delay: (circles.length - idx) * 0.05,
            repeat: -1,
            ease: 'power2.inOut'
          });
        });
      }
    }

    render();
    window.addEventListener('resize', render);
  }

  // ================================================================
  // 4. CARD 4: EXPERIENCE (Top Quality) — Rotated Diamonds
  // ================================================================
  function initExperienceAsset() {
    const container = document.querySelector('.b-usp-asset-experience');
    if (!container) return;
    const svg = container.querySelector('.b__svg');
    const group = container.querySelector('.b__svg__rects');
    if (!svg || !group) return;

    createDotPattern(svg, 'dotGridExperience');

    const baseSize = 80;
    const sizeStep = 40;
    const colors = HSL_COLORS;

    function render() {
      const rect = container.getBoundingClientRect();
      const w = rect.width || 400;
      const h = rect.height || 300;

      svg.setAttribute('viewBox', `0 0 ${fmt(w)} ${fmt(h)}`);
      group.innerHTML = '';

      const cx = w / 2;
      const cy = h / 2;
      group.setAttribute('transform', `rotate(45, ${fmt(cx)}, ${fmt(cy)})`);

      const maxSpan = Math.max(w, h);
      let count = 0;
      for (let i = 0; i < 200; i++) {
        count = i;
        if ((baseSize + i * sizeStep) * Math.SQRT2 >= maxSpan * 1.5) break;
      }

      const rects = [];
      for (let i = count; i >= 0; i--) {
        const size = baseSize + i * sizeStep;
        const r = document.createElementNS(SVG_NS, 'rect');
        const rx = cx - size / 2;
        const ry = cy - size / 2;
        const color = colors[i % 5];

        r.setAttribute('x', fmt(rx));
        r.setAttribute('y', fmt(ry));
        r.setAttribute('width', fmt(size));
        r.setAttribute('height', fmt(size));
        r.setAttribute('rx', '8');
        r.setAttribute('fill', color);
        group.appendChild(r);
        rects.push({ el: r, i, size });
      }

      // Pulse expansion
      if (typeof gsap !== 'undefined') {
        rects.forEach((item) => {
          const nextSize = item.size + sizeStep;
          const nextX = cx - nextSize / 2;
          const nextY = cy - nextSize / 2;

          gsap.to(item.el, {
            x: nextX,
            y: nextY,
            width: nextSize,
            height: nextSize,
            duration: 1.5,
            delay: item.i * 0.05,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut'
          });
        });
      }
    }

    render();
    window.addEventListener('resize', render);
  }

  // Initialize all 4 card SVG generators
  initContinuityAsset();
  initCapacityAsset();
  initCollaborationAsset();
  initExperienceAsset();

});
