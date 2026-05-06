document.addEventListener('DOMContentLoaded', () => {
    // ── 1. BACKGROUND ENGINE ──
    class PillarBackground {
        constructor() {
            this.container = document.getElementById('pillar-bg-container');
            if (!this.container) return;
            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.container.appendChild(this.renderer.domElement);
            this.createPillar();
            this.animate();
            window.addEventListener('resize', () => this.onResize());
        }
        createPillar() {
            const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;
            const fragmentShader = `
                precision highp float;
                uniform float uTime;
                uniform vec2 uResolution;
                varying vec2 vUv;
                void main() {
                    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
                    float rot = 0.436; // 25deg
                    uv = vec2(cos(rot)*uv.x - sin(rot)*uv.y, sin(rot)*uv.x + cos(rot)*uv.y);
                    float t = uTime * 0.3;
                    vec3 col = vec3(0.0);
                    float d_total = 0.1;
                    for(int i = 0; i < 60; i++) {
                        vec3 p = vec3(0.0, 0.0, -10.0) + normalize(vec3(uv, 1.0)) * d_total;
                        p.xz = vec2(cos(t)*p.x - sin(t)*p.z, sin(t)*p.x + cos(t)*p.z);
                        vec3 q = p; q.y = p.y * 0.4 + t;
                        q += cos(q.zxy * 1.0 - t);
                        float d = max(length(cos(q.xz)) - 0.2, length(p.xz) - 3.0);
                        d = abs(d) * 0.15 + 0.01;
                        col += mix(vec3(1.0, 0.62, 0.99), vec3(0.32, 0.15, 1.0), clamp((10.0-p.y)/20.0, 0.0, 1.0)) / d;
                        d_total += d * 1.15;
                        if(d_total > 40.0) break;
                    }
                    gl_FragColor = vec4(tanh(col * 0.002), 1.0);
                }
            `;
            this.material = new THREE.ShaderMaterial({
                vertexShader, fragmentShader,
                uniforms: { uTime: { value: 0 }, uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } },
                transparent: true
            });
            this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
        }
        onResize() {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        }
        animate() {
            requestAnimationFrame(() => this.animate());
            this.material.uniforms.uTime.value += 0.015;
            this.renderer.render(this.scene, this.camera);
        }
    }
    new PillarBackground();

    // ── 2. BENTO INTERACTIONS ──
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);
    const bentoElements = document.querySelectorAll('.magic-bento-card');

    document.addEventListener('mousemove', (e) => {
        gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1 });
        bentoElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--glow-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
            el.style.setProperty('--glow-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
            const dist = Math.hypot(e.clientX - (rect.left + rect.width/2), e.clientY - (rect.top + rect.height/2));
            const intensity = Math.max(0, 1 - dist / 400);
            el.style.setProperty('--glow-intensity', intensity);
            if (intensity > 0) gsap.to(spotlight, { opacity: intensity * 0.9, duration: 0.2 });
        });
    });

    bentoElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const rx = ((e.clientY - (rect.top + rect.height/2)) / (rect.height/2)) * -8;
            const ry = ((e.clientX - (rect.left + rect.width/2)) / (rect.width/2)) * 8;
            gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.2, transformPerspective: 1000 });
        });
        card.addEventListener('mouseleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6 }));
    });

    // ── 3. FADE IN ──
    const obs = new IntersectionObserver((es) => {
        es.forEach(e => { if(e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0'; el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        obs.observe(el);
    });
});