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

window.addEventListener('scroll', handleHorizontalScroll, { passive: true });const canvas = document.getElementById("darkveil-bg");
const gl = canvas.getContext("webgl");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
window.addEventListener("resize", resize);
resize();

const vertexSrc = `
attribute vec2 position;
void main(){
  gl_Position = vec4(position,0.0,1.0);
}
`;

const fragmentSrc = `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;

float rand(vec2 p){
  return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv = uv * 2.0 - 1.0;

  float t = uTime * 0.5;

  // Warp effect
  uv += 0.2 * vec2(
    sin(uv.y * 6.0 + t),
    cos(uv.x * 6.0 + t)
  );

  float color = sin(uv.x * 3.0 + t) + cos(uv.y * 3.0 - t);

  // Dark purple theme
  vec3 col = vec3(
    0.1 + 0.3 * color,
    0.0,
    0.3 + 0.6 * color
  );

  // Noise
  col += (rand(uv + t) - 0.5) * 0.05;

  gl_FragColor = vec4(col, 1.0);
}
`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSrc));
gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSrc));
gl.linkProgram(program);
gl.useProgram(program);

const vertices = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const position = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

const uTime = gl.getUniformLocation(program, "uTime");
const uResolution = gl.getUniformLocation(program, "uResolution");

function render(time) {
  gl.uniform1f(uTime, time * 0.001);
  gl.uniform2f(uResolution, canvas.width, canvas.height);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}

render();

