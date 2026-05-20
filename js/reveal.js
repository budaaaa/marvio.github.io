/**
 * reveal.js — IntersectionObserver for .reveal-fade / .reveal-slide / .reveal-card
 * No GSAP dependency.
 */

function initReveal() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });

  document.querySelectorAll('.reveal-fade, .reveal-slide, .reveal-card').forEach(function(el) {
    observer.observe(el);
  });
}
