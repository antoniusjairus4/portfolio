/* ═══════════════════════════════════════════════════════════
   liquidether.js — vanilla JS port of LiquidEther (no React)
   Depends on: three.js r128 from CDN
   Usage: initLiquidEther(container, options)
   ═══════════════════════════════════════════════════════════ */

(function (global) {

  function hexToColor(hex) {
    return new THREE.Color(hex);
  }

  function makePaletteTexture(stops) {
    let arr = (Array.isArray(stops) && stops.length > 0)
      ? (stops.length === 1 ? [stops[0], stops[0]] : stops)
      : ['#ffffff', '#ffffff'];
    const w = arr.length;
    const data = new Uint8Array(w * 4);
    for (let i = 0; i < w; i++) {
      const c = new THREE.Color(arr[i]);
      data[i * 4 + 0] = Math.round(c.r * 255);
      data[i * 4 + 1] = Math.round(c.g * 255);
      data[i * 4 + 2] = Math.round(c.b * 255);
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  /* ── SHADERS ── */
  const face_vert = `
    attribute vec3 position;
    uniform vec2 px;
    uniform vec2 boundarySpace;
    varying vec2 uv;
    precision highp float;
    void main(){
      vec3 pos = position;
      vec2 scale = 1.0 - boundarySpace * 2.0;
      pos.xy = pos.xy * scale;
      uv = vec2(0.5)+(pos.xy)*0.5;
      gl_Position = vec4(pos, 1.0);
    }
  `;
  const line_vert = `
    attribute vec3 position;
    uniform vec2 px;
    precision highp float;
    varying vec2 uv;
    void main(){
      vec3 pos = position;
      uv = 0.5 + pos.xy * 0.5;
      vec2 n = sign(pos.xy);
      pos.xy = abs(pos.xy) - px * 1.0;
      pos.xy *= n;
      gl_Position = vec4(pos, 1.0);
    }
  `;
  const mouse_vert = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
      vec2 pos = position.xy * scale * 2.0 * px + center;
      vUv = uv;
      gl_Position = vec4(pos, 0.0, 1.0);
    }
  `;
  const advection_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform bool isBFECC;
    uniform vec2 fboSize;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
      vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
      if(isBFECC == false){
        vec2 vel = texture2D(velocity, uv).xy;
        vec2 uv2 = uv - vel * dt * ratio;
        vec2 newVel = texture2D(velocity, uv2).xy;
        gl_FragColor = vec4(newVel, 0.0, 0.0);
      } else {
        vec2 spot_new = uv;
        vec2 vel_old = texture2D(velocity, uv).xy;
        vec2 spot_old = spot_new - vel_old * dt * ratio;
        vec2 vel_new1 = texture2D(velocity, spot_old).xy;
        vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
        vec2 error = spot_new2 - spot_new;
        vec2 spot_new3 = spot_new - error / 2.0;
        vec2 vel_2 = texture2D(velocity, spot_new3).xy;
        vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
        vec2 newVel2 = texture2D(velocity, spot_old2).xy;
        gl_FragColor = vec4(newVel2, 0.0, 0.0);
      }
    }
  `;
  const color_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D palette;
    uniform vec4 bgColor;
    varying vec2 uv;
    void main(){
      vec2 vel = texture2D(velocity, uv).xy;
      float lenv = clamp(length(vel), 0.0, 1.0);
      vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
      vec3 outRGB = mix(bgColor.rgb, c, lenv);
      float outA = mix(bgColor.a, 1.0, lenv);
      gl_FragColor = vec4(outRGB, outA);
    }
  `;
  const divergence_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
      float x0 = texture2D(velocity, uv-vec2(px.x,0.0)).x;
      float x1 = texture2D(velocity, uv+vec2(px.x,0.0)).x;
      float y0 = texture2D(velocity, uv-vec2(0.0,px.y)).y;
      float y1 = texture2D(velocity, uv+vec2(0.0,px.y)).y;
      float divergence = (x1-x0+y1-y0)/2.0;
      gl_FragColor = vec4(divergence/dt);
    }
  `;
  const externalForce_frag = `
    precision highp float;
    uniform vec2 force;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
      vec2 circle = (vUv - 0.5) * 2.0;
      float d = 1.0 - min(length(circle), 1.0);
      d *= d;
      gl_FragColor = vec4(force * d, 0.0, 1.0);
    }
  `;
  const poisson_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D divergence;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
      float p0 = texture2D(pressure, uv+vec2(px.x*2.0,0.0)).r;
      float p1 = texture2D(pressure, uv-vec2(px.x*2.0,0.0)).r;
      float p2 = texture2D(pressure, uv+vec2(0.0,px.y*2.0)).r;
      float p3 = texture2D(pressure, uv-vec2(0.0,px.y*2.0)).r;
      float div = texture2D(divergence, uv).r;
      float newP = (p0+p1+p2+p3)/4.0 - div;
      gl_FragColor = vec4(newP);
    }
  `;
  const pressure_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D velocity;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
      float p0 = texture2D(pressure, uv+vec2(px.x,0.0)).r;
      float p1 = texture2D(pressure, uv-vec2(px.x,0.0)).r;
      float p2 = texture2D(pressure, uv+vec2(0.0,px.y)).r;
      float p3 = texture2D(pressure, uv-vec2(0.0,px.y)).r;
      vec2 v = texture2D(velocity, uv).xy;
      vec2 gradP = vec2(p0-p1, p2-p3)*0.5;
      v = v - gradP * dt;
      gl_FragColor = vec4(v, 0.0, 1.0);
    }
  `;
  const viscous_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D velocity_new;
    uniform float v;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
      vec2 old = texture2D(velocity, uv).xy;
      vec2 n0 = texture2D(velocity_new, uv+vec2(px.x*2.0,0.0)).xy;
      vec2 n1 = texture2D(velocity_new, uv-vec2(px.x*2.0,0.0)).xy;
      vec2 n2 = texture2D(velocity_new, uv+vec2(0.0,px.y*2.0)).xy;
      vec2 n3 = texture2D(velocity_new, uv-vec2(0.0,px.y*2.0)).xy;
      vec2 newv = 4.0*old + v*dt*(n0+n1+n2+n3);
      newv /= 4.0*(1.0+v*dt);
      gl_FragColor = vec4(newv, 0.0, 0.0);
    }
  `;

  /* ── CORE ── */
  function initLiquidEther(container, opts) {
    opts = Object.assign({
      mouseForce: 20,
      cursorSize: 100,
      isViscous: true,
      viscous: 30,
      iterationsViscous: 32,
      iterationsPoisson: 32,
      dt: 0.014,
      BFECC: true,
      resolution: 0.5,
      isBounce: false,
      colors: ['#5227FF', '#FF9FFC', '#B497CF'],
      autoDemo: true,
      autoSpeed: 0.5,
      autoIntensity: 2.2,
      takeoverDuration: 0.25,
      autoResumeDelay: 3000,
      autoRampDuration: 0.6
    }, opts);

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.style.position = container.style.position || 'relative';
    container.appendChild(canvas);

    let W = 1, H = 1;

    function resize() {
      const r = container.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      renderer.setSize(W, H, false);
      if (sim) sim.resize(W, H);
    }

    /* ── FBO factory ── */
    function makeFBO(w, h) {
      const isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);
      return new THREE.WebGLRenderTarget(w, h, {
        type: isIOS ? THREE.HalfFloatType : THREE.FloatType,
        depthBuffer: false, stencilBuffer: false,
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping
      });
    }

    /* ── ShaderPass ── */
    function makePass(vertSrc, fragSrc, uniforms, output) {
      const scene = new THREE.Scene();
      const cam = new THREE.Camera();
      const mat = new THREE.RawShaderMaterial({ vertexShader: vertSrc, fragmentShader: fragSrc, uniforms });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      scene.add(mesh);
      return {
        scene, cam, mat, mesh,
        render(target) {
          renderer.setRenderTarget(target !== undefined ? target : null);
          renderer.render(scene, cam);
          renderer.setRenderTarget(null);
        }
      };
    }

    /* ── Mouse ── */
    const mouse = {
      coords: new THREE.Vector2(0, 0),
      coords_old: new THREE.Vector2(0, 0),
      diff: new THREE.Vector2(0, 0),
      moved: false,
      isInside: false
    };

    canvas.parentElement.addEventListener('mousemove', e => {
      const r = container.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height * 2 - 1);
      mouse.coords.set(nx, ny);
      mouse.moved = true;
      mouse.isInside = true;
    });
    container.addEventListener('mouseleave', () => { mouse.isInside = false; });
    container.addEventListener('touchmove', e => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const r = container.getBoundingClientRect();
      mouse.coords.set(
        (t.clientX - r.left) / r.width * 2 - 1,
        -((t.clientY - r.top) / r.height * 2 - 1)
      );
      mouse.moved = true;
    }, { passive: true });

    /* ── Auto driver ── */
    let autoCurrent = new THREE.Vector2(0, 0);
    let autoTarget  = new THREE.Vector2();
    let lastUserMs  = performance.now();
    let autoRafT    = performance.now();

    function pickAutoTarget() {
      const m = 0.2;
      autoTarget.set((Math.random() * 2 - 1) * (1 - m), (Math.random() * 2 - 1) * (1 - m));
    }
    pickAutoTarget();

    function updateAuto(now) {
      const idle = now - lastUserMs;
      if (idle < opts.autoResumeDelay || mouse.isInside) return;
      const dtSec = Math.min((now - autoRafT) / 1000, 0.05);
      autoRafT = now;
      const dir = new THREE.Vector2().subVectors(autoTarget, autoCurrent);
      if (dir.length() < 0.02) { pickAutoTarget(); return; }
      dir.normalize().multiplyScalar(opts.autoSpeed * dtSec);
      autoCurrent.add(dir);
      mouse.coords.copy(autoCurrent);
      mouse.moved = true;
    }

    /* ── Simulation ── */
    let fbos, advPass, forcePass, viscPass, divPass, poisPass, presPass, colorPass;
    let cellScale = new THREE.Vector2();
    let fboSize   = new THREE.Vector2();
    let paletteTex = makePaletteTexture(opts.colors);

    function buildSim(w, h) {
      const sw = Math.max(1, Math.round(opts.resolution * w));
      const sh = Math.max(1, Math.round(opts.resolution * h));
      fboSize.set(sw, sh);
      cellScale.set(1 / sw, 1 / sh);

      fbos = {};
      ['vel_0','vel_1','visc0','visc1','div','pres0','pres1'].forEach(k => {
        fbos[k] = makeFBO(sw, sh);
      });

      /* Advection */
      advPass = makePass(face_vert, advection_frag, {
        boundarySpace: { value: cellScale.clone() },
        px: { value: cellScale.clone() },
        fboSize: { value: fboSize.clone() },
        velocity: { value: fbos.vel_0.texture },
        dt: { value: opts.dt },
        isBFECC: { value: opts.BFECC }
      });
      /* Boundary lines for advection */
      const bG = new THREE.BufferGeometry();
      bG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]), 3));
      const bLine = new THREE.LineSegments(bG, new THREE.RawShaderMaterial({
        vertexShader: line_vert, fragmentShader: advection_frag,
        uniforms: advPass.mat.uniforms
      }));
      advPass.scene.add(bLine);

      /* External force */
      const forceGeo = new THREE.PlaneGeometry(1, 1);
      const forceMat = new THREE.RawShaderMaterial({
        vertexShader: mouse_vert, fragmentShader: externalForce_frag,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: {
          px: { value: cellScale.clone() },
          force: { value: new THREE.Vector2() },
          center: { value: new THREE.Vector2() },
          scale: { value: new THREE.Vector2(opts.cursorSize, opts.cursorSize) }
        }
      });
      const forceMesh = new THREE.Mesh(forceGeo, forceMat);
      const forceScene = new THREE.Scene();
      const forceCam = new THREE.Camera();
      forceScene.add(forceMesh);
      forcePass = { scene: forceScene, cam: forceCam, mat: forceMat, mesh: forceMesh,
        render(t) { renderer.setRenderTarget(t||null); renderer.render(forceScene, forceCam); renderer.setRenderTarget(null); }
      };

      /* Viscous */
      viscPass = makePass(face_vert, viscous_frag, {
        boundarySpace: { value: cellScale.clone() },
        velocity: { value: fbos.vel_1.texture },
        velocity_new: { value: fbos.visc0.texture },
        v: { value: opts.viscous },
        px: { value: cellScale.clone() },
        dt: { value: opts.dt }
      });

      /* Divergence */
      divPass = makePass(face_vert, divergence_frag, {
        boundarySpace: { value: cellScale.clone() },
        velocity: { value: fbos.vel_1.texture },
        px: { value: cellScale.clone() },
        dt: { value: opts.dt }
      });

      /* Poisson */
      poisPass = makePass(face_vert, poisson_frag, {
        boundarySpace: { value: cellScale.clone() },
        pressure: { value: fbos.pres0.texture },
        divergence: { value: fbos.div.texture },
        px: { value: cellScale.clone() }
      });

      /* Pressure */
      presPass = makePass(face_vert, pressure_frag, {
        boundarySpace: { value: cellScale.clone() },
        pressure: { value: fbos.pres0.texture },
        velocity: { value: fbos.vel_1.texture },
        px: { value: cellScale.clone() },
        dt: { value: opts.dt }
      });

      /* Color output */
      colorPass = makePass(face_vert, color_frag, {
        velocity: { value: fbos.vel_0.texture },
        boundarySpace: { value: new THREE.Vector2() },
        palette: { value: paletteTex },
        bgColor: { value: new THREE.Vector4(0, 0, 0, 0) }
      });
    }

    const sim = {
      resize(w, h) {
        const sw = Math.max(1, Math.round(opts.resolution * w));
        const sh = Math.max(1, Math.round(opts.resolution * h));
        fboSize.set(sw, sh);
        cellScale.set(1 / sw, 1 / sh);
        Object.values(fbos).forEach(fbo => fbo.setSize(sw, sh));
      }
    };

    resize();
    buildSim(W, H);

    /* ── Frame loop ── */
    let raf;
    function frame(now) {
      raf = requestAnimationFrame(frame);

      if (!mouse.isInside && opts.autoDemo) updateAuto(now);

      mouse.diff.subVectors(mouse.coords, mouse.coords_old);
      mouse.coords_old.copy(mouse.coords);
      if (!mouse.isInside && opts.autoDemo) mouse.diff.multiplyScalar(opts.autoIntensity);

      /* 1. Advection */
      advPass.mat.uniforms.velocity.value = fbos.vel_0.texture;
      advPass.mat.uniforms.isBFECC.value = opts.BFECC;
      advPass.mat.uniforms.dt.value = opts.dt;
      advPass.render(fbos.vel_1);

      /* 2. External force */
      const forceUniforms = forcePass.mat.uniforms;
      forceUniforms.force.value.set(mouse.diff.x / 2 * opts.mouseForce, mouse.diff.y / 2 * opts.mouseForce);
      const csX = opts.cursorSize * cellScale.x;
      const csY = opts.cursorSize * cellScale.y;
      forceUniforms.center.value.set(
        Math.min(Math.max(mouse.coords.x, -1 + csX), 1 - csX),
        Math.min(Math.max(mouse.coords.y, -1 + csY), 1 - csY)
      );
      forcePass.render(fbos.vel_1);

      /* 3. Viscous */
      let velFBO = fbos.vel_1;
      if (opts.isViscous) {
        viscPass.mat.uniforms.velocity.value = fbos.vel_1.texture;
        for (let i = 0; i < opts.iterationsViscous; i++) {
          const inFBO  = i % 2 === 0 ? fbos.visc0 : fbos.visc1;
          const outFBO = i % 2 === 0 ? fbos.visc1 : fbos.visc0;
          viscPass.mat.uniforms.velocity_new.value = inFBO.texture;
          viscPass.render(outFBO);
          velFBO = outFBO;
        }
      }

      /* 4. Divergence */
      divPass.mat.uniforms.velocity.value = velFBO.texture;
      divPass.render(fbos.div);

      /* 5. Poisson */
      let presFBO = fbos.pres0;
      poisPass.mat.uniforms.divergence.value = fbos.div.texture;
      for (let i = 0; i < opts.iterationsPoisson; i++) {
        const inP  = i % 2 === 0 ? fbos.pres0 : fbos.pres1;
        const outP = i % 2 === 0 ? fbos.pres1 : fbos.pres0;
        poisPass.mat.uniforms.pressure.value = inP.texture;
        poisPass.render(outP);
        presFBO = outP;
      }

      /* 6. Pressure projection */
      presPass.mat.uniforms.velocity.value = velFBO.texture;
      presPass.mat.uniforms.pressure.value = presFBO.texture;
      presPass.render(fbos.vel_0);

      /* 7. Render to screen */
      colorPass.mat.uniforms.velocity.value = fbos.vel_0.texture;
      colorPass.render(null);

      mouse.moved = false;
    }

    raf = requestAnimationFrame(frame);

    window.addEventListener('resize', () => { resize(); });

    /* IntersectionObserver — pause when off-screen */
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }, { threshold: 0.01 });
    io.observe(container);

    /* Return cleanup */
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }

  global.initLiquidEther = initLiquidEther;

})(window);