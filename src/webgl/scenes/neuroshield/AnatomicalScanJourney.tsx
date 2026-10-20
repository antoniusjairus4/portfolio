import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, type RefObject, useEffect, useMemo, useRef } from 'react';
import {
  DataTexture,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  type Group,
  InstancedBufferAttribute,
  type InstancedMesh,
  type MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
} from 'three';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { SpatialType } from '../palindrome/SpatialType';
import {
  RESEARCH_FRAMES,
  scanCursor,
  scanPath,
  scanRamp,
  scanSpread,
  spineReveal,
} from './scanJourney';
import { useTransitionScans } from './useTransitionScans';

function sliceMaterial(empty: DataTexture) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: {
      uSource0: { value: empty },
      uSource1: { value: empty },
      uSource2: { value: empty },
      uReady: { value: new Vector3() },
      uFlip: { value: new Vector3() },
      uPassage: { value: 0 },
    },
    vertexShader: `
      attribute vec4 aCrop, aState;
      attribute float aSource, aDepth;
      varying vec2 vUv;
      varying vec4 vCrop, vState;
      varying float vSource, vDepth;
      void main() {
        vUv=uv; vCrop=aCrop; vState=aState; vSource=aSource; vDepth=aDepth;
        gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);
      }`,
    fragmentShader: `
      uniform sampler2D uSource0, uSource1, uSource2;
      uniform vec3 uReady, uFlip;
      uniform float uPassage;
      varying vec2 vUv;
      varying vec4 vCrop, vState;
      varying float vSource, vDepth;
      float stroke(float d,float w) { return 1.-smoothstep(w,w+max(fwidth(d),.001),abs(d)); }
      void main() {
        if(vState.x<.002) discard;
        vec2 q=(vUv-.5)*2.;
        vec2 uv=vCrop.xy+vec2(vUv.x,1.-vUv.y)*vCrop.zw;
        vec3 source=vec3(0.);
        float ready=0.;
        if(vSource<.5) {
          uv.y=mix(uv.y,1.-uv.y,uFlip.x);
          source=texture2D(uSource0,uv).rgb; ready=uReady.x;
        } else if(vSource<1.5) {
          uv.y=mix(uv.y,1.-uv.y,uFlip.y);
          source=texture2D(uSource1,uv).rgb; ready=uReady.y;
        } else {
          uv.y=mix(uv.y,1.-uv.y,uFlip.z);
          source=texture2D(uSource2,uv).rgb; ready=uReady.z;
        }
        float lum=dot(source,vec3(.2126,.7152,.0722));
        float focus=vState.y;
        // Literal imagery ends before the longitudinal abstract pathway.
        float abstract=max(vState.z,1.-ready);
        float extracted=vState.w;
        float edge=1.-smoothstep(.93,1.,max(abs(q.x),abs(q.y)));
        float anatomy=smoothstep(.018,.16,lum)*edge;
        vec3 cool=mix(vec3(.26,.48,.58),vec3(.69,.85,.84),focus);
        vec3 imageColor=mix(source*vec3(.84,1.,1.06),vec3(lum)*vec3(1.,.98,.89),focus*.48);
        imageColor*=.8+focus*.5;
        // Sample-derived boundaries disappear with the source. The remaining
        // open measurement contours are explicitly schematic, never fake MRI.
        float sourceContour=smoothstep(.045,.15,length(vec2(dFdx(lum),dFdy(lum))));
        float left=stroke(q.x+.35+.055*sin(q.y*4.+vDepth*5.),.009);
        float right=stroke(q.x-.35-.04*sin(q.y*3.-vDepth*4.),.009);
        float longitudinal=(left+right)*step(-.84,q.y)*step(q.y,.81);
        // Sparse section boundaries carry depth through the dark passage.
        // They are schematic outlines, including when source images are absent.
        vec2 section=q/vec2(.72,.86);
        float sectionEdge=stroke(length(section)-.82,.012);
        float sectionBreak=step(.13,abs(section.x+.12));
        float sectionContour=sectionEdge*sectionBreak;
        float bounds=stroke(max(abs(q.x),abs(q.y))-.87,.004);
        float cornerMask=step(.63,min(abs(q.x),abs(q.y)));
        float corner=bounds*cornerMask;
        float tick=stroke(q.x+.86,.008)*step(.94,cos(q.y*36.));
        float sampleMark=stroke(q.y-.29,.005)*step(.28,q.x)*step(q.x,.48);
        float schematic=mix(sectionContour,longitudinal,vState.z);
        float contours=mix(sourceContour*.34,schematic,abstract);
        contours=max(contours,sectionContour*uPassage*.75);
        contours=mix(contours,corner+tick*.45,extracted*.8);
        float registration=(corner*.3+tick*.17)*( .25+focus*.75)*(1.-uPassage*.9);
        float imageAlpha=anatomy*(1.-abstract);
        float contourAlpha=(contours*.65+registration+sampleMark*abstract*.3);
        // One small selected boundary, with no red wash or emission.
        float selected=sampleMark*step(.77,vDepth)*step(vDepth,.83)*abstract;
        vec3 color=mix(imageColor,cool,abstract);
        color=mix(color,cool,clamp(contours*uPassage,0.,1.));
        color=mix(color,vec3(.26,.012,.025),selected);
        float alpha=(imageAlpha+contourAlpha)*vState.x;
        if(alpha<.003) discard;
        gl_FragColor=vec4(color,clamp(alpha,0.,.92));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

export function AnatomicalScanJourney({
  progress,
  frame,
  portrait,
}: {
  progress: MutableRefObject<number>;
  frame: RefObject<Group | null>;
  portrait: boolean;
}) {
  const { camera } = useThree();
  const { quality } = useExperienceEnvironment();
  const sources = useTransitionScans();
  const count = portrait || quality !== 'high' ? 24 : 36;
  const mesh = useRef<InstancedMesh>(null);
  const caption = useRef<Group>(null);
  const captionMaterial = useRef<MeshBasicMaterial>(null);
  const resources = useMemo(() => {
    const geometry = new PlaneGeometry(1, 1);
    const crops = new Float32Array(count * 4);
    const source = new Float32Array(count);
    const depths = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const slot = count - 1 - i; // Far-to-near blend order, shared draw call.
      const t = i / (count - 1);
      depths[slot] = t;
      if (i === 0 || t > 0.6) {
        source[slot] = i === 0 ? 0 : 2;
        crops.set([0, 0, 1, 1], slot * 4);
      } else {
        // Nine distinct axial views in the supplied contact sheet, superior
        // toward inferior. Reuse is spatial sampling, not a patient volume.
        source[slot] = 1;
        const cell = 8 - Math.min(8, Math.floor(((t - 1 / count) / 0.56) * 9));
        const bounded = Math.max(0, Math.min(8, cell));
        crops.set([(bounded % 3) / 3, Math.floor(bounded / 3) / 3, 1 / 3, 1 / 3], slot * 4);
      }
    }
    geometry.setAttribute('aCrop', new InstancedBufferAttribute(crops, 4));
    geometry.setAttribute('aSource', new InstancedBufferAttribute(source, 1));
    geometry.setAttribute('aDepth', new InstancedBufferAttribute(depths, 1));
    const state = new InstancedBufferAttribute(new Float32Array(count * 4), 4);
    state.setUsage(DynamicDrawUsage);
    geometry.setAttribute('aState', state);
    const empty = new DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, RGBAFormat);
    empty.needsUpdate = true;
    return { geometry, state, empty, material: sliceMaterial(empty) };
  }, [count]);
  const scratch = useMemo(
    () => ({
      object: new Object3D(),
      camera: new Vector3(),
      point: new Vector3(),
      next: new Vector3(),
      normal: new Vector3(),
      delta: new Vector3(),
      destination: new Vector3(),
      worldScale: new Vector3(),
      inverse: new Quaternion(),
      rotation: new Quaternion(),
      axis: new Vector3(0, 0, 1),
      euler: new Euler(),
    }),
    [],
  );
  useEffect(() => {
    if (mesh.current) mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
    return () => {
      resources.geometry.dispose();
      resources.material.dispose();
      resources.empty.dispose();
    };
  }, [resources]);
  useEffect(() => {
    sources.forEach((texture, i) => {
      resources.material.uniforms[`uSource${i}`].value = texture ?? resources.empty;
      resources.material.uniforms.uReady.value.setComponent(i, texture ? 1 : 0);
      // ImageBitmap uploads retain top-origin rows; HTML images use flipY.
      const bitmap = typeof ImageBitmap !== 'undefined' && texture?.image instanceof ImageBitmap;
      resources.material.uniforms.uFlip.value.setComponent(i, bitmap ? 0 : 1);
    });
  }, [sources, resources]);

  useFrame(() => {
    if (!mesh.current || !frame.current) return;
    const p = progress.current;
    const spread = scanSpread(p);
    const cursor = scanCursor(p);
    const enter = scanRamp(p, 0.42, 0.5);
    const revealCount = 1 + (count - 1) * scanRamp(p, 0.29, 0.48);
    const presence = scanRamp(p, 0.245, 0.275);
    const extraction = scanRamp(p, 0.81, 0.96);
    const passage = scanRamp(p, 0.32, 0.415) * (1 - spineReveal(p));
    resources.material.uniforms.uPassage.value = passage;
    frame.current.updateWorldMatrix(true, false);
    frame.current.worldToLocal(scratch.camera.copy(camera.position));
    frame.current.getWorldQuaternion(scratch.inverse).invert();
    frame.current.getWorldScale(scratch.worldScale);
    for (let i = 0; i < count; i++) {
      const slot = count - 1 - i;
      const t = i / (count - 1);
      const revealed = i === 0 ? 1 : scanRamp(revealCount, i, i + 1);
      scanPath(t, spread, scratch.point);
      scanPath(t + 0.006, spread, scratch.next);
      scratch.normal.copy(scratch.point).sub(scratch.next).normalize();
      const object = scratch.object;
      object.position.copy(scratch.point);
      object.quaternion.setFromUnitVectors(scratch.axis, scratch.normal);
      const narrow = scanRamp(t, 0.4, 0.86);
      const width = (3.55 - narrow * 2.15) * (portrait ? 0.9 : 1);
      const height = 3.8 - narrow * 0.75;
      object.scale.set(width, height, 1);
      // Last sections become real environment-aligned research boundaries.
      const frameIndex = i - (count - RESEARCH_FRAMES.length);
      const unfold = frameIndex >= 0 ? extraction : 0;
      if (frameIndex >= 0) {
        const destination = RESEARCH_FRAMES[frameIndex];
        scratch.destination.set(...destination.at);
        frame.current.worldToLocal(scratch.destination);
        object.position.lerp(scratch.destination, unfold);
        scratch.euler.set(...destination.turn);
        scratch.rotation.setFromEuler(scratch.euler).premultiply(scratch.inverse);
        object.quaternion.slerp(scratch.rotation, unfold);
        object.scale.x += (destination.size[0] / scratch.worldScale.x - object.scale.x) * unfold;
        object.scale.y += (destination.size[1] / scratch.worldScale.y - object.scale.y) * unfold;
      }
      object.updateMatrix();
      mesh.current.setMatrixAt(slot, object.matrix);
      const distance = scratch.delta.copy(scratch.camera).sub(scratch.point).dot(scratch.normal);
      const focus = Math.exp(-(((t - cursor - 0.045) / (portrait ? 0.065 : 0.048)) ** 2));
      const ahead = scanRamp(distance, -0.3, 0.12);
      const clearance = scanRamp(Math.abs(distance), 0.035, 0.28);
      const anticipation = Math.exp(-Math.max(0, distance - 2) * 0.14);
      const stackOpacity = 0.12 + (i === 0 ? 0.44 : 0);
      const travelOpacity = (0.055 + focus * 0.78) * anticipation * ahead * clearance;
      // Keep the current/next sections readable in darkness; distant layers
      // remain quiet instead of filling the view with faint vertical rails.
      const passageContrast = passage * (0.14 + 0.36 * focus);
      const opacity =
        presence *
        revealed *
        // Keep scans faint through head/neck entry, then secondary to the spine.
        (1 -
          0.96 * scanRamp(p, 0.32, 0.415) +
          passageContrast +
          0.2 * spineReveal(p) +
          0.76 * scanRamp(p, 0.76, 0.87)) *
        ((stackOpacity * (1 - enter) + travelOpacity * enter) * (1 - unfold) + unfold * 0.42) *
        (1 - scanRamp(p, 0.96, 1));
      const abstraction = scanRamp(t, 0.58, 0.77);
      resources.state.setXYZW(
        slot,
        opacity,
        Math.max(focus, (1 - enter) * 0.45),
        abstraction,
        unfold,
      );
    }
    resources.state.needsUpdate = true;
    mesh.current.instanceMatrix.needsUpdate = true;
    if (caption.current) {
      scanPath(Math.max(0, Math.min(0.9, cursor + 0.08)), spread, caption.current.position);
      caption.current.position.y -= 2.05;
    }
    if (captionMaterial.current)
      captionMaterial.current.opacity = spineReveal(p) * (1 - scanRamp(p, 0.7, 0.79)) * 0.5;
  });
  return (
    <>
      <instancedMesh
        ref={mesh}
        args={[resources.geometry, resources.material, count]}
        frustumCulled={false}
        name="NS_SpatialSourceSlices"
      />
      <group ref={caption}>
        <SpatialType
          text="SOURCE STUDY · NOT A REGISTERED VOLUME"
          height={portrait ? 0.075 : 0.085}
          color="#C9DDD9"
          materialRef={(material) => {
            captionMaterial.current = material;
          }}
        />
      </group>
    </>
  );
}
