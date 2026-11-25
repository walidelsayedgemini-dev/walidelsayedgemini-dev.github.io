import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Site-wide living sky.
 *  - nebula + Milky Way glow (sky-space, rotates with the stars) rendered to a low-res HDR target
 *  - real-colour stars (O→M), smooth twinkle, diffraction spikes on the brightest ones
 *  - five real constellations (true shapes from RA/Dec) drawn in soft gold, one comes into view every few screens
 *  - shooting stars, drifting star-dust that speeds up when you scroll, a light that follows the cursor
 * Everything is time-based and exponentially smoothed, so motion stays fluid at any frame rate.
 */

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const smooth = (dt: number, rate: number) => 1 - Math.exp(-dt * rate);

/* ------------------------------------------------------------------ shaders */
const quadVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const nebulaFrag = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform mat3 uInvRot; uniform float uTan; uniform vec3 uBandN;
varying vec2 vUv;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for(int i = 0; i < 5; i++){ s += a * noise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
void main(){
  vec2 ndc = vUv * 2.0 - 1.0;
  float asp = uRes.x / uRes.y;
  vec3 vd = normalize(vec3(ndc.x * uTan * asp, ndc.y * uTan, -1.0));
  vec3 d = uInvRot * vd;
  float t = uTime * 0.010;
  vec3 q = d * 2.1 + vec3(t, -t * 0.7, t * 0.45);
  float warp = fbm(q * 1.6 + vec3(0.0, t * 1.3, 0.0));
  float w = fbm(q + warp * 1.35);
  float lat = dot(d, uBandN);
  float band = exp(-lat * lat * 10.0);
  float core = exp(-lat * lat * 46.0);
  float dust = fbm(d * 5.5 + 3.0 + vec3(t * 0.6));
  vec3 col = vec3(0.012, 0.016, 0.026);
  col += vec3(0.085, 0.090, 0.190) * smoothstep(0.42, 0.95, w) * 0.85;           // indigo veil
  col += vec3(0.030, 0.105, 0.125) * smoothstep(0.55, 1.0, fbm(q * 1.25 + 5.0)) * 0.55; // teal wisps
  col += vec3(0.150, 0.060, 0.110) * smoothstep(0.62, 1.0, fbm(q * 0.9 - 7.0)) * 0.35;  // faint rose
  vec3 milky = mix(vec3(0.20, 0.17, 0.12), vec3(0.34, 0.27, 0.15), core);
  col += milky * band * (0.30 + 0.70 * w) * 0.55 * smoothstep(0.30, 0.72, dust);
  col *= 1.0 - band * 0.45 * smoothstep(0.52, 0.78, fbm(d * 9.0 - 2.0));         // dark dust lanes
  gl_FragColor = vec4(col, 1.0);
}`;

const compositeFrag = /* glsl */ `
precision highp float;
uniform sampler2D uNeb; uniform vec2 uRes; uniform float uTime;
uniform vec2 uMouse; uniform float uMouseOn; uniform float uGlow;
uniform vec4 uM0; uniform vec4 uM1; uniform vec2 uP; uniform vec2 uL;
varying vec2 vUv;
float meteor(vec2 p, vec4 m, float prog, float len){
  if(prog <= 0.0 || prog >= 1.0) return 0.0;
  vec2 dir = vec2(cos(m.z), sin(m.z));
  vec2 h = m.xy + dir * prog * m.w;
  vec2 v = p - h;
  float along = dot(v, -dir);
  float perp = abs(dot(v, vec2(-dir.y, dir.x)));
  float px = 2.0 / uRes.y;
  float env = sin(3.14159265 * prog);
  float L = len * (0.35 + 0.65 * env);
  float tail = 0.0;
  if(along > 0.0 && along < L){ float k = 1.0 - along / L; float wd = px * (0.55 + 1.5 * k); tail = k * k * exp(-perp * perp / (wd * wd)); }
  float head = exp(-dot(v, v) / (px * px * 7.0)) * 1.4 + exp(-dot(v, v) / (px * px * 120.0)) * 0.18;
  return (tail * 0.95 + head) * env;
}
void main(){
  vec3 col = texture2D(uNeb, vUv).rgb;
  vec2 ndc = vUv * 2.0 - 1.0;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(ndc.x * asp, ndc.y);
  float T = uTime;
  // slowly orbiting soft lights
  vec2 o1 = vec2(cos(T * 0.043) * 0.75 * asp, sin(T * 0.031) * 0.55);
  vec2 o2 = vec2(cos(T * 0.027 + 2.1) * 0.85 * asp, sin(T * 0.039 + 1.3) * 0.6);
  vec2 o3 = vec2(sin(T * 0.021 + 4.0) * 0.6 * asp, cos(T * 0.034 + 0.5) * 0.7);
  col += vec3(0.30, 0.23, 0.11) * 0.085 * exp(-dot(p - o1, p - o1) * 1.5) * uGlow;
  col += vec3(0.10, 0.12, 0.28) * 0.11 * exp(-dot(p - o2, p - o2) * 1.1) * uGlow;
  col += vec3(0.05, 0.17, 0.19) * 0.06 * exp(-dot(p - o3, p - o3) * 1.9) * uGlow;
  // the light that follows you
  vec2 m = vec2(uMouse.x * asp, uMouse.y);
  float md = dot(p - m, p - m);
  col += vec3(0.36, 0.28, 0.15) * (0.075 * exp(-md * 2.6) + 0.035 * exp(-md * 18.0)) * uMouseOn;
  // vignette
  col *= 1.0 - 0.28 * dot(ndc * 0.75, ndc * 0.75);
  col += vec3(1.0, 0.94, 0.82) * (meteor(p, uM0, uP.x, uL.x) + meteor(p, uM1, uP.y, uL.y));
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) / 160.0;
  gl_FragColor = vec4(col, 1.0);
}`;

const starVert = /* glsl */ `
uniform float uTime; uniform float uPx;
attribute float aMag; attribute float aSeed; attribute vec3 aColor;
varying vec3 vCol; varying float vB; varying float vSpike; varying float vSharp;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = -mv.z;
  float s1 = sin(uTime * (0.55 + aSeed * 2.4) + aSeed * 61.0);
  float s2 = sin(uTime * (0.19 + aSeed * 0.8) + aSeed * 13.0);
  float tw = 0.70 + 0.30 * (0.5 + 0.5 * s1) * (0.65 + 0.35 * s2);
  float spike = smoothstep(0.955, 0.995, aMag);
  float base = mix(1.15, 3.4, aMag * aMag);
  float size = mix(base, 9.0 + 22.0 * spike, step(0.955, aMag));
  float depth = clamp(26.0 / dist, 0.75, 1.45);
  gl_PointSize = max(1.2, size * depth) * uPx;
  vCol = aColor;
  vB = (0.28 + 0.95 * aMag * aMag) * tw;
  vSpike = spike;
  vSharp = mix(16.0, 150.0, step(0.955, aMag));
}`;

const starFrag = /* glsl */ `
precision highp float;
varying vec3 vCol; varying float vB; varying float vSpike; varying float vSharp;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  float r2 = dot(q, q);
  if(r2 > 0.25) discard;
  float a = exp(-r2 * vSharp);
  if(vSpike > 0.0){
    float fade = 1.0 - smoothstep(0.0, 0.5, length(q));
    float sx = exp(-abs(q.y) * 120.0) * fade;
    float sy = exp(-abs(q.x) * 120.0) * fade;
    a += vSpike * ((sx + sy) * 0.55 + exp(-r2 * 26.0) * 0.22);
  }
  gl_FragColor = vec4(vCol * a * vB, 1.0);
}`;

const lineVert = /* glsl */ `
uniform float uDraw[5]; uniform float uAlpha[5]; uniform vec2 uRes; uniform float uWidth;
attribute vec3 aB; attribute float aEnd; attribute float aSide; attribute float aK; attribute float aKn; attribute float aId;
varying float vSide; varying float vA;
void main(){
  int id = int(aId + 0.5);
  float dr = 0.0; float al = 0.0;
  for(int i = 0; i < 5; i++){ if(i == id){ dr = uDraw[i]; al = uAlpha[i]; } }
  float f = clamp((dr - aK) / aKn, 0.0, 1.0);
  vec3 B = mix(position, aB, f);
  vec4 ca = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 cb = projectionMatrix * modelViewMatrix * vec4(B, 1.0);
  vec4 c = aEnd > 0.5 ? cb : ca;
  vec2 sa = ca.xy / ca.w * uRes; vec2 sb = cb.xy / cb.w * uRes;
  vec2 dir = sb - sa; float l = length(dir); dir = l > 1e-4 ? dir / l : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  c.xy += nrm * aSide * uWidth / uRes * c.w;
  gl_Position = c;
  vSide = aSide;
  vA = al * step(0.0001, f) * step(0.0, min(ca.w, cb.w));
}`;

const lineFrag = /* glsl */ `
precision highp float;
varying float vSide; varying float vA;
void main(){
  float e = 1.0 - smoothstep(0.25, 1.0, abs(vSide));
  gl_FragColor = vec4(vec3(0.86, 0.71, 0.43) * e * vA * 0.62, 1.0);
}`;

const dustVert = /* glsl */ `
uniform float uTravel; uniform float uPx; uniform float uTime;
attribute float aSeed;
varying float vA;
void main(){
  vec3 p = position;
  p.z = mod(p.z + uTravel, 16.0) - 15.5;
  p.x += sin(uTime * 0.11 + aSeed * 30.0) * 0.12;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = -mv.z;
  gl_PointSize = clamp(5.5 / d, 0.6, 3.6) * uPx;
  vA = smoothstep(15.5, 9.0, d) * smoothstep(0.4, 2.2, d) * (0.35 + 0.65 * aSeed);
}`;

const dustFrag = /* glsl */ `
precision highp float;
varying float vA;
void main(){
  vec2 q = gl_PointCoord - 0.5; float r2 = dot(q, q);
  if(r2 > 0.25) discard;
  gl_FragColor = vec4(vec3(0.95, 0.86, 0.68) * exp(-r2 * 14.0) * vA * 0.55, 1.0);
}`;

/* -------------------------------------------------------- real sky shapes */
// [RA hours, Dec degrees, visual magnitude]
type S = [number, number, number];
const CONST: { name: string; stars: S[]; lines: [number, number][] }[] = [
  {
    name: "Orion",
    stars: [
      [5.919, 7.407, 0.5], [5.418, 6.35, 1.6], [5.679, -1.943, 1.8], [5.603, -1.202, 1.7],
      [5.533, -0.299, 2.2], [5.796, -9.67, 2.1], [5.242, -8.202, 0.1], [5.585, 9.934, 3.4],
    ],
    lines: [[7, 0], [7, 1], [0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6]],
  },
  {
    name: "Cassiopeia",
    stars: [[0.153, 59.15, 2.3], [0.675, 56.537, 2.2], [0.945, 60.717, 2.4], [1.43, 60.235, 2.7], [1.907, 63.67, 3.4]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: "Leo",
    stars: [
      [10.14, 11.967, 1.4], [10.122, 16.763, 3.5], [10.333, 19.842, 2.0], [10.278, 23.417, 3.4],
      [9.879, 26.007, 3.9], [9.764, 23.774, 3.0], [11.235, 20.524, 2.6], [11.818, 14.572, 2.1], [11.237, 15.43, 3.3],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7], [7, 8], [8, 0], [6, 8]],
  },
  {
    name: "Ursa Major",
    stars: [
      [11.062, 61.751, 1.8], [11.031, 56.382, 2.4], [11.897, 53.695, 2.4], [12.257, 57.033, 3.3],
      [12.9, 55.96, 1.8], [13.399, 54.925, 2.2], [13.792, 49.313, 1.9],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    name: "Cygnus",
    stars: [[20.69, 45.28, 1.3], [20.37, 40.257, 2.2], [20.77, 33.97, 2.5], [19.75, 45.131, 2.9], [19.512, 27.96, 3.1], [21.216, 30.227, 3.2]],
    lines: [[0, 1], [1, 4], [1, 2], [2, 5], [1, 3]],
  },
];
// where each figure sits on the scroll band: angle below the horizon (deg), sideways offset, spin (deg)
const PLACE: [number, number, number][] = [
  [-2, 0.3, 0],
  [-40, -0.34, 12],
  [-78, 0.32, -8],
  [-116, -0.3, 6],
  [-154, 0.28, -10],
];
const SKY_R = 44;

const SPECTRAL: [number, [number, number, number]][] = [
  [0.02, [0.62, 0.7, 1.0]],
  [0.12, [0.68, 0.76, 1.0]],
  [0.32, [0.8, 0.85, 1.0]],
  [0.54, [0.97, 0.97, 1.0]],
  [0.74, [1.0, 0.95, 0.85]],
  [0.93, [1.0, 0.83, 0.62]],
  [1.01, [1.0, 0.72, 0.48]],
];
const starColor = () => {
  const r = Math.random();
  return SPECTRAL.find(([p]) => r < p)![1];
};

function randomDir(v: THREE.Vector3) {
  const u = rnd(-1, 1);
  const th = rnd(0, TAU);
  const s = Math.sqrt(1 - u * u);
  return v.set(s * Math.cos(th), s * Math.sin(th), u);
}

interface Built {
  stars: THREE.BufferGeometry;
  lines: THREE.BufferGeometry;
  starCount: number;
}

function buildSky(nField: number, nBand: number, bandN: THREE.Vector3): Built {
  const conStars = CONST.reduce((a, c) => a + c.stars.length, 0);
  const total = nField + nBand + conStars;
  const pos = new Float32Array(total * 3);
  const mag = new Float32Array(total);
  const seed = new Float32Array(total);
  const col = new Float32Array(total * 3);
  const v = new THREE.Vector3();
  // band basis
  const b1 = new THREE.Vector3(1, 0, 0).cross(bandN).normalize();
  const b2 = bandN.clone().cross(b1).normalize();
  let k = 0;
  const push = (dir: THREE.Vector3, r: number, m: number, c: [number, number, number]) => {
    pos[k * 3] = dir.x * r;
    pos[k * 3 + 1] = dir.y * r;
    pos[k * 3 + 2] = dir.z * r;
    mag[k] = m;
    seed[k] = Math.random();
    col.set(c, k * 3);
    k++;
  };
  // constellations
  const segA: number[] = [];
  const segB: number[] = [];
  const segId: number[] = [];
  const segK: number[] = [];
  const segKn: number[] = [];
  CONST.forEach((c, ci) => {
    const [deg, xoff, spin] = PLACE[ci];
    const th = (deg * Math.PI) / 180;
    const C = new THREE.Vector3(xoff, Math.sin(th), -Math.cos(th)).normalize();
    const N0 = new THREE.Vector3(0, Math.cos(th), Math.sin(th));
    const R0 = new THREE.Vector3().crossVectors(N0, C).normalize().negate();
    const N = N0.clone().sub(C.clone().multiplyScalar(N0.dot(C))).normalize();
    const R = R0.clone().sub(C.clone().multiplyScalar(R0.dot(C))).normalize();
    const sp = (spin * Math.PI) / 180;
    const ra0 = (c.stars.reduce((a, s) => a + s[0], 0) / c.stars.length) * 15 * (Math.PI / 180);
    const de0 = (c.stars.reduce((a, s) => a + s[1], 0) / c.stars.length) * (Math.PI / 180);
    const pts = c.stars.map(([ra, de, vm]) => {
      const a = ra * 15 * (Math.PI / 180);
      const d = de * (Math.PI / 180);
      const cosc = Math.sin(de0) * Math.sin(d) + Math.cos(de0) * Math.cos(d) * Math.cos(a - ra0);
      const x = (Math.cos(d) * Math.sin(a - ra0)) / cosc;
      const y = (Math.cos(de0) * Math.sin(d) - Math.sin(de0) * Math.cos(d) * Math.cos(a - ra0)) / cosc;
      const sx = -x * 1.05;
      const sy = y * 1.05;
      const rx = sx * Math.cos(sp) - sy * Math.sin(sp);
      const ry = sx * Math.sin(sp) + sy * Math.cos(sp);
      const dir = C.clone().addScaledVector(R, rx).addScaledVector(N, ry).normalize();
      push(dir, SKY_R, Math.min(0.999, 0.968 + (3.6 - vm) * 0.0085), [1, 0.93, 0.8]);
      return dir.multiplyScalar(SKY_R);
    });
    c.lines.forEach(([i, j], li) => {
      segA.push(pts[i].x, pts[i].y, pts[i].z);
      segB.push(pts[j].x, pts[j].y, pts[j].z);
      segId.push(ci);
      segK.push(li / c.lines.length);
      segKn.push(1 / c.lines.length);
    });
  });
  // constellation stars come first, then the field, then the faint band: adaptive quality (drawRange) drops the faint tail
  for (let i = 0; i < nField; i++) {
    randomDir(v);
    const m = Math.pow(Math.random(), 7.5) * 0.995; // power law: few bright, many faint
    push(v, rnd(7, 90), m, starColor());
  }
  for (let i = 0; i < nBand; i++) {
    const th = rnd(0, TAU);
    const lat = (Math.random() + Math.random() + Math.random() - 1.5) * 0.17;
    v.copy(b1).multiplyScalar(Math.cos(th)).addScaledVector(b2, Math.sin(th)).addScaledVector(bandN, lat).normalize();
    push(v, rnd(30, 90), Math.pow(Math.random(), 4) * 0.55, starColor());
  }
  const stars = new THREE.BufferGeometry();
  stars.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  stars.setAttribute("aMag", new THREE.BufferAttribute(mag, 1));
  stars.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  stars.setAttribute("aColor", new THREE.BufferAttribute(col, 3));

  const n = segId.length;
  const P = new Float32Array(n * 4 * 3);
  const B = new Float32Array(n * 4 * 3);
  const E = new Float32Array(n * 4);
  const Sd = new Float32Array(n * 4);
  const K = new Float32Array(n * 4);
  const Kn = new Float32Array(n * 4);
  const I = new Float32Array(n * 4);
  const idx: number[] = [];
  for (let s = 0; s < n; s++) {
    for (let q = 0; q < 4; q++) {
      const o = s * 4 + q;
      P.set(segA.slice(s * 3, s * 3 + 3), o * 3);
      B.set(segB.slice(s * 3, s * 3 + 3), o * 3);
      E[o] = q < 2 ? 0 : 1;
      Sd[o] = q % 2 === 0 ? -1 : 1;
      K[o] = segK[s];
      Kn[o] = segKn[s];
      I[o] = segId[s];
    }
    const b = s * 4;
    idx.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
  }
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(P, 3));
  lines.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  lines.setAttribute("aEnd", new THREE.BufferAttribute(E, 1));
  lines.setAttribute("aSide", new THREE.BufferAttribute(Sd, 1));
  lines.setAttribute("aK", new THREE.BufferAttribute(K, 1));
  lines.setAttribute("aKn", new THREE.BufferAttribute(Kn, 1));
  lines.setAttribute("aId", new THREE.BufferAttribute(I, 1));
  lines.setIndex(idx);
  return { stars, lines, starCount: total };
}

/* ------------------------------------------------------------- component */
export default function Cosmos() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the CSS aurora fallback stays
    }
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const lowEnd = small || coarse || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || !!nav.connection?.saveData;
    let dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 2);
    let nebScale = lowEnd ? 0.36 : 0.5;
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x05070b, 1);
    el.appendChild(renderer.domElement);

    const bandN = new THREE.Vector3(0.62, 0.78, 0.12).normalize();
    const sky = buildSky(lowEnd ? 4200 : 8200, lowEnd ? 2600 : 6000, bandN);

    // nebula pass
    const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter });
    const nebScene = new THREE.Scene();
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const nebMat = new THREE.ShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: nebulaFrag,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uInvRot: { value: new THREE.Matrix3() },
        uTan: { value: Math.tan((30 * Math.PI) / 180) },
        uBandN: { value: bandN },
      },
      depthTest: false,
      depthWrite: false,
    });
    const nebQuad = new THREE.Mesh(quadGeo, nebMat);
    nebQuad.frustumCulled = false;
    nebScene.add(nebQuad);

    // main scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    const compMat = new THREE.ShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: compositeFrag,
      uniforms: {
        uNeb: { value: rt.texture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.4, 0.2) },
        uMouseOn: { value: 0 },
        uGlow: { value: 1 },
        uM0: { value: new THREE.Vector4() },
        uM1: { value: new THREE.Vector4() },
        uP: { value: new THREE.Vector2(-1, -1) },
        uL: { value: new THREE.Vector2(0.3, 0.3) },
      },
      depthTest: false,
      depthWrite: false,
    });
    const comp = new THREE.Mesh(quadGeo, compMat);
    comp.frustumCulled = false;
    comp.renderOrder = -10;
    scene.add(comp);

    const add = { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation, transparent: true, depthTest: false, depthWrite: false } as const;
    const group = new THREE.Group();
    scene.add(group);
    const starMat = new THREE.ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: starFrag,
      uniforms: { uTime: { value: 0 }, uPx: { value: dpr } },
      ...add,
    });
    const stars = new THREE.Points(sky.stars, starMat);
    stars.frustumCulled = false;
    group.add(stars);
    const lineMat = new THREE.ShaderMaterial({
      vertexShader: lineVert,
      fragmentShader: lineFrag,
      uniforms: {
        uDraw: { value: [0, 0, 0, 0, 0] },
        uAlpha: { value: [0, 0, 0, 0, 0] },
        uRes: { value: new THREE.Vector2(1, 1) },
        uWidth: { value: 1.1 * dpr },
      },
      ...add,
    });
    const lines = new THREE.Mesh(sky.lines, lineMat);
    lines.frustumCulled = false;
    group.add(lines);

    // drifting star-dust (gives the "flying through space" depth)
    const ND = lowEnd ? 260 : 560;
    const dp = new Float32Array(ND * 3);
    const ds = new Float32Array(ND);
    for (let i = 0; i < ND; i++) {
      dp[i * 3] = rnd(-9, 9);
      dp[i * 3 + 1] = rnd(-6, 6);
      dp[i * 3 + 2] = rnd(0, 16);
      ds[i] = Math.random();
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(ds, 1));
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      uniforms: { uTravel: { value: 0 }, uPx: { value: dpr }, uTime: { value: 0 } },
      ...add,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);

    /* --------------------------------------------------------- sizing */
    let W = 1;
    let H = 1;
    let heroH = window.innerHeight;
    const resize = () => {
      W = el.clientWidth || window.innerWidth;
      H = el.clientHeight || window.innerHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
      const aspect = W / H;
      const fov = aspect < 1 ? 72 : 60;
      camera.fov = fov;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      const tan = Math.tan(((fov / 2) * Math.PI) / 180);
      nebMat.uniforms.uTan.value = tan;
      rt.setSize(Math.max(2, Math.round(W * nebScale)), Math.max(2, Math.round(H * nebScale)));
      nebMat.uniforms.uRes.value.set(W, H);
      compMat.uniforms.uRes.value.set(W * dpr, H * dpr);
      lineMat.uniforms.uRes.value.set(W * dpr * 0.5, H * dpr * 0.5);
      lineMat.uniforms.uWidth.value = 1.25 * dpr;
      starMat.uniforms.uPx.value = dpr;
      dustMat.uniforms.uPx.value = dpr;
      heroH = document.getElementById("top")?.offsetHeight ?? window.innerHeight;
      if (reduced) frame(performance.now(), true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    /* --------------------------------------------------------- inputs */
    const mouseT = new THREE.Vector2(0.35, 0.15);
    let mouseOnT = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouseT.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      mouseOnT = 1;
    };
    const onLeave = () => (mouseOnT = 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let light = document.documentElement.dataset.theme === "light";
    const mo = new MutationObserver(() => {
      light = document.documentElement.dataset.theme === "light";
      if (!light) el.style.clipPath = "";
      el.style.visibility = "";
      if (reduced) frame(performance.now(), true);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    /* --------------------------------------------------------- state */
    const start = performance.now();
    let last = start;
    let sy = window.scrollY;
    let prevY = sy;
    let vel = 0;
    let travel = 0;
    const mouse = new THREE.Vector2(0.35, 0.15);
    let mouseOn = 0;
    const cam = new THREE.Vector2();
    const qx = new THREE.Quaternion();
    const qy = new THREE.Quaternion();
    const qz = new THREE.Quaternion();
    const X = new THREE.Vector3(1, 0, 0);
    const Y = new THREE.Vector3(0, 1, 0);
    const Z = new THREE.Vector3(0, 0, 1);
    const m4 = new THREE.Matrix4();
    const inv = nebMat.uniforms.uInvRot.value as THREE.Matrix3;
    const met = [
      { t0: -1, dur: 1, v: compMat.uniforms.uM0.value as THREE.Vector4, len: 0.3 },
      { t0: -1, dur: 1, v: compMat.uniforms.uM1.value as THREE.Vector4, len: 0.3 },
    ];
    let nextMeteor = 2.2;
    const spawn = (t: number) => {
      const slot = met.find((m) => t - m.t0 > m.dur);
      if (!slot) return;
      const asp = W / H;
      const leftward = Math.random() < 0.5;
      const ang = leftward ? rnd(200, 235) : rnd(-55, -20);
      const a = (ang * Math.PI) / 180;
      const sx = leftward ? rnd(-0.1, 0.95) * asp : rnd(-0.95, 0.1) * asp;
      slot.v.set(sx, rnd(0.2, 0.95), a, rnd(0.55, 1.1));
      slot.len = rnd(0.22, 0.42);
      slot.t0 = t;
      slot.dur = rnd(0.75, 1.35);
    };

    // adaptive quality (resolution first, never frame skipping); ignores the boot period
    let level = 0;
    let acc = 0;
    let frames = 0;
    let settleUntil = 2.6;
    const degrade = (t: number) => {
      level++;
      if (level === 1) {
        dpr = Math.min(dpr, 1);
        nebScale = Math.min(nebScale, 0.36);
      } else if (level === 2) {
        nebScale = 0.26;
        sky.stars.setDrawRange(0, Math.floor(sky.starCount * 0.6));
      } else {
        sky.stars.setDrawRange(0, Math.floor(sky.starCount * 0.4));
        dustGeo.setDrawRange(0, Math.floor(ND * 0.5));
      }
      resize();
      settleUntil = t + 1.2;
    };

    let shown = false;
    let raf = 0;
    const frame = (now: number, force = false) => {
      const dtRaw = (now - last) / 1000;
      last = now;
      const dt = Math.min(dtRaw, 0.05);
      const t = (now - start) / 1000;

      // light theme: the sky only lives inside the dark hero "stage"
      if (light) {
        const bottom = heroH - window.scrollY;
        if (bottom <= 0) {
          el.style.visibility = "hidden";
          return;
        }
        el.style.visibility = "";
        el.style.clipPath = `inset(0 0 ${Math.max(0, H - bottom)}px 0)`;
      }

      if (!force && t > settleUntil && dtRaw < 0.25) {
        acc += dtRaw;
        frames++;
        if (frames >= 90) {
          if (acc / frames > 0.024 && level < 3) degrade(t);
          acc = 0;
          frames = 0;
        }
      }

      const y = window.scrollY;
      sy += (y - sy) * (force ? 1 : smooth(dt, 7));
      const v = dt > 0 ? (y - prevY) / dt : 0;
      prevY = y;
      vel += (Math.min(Math.abs(v) / H, 4) - vel) * smooth(dt, 3);
      travel += dt * (0.32 + vel * 2.2);

      mouse.lerp(mouseT, force ? 1 : smooth(dt, 3.2));
      mouseOn += (mouseOnT - mouseOn) * smooth(dt, 1.6);
      cam.x += (mouse.x * 0.55 * mouseOn - cam.x) * smooth(dt, 1.4);
      cam.y += (mouse.y * 0.32 * mouseOn - cam.y) * smooth(dt, 1.4);
      camera.position.set(cam.x, cam.y, 0);

      // sky orientation: scroll pans the band upward, gentle breathing drift on top
      const tt = reduced ? 0 : t;
      const alpha = (sy / H) * 0.23;
      qx.setFromAxisAngle(X, alpha);
      qy.setFromAxisAngle(Y, 0.16 * Math.sin(tt * 0.019) + cam.x * 0.02);
      qz.setFromAxisAngle(Z, 0.06 * Math.sin(tt * 0.013 + 1.0) - 0.04);
      group.quaternion.copy(qz).multiply(qy).multiply(qx);
      m4.makeRotationFromQuaternion(group.quaternion);
      inv.setFromMatrix4(m4).transpose();

      nebMat.uniforms.uTime.value = tt + 40;
      compMat.uniforms.uTime.value = tt + 40;
      starMat.uniforms.uTime.value = tt + 10;
      dustMat.uniforms.uTime.value = tt;
      dustMat.uniforms.uTravel.value = travel;
      (compMat.uniforms.uMouse.value as THREE.Vector2).copy(mouse);
      compMat.uniforms.uMouseOn.value = mouseOn;

      // constellations: draw in, hold, fade, repeat (staggered)
      const dr = lineMat.uniforms.uDraw.value as number[];
      const al = lineMat.uniforms.uAlpha.value as number[];
      for (let i = 0; i < 5; i++) {
        if (reduced) {
          dr[i] = 1;
          al[i] = 1;
          continue;
        }
        const s = (((t + 1.5 - i * 4.3) / 22) % 1 + 1) % 1;
        const e = Math.min(1, s / 0.24);
        dr[i] = 1 - Math.pow(1 - e, 3);
        al[i] = Math.min(1, s / 0.03) * (1 - Math.min(1, Math.max(0, (s - 0.8) / 0.15)));
      }

      // shooting stars
      if (!reduced) {
        if (t > nextMeteor) {
          spawn(t);
          nextMeteor = t + rnd(2.5, 6);
        }
        const P = compMat.uniforms.uP.value as THREE.Vector2;
        const L = compMat.uniforms.uL.value as THREE.Vector2;
        P.set((t - met[0].t0) / met[0].dur, (t - met[1].t0) / met[1].dur);
        if (met[0].t0 < 0) P.x = -1;
        if (met[1].t0 < 0) P.y = -1;
        L.set(met[0].len, met[1].len);
      }

      renderer.setRenderTarget(rt);
      renderer.render(nebScene, ortho);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      if (!shown) {
        shown = true;
        el.classList.add("on");
        document.documentElement.classList.add("cosmos-on");
      }
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      frame(now);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    resize();
    if (reduced) {
      frame(performance.now(), true);
      const onScroll = () => light && frame(performance.now(), true);
      window.addEventListener("scroll", onScroll, { passive: true });
    } else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("cosmos-on");
      sky.stars.dispose();
      sky.lines.dispose();
      dustGeo.dispose();
      quadGeo.dispose();
      [nebMat, compMat, starMat, lineMat, dustMat].forEach((m) => m.dispose());
      rt.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} className="cosmos" aria-hidden />;
}
