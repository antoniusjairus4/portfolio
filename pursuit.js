/* ── pursuit.js — shared interactions for all pursuit pages ── */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ── Fade-in on scroll ── */
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => observer.observe(el));

  /* ── Wave canvas background (optional, only if canvas exists) ── */
  const canvas = document.getElementById('wave-canvas');
  if (canvas && typeof window.initLineWaves === 'function') {
    window.initLineWaves(canvas, {
      speed:           0.25,
      innerLineCount:  28,
      outerLineCount:  32,
      warpIntensity:   0.8,
      rotation:        -45,
      edgeFadeWidth:   0.0,
      colorCycleSpeed: 0.8,
      brightness:      0.14,
      color1:          '#9b7fe8',
      color2:          '#c4a8ff',
      color3:          '#6d4fc2',
      enableMouse:     true,
      mouseInfluence:  1.5
    });
  }
});
