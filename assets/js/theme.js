/* Three-state theme controller: system (default), light, dark.
   Loaded synchronously in <head> so the stored choice applies before paint. */
(function () {
  'use strict';

  var KEY = 'portfolio-theme';
  var MODES = ['system', 'light', 'dark'];
  var LABELS = {
    system: 'Theme: system. Activate to switch to light.',
    light: 'Theme: light. Activate to switch to dark.',
    dark: 'Theme: dark. Activate to switch to system.'
  };

  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var listeners = [];

  function read() {
    var stored;
    try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
    return MODES.indexOf(stored) === -1 ? 'system' : stored;
  }

  var mode = read();

  function resolved() {
    if (mode === 'system') return media.matches ? 'dark' : 'light';
    return mode;
  }

  function apply() {
    if (mode === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }

  function notify() {
    var r = resolved();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](r); } catch (e) { /* a bad listener must not break the toggle */ }
    }
  }

  function set(next) {
    if (MODES.indexOf(next) === -1) return;
    mode = next;
    try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode: session-only */ }
    apply();
    notify();
  }

  function cycle() {
    set(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
    return mode;
  }

  /* System preference changing counts as a theme change while in system mode. */
  var onMediaChange = function () { if (mode === 'system') notify(); };
  if (media.addEventListener) media.addEventListener('change', onMediaChange);
  else media.addListener(onMediaChange);

  var ICONS = {
    system: '<path d="M3 4h10v6H3z"/><path d="M6 13h4"/><path d="M8 10v3"/>',
    light: '<circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4"/>',
    dark: '<path d="M13 9.5A5.5 5.5 0 016.5 3a5.5 5.5 0 100 11 5.5 5.5 0 006.5-4.5z"/>'
  };

  function paint(btn) {
    btn.setAttribute('aria-label', LABELS[mode]);
    btn.setAttribute('title', LABELS[mode]);
    btn.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
      'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + ICONS[mode] + '</svg>';
  }

  function attachToggle(btn) {
    if (!btn) return;
    btn.type = 'button';
    paint(btn);
    btn.addEventListener('click', function () {
      cycle();
      paint(btn);
    });
  }

  apply();

  window.PortfolioTheme = {
    get: function () { return mode; },
    set: set,
    cycle: cycle,
    resolved: resolved,
    attachToggle: attachToggle,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };
})();
