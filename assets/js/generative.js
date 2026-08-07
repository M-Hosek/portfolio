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

  /* 2D value noise in [0,1], bilinear over a hashed integer lattice. */
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

  /* ---------- Particles: parallel typed arrays, zero per-frame allocation ---------- */

  var count = 0;
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
        var t = (tint[i] + tint[j]) * 0.5;
        var r = eco[0] + (scifi[0] - eco[0]) * t;
        var g = eco[1] + (scifi[1] - eco[1]) * t;
        var b = eco[2] + (scifi[2] - eco[2]) * t;
        ctx.strokeStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) +
                          ',' + (falloff * 0.28).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.stroke();
      }
    }

    for (var k = 0; k < count; k++) {
      var tk = tint[k];
      var rr = eco[0] + (scifi[0] - eco[0]) * tk;
      var gg = eco[1] + (scifi[1] - eco[1]) * tk;
      var bb = eco[2] + (scifi[2] - eco[2]) * tk;
      ctx.fillStyle = 'rgba(' + (rr | 0) + ',' + (gg | 0) + ',' + (bb | 0) + ',0.55)';
      ctx.beginPath();
      ctx.arc(px[k], py[k], 1.6, 0, Math.PI * 2);
      ctx.fill();
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

  if (reduceMotion.matches) {
    draw();  // one static frame, no loop
  } else {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', sync);
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
