// /* ═══════════════════════════════════════════════
//    linewaves.js — vanilla WebGL port of LineWaves
//    Drop this into any page. Call:
//      initLineWaves(canvasId, options)
//    ═══════════════════════════════════════════════ */

// function hexToVec3(hex) {
//   const h = hex.replace('#', '');
//   return [
//     parseInt(h.slice(0, 2), 16) / 255,
//     parseInt(h.slice(2, 4), 16) / 255,
//     parseInt(h.slice(4, 6), 16) / 255
//   ];
// }

// const VERT = `
//   attribute vec2 position;
//   attribute vec2 uv;
//   varying vec2 vUv;
//   void main() {
//     vUv = uv;
//     gl_Position = vec4(position, 0.0, 1.0);
//   }
// `;

// const FRAG = `
//   precision highp float;

//   uniform float uTime;
//   uniform vec3  uResolution;
//   uniform float uSpeed;
//   uniform float uInnerLines;
//   uniform float uOuterLines;
//   uniform float uWarpIntensity;
//   uniform float uRotation;
//   uniform float uEdgeFadeWidth;
//   uniform float uColorCycleSpeed;
//   uniform float uBrightness;
//   uniform vec3  uColor1;
//   uniform vec3  uColor2;
//   uniform vec3  uColor3;
//   uniform vec2  uMouse;
//   uniform float uMouseInfluence;
//   uniform bool  uEnableMouse;

//   #define HALF_PI 1.5707963

//   float hashF(float n) {
//     return fract(sin(n * 127.1) * 43758.5453123);
//   }

//   float smoothNoise(float x) {
//     float i = floor(x);
//     float f = fract(x);
//     float u = f * f * (3.0 - 2.0 * f);
//     return mix(hashF(i), hashF(i + 1.0), u);
//   }

//   float displaceA(float coord, float t) {
//     float r = sin(coord * 2.123) * 0.2;
//     r += sin(coord * 3.234 + t * 4.345) * 0.1;
//     r += sin(coord * 0.589 + t * 0.934) * 0.5;
//     return r;
//   }

//   float displaceB(float coord, float t) {
//     float r = sin(coord * 1.345) * 0.3;
//     r += sin(coord * 2.734 + t * 3.345) * 0.2;
//     r += sin(coord * 0.189 + t * 0.934) * 0.3;
//     return r;
//   }

//   vec2 rotate2D(vec2 p, float angle) {
//     float c = cos(angle); float s = sin(angle);
//     return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
//   }

//   void main() {
//     vec2 coords = gl_FragCoord.xy / uResolution.xy;
//     coords = coords * 2.0 - 1.0;
//     coords = rotate2D(coords, uRotation);

//     float halfT = uTime * uSpeed * 0.5;
//     float fullT = uTime * uSpeed;

//     float mouseWarp = 0.0;
//     if (uEnableMouse) {
//       vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
//       float mDist = length(coords - mPos);
//       mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
//     }

//     float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
//     float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
//     float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
//     float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

//     vec2 fieldA  = vec2(warpAx, warpAy);
//     vec2 fieldB  = vec2(warpBx, warpBy);
//     vec2 blended = mix(fieldA, fieldB, 0.5);

//     float fadeTop    = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
//     float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
//     float vMask      = 1.0 - max(fadeTop, fadeBottom);

//     float tileCount = mix(uOuterLines, uInnerLines, vMask);
//     float scaledY   = blended.y * tileCount;
//     float nY        = smoothNoise(abs(scaledY));

//     float ridge = pow(
//       step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
//       5.0
//     );

//     float lines = 0.0;
//     for (float i = 1.0; i < 3.0; i += 1.0) {
//       lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
//     }

//     float pattern = vMask * lines;
//     float cycleT  = fullT * uColorCycleSpeed;

//     float rC = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
//     float gC = (pattern + vMask  * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
//     float bC = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

//     vec3  col   = (rC * uColor1 + gC * uColor2 + bC * uColor3) * uBrightness;
//     float alpha = clamp(length(col), 0.0, 1.0);

//     gl_FragColor = vec4(col, alpha);
//   }
// `;

// function compileShader(gl, type, src) {
//   const s = gl.createShader(type);
//   gl.shaderSource(s, src);
//   gl.compileShader(s);
//   if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
//     console.error('Shader error:', gl.getShaderInfoLog(s));
//     gl.deleteShader(s);
//     return null;
//   }
//   return s;
// }

// function createProgram(gl, vert, frag) {
//   const p = gl.createProgram();
//   gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vert));
//   gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag));
//   gl.linkProgram(p);
//   if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
//     console.error('Program error:', gl.getProgramInfoLog(p));
//     return null;
//   }
//   return p;
// }

// function initLineWaves(canvas, opts = {}) {
//   const o = Object.assign({
//     speed:              0.3,
//     innerLineCount:     32.0,
//     outerLineCount:     36.0,
//     warpIntensity:      1.0,
//     rotation:           -45,
//     edgeFadeWidth:      0.0,
//     colorCycleSpeed:    1.0,
//     brightness:         0.18,
//     color1:             '#9b7fe8',
//     color2:             '#c4a8ff',
//     color3:             '#6d4fc2',
//     enableMouse:        true,
//     mouseInfluence:     2.0
//   }, opts);

//   const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
//   if (!gl) { console.warn('WebGL not supported'); return; }

//   gl.clearColor(0, 0, 0, 0);
//   gl.enable(gl.BLEND);
//   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

//   const prog = createProgram(gl, VERT, FRAG);
//   gl.useProgram(prog);

//   /* Full-screen triangle */
//   const verts = new Float32Array([-1,-1, 3,-1, -1,3]);
//   const uvs   = new Float32Array([0,0, 2,0, 0,2]);

//   const vBuf = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
//   gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
//   const aPos = gl.getAttribLocation(prog, 'position');
//   gl.enableVertexAttribArray(aPos);
//   gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

//   const uBuf = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, uBuf);
//   gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
//   const aUv = gl.getAttribLocation(prog, 'uv');
//   gl.enableVertexAttribArray(aUv);
//   gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

//   /* Uniform locations */
//   const U = {};
//   ['uTime','uResolution','uSpeed','uInnerLines','uOuterLines',
//    'uWarpIntensity','uRotation','uEdgeFadeWidth','uColorCycleSpeed',
//    'uBrightness','uColor1','uColor2','uColor3',
//    'uMouse','uMouseInfluence','uEnableMouse'
//   ].forEach(n => { U[n] = gl.getUniformLocation(prog, n); });

//   const rotRad = (o.rotation * Math.PI) / 180;
//   gl.uniform1f(U.uSpeed,          o.speed);
//   gl.uniform1f(U.uInnerLines,     o.innerLineCount);
//   gl.uniform1f(U.uOuterLines,     o.outerLineCount);
//   gl.uniform1f(U.uWarpIntensity,  o.warpIntensity);
//   gl.uniform1f(U.uRotation,       rotRad);
//   gl.uniform1f(U.uEdgeFadeWidth,  o.edgeFadeWidth);
//   gl.uniform1f(U.uColorCycleSpeed,o.colorCycleSpeed);
//   gl.uniform1f(U.uBrightness,     o.brightness);
//   gl.uniform3fv(U.uColor1,        hexToVec3(o.color1));
//   gl.uniform3fv(U.uColor2,        hexToVec3(o.color2));
//   gl.uniform3fv(U.uColor3,        hexToVec3(o.color3));
//   gl.uniform1f(U.uMouseInfluence, o.mouseInfluence);
//   gl.uniform1i(U.uEnableMouse,    o.enableMouse ? 1 : 0);

//   let mouse = [0.5, 0.5];
//   let target = [0.5, 0.5];

//   if (o.enableMouse) {
//     canvas.addEventListener('mousemove', e => {
//       const r = canvas.getBoundingClientRect();
//       target = [
//         (e.clientX - r.left) / r.width,
//         1.0 - (e.clientY - r.top) / r.height
//       ];
//     });
//     canvas.addEventListener('mouseleave', () => { target = [0.5, 0.5]; });
//   }

//   function resize() {
//     const w = canvas.offsetWidth;
//     const h = canvas.offsetHeight;
//     canvas.width  = w;
//     canvas.height = h;
//     gl.viewport(0, 0, w, h);
//     gl.uniform3f(U.uResolution, w, h, w / h);
//   }
//   window.addEventListener('resize', resize);
//   resize();

//   let raf;
//   function frame(t) {
//     raf = requestAnimationFrame(frame);
//     gl.clear(gl.COLOR_BUFFER_BIT);

//     mouse[0] += 0.05 * (target[0] - mouse[0]);
//     mouse[1] += 0.05 * (target[1] - mouse[1]);
//     gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
//     gl.uniform1f(U.uTime, t * 0.001);

//     gl.drawArrays(gl.TRIANGLES, 0, 3);
//   }
//   raf = requestAnimationFrame(frame);

//   /* Return cleanup function */
//   return () => {
//     cancelAnimationFrame(raf);
//     window.removeEventListener('resize', resize);
//     gl.getExtension('WEBGL_lose_context')?.loseContext();
//   };
// }

// window.initLineWaves = initLineWaves;