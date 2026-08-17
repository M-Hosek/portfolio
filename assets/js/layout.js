/* Injects shared header and footer, marks the active nav link.
   Loaded with `defer`. Pages provide [data-site-header] and [data-site-footer]. */
(function () {
  'use strict';

  var SITE_NAME = 'Melissa A. Hosek, PhD';

  /* Source of truth for the INJECTED nav. The <noscript> fallback nav in all
     seven HTML files duplicates these destinations and must be updated in step —
     it is what no-JS clients and crawlers see. */
  var NAV = [
    { slug: 'research', href: 'research.html', label: 'Research' },
    { slug: 'projects', href: 'projects.html', label: 'Projects' },
    { slug: 'writing',  href: 'writing.html',  label: 'Teaching' },
    { slug: 'cv',       href: 'cv.html',       label: 'CV' },
    { slug: 'contact',  href: 'contact.html',  label: 'Contact' }
  ];

  var body = document.body;
  var page = body.getAttribute('data-page') || '';
  var root = body.getAttribute('data-root') || '';

  function navItem(item) {
    var current = item.slug === page ? ' aria-current="page"' : '';
    return '<li><a href="' + root + item.href + '"' + current + '>' +
           item.label + '</a></li>';
  }

  function buildHeader(el) {
    var items = '';
    for (var i = 0; i < NAV.length; i++) items += navItem(NAV[i]);

    el.innerHTML =
      '<div class="wrap">' +
        '<a class="brand" href="' + root + 'index.html">' + SITE_NAME + '</a>' +
        '<nav class="site-nav" aria-label="Primary"><ul>' + items + '</ul></nav>' +
        '<button class="theme-toggle" type="button" aria-label="Theme"></button>' +
      '</div>';

    if (window.PortfolioTheme) {
      window.PortfolioTheme.attachToggle(el.querySelector('.theme-toggle'));
    }
  }

  function buildFooter(el) {
    var year = new Date().getFullYear();
    el.innerHTML =
      '<div class="wrap">' +
        '<p>&copy; ' + year + ' ' + SITE_NAME + '</p>' +
        '<p><a href="' + root + 'contact.html">Contact</a></p>' +
      '</div>';
  }

  var header = document.querySelector('[data-site-header]');
  var footer = document.querySelector('[data-site-footer]');
  if (header) buildHeader(header);
  if (footer) buildFooter(footer);
})();
