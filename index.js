/* ── 1. WEBGL BACKGROUND (DARK VEIL) ── */
const canvas = document.getElementById("darkveil-bg");
const gl = canvas.getContext("webgl");

function resize() {
  // Use innerWidth/Height to fill the full viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resize);
resize();

const vertexSrc = `attribute vec2 position; void main(){ gl_Position = vec4(position,0.0,1.0); }`;
const fragmentSrc = `
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
float rand(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv = uv * 2.0 - 1.0;
  float t = uTime * 0.5;
  uv += 0.2 * vec2(sin(uv.y * 6.0 + t), cos(uv.x * 6.0 + t));
  float color = sin(uv.x * 3.0 + t) + cos(uv.y * 3.0 - t);
  vec3 col = vec3(0.05 + 0.15 * color, 0.01, 0.2 + 0.3 * color); // Darker purple for readability
  col += (rand(uv + t) - 0.5) * 0.03;
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

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
const posLoc = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

const uTime = gl.getUniformLocation(program, "uTime");
const uRes  = gl.getUniformLocation(program, "uResolution");

function render(time) {
  gl.uniform1f(uTime, time * 0.001);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}
render();


/* ── 2. TYPEWRITER EFFECT ── */
const firstText = 'Antonius', secondText = 'Jairus';
const firstEl = document.getElementById('first'), secondEl = document.getElementById('second');
let i = 0, j = 0;

function typeFirst() {
  if (i < firstText.length) {
    firstEl.textContent += firstText.charAt(i++);
    firstEl.classList.add('glitch');
    firstEl.setAttribute('data-text', firstEl.textContent);
    setTimeout(typeFirst, 80);
  } else setTimeout(typeSecond, 200);
}
function typeSecond() {
  if (j < secondText.length) {
    secondEl.textContent += secondText.charAt(j++);
    secondEl.classList.add('glitch');
    secondEl.setAttribute('data-text', secondEl.textContent);
    setTimeout(typeSecond, 80);
  } else {
    setTimeout(() => { [firstEl, secondEl].forEach(el => el.classList.remove('glitch')); }, 700);
  }
}

if (!sessionStorage.getItem('typed')) {
  typeFirst();
  sessionStorage.setItem('typed', 'yes');
} else {
  firstEl.textContent = firstText; secondEl.textContent = secondText;
}


/* ── 3. PORTRAIT & SCROLL INTERACTION ── */
const portrait = document.querySelector('.portrait');
const eduSection = document.getElementById('education-section');

window.addEventListener('scroll', () => {
  // Hide portrait when scrolling into education
  if (window.scrollY > eduSection.offsetTop - 200) portrait.classList.add('hide');
  else portrait.classList.remove('hide');
}, { passive: true });


/* ── 4. HORIZONTAL PURSUITS TRACK ── */
const achSection = document.getElementById('achievements-section');
const track = document.getElementById('horizontal-track');
let scrollDist = 0;

function setupAchievements() {
  const trackWidth = track.scrollWidth;
  scrollDist = Math.max(0, trackWidth - window.innerWidth + 160);
  achSection.style.height = (window.innerHeight + scrollDist) + 'px';
}

// Crucial: Wait for images/styles to load before calculating width
window.addEventListener('load', setupAchievements);
window.addEventListener('resize', setupAchievements);

window.addEventListener('scroll', () => {
  const rect = achSection.getBoundingClientRect();
  if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
    const progress = Math.abs(rect.top);
    track.style.transform = `translateX(-${Math.min(progress, scrollDist)}px)`;
  }
}, { passive: true });


/* ── 5. GLITCH ON SCROLL ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('glitch-active');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.glitch-on-scroll').forEach(el => observer.observe(el));
