/**
 * main.js — Entry point. Wires all modules together.
 * Loaded last. GSAP is already on window from CDN script tags above.
 */

window.addEventListener('load', function() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero must run first — removes js-loading class and fires page cover wipe
  initHero(gsap);
  initNav(gsap, ScrollTrigger);
  initScroll(ScrollTrigger);
  initReveal();
  initParallax(gsap, ScrollTrigger);
  initCollab();
  initForm();

  // Refresh ScrollTrigger after GSAP animations have settled layout
  setTimeout(function() { ScrollTrigger.refresh(); }, 500);
});
