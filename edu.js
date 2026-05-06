document.addEventListener('DOMContentLoaded', () => {
    // ── 1. LIGHTPILLAR BACKGROUND ENGINE (Vanilla Three.js) ──
    class PillarBackground {
        constructor() {
            this.container = document.getElementById('pillar-bg-container');
            if (!this.container) return;

            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);

            this.createPillar();
            this.animate();
            window.addEventListener('resize', () => this.onResize());
        }

        createPillar() {
            // Shaders converted from your ReactBits source
            const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;
            const fragmentShader = `
                precision highp float;
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec3 uTopColor;
                uniform vec3 uBottomColor;
                varying vec2 vUv;

                void main() {
                    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
                    
                    // Specific rotation angle (25 degrees in radians)
                    float pillarRotation = 0.436; 
                    uv = vec2(cos(pillarRotation) * uv.x - sin(pillarRotation) * uv.y, sin(pillarRotation) * uv.x + cos(pillarRotation) * uv.y);

                    float t = uTime * 0.3; // Speed from rotationSpeed config
                    vec3 ro = vec3(0.0, 0.0, -10.0);
                    vec3 rd = normalize(vec3(uv, 1.0));

                    vec3 col = vec3(0.0);
                    float d_total = 0.1;

                    // High iteration count for detailed background depth
                    for(int i = 0; i < 80; i++) {
                        vec3 p = ro + rd * d_total;
                        p.xz = vec2(cos(t) * p.x - sin(t) * p.z, sin(t) * p.x + cos(t) * p.z);
                        vec3 q = p;
                        q.y = p.y * 0.4 + t; // pillarHeight config
                        
                        // Wave/distort logic
                        q += cos(q.zxy * 1.0 - t) * 1.0;
                        
                        float d = length(cos(q.xz)) - 0.2;
                        d = max(d, length(p.xz) - 3.0); // pillarWidth config
                        d = abs(d) * 0.15 + 0.01;

                        float grad = clamp((10.0 - p.y) / 20.0, 0.0, 1.0);
                        col += mix(uBottomColor, uTopColor, grad) / d;
                        d_total += d * 1.0; // stepMultiplier config
                        if(d_total > 50.0) break;
                    }

                    col = tanh(col * 0.002); // glowAmount config
                    gl_FragColor = vec4(col, 1.0);
                }
            `;

            this.material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                    uTopColor: { value: new THREE.Color('#5227FF') },
                    uBottomColor: { value: new THREE.Color('#FF9FFC') }
                },
                transparent: true
            });

            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
            this.scene.add(mesh);
        }

        onResize() {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            this.material.uniforms.uTime.value += 0.015; // Animation step
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Initialize the background effect
    new PillarBackground();


    // ── 2. GLOBAL MOUSE SPOTLIGHT (GSAP Powered) ──
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);

    const bentoElements = document.querySelectorAll('.magic-bento-card');

    document.addEventListener('mousemove', (e) => {
        // Spotlight movement
        gsap.to(spotlight, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
            ease: 'none'
        });

        // Track mouse distance to elements for intensity calculation
        bentoElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            
            // Map global mouse to local card coordinates for glow
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty('--glow-x', `${x}%`);
            el.style.setProperty('--glow-y', `${y}%`);

            // Proximity intensity calculation (High sensitivity: 400px radius)
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            
            const intensity = Math.max(0, 1 - dist / 400);
            el.style.setProperty('--glow-intensity', intensity);
            
            if (intensity > 0) {
                // If cursor is close, brighten the spotlight
                gsap.to(spotlight, { opacity: intensity * 0.9, duration: 0.2 });
            }
        });
    });

    // Reset spotlight when mouse leaves viewport
    document.addEventListener('mouseleave', () => {
        gsap.to(spotlight, { opacity: 0, duration: 0.3 });
    });


    // ── 3. CARD TILT EFFECT (Headers & Images) ──
    bentoElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Max tilt of 8 degrees
            const rotateX = ((e.clientY - (rect.top + rect.height/2)) / (rect.height/2)) * -8;
            const rotateY = ((e.clientX - (rect.left + rect.width/2)) / (rect.width/2)) * 8;

            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.2,
                transformPerspective: 1000,
                ease: 'power1.out'
            });
        });

        // Snap back on mouse leave with elastic ease
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        });
    });


    // ── 4. SCROLL INTERSECTION OBSERVER (Fade-In) ──
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    // Initial state: opacity 0, offset 25px
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
    });
});