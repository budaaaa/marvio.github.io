/**
 * nav.js — Logo + sidebar navigation
 *
 * - ScrollTrigger: dark-bg class, logo image swap, --current-bg CSS var
 * - IntersectionObserver: is-active on nav items (more reliable than ScrollTrigger
 *   for active tracking — not affected by stale cached positions after layout shifts)
 */

function initNav(gsap, ScrollTrigger) {
  var logo    = document.getElementById('site-logo');
  var logoImg = document.getElementById('logo-img');
  var lineNav = document.getElementById('line-nav');

  if (!logo || !lineNav) return;

  var darkLogoCount = 0;
  var darkNavCount  = 0;

  function applyDarkLogo() {
    logo.classList.add('dark-bg');
    if (logoImg) logoImg.src = 'assets/logo-white.png';
  }

  function removeDarkLogo() {
    logo.classList.remove('dark-bg');
    if (logoImg) logoImg.src = 'assets/logo.png';
  }

  // ── ScrollTrigger: dark-bg + --current-bg ───────────────────────────────
  // One pass. Logo trigger fires at top-of-viewport, sidebar at midpoint.

  document.querySelectorAll('section, #services-wrapper').forEach(function(section) {
    var isDark    = section.classList.contains('dark-section');
    var sectionBg = window.getComputedStyle(section).backgroundColor;

    ScrollTrigger.create({
      trigger: section,
      start: 'top top+=60',
      end:   'bottom top+=60',
      onEnter:     function() { logo.style.setProperty('--current-bg', sectionBg); if (isDark) { darkLogoCount++; applyDarkLogo(); } },
      onLeave:     function() { if (isDark) { darkLogoCount--; if (darkLogoCount <= 0) removeDarkLogo(); } },
      onEnterBack: function() { logo.style.setProperty('--current-bg', sectionBg); if (isDark) { darkLogoCount++; applyDarkLogo(); } },
      onLeaveBack: function() { if (isDark) { darkLogoCount--; if (darkLogoCount <= 0) removeDarkLogo(); } },
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end:   'bottom center',
      onEnter:     function() { lineNav.style.setProperty('--current-bg', sectionBg); if (isDark) { darkNavCount++; lineNav.classList.add('dark-bg'); } },
      onLeave:     function() { if (isDark) { darkNavCount--; if (darkNavCount <= 0) lineNav.classList.remove('dark-bg'); } },
      onEnterBack: function() { lineNav.style.setProperty('--current-bg', sectionBg); if (isDark) { darkNavCount++; lineNav.classList.add('dark-bg'); } },
      onLeaveBack: function() { if (isDark) { darkNavCount--; if (darkNavCount <= 0) lineNav.classList.remove('dark-bg'); } },
    });
  });

  // Seed logo with hero background immediately
  var hero = document.getElementById('hero');
  if (hero) {
    logo.style.setProperty('--current-bg', window.getComputedStyle(hero).backgroundColor);
  }

  // ── IntersectionObserver: is-active on nav items ─────────────────────────
  // Uses the nav's href list as the source of truth.
  // The section whose centre is most prominent in the viewport wins.

  var navItems = document.querySelectorAll('.nav-item');

  // Build a map: sectionId → navItem
  var navMap = {};
  navItems.forEach(function(item) {
    var href = item.getAttribute('href');
    if (href && href.startsWith('#')) {
      navMap[href.slice(1)] = item;
    }
  });

  // Track intersection ratios so we can pick the "most visible" linked section
  var sectionRatios = {};
  Object.keys(navMap).forEach(function(id) { sectionRatios[id] = 0; });

  var lastBestId = null; // sticky — keeps last active item when between linked sections

  function updateActiveNav() {
    var bestId    = null;
    var bestRatio = 0;
    Object.keys(sectionRatios).forEach(function(id) {
      if (sectionRatios[id] > bestRatio) {
        bestRatio = sectionRatios[id];
        bestId    = id;
      }
    });

    // Only update if a linked section is actually visible.
    // Exception: if we're scrolled back to the top (hero zone), clear the
    // active item so the About line doesn't stay expanded in the hero.
    if (bestId !== null && bestRatio > 0) {
      lastBestId = bestId;
    } else if (bestRatio === 0) {
      // Nothing linked is visible — check if we're above the first linked section
      var firstId  = Object.keys(navMap)[0];
      var firstEl  = firstId && document.getElementById(firstId);
      if (firstEl && firstEl.getBoundingClientRect().top > 0) {
        lastBestId = null; // back in hero, clear active
      }
    }

    navItems.forEach(function(item) {
      var href = item.getAttribute('href');
      item.classList.toggle('is-active', lastBestId !== null && href === '#' + lastBestId);
    });
  }

  var activeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var id = entry.target.id;
      if (id in sectionRatios) {
        sectionRatios[id] = entry.intersectionRatio;
      }
    });
    updateActiveNav();
  }, {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  });

  // Observe only the sections that have nav links
  Object.keys(navMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) activeObserver.observe(el);
  });
}
