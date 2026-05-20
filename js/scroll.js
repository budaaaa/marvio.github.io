/**
 * scroll.js — Progress bar, is-scrolled toggle, scroll-to-top, smooth anchors
 * Single rAF-throttled listener. No duplicates.
 */

function initScroll(ScrollTrigger) {
  var progressBar  = document.getElementById('scroll-progress');
  var siteLogo     = document.getElementById('site-logo');
  var lineNav      = document.getElementById('line-nav');
  var scrollTopBtn = document.getElementById('scroll-top');
  var ticking      = false;

  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var scrollY    = window.scrollY;
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;

      if (progressBar) {
        progressBar.style.transform = 'scaleX(' + (scrollable > 0 ? scrollY / scrollable : 0) + ')';
      }

      var scrolled = scrollY > 30;
      if (siteLogo) siteLogo.classList.toggle('is-scrolled', scrolled);
      if (lineNav)  lineNav.classList.toggle('is-scrolled',  scrolled);

      ticking = false;
    });
  }, { passive: true });

  // Scroll-to-top button
  if (scrollTopBtn) {
    ScrollTrigger.create({
      trigger: '#hero',
      start:   'bottom top',
      onEnter:     function() { scrollTopBtn.classList.add('visible'); },
      onEnterBack: function() { scrollTopBtn.classList.remove('visible'); },
    });
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
