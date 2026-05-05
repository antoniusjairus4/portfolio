/* ── edu.js — education page only ── */

// Scroll to anchor on load
window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {

  /* ── Fade-in on scroll ── */
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ── LiquidEther — School section ── */
  const schoolEl = document.getElementById('school-fluid');
  if (schoolEl && window.initLiquidEther) {
    initLiquidEther(schoolEl, {
      colors: ['#5227FF', '#9b7fe8', '#c4a8ff'],
      mouseForce: 20,
      cursorSize: 100,
      isViscous: true,
      viscous: 30,
      iterationsViscous: 32,
      iterationsPoisson: 32,
      resolution: 0.5,
      dt: 0.014,
      BFECC: true,
      isBounce: false,
      autoDemo: true,
      autoSpeed: 0.5,
      autoIntensity: 2.2,
      takeoverDuration: 0.25,
      autoResumeDelay: 3000,
      autoRampDuration: 0.6
    });
  }

  /* ── LiquidEther — College section ── */
  const collegeEl = document.getElementById('college-fluid');
  if (collegeEl && window.initLiquidEther) {
    initLiquidEther(collegeEl, {
      colors: ['#3d1fa8', '#FF9FFC', '#B497CF'],
      mouseForce: 20,
      cursorSize: 100,
      isViscous: true,
      viscous: 30,
      iterationsViscous: 32,
      iterationsPoisson: 32,
      resolution: 0.5,
      dt: 0.014,
      BFECC: true,
      isBounce: false,
      autoDemo: true,
      autoSpeed: 0.4,
      autoIntensity: 2.0,
      takeoverDuration: 0.25,
      autoResumeDelay: 3000,
      autoRampDuration: 0.6
    });
  }

});