/**
 * parallax.js — GSAP parallax for hero + founder images
 *
 * Disabled on mobile (< 768px) — on mobile the images are positioned
 * absolutely at top: -125px with a fixed height. Running yPercent on them
 * on top of that causes vertical jank/shaking during scroll.
 */

function initParallax(gsap, ScrollTrigger) {
  // No parallax on mobile — the images are laid out completely differently
  if (window.innerWidth < 768) return;

  gsap.to('.hero-bg-image', {
    yPercent: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-why-wrap',
      start:   'top top',
      end:     'bottom top',
      scrub:   1,
    },
  });

  var founderImg = document.querySelector('.founder-bg-image');
  if (founderImg) {
    gsap.fromTo(founderImg,
      { x: 100, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: '.work-team-wrap', start: 'top 60%' },
      }
    );

    gsap.to('.founder-bg-image', {
      yPercent: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.work-team-wrap',
        start:   'top bottom',
        end:     'bottom top',
        scrub:   1,
      },
    });
  }
}
