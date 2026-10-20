import { Color, DoubleSide, ShaderMaterial } from 'three';

// Material shared by the established NeuroShield environment.
export const SCAN_BACKGROUND = '#172E43';

// Illustrative sections, not measurements or findings. Each section changes its
// cranial outline, tissue contours and ventricular profile with slice depth.
export function makeScanMaterial(index: number, color: string) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: {
      uSlice: { value: index },
      uTint: { value: new Color(color) },
      uFocus: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uSlice, uFocus, uOpacity;
      uniform vec3 uTint;
      void main(){
        vec2 q=(vUv-.5)*2.;
        float section=.65+.28*sin(.3+uSlice*.23);
        q.x/=section;
        q.y/=.87+.08*cos(uSlice*.37);
        float angle=atan(q.y,q.x);
        float r=length(q);
        float boundary=.8+.035*cos(angle*3.+uSlice*.3)+.018*sin(angle*7.);
        float tissue=1.-smoothstep(boundary-.025,boundary,r);
        float cortex=exp(-pow((r-boundary+.045)*39.,2.));
        float fissure=exp(-pow(q.x*38.,2.))*(1.-smoothstep(.4,.74,abs(q.y)));
        vec2 vent=vec2(abs(q.x)-.105,q.y+.03+.04*sin(uSlice));
        float ventricles=1.-smoothstep(.06,.105,length(vent*vec2(1.1,.55)));
        float folds=.5+.5*sin(r*61.+sin(angle*11.+uSlice)*2.3+sin(q.y*19.)*1.7+uSlice*.63);
        float tissueTone=(.29+folds*.21+cortex*.36)*(1.-ventricles*.84)*(1.-fissure*.64);
        float grain=fract(sin(dot(floor(vUv*420.),vec2(12.9898,78.233))+uSlice*5.)*43758.5453)-.5;
        float frame=(1.-smoothstep(.97,.99,max(abs(q.x*section),abs(q.y))));
        vec3 anatomy=mix(uTint,vec3(.79,.85,.83),.28+uFocus*.31);
        vec3 col=anatomy*(tissueTone+grain*.025)*(.65+uFocus*.65);
        float alpha=(tissue*(.34+tissueTone*.49)+frame*.025)*uOpacity;
        gl_FragColor=vec4(col,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
