import * as THREE from 'three';

export const stripVertexShader = `
uniform float uProgress;     // 0.0 to 1.0 (local strip progress)
uniform float uCurlRadius;   // Radius R of cylinder bend
uniform float uRotZ;         // Seeded Z rotation
uniform float uDriftX;       // Seeded X drift
uniform float uUvMinX;       // Strip left UV
uniform float uUvMaxX;       // Strip right UV
uniform float uAspect;       // Viewport aspect ratio

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vProgress;

void main() {
  vUv = uv;
  vProgress = uProgress;

  vec3 pos = position;

  // Local UV X mapped to full texture window
  float globalUvX = mix(uUvMinX, uUvMaxX, uv.x);

  // Cylinder roll calculation along Y (top Y=0.5 down to Y=-0.5)
  // Roll line moves from top (Y=0.5) down to bottom (Y=-0.5)
  float rollY = 0.5 - uProgress * 1.5;

  if (pos.y > rollY) {
    float dist = pos.y - rollY;
    float angle = dist / uCurlRadius;

    // Wrap position around cylinder of radius R lifting toward camera (Z+)
    pos.y = rollY + uCurlRadius * sin(angle);
    pos.z = uCurlRadius * (1.0 - cos(angle));

    // Calculate bent normal
    vec3 bNormal = vec3(0.0, cos(angle), sin(angle));
    vNormal = normalMatrix * bNormal;
  } else {
    vNormal = normalMatrix * normal;
  }

  // Gravity-like downward acceleration + Z-rotation + X drift as strip detaches
  float gravity = pow(uProgress, 2.2) * 1.8;
  pos.y -= gravity;
  pos.x += uDriftX * uProgress;

  // Z rotation tilt
  float cz = cos(uRotZ * uProgress);
  float sz = sin(uRotZ * uProgress);
  mat2 rot = mat2(cz, -sz, sz, cz);
  pos.xy = rot * pos.xy;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const stripFragmentShader = `
uniform sampler2D uTexture;
uniform float uUvMinX;
uniform float uUvMaxX;
uniform float uProgress;
uniform float uSeed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vProgress;

// Simple pseudo-noise function for torn edge
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  // Global UV lookup for seamless sampling
  float globalUvX = mix(uUvMinX, uUvMaxX, vUv.x);
  vec2 globalUv = vec2(globalUvX, vUv.y);

  // Jagged edge noise (activates only as strip detaches / progress > 0)
  float edgeNoise = (rand(vec2(globalUv.y * 50.0, uSeed)) - 0.5) * 0.015 * smoothstep(0.0, 0.1, uProgress);

  // Torn rim mask
  float isEdge = smoothstep(0.0, 0.02, vUv.x + edgeNoise) * (1.0 - smoothstep(0.98, 1.0, vUv.x + edgeNoise));

  // Front face sampling vs Back face rendering
  if (gl_FrontFacing) {
    vec4 col = texture2D(uTexture, globalUv);

    // Warm key light directional shading
    vec3 lightDir = normalize(vec3(-0.5, 0.8, 1.0));
    float diff = max(dot(normalize(vNormal), lightDir), 0.35);

    // Add subtle paper fibre rim highlight along torn edge
    float rim = (1.0 - isEdge) * 0.2 * smoothstep(0.05, 0.3, uProgress);
    col.rgb = mix(col.rgb * diff, vec3(0.95, 0.92, 0.85), rim);

    gl_FragColor = col;
  } else {
    // Back of paper: darker, desaturated, mirrored horizontal sample with paper grain
    vec2 backUv = vec2(mix(uUvMaxX, uUvMinX, vUv.x), vUv.y);
    vec4 col = texture2D(uTexture, backUv);

    // Desaturate & darken back of paper
    float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
    vec3 backColor = mix(vec3(gray), vec3(0.12, 0.09, 0.07), 0.75);

    // Add subtle paper grain
    float grain = (rand(vUv * 100.0) - 0.5) * 0.04;
    backColor += grain;

    // Back face shading
    vec3 lightDir = normalize(vec3(-0.5, 0.8, 1.0));
    float diff = max(dot(normalize(-vNormal), lightDir), 0.25);

    gl_FragColor = vec4(backColor * diff, 1.0);
  }
}
`;
