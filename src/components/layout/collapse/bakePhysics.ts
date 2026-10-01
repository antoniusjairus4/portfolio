import Matter from 'matter-js';

export interface BakedTransform {
  x: number;
  y: number;
  rotation: number;
}

export interface BakedFrame {
  time: number;
  transforms: BakedTransform[];
}

export interface BakeResult {
  fps: number;
  duration: number;
  totalFrames: number;
  letterIds: string[];
  frames: BakedFrame[];
  hash: string;
}

export interface LetterBox {
  id: string;
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isName: boolean;
}

export interface PhysicsConfig {
  viewportWidth: number;
  viewportHeight: number;
  boxes: LetterBox[];
  seed?: number;
}

// Simple deterministic PRNG (Linear Congruential Generator)
export function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Compute deterministic FNV-1a hash of bake result
function hashBakeFrames(frames: BakedFrame[]): string {
  let hash = 0x811c9dc5;
  for (let f = 0; f < frames.length; f += 5) {
    const transforms = frames[f].transforms;
    for (let i = 0; i < transforms.length; i++) {
      const x = Math.round(transforms[i].x * 10);
      const y = Math.round(transforms[i].y * 10);
      const r = Math.round(transforms[i].rotation * 100);
      hash ^= x;
      hash = Math.imul(hash, 0x01000193);
      hash ^= y;
      hash = Math.imul(hash, 0x01000193);
      hash ^= r;
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return (hash >>> 0).toString(16);
}

export function bakePhysicsSimulation(config: PhysicsConfig): BakeResult {
  const { viewportWidth, viewportHeight, boxes, seed = 42 } = config;
  const rng = createPRNG(seed);

  // Create Matter.js Engine & World
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 2.2, scale: 0.001 },
  });
  const world = engine.world;

  // Boundary Colliders
  const wallThickness = 100;
  const floorY = viewportHeight;

  // Static floor & side walls
  const floor = Matter.Bodies.rectangle(
    viewportWidth / 2,
    floorY + wallThickness / 2,
    viewportWidth * 3,
    wallThickness,
    { isStatic: true, restitution: 0.65, friction: 0.2 }
  );

  const leftWall = Matter.Bodies.rectangle(
    -wallThickness / 2,
    viewportHeight / 2,
    wallThickness,
    viewportHeight * 3,
    { isStatic: true, restitution: 0.5, friction: 0.1 }
  );

  const rightWall = Matter.Bodies.rectangle(
    viewportWidth + wallThickness / 2,
    viewportHeight / 2,
    wallThickness,
    viewportHeight * 3,
    { isStatic: true, restitution: 0.5, friction: 0.1 }
  );

  Matter.Composite.add(world, [floor, leftWall, rightWall]);

  // Create Rigid Bodies for Each Letter Box
  const letterBodies: { id: string; body: Matter.Body; startX: number; startY: number; releaseTime: number }[] = [];

  // Sequential release from right to left (last box first)
  const totalBoxes = boxes.length;

  boxes.forEach((box: LetterBox, index: number) => {
    // Shrink box colliders by 10% to prevent artificial overlap gaps
    const cWidth = Math.max(box.width * 0.90, 8);
    const cHeight = Math.max(box.height * 0.90, 8);
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    const body = Matter.Bodies.rectangle(centerX, centerY, cWidth, cHeight, {
      isStatic: true,
      restitution: box.isName ? 0.70 : 0.60,
      friction: 0.15,
      density: box.isName ? 0.003 : 0.001, // Name letters are heavier
      frictionAir: 0.01,
    });

    // Stagger release: last letter releases at 0s, earlier letters delayed by ~0.04s each
    const releaseTime = (totalBoxes - 1 - index) * 0.04;

    Matter.Composite.add(world, body);
    letterBodies.push({ id: box.id, body, startX: centerX, startY: centerY, releaseTime });
  });

  const fps = 60;
  const timeStep = 1000 / fps;
  const totalDurationSec = 3.2;
  const totalFrames = Math.round(totalDurationSec * fps);
  const frames: BakedFrame[] = [];

  const letterIds = boxes.map((b: LetterBox) => b.id);

  // Simulation Loop
  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    const currentTimeSec = (frameIdx * timeStep) / 1000;

    // 1. Check Sequenced Releases
    letterBodies.forEach(({ body, releaseTime }) => {
      if (body.isStatic && currentTimeSec >= releaseTime) {
        Matter.Body.setStatic(body, false);
        // Apply seeded impulse & spin
        const impulseX = (rng() - 0.5) * 0.008;
        const impulseY = -rng() * 0.005;
        const torque = (rng() - 0.5) * 0.002;
        Matter.Body.applyForce(body, body.position, { x: impulseX, y: impulseY });
        Matter.Body.setAngularVelocity(body, torque);
      }
    });

    // 2. Tilt Floor & Open Left Wall to Slide Pile Away (after ~1.9s)
    if (currentTimeSec >= 1.9) {
      // Remove left wall
      if (leftWall.position.x > -500) {
        Matter.Body.setPosition(leftWall, { x: -2000, y: viewportHeight / 2 });
      }
      // Tilt floor clockwise (~18 degrees)
      const tiltProgress = Math.min((currentTimeSec - 1.9) / 0.8, 1.0);
      const angle = (18 * Math.PI / 180) * tiltProgress;
      Matter.Body.setAngle(floor, angle);
    }

    // 3. Step Engine
    Matter.Engine.update(engine, timeStep);

    // 4. Record Transforms
    const transforms = letterBodies.map(({ body, startX, startY }) => {
      const posX = body && body.position && !Number.isNaN(body.position.x) ? body.position.x : startX;
      const posY = body && body.position && !Number.isNaN(body.position.y) ? body.position.y : startY;
      const angle = body && !Number.isNaN(body.angle) ? body.angle : 0;
      return {
        x: posX - startX,
        y: posY - startY,
        rotation: angle,
      };
    });

    frames.push({
      time: currentTimeSec,
      transforms,
    });
  }

  const hash = hashBakeFrames(frames);

  return {
    fps,
    duration: totalDurationSec,
    totalFrames,
    letterIds,
    frames,
    hash,
  };
}
