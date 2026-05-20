/**
 * hero.js — Page cover wipe, hero intro timeline, mouse parallax shapes
 */

function initHero(gsap) {
  var cover = document.getElementById('page-cover');

  var heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });

  heroTl
    .from('.hero-label',         { y: 30, opacity: 0, duration: 1 })
    .from('.line-inner',         { yPercent: 105, duration: 1.2, stagger: 0.15 }, '-=0.6')
    .call(function() {
      document.querySelectorAll('.stroke-text').forEach(function(el, i) {
        setTimeout(function() { el.classList.add('filled'); }, i * 200);
      });
    }, null, '-=0.8')
    .from('.hero-sub',           { y: 30, opacity: 0, duration: 1 }, '-=0.5')
    .from('.hero-links .btn',    { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.7')
    .from('.logo',               { opacity: 0, x: -20, duration: 0.8 }, '-=0.8')
    .from('.nav-item',           { opacity: 0, x: -10, duration: 0.6, stagger: 0.08 }, '-=0.6')
    .from('.float-shape',        { scale: 0, opacity: 0, duration: 1.5, stagger: 0.2, ease: 'elastic.out(1, 0.5)' }, '-=1.5')
    .fromTo('.hero-bg-image',    { x: 100, opacity: 0 }, { x: 0, opacity: 0.85, duration: 1.5, ease: 'power3.out' }, '-=1.5');

  document.body.classList.remove('js-loading');

  gsap.to(cover, {
    yPercent: -100,
    duration: 0.8,
    ease: 'power3.inOut',
    onComplete: function() { cover.style.display = 'none'; },
  });

  setTimeout(function() { heroTl.play(); }, 150);

  // Magnetic buttons
  if (window.innerWidth >= 768) {
    document.querySelectorAll('.magnetic').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width  / 2) * 0.25;
        var y = (e.clientY - rect.top  - rect.height / 2) * 0.25;
        btn.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        btn.style.transform  = 'translate(' + x + 'px, ' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btn.style.transform  = '';
      });
    });
  }

  // Float-shape mouse parallax
  if (window.innerWidth >= 768) {
    var shapes  = document.querySelectorAll('.float-shape');
    var factors = [0.03, -0.04, 0.05, -0.07, 0.06];
    var heroEl  = document.getElementById('hero');
    var ticking = false;

    heroEl.addEventListener('mousemove', function(e) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        var dx = e.clientX - window.innerWidth  / 2;
        var dy = e.clientY - window.innerHeight / 2;
        shapes.forEach(function(shape, i) {
          var f = factors[i] !== undefined ? factors[i] : 0.03;
          shape.style.transform = 'translate(' + (dx * f) + 'px, ' + (dy * f) + 'px)';
        });
        ticking = false;
      });
    });
  }
}
