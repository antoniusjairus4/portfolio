const canvas = document.getElementById("darkveil-bg");
const gl = canvas && canvas.getContext("webgl", { antialias: false, alpha: true });

function initBackground() {
  if (!canvas || !gl) return;

  const vertexSrc = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSrc = `
    precision mediump float;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec2 uPointer;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      float t = uTime * 0.12;
      float field = noise(p * 2.4 + vec2(t, -t));
      field += 0.5 * noise(p * 4.8 - vec2(t * 1.8, t * 0.7));
      float current = sin((p.x * 1.8 - p.y * 0.85) + uTime * 0.26);
      current += 0.55 * sin((p.x * -1.2 + p.y * 1.6) - uTime * 0.18);
      current = smoothstep(0.66, 1.34, current + field * 0.34);

      vec2 pointer = (uPointer / uResolution.xy) * 2.0 - 1.0;
      pointer.x *= uResolution.x / uResolution.y;
      float cursor = smoothstep(0.42, 0.0, distance(p, pointer));

      vec3 ink = vec3(0.015, 0.018, 0.026);
      vec3 cyan = vec3(0.35, 0.78, 0.98);
      vec3 ember = vec3(1.0, 0.46, 0.18);
      vec3 violet = vec3(0.48, 0.32, 0.95);

      vec3 color = ink;
      color += cyan * smoothstep(0.52, 1.25, field) * 0.17;
      color += ember * smoothstep(0.72, 1.36, field + p.x * 0.18) * 0.12;
      color += violet * smoothstep(0.56, 1.18, field - p.y * 0.16) * 0.16;
      color += mix(cyan, ember, uv.x) * current * 0.055;
      color += cyan * cursor * 0.13;

      float vignette = smoothstep(1.32, 0.22, length(p));
      color *= vignette;
      color += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.018;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSrc);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  gl.useProgram(program);

  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "uTime");
  const uResolution = gl.getUniformLocation(program, "uResolution");
  const uPointer = gl.getUniformLocation(program, "uPointer");
  const pointer = { x: window.innerWidth * 0.68, y: window.innerHeight * 0.38 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function render(time) {
    gl.uniform1f(uTime, time * 0.001);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uPointer, pointer.x * (canvas.width / window.innerWidth), canvas.height - pointer.y * (canvas.height / window.innerHeight));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointer.x += (event.clientX - pointer.x) * 0.22;
    pointer.y += (event.clientY - pointer.y) * 0.22;
  }, { passive: true });

  resize();
  requestAnimationFrame(render);
}

function initReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  revealEls.forEach((el) => observer.observe(el));
}

function initProjectSpotlight() {
  document.querySelectorAll(".project-card, .image-card, .pursuit-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    }, { passive: true });
  });
}

function initPursuitScroll() {
  const section = document.querySelector(".pursuits-section");
  const track = document.getElementById("pursuit-track");
  const sticky = document.querySelector(".pursuits-sticky");

  if (!section || !track || !sticky) return;

  let distance = 0;

  function setup() {
    const shellWidth = sticky.getBoundingClientRect().width;
    distance = Math.max(0, track.scrollWidth - shellWidth);
    const scrollBuffer = window.innerWidth < 761 ? 96 : 144;
    section.style.height = `${window.innerHeight + distance + scrollBuffer}px`;
  }

  function update() {
    if (distance === 0) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.min(distance, Math.max(0, -rect.top));
    track.style.transform = `translate3d(${-progress}px, 0, 0)`;
  }

  setup();
  update();
  window.addEventListener("resize", () => {
    setup();
    update();
  }, { passive: true });
  window.addEventListener("scroll", update, { passive: true });
}

function initActiveNav() {
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.28, rootMargin: "-24% 0px -58% 0px" });

  sections.forEach((section) => observer.observe(section));
}

initBackground();
initReveal();
initProjectSpotlight();
initPursuitScroll();
initActiveNav();
