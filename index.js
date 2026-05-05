/* ── index.js — interactions for index.html ── */

/* ── TYPEWRITER with one-shot glitch ── */
const firstText  = 'Antonius';
const secondText = 'Jairus';
let i = 0, j = 0;
const firstEl  = document.getElementById('first');
const secondEl = document.getElementById('second');

function typeFirst() {
  if (i < firstText.length) {
    firstEl.textContent += firstText.charAt(i);
    firstEl.classList.add('glitch');
    firstEl.setAttribute('data-text', firstEl.textContent);
    i++;
    setTimeout(typeFirst, 80);
  } else {
    setTimeout(typeSecond, 200);
  }
}

function typeSecond() {
  if (j < secondText.length) {
    secondEl.textContent += secondText.charAt(j);
    secondEl.classList.add('glitch');
    secondEl.setAttribute('data-text', secondEl.textContent);
    j++;
    setTimeout(typeSecond, 80);
  } else {
    setTimeout(() => {
      firstEl.classList.remove('glitch');
      secondEl.classList.remove('glitch');
    }, 700);
  }
}

// Play once per tab session
if (!sessionStorage.getItem('typed')) {
  typeFirst();
  sessionStorage.setItem('typed', 'yes');
} else {
  firstEl.textContent = firstText;
  secondEl.textContent = secondText;
}


/* ── PORTRAIT: hide when user scrolls past education ── */
const portrait         = document.querySelector('.portrait');
const educationSection = document.getElementById('education-section');

function handlePortrait() {
  const triggerTop = educationSection.offsetTop;
  if (window.scrollY > triggerTop + 300) {
    portrait.classList.add('hide');
  } else {
    portrait.classList.remove('hide');
  }
}
window.addEventListener('scroll', handlePortrait, { passive: true });


/* ── GLITCH ON SCROLL (IntersectionObserver, fires once per element) ── */
const glitchEls = document.querySelectorAll('.glitch-on-scroll');
const glitchObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('glitch-active');
      glitchObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

glitchEls.forEach(el => glitchObserver.observe(el));


/* ── HORIZONTAL SCROLL FOR PURSUITS ──
   Section height = 100vh + card overflow.
   Vertical scroll inside section → horizontal translateX on track.
*/
const achSection = document.getElementById('achievements-section');
const track      = document.getElementById('horizontal-track');

function setupAchievements() {
  const trackWidth     = track.scrollWidth;
  const visibleWidth   = window.innerWidth;
  const scrollDistance = Math.max(0, trackWidth - visibleWidth + 160);
  achSection.style.height = (window.innerHeight + scrollDistance) + 'px';
  return scrollDistance;
}

let scrollDistance = setupAchievements();
window.addEventListener('resize', () => { scrollDistance = setupAchievements(); }, { passive: true });

function handleHorizontalScroll() {
  const sectionTop = achSection.offsetTop;
  const scrolled   = window.scrollY - sectionTop;
  const progress   = Math.min(scrollDistance, Math.max(0, scrolled));
  track.style.transform = `translateX(-${progress}px)`;
}

window.addEventListener('scroll', handleHorizontalScroll, { passive: true });