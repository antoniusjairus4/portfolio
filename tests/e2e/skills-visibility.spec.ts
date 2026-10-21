import { expect, type Page, test } from '@playwright/test';
import {
  Box3,
  type BufferGeometry,
  type Camera,
  type InstancedMesh,
  Matrix4,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { skillFocusProgress } from '../../src/components/skills/skillsSpatial';
import { skillCategories } from '../../src/content/skills';

type LogoMesh = Mesh<BufferGeometry, MeshStandardMaterial>;
interface AuditWindow extends Window {
  __THREE_DEVTOOLS__: EventTarget;
  __skillsAudit: { scene: Object3D; camera: Camera; renderer: WebGLRenderer };
}

// The Three devtools observer is confined to the browser test. No production
// inspection globals, renderer ownership changes, or depth-test bypasses.
async function observeRenderer(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('jairus_portfolio_visited', 'true');
    const scope = window as unknown as AuditWindow;
    scope.__THREE_DEVTOOLS__ = new EventTarget();
    scope.__THREE_DEVTOOLS__.addEventListener('observe', (event) => {
      const renderer = (event as CustomEvent<WebGLRenderer>).detail;
      if (!renderer.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene: Object3D, camera: Camera) => {
        scope.__skillsAudit = { scene, camera, renderer };
        return render(scene, camera);
      };
    });
  });
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 15000,
  });
}

async function seek(page: Page, progress: number) {
  await page.locator('#skills').evaluate((element, p) => {
    window.scrollTo({
      top:
        element.getBoundingClientRect().top +
        scrollY +
        (element.getBoundingClientRect().height - innerHeight) * p,
      behavior: 'instant',
    });
  }, progress);
  await expect(page.locator('[data-project-scene="skills"]')).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator('#skills')
        .evaluate((e) => Number((e as HTMLElement).style.getPropertyValue('--skills-progress'))),
    )
    .toBeCloseTo(progress, 3);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

async function capture(page: Page, domain: number, skill: number) {
  return page.evaluate(
    ({ domain, skill }) => {
      const scope = window as unknown as AuditWindow;
      const { scene, camera, renderer } = scope.__skillsAudit;
      scene.updateMatrixWorld(true);
      const logo = scene.getObjectByName(`skills-logo-${domain}-${skill}`) as LogoMesh;
      const vector = camera.position.clone();
      const corners = Array.from({ length: 4 }, (_, i) =>
        vector
          .fromBufferAttribute(logo.geometry.attributes.position, i)
          .applyMatrix4(logo.matrixWorld)
          .project(camera)
          .toArray(),
      );
      const boxes: {
        matrix: number[];
        min: number[];
        max: number[];
        vertices?: number[];
        indices?: number[];
      }[] = [];
      scene.traverseVisible((node) => {
        const object = node as Mesh;
        if (!object.isMesh) return;
        let owner: Object3D | null = object.parent;
        while (
          owner &&
          owner.name !== 'skills-architecture' &&
          owner.name !== 'skills-exhibit-structure'
        )
          owner = owner.parent;
        if (!owner || (object.material as MeshStandardMaterial).opacity < 0.15) return;
        object.geometry.computeBoundingBox();
        const bounds = object.geometry.boundingBox;
        if (!bounds) return;
        const matrix = object.matrixWorld.clone();
        const instanced = object as InstancedMesh;
        if (instanced.isInstancedMesh) {
          for (let i = 0; i < instanced.count; i++) {
            instanced.getMatrixAt(i, matrix);
            matrix.premultiply(object.matrixWorld);
            boxes.push({
              matrix: matrix.toArray(),
              min: bounds.min.toArray(),
              max: bounds.max.toArray(),
            });
          }
        } else
          boxes.push({
            matrix: matrix.toArray(),
            min: bounds.min.toArray(),
            max: bounds.max.toArray(),
            ...(object.geometry.type !== 'BoxGeometry'
              ? {
                  vertices: Array.from(object.geometry.attributes.position.array),
                  indices: object.geometry.index
                    ? Array.from(object.geometry.index.array)
                    : undefined,
                }
              : {}),
          });
      });
      const element = document.querySelector(
        `[data-skill-label="${domain}:${skill}"]`,
      ) as HTMLElement;
      const rect = element.getBoundingClientRect().toJSON();
      const headings = Array.from(document.querySelectorAll('.skills-category'))
        .filter((e) => Number(getComputedStyle(e).opacity) > 0.05)
        .map((e) => e.getBoundingClientRect().toJSON());
      return {
        boxes,
        corners,
        rect,
        headings,
        text: element.querySelector('.skills-name')?.textContent?.trim(),
        descriptor: element.querySelector('small')?.textContent?.trim(),
        labelOpacity: Number(element.style.opacity),
        logoOpacity: logo.material.opacity,
        logoVisible: logo.parent?.visible,
        textureReady: logo.material.map?.image?.complete,
        camera: camera.matrixWorld.toArray(),
        projection: camera.projectionMatrix.toArray(),
        logo: logo.matrixWorld.toArray(),
        world: logo.getWorldPosition(vector).toArray(),
        render: { ...renderer.info.render },
        memory: { ...renderer.info.memory },
        labels: Array.from(document.querySelectorAll('.skills-inscription')).map((e) => ({
          opacity: (e as HTMLElement).style.opacity,
          transform: (e as HTMLElement).style.transform,
        })),
      };
    },
    { domain, skill },
  );
}

function occlusions(state: Awaited<ReturnType<typeof capture>>, width: number, height: number) {
  const camera = new PerspectiveCamera();
  camera.matrixWorld.fromArray(state.camera);
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  camera.projectionMatrix.fromArray(state.projection);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  const world = new Vector3(...state.world);
  const local = world.clone().applyMatrix4(camera.matrixWorldInverse);
  const raycaster = new Raycaster();
  const boxes = state.boxes.map((b) => ({
    inverse: new Matrix4().fromArray(b.matrix).invert(),
    matrix: new Matrix4().fromArray(b.matrix),
    box: new Box3(new Vector3(...b.min), new Vector3(...b.max)),
    vertices: b.vertices,
    indices: b.indices,
  }));
  const logoX = state.corners.map((p) => p[0]);
  const logoY = state.corners.map((p) => p[1]);
  const ranges = [
    [Math.min(...logoX), Math.max(...logoX), Math.min(...logoY), Math.max(...logoY)],
    [
      (state.rect.left / width) * 2 - 1,
      (state.rect.right / width) * 2 - 1,
      1 - (state.rect.bottom / height) * 2,
      1 - (state.rect.top / height) * 2,
    ],
  ];
  const blocked: string[] = [];
  ranges.forEach(([left, right, bottom, top], region) => {
    for (const u of [0.05, 0.25, 0.5, 0.75, 0.95])
      for (const v of [0.05, 0.25, 0.5, 0.75, 0.95]) {
        raycaster.setFromCamera(
          new Vector2(left + (right - left) * u, bottom + (top - bottom) * v),
          camera,
        );
        const direction = raycaster.ray.direction
          .clone()
          .transformDirection(camera.matrixWorldInverse);
        const depth =
          region === 0
            ? local.z
            : world
                .clone()
                .add(new Vector3(0, -1.65, 0))
                .applyMatrix4(camera.matrixWorldInverse).z;
        const distance = depth / direction.z;
        if (
          boxes.some((b) => {
            const ray = raycaster.ray.clone().applyMatrix4(b.inverse);
            const hit = ray.intersectBox(b.box, new Vector3());
            if (!hit) return false;
            if (b.vertices) {
              const vertices = b.vertices;
              const indices = b.indices ?? Array.from({ length: vertices.length / 3 }, (_, i) => i);
              for (let i = 0; i < indices.length; i += 3) {
                const point = ray.intersectTriangle(
                  new Vector3().fromArray(vertices, indices[i] * 3),
                  new Vector3().fromArray(vertices, indices[i + 1] * 3),
                  new Vector3().fromArray(vertices, indices[i + 2] * 3),
                  false,
                  new Vector3(),
                );
                if (
                  point &&
                  point.applyMatrix4(b.matrix).distanceTo(raycaster.ray.origin) < distance - 0.12
                )
                  return true;
              }
              return false;
            }
            return hit.applyMatrix4(b.matrix).distanceTo(raycaster.ray.origin) < distance - 0.12;
          })
        )
          blocked.push(`${region === 0 ? 'logo' : 'label'}:${u},${v}`);
      }
  });
  return blocked;
}

for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
  [390, 844],
]) {
  test(`all 27 exhibits stay clear and reconstruct at ${width}x${height}`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width, height });
    await observeRenderer(page);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const entries = skillCategories.flatMap((category, domain) =>
      category.skills.map((name, skill) => ({
        domain,
        skill,
        name,
        progress: skillFocusProgress(domain, skill),
      })),
    );
    const forward = new Map<string, Awaited<ReturnType<typeof capture>>>();
    const statistics: unknown[] = [];
    for (const direction of ['forward', 'reverse']) {
      for (const entry of direction === 'forward' ? entries : [...entries].reverse()) {
        const { domain, skill, name, progress } = entry;
        await seek(page, progress);
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                !!(
                  (window as unknown as AuditWindow).__skillsAudit?.scene.getObjectByName(
                    'skills-logo-0-0',
                  ) as LogoMesh
                )?.material.map?.image?.complete,
            ),
          )
          .toBe(true);
        const state = await capture(page, domain, skill);
        const description = `${direction} ${name}`;
        expect.soft(state.text, description).toBe(name);
        expect.soft(state.descriptor, description).toBeTruthy();
        expect.soft(state.logoVisible, description).toBe(true);
        expect.soft(state.textureReady, description).toBe(true);
        expect.soft(state.labelOpacity, description).toBeGreaterThan(0.9);
        expect.soft(state.logoOpacity, description).toBeGreaterThan(0.9);
        expect.soft(state.rect.left, description).toBeGreaterThan(20);
        expect.soft(state.rect.right, description).toBeLessThan(width - 20);
        expect.soft(state.rect.top, description).toBeGreaterThan(height * 0.3);
        expect.soft(state.rect.bottom, description).toBeLessThan(height - 40);
        for (const point of state.corners) {
          expect.soft(Math.abs(point[0]), description).toBeLessThan(0.9);
          expect.soft(Math.abs(point[1]), description).toBeLessThan(0.8);
        }
        for (const heading of state.headings) {
          const logoTop = ((1 - Math.max(...state.corners.map((p) => p[1]))) * height) / 2;
          expect
            .soft(logoTop, `${description} heading separation`)
            .toBeGreaterThan(heading.bottom + 20);
        }
        expect.soft(occlusions(state, width, height), description).toEqual([]);
        const key = `${domain}:${skill}`;
        if (direction === 'forward') {
          forward.set(key, state);
          await page.screenshot({ path: testInfo.outputPath(`${domain}-${skill}.png`) });
          statistics.push({
            name,
            render: state.render,
            memory: state.memory,
            architecturalMembers: state.boxes.length,
          });
        } else {
          const previous = forward.get(key);
          if (!previous) throw new Error(`Missing forward sample: ${key}`);
          expect.soft(state.camera, description).toEqual(previous.camera);
          expect.soft(state.logo, description).toEqual(previous.logo);
          expect.soft(state.boxes, description).toEqual(previous.boxes);
          expect.soft(state.labels, description).toEqual(previous.labels);
        }
      }
    }
    // Intermediate samples test approach/leave, not only the strongest frames.
    for (const entry of entries)
      for (const delta of
        entry.domain === 4 ? [-0.01, -0.005, 0.005, 0.01] : [-0.002, 0.002]) {
        await seek(page, entry.progress + delta);
        const state = await capture(page, entry.domain, entry.skill);
        expect
          .soft(occlusions(state, width, height), `${entry.name} approach ${delta}`)
          .toEqual([]);
      }
    await testInfo.attach('render-statistics', {
      body: JSON.stringify(statistics, null, 2),
      contentType: 'application/json',
    });
    expect(errors).toEqual([]);
  });
}
