/* ── edu.js — interactions for edu.html ── */

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

  /* ── Wave canvas background (LineWaves) ── */
  const waveCanvas = document.getElementById('wave-canvas');
  if (waveCanvas && window.initLineWaves) {
    initLineWaves(waveCanvas, {
      speed: 0.25, innerLineCount: 28, outerLineCount: 32,
      warpIntensity: 0.8, rotation: -45, edgeFadeWidth: 0,
      colorCycleSpeed: 0.8, brightness: 0.25,
      color1: '#9b7fe8', color2: '#c4a8ff', color3: '#6d4fc2',
      enableMouse: true, mouseInfluence: 1.5
    });
  }

  /* ── LiquidEther on school + college section headers ── */
  if (window.initLiquidEther) {
    /* School hero strip */
    const schoolFluid = document.getElementById('school-fluid');
    if (schoolFluid) {
      initLiquidEther(schoolFluid, {
        colors: ['#5227FF', '#9b7fe8', '#c4a8ff'],
        mouseForce: 20, cursorSize: 100,
        isViscous: true, viscous: 30,
        iterationsViscous: 32, iterationsPoisson: 32,
        resolution: 0.5, dt: 0.014, BFECC: true, isBounce: false,
        autoDemo: true, autoSpeed: 0.5, autoIntensity: 2.2,
        takeoverDuration: 0.25, autoResumeDelay: 3000, autoRampDuration: 0.6
      });
    }

    /* College hero strip */
    const collegeFluid = document.getElementById('college-fluid');
    if (collegeFluid) {
      initLiquidEther(collegeFluid, {
        colors: ['#3d1fa8', '#FF9FFC', '#B497CF'],
        mouseForce: 20, cursorSize: 100,
        isViscous: true, viscous: 30,
        iterationsViscous: 32, iterationsPoisson: 32,
        resolution: 0.5, dt: 0.014, BFECC: true, isBounce: false,
        autoDemo: true, autoSpeed: 0.4, autoIntensity: 2.0,
        takeoverDuration: 0.25, autoResumeDelay: 3000, autoRampDuration: 0.6
      });
    }
  }
});