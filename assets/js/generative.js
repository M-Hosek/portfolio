/* Pollen drift — a value-noise flow field on canvas 2D.
   Decorative only: aria-hidden, pointer-events: none, no input. */
(function () {
  'use strict';

  var canvas = document.querySelector('canvas.hero-canvas[data-generative]');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var LINK_DIST = 80;         // px — connect particles closer than this
  var LINK_DIST_SQ = LINK_DIST * LINK_DIST;
  var TARGET_FPS = 30;
  var FRAME_MS = 1000 / TARGET_FPS;
  var NOISE_SCALE = 0.0022;   // flow field frequency
  var NOISE_DRIFT = 0.00008;  // how fast the field itself evolves
  var SPEED = 0.35;           // px per ms at full step

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Value noise (no library) ---------- */

  function hash2(ix, iy) {
    var h = ix * 374761393 + iy * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }

  function smooth(t) { return t * t * (3 - 2 * t); }

  /* 2D value noise, bilinear over a hashed integer lattice. hash2 actually
     returns [0, 0.5) — `h >> 16` sign-extends so bit 31 of the XOR is always
     0 and >>> 0 never reaches 2^31 — which is why noise2's result is used
     with `* Math.PI * 4` (a full turn over the doubled range) rather than
     `* Math.PI * 2`. Do not "fix" the shift to `>>>`: that would double the
     hashed range and, combined with the existing `* 4`, sweep two full
     turns instead of one, silently changing the artwork. */
  function noise2(x, y) {
    var x0 = Math.floor(x), y0 = Math.floor(y);
    var fx = smooth(x - x0), fy = smooth(y - y0);
    var n00 = hash2(x0, y0), n10 = hash2(x0 + 1, y0);
    var n01 = hash2(x0, y0 + 1), n11 = hash2(x0 + 1, y0 + 1);
    var a = n00 + (n10 - n00) * fx;
    var b = n01 + (n11 - n01) * fx;
    return a + (b - a) * fy;
  }

  /* ---------- Color ---------- */

  var eco = [63, 123, 95], scifi = [31, 107, 122];

  function parseColor(str) {
    str = (str || '').trim();
    var m = str.match(/^#([0-9a-f]{6})$/i);
    if (m) {
      var n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (m) return [+m[1] | 0, +m[2] | 0, +m[3] | 0];
    return null;
  }

  function readAccents() {
    var cs = getComputedStyle(document.documentElement);
    eco = parseColor(cs.getPropertyValue('--eco')) || eco;
    scifi = parseColor(cs.getPropertyValue('--scifi')) || scifi;
  }

  /* ---------- Particles: parallel typed arrays, no per-frame particle-object
     churn (draw() still allocates rgba() strings per frame; the typed
     arrays only avoid the allocation that mattered: per-particle objects) ---------- */

  var count = 0;
  var staticCoords = null;
  var px = null, py = null, tint = null;  // tint: 0 = eco, 1 = scifi
  var w = 0, h = 0, dpr = 1;
  var fieldT = 0;

  function targetCount() {
    var area = w * h;
    return Math.max(60, Math.min(120, Math.round(area / 11000)));
  }

  function seed() {
    count = targetCount();
    px = new Float32Array(count);
    py = new Float32Array(count);
    tint = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      px[i] = Math.random() * w;
      py[i] = Math.random() * h;
      tint[i] = Math.random();
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var nw = Math.max(1, Math.round(rect.width));
    var nh = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    var drastic = !count ||
      Math.abs(nw - w) > w * 0.25 || Math.abs(nh - h) > h * 0.25;

    w = nw; h = nh;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (drastic) seed();
  }

  /* Mix the two accents. t: 0 = ecology green, 1 = sci-fi cyan. */
  function rgbaMix(t, alpha) {
    var r = eco[0] + (scifi[0] - eco[0]) * t;
    var g = eco[1] + (scifi[1] - eco[1]) * t;
    var b = eco[2] + (scifi[2] - eco[2]) * t;
    return 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' +
           alpha.toFixed(3) + ')';
  }

  /* ---------- Zodiac figures ---------- */

  var ZODIAC = window.ZODIAC || [];
  var FIG_NARROW = 700;      // px — below this the hero stacks, so recenter

  /* Target rectangle for the figure, plus an opacity multiplier.
     Wide: the open area right of the hero text. Narrow: centered and
     dimmed, because the text column stacks over it. */
  function figureBox() {
    if (w >= FIG_NARROW) {
      return { x: w * 0.58, y: h * 0.18, w: w * 0.36, h: h * 0.64, alpha: 1 };
    }
    return { x: w * 0.10, y: h * 0.15, w: w * 0.80, h: h * 0.70, alpha: 0.5 };
  }

  /* Map a figure's normalized stars into screen coords, preserving its
     aspect and centering it in the box. Writes 2*n floats into `out`. */
  function placeFigure(fig, box, out) {
    var boxAspect = box.w / box.h;
    var fw, fh;
    if (fig.aspect >= boxAspect) { fw = box.w; fh = box.w / fig.aspect; }
    else { fh = box.h; fw = box.h * fig.aspect; }
    var ox = box.x + (box.w - fw) * 0.5;
    var oy = box.y + (box.h - fh) * 0.5;
    for (var i = 0; i < fig.stars.length; i++) {
      out[i * 2] = ox + fig.stars[i][0] * fw;
      out[i * 2 + 1] = oy + fig.stars[i][1] * fh;
    }
  }

  /* Draw authored edges then stars. `coords` is x0,y0,x1,y1,... in screen
     space; it may hold fewer points than fig.stars if recruitment was
     clamped, so edges referencing missing points are skipped. */
  function drawFigure(fig, coords, alpha, n) {
    if (alpha <= 0) return;
    var span = fig.stars.length > 1 ? fig.stars.length - 1 : 1;
    var e, a, b;

    ctx.lineWidth = 1;
    for (e = 0; e < fig.edges.length; e++) {
      a = fig.edges[e][0]; b = fig.edges[e][1];
      if (a >= n || b >= n) continue;
      ctx.strokeStyle = rgbaMix((a + b) / (2 * span), alpha * 0.55);
      ctx.beginPath();
      ctx.moveTo(coords[a * 2], coords[a * 2 + 1]);
      ctx.lineTo(coords[b * 2], coords[b * 2 + 1]);
      ctx.stroke();
    }

    for (e = 0; e < n; e++) {
      ctx.fillStyle = rgbaMix(e / span, alpha * 0.9);
      ctx.beginPath();
      ctx.arc(coords[e * 2], coords[e * 2 + 1], 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------- Simulation + draw ---------- */

  function step(dt) {
    fieldT += dt * NOISE_DRIFT;
    var d = Math.min(dt, 50) * SPEED * 0.06;
    for (var i = 0; i < count; i++) {
      var angle = noise2(px[i] * NOISE_SCALE + fieldT,
                         py[i] * NOISE_SCALE - fieldT) * Math.PI * 4;
      var nx = px[i] + Math.cos(angle) * d;
      var ny = py[i] + Math.sin(angle) * d;
      if (nx < -10) nx = w + 10; else if (nx > w + 10) nx = -10;
      if (ny < -10) ny = h + 10; else if (ny > h + 10) ny = -10;
      px[i] = nx; py[i] = ny;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* Connections first, so dots sit on top. */
    ctx.lineWidth = 1;
    for (var i = 0; i < count; i++) {
      for (var j = i + 1; j < count; j++) {
        var dx = px[i] - px[j], dy = py[i] - py[j];
        var dsq = dx * dx + dy * dy;
        if (dsq > LINK_DIST_SQ) continue;
        var falloff = 1 - Math.sqrt(dsq) / LINK_DIST;
        ctx.strokeStyle = rgbaMix((tint[i] + tint[j]) * 0.5, falloff * 0.28);
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.stroke();
      }
    }

    for (var k = 0; k < count; k++) {
      ctx.fillStyle = rgbaMix(tint[k], 0.55);
      ctx.beginPath();
      ctx.arc(px[k], py[k], 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Task 4 replaces this with the phase-driven figure. */
    if (ZODIAC.length) {
      var fig = ZODIAC[0];
      var box = figureBox();
      var n = fig.stars.length;
      if (!staticCoords || staticCoords.length < n * 2) {
        staticCoords = new Float32Array(n * 2);
      }
      placeFigure(fig, box, staticCoords);
      drawFigure(fig, staticCoords, box.alpha, n);
    }
  }

  /* ---------- Loop control ---------- */

  var rafId = 0, last = 0, acc = 0, onScreen = true, running = false;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    var dt = now - last;
    last = now;
    acc += dt;
    if (acc < FRAME_MS) return;
    step(acc);
    acc = 0;
    draw();
  }

  function start() {
    if (running || reduceMotion.matches) return;
    running = true;
    last = performance.now();
    acc = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function sync() {
    if (onScreen && !document.hidden) start();
    else stop();
  }

  /* ---------- Wiring ---------- */

  readAccents();
  resize();

  /* Pause-path listeners are registered unconditionally, even when reduced
     motion is active at load: start() independently guards on
     reduceMotion.matches, so this stays inert until motion is allowed, but
     if the user later toggles reduced motion off mid-session the loop must
     already be able to pause off-screen/hidden rather than running forever. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(canvas);
  }
  document.addEventListener('visibilitychange', sync);

  if (reduceMotion.matches) {
    draw();  // one static frame, no loop
  } else {
    sync();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      resize();
      if (!running) draw();
    }).observe(canvas);
  } else {
    window.addEventListener('resize', function () {
      resize();
      if (!running) draw();
    });
  }

  if (window.PortfolioTheme) {
    window.PortfolioTheme.onChange(function () {
      readAccents();
      if (!running) draw();
    });
  }

  var onMotionChange = function () {
    if (reduceMotion.matches) { stop(); draw(); }
    else sync();
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
  else reduceMotion.addListener(onMotionChange);
})();
