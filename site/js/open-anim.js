(() => {
  const canvas = document.getElementById('open-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, CELL, cols, rows, R_INNER, R_OUTER;

  function resize() {
    const section = canvas.parentElement; // .open-support
    const rect = section.getBoundingClientRect();
    W = canvas.width = rect.width;
    H = canvas.height = Math.max(280, Math.min(540, rect.height));
    CELL = Math.max(28, Math.min(56, Math.floor(W / 24)));
    cols = Math.ceil(W / CELL) + 2;
    rows = Math.ceil(H / CELL) + 2;
    const m = Math.min(W, H);
    R_INNER = m * 0.32;
    R_OUTER = m * 0.78;
  }
  resize();
  window.addEventListener('resize', resize);

  const gridColor = 'rgba(53,176,205,0.08)';
  const strutColor = 'rgba(53,176,205,0.35)';
  const NODE_RGB = [
    [247, 136, 176], // #f788b0
    [77, 192, 219]   // #4dc0db
  ];

  const struts = Array.from({ length: 28 }, () => ({
    v: Math.random() < .5,
    i: 0,
    j: 0,
    len: 0,
    life: 0,
    max: 70 + Math.random() * 90
  }));
  const nodes = Array.from({ length: 22 }, () => ({
    i: 0, j: 0, life: 0, max: 50 + Math.random() * 70, c: Math.floor(Math.random() * NODE_RGB.length)
  }));

  function resetStrut(s) {
    s.v = Math.random() < .5;
    s.i = Math.floor(Math.random() * cols);
    s.j = Math.floor(Math.random() * rows);
    s.len = 1 + Math.floor(Math.random() * 4);
    s.life = 0;
    s.max = 50 + Math.random() * 100;
  }
  function resetNode(n) {
    n.i = Math.floor(Math.random() * cols);
    n.j = Math.floor(Math.random() * rows);
    n.life = 0;
    n.max = 40 + Math.random() * 80;
  }
  struts.forEach(resetStrut);
  nodes.forEach(resetNode);

  function wAt(x, y) {
    const cx = W * 0.5, cy = H * 0.5;
    const dx = x - cx, dy = y - cy;
    const d = Math.sqrt(dx*dx + dy*dy);
    let t = (d - R_INNER) / (R_OUTER - R_INNER);
    if (t < 0) t = 0; else if (t > 1) t = 1;
    return t * t * (3 - 2 * t);
  }

  function drawGrid() {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -1; i < cols; i++) {
      const x = i * CELL + (W % CELL) * .5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let j = -1; j < rows; j++) {
      const y = j * CELL + (H % CELL) * .5;
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  function drawStruts() {
    ctx.strokeStyle = strutColor;
    ctx.lineWidth = 1.5;
    struts.forEach(s => {
      s.life += 1.25;
      if (s.life > s.max) resetStrut(s);
      const p = s.life / s.max;
      const al = p < .5 ? p * 2 : (1 - p) * 2;
      const x0 = s.i * CELL + (W % CELL) * .5;
      const y0 = s.j * CELL + (H % CELL) * .5;
      if (s.v) {
        const y1 = y0 + s.len * CELL;
        const mx = x0, my = y0 + (y1 - y0) * .5;
        const w = wAt(mx, my);
        const baseA = (0.15 + al * 0.5) * (0.12 + 0.88 * w);
        ctx.strokeStyle = `rgba(53,176,205,${baseA})`;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y1);
        ctx.stroke();
      } else {
        const x1 = x0 + s.len * CELL;
        const mx = x0 + (x1 - x0) * .5, my = y0;
        const w = wAt(mx, my);
        const baseA = (0.15 + al * 0.5) * (0.12 + 0.88 * w);
        ctx.strokeStyle = `rgba(53,176,205,${baseA})`;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y0);
        ctx.stroke();
      }
    });
  }

  function drawNodes() {
    nodes.forEach(n => {
      n.life += 1.05;
      if (n.life > n.max) resetNode(n);
      const p = n.life / n.max;
      const alpha = (p < .5 ? p * 2 : (1 - p) * 2);
      const x = n.i * CELL + (W % CELL) * .5;
      const y = n.j * CELL + (H % CELL) * .5;
      const w = wAt(x, y);
      const rgb = NODE_RGB[n.c];
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.16 * (0.12 + 0.88 * w)})`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.7 * (0.12 + 0.88 * w)})`;
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawCenterFade() {
    const cx = W * 0.5, cy = H * 0.5;
    const r1 = Math.min(W, H) * 0.34;
    const r2 = Math.min(W, H) * 0.82;
    const fade = ctx.createRadialGradient(cx, cy, r1, cx, cy, r2);
    fade.addColorStop(0, 'rgba(10,12,15,0.78)');
    fade.addColorStop(0.5, 'rgba(10,12,15,0.42)');
    fade.addColorStop(1, 'rgba(10,12,15,0.0)');
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1 * 1.8);
    glow.addColorStop(0, 'rgba(53,176,205,0.12)');
    glow.addColorStop(1, 'rgba(53,176,205,0.0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    if (window.__detraxisModalOpen) {
      requestAnimationFrame(tick);
      return;
    }
    drawGrid();
    drawStruts();
    drawNodes();
    drawCenterFade();
    requestAnimationFrame(tick);
  }
  tick();
})();
