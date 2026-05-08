import { Renderer, Program, Mesh, Triangle } from 'ogl';

const vertexShader = `#version 300 es
precision highp float;

in vec2 position;
in vec2 uv;

out vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentShader = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uSpeed;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;

out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {

    vec2 center = iResolution.xy * 0.5;

    C = (C - center) / uScale + center;

    // Subtle mouse warp
    vec2 mouseOffset = (uMouse - center) * 0.0002;

    C += mouseOffset * length(C - center);

    float i, d, z, T = iTime * uSpeed;

    vec3 O, p, S;

    // Raymarching nebula loop
    for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {

        p = z * normalize(vec3(C - .5 * r, r.y));

        p.z -= 4.;

        S = p;

        d = p.y - T;

        p.x += .4 * (1. + p.y)
            * sin(d + p.x * 0.1)
            * cos(.34 * d + p.x * 0.05);

        Q = p.xz *= mat2(
            cos(p.y + vec4(0,11,33,0) - T)
        );

        z += d =
            abs(
                sqrt(length(Q * Q))
                - .25 * (5. + S.y)
            ) / 3. + 8e-4;

        o = 1. + sin(
            S.y +
            p.z * .5 +
            S.z -
            length(S - p) +
            vec4(2,1,0,8)
        );
    }

    o.xyz = tanh(O / 1e4);
}

void main() {

    vec4 o = vec4(0.0);

    mainImage(o, gl_FragCoord.xy);

    // Intensity mapping for custom color overlay
    float intensity = (o.r + o.g + o.b) / 3.0;

    vec3 finalColor = mix(
        o.rgb * 0.15,
        intensity * uCustomColor,
        1.15
    );

    // Alpha management based on light intensity
    fragColor = vec4(
        finalColor,
        length(o.rgb) * uOpacity
    );
}`;

function initPlasma() {

    const container = document.getElementById('plasma-canvas-container');

    if (!container) return;

    const renderer = new Renderer({
        alpha: true,
        dpr: Math.min(window.devicePixelRatio, 2)
    });

    const gl = renderer.gl;

    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {

        vertex: vertexShader,

        fragment: fragmentShader,

        uniforms: {

            iTime: {
                value: 0
            },

            iResolution: {
                value: [0, 0]
            },

            // CYBERPUNK PINK / PURPLE
            uCustomColor: {
                value: [0.9, 0.2, 1.0]
            },

            uSpeed: {
                value: 0.3
            },

            uScale: {
                value: 1.15
            },

            uOpacity: {
                value: 0.85
            },

            uMouse: {
                value: [0, 0]
            }
        }
    });

    const mesh = new Mesh(gl, {
        geometry,
        program
    });

    const mouse = [0, 0];

    // Mouse interaction
    window.addEventListener('mousemove', (e) => {

        const rect = container.getBoundingClientRect();

        mouse[0] = e.clientX - rect.left;

        mouse[1] =
            rect.height -
            (e.clientY - rect.top);

        program.uniforms.uMouse.value = mouse;
    });

    // Responsive resize
    function resize() {

        const width = window.innerWidth;

        const height = window.innerHeight;

        renderer.setSize(width, height);

        program.uniforms.iResolution.value = [
            gl.drawingBufferWidth,
            gl.drawingBufferHeight
        ];
    }

    window.addEventListener('resize', resize);

    window.addEventListener(
        'orientationchange',
        resize
    );

    resize();

    // Animation loop
    function update(t) {

        requestAnimationFrame(update);

        program.uniforms.iTime.value = t * 0.001;

        renderer.render({
            scene: mesh
        });
    }

    requestAnimationFrame(update);
}

document.addEventListener(
    'DOMContentLoaded',
    initPlasma
);