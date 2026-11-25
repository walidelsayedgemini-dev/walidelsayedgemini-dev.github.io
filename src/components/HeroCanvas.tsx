import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReduced } from "../lib/util";

const beamFrag = /* glsl */ `
precision highp float;
uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
void main(){
  vec2 o = vec2(0.80, 0.34);
  vec2 p = (vUv - o) * vec2(uRes.x / uRes.y, 1.0);
  float a = atan(p.y, p.x);
  float t = uTime * 0.32;
  float d = abs(mod(a - t + 3.14159265, 6.2831853) - 3.14159265);
  float beam = pow(smoothstep(0.42, 0.0, d), 2.2);
  float fall = exp(-length(p) * 0.85);
  float core = exp(-length(p) * 38.0);
  vec3 amber = vec3(1.0, 0.70, 0.14);
  vec3 col = amber * (beam * fall * 0.34 + core * 1.1);
  gl_FragColor = vec4(col, 1.0);
}`;

const beamVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const ptsVert = /* glsl */ `
uniform float uTime; uniform vec2 uMouse; uniform float uPx; uniform float uAspect; uniform float uScroll;
attribute float aSeed; attribute float aR;
varying float vMix; varying float vA;
void main(){
  vec3 p = position;
  float ang = uTime * (0.035 + 0.12 / (0.7 + aR));
  float c = cos(ang), s = sin(ang);
  p.xz = mat2(c, -s, s, c) * p.xz;
  float tl = 0.95;
  p.yz = mat2(cos(tl), -sin(tl), sin(tl), cos(tl)) * p.yz;
  p.y += sin(uTime * 0.7 + aSeed * 40.0) * 0.035;
  p.y += uScroll * 0.8;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = ndc - uMouse; d.x *= uAspect;
  float f = exp(-dot(d, d) * 16.0);
  ndc += normalize(d + 1e-4) * f * 0.16;
  clip.xy = ndc * clip.w;
  gl_Position = clip;
  gl_PointSize = (1.0 + aSeed * 2.4 + f * 3.0) * uPx * (7.5 / -mv.z);
  vMix = smoothstep(0.5, 4.8, aR) ;
  vA = 0.35 + 0.65 * aSeed + f;
}`;

const ptsFrag = /* glsl */ `
precision highp float;
varying float vMix; varying float vA;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q);
  if(r > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, r);
  vec3 amber = vec3(1.0, 0.72, 0.18);
  vec3 cyan = vec3(0.30, 0.88, 1.0);
  vec3 col = mix(amber, cyan, vMix);
  gl_FragColor = vec4(col, soft * vA * 0.9);
}`;

export default function HeroCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReduced();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // WebGL unavailable: CSS gradient fallback stays visible
    }
    const mobile = window.innerWidth < 800;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // lighthouse beam (full-screen shader, drawn first, additive)
    const beamMat = new THREE.ShaderMaterial({
      vertexShader: beamVert,
      fragmentShader: beamFrag,
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), beamMat);
    beam.frustumCulled = false;
    beam.renderOrder = -1;
    scene.add(beam);

    // spiral-galaxy particle field
    const N = mobile ? 3200 : 7500;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const rad = new Float32Array(N);
    const arms = 4;
    for (let i = 0; i < N; i++) {
      const r = Math.pow(Math.random(), 0.65) * 5.2;
      const arm = (i % arms) / arms * Math.PI * 2;
      const spin = r * 0.9;
      const spread = (Math.random() - 0.5) * (0.25 + r * 0.22);
      const th = arm + spin + spread;
      pos[i * 3] = Math.cos(th) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.35 * (1 - r / 6);
      pos[i * 3 + 2] = Math.sin(th) * r;
      seed[i] = Math.random();
      rad[i] = r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aR", new THREE.BufferAttribute(rad, 1));
    const ptsMat = new THREE.ShaderMaterial({
      vertexShader: ptsVert,
      fragmentShader: ptsFrag,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uPx: { value: dpr },
        uAspect: { value: 1 },
        uScroll: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, ptsMat);
    pts.position.set(0.9, -0.2, 0);
    scene.add(pts);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      beamMat.uniforms.uRes.value.set(w, h);
      ptsMat.uniforms.uAspect.value = w / h;
      if (reduced) renderer.render(scene, camera);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const target = new THREE.Vector2(9, 9);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const onLeave = () => target.set(9, 9);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      beamMat.uniforms.uTime.value = t;
      ptsMat.uniforms.uTime.value = t;
      ptsMat.uniforms.uScroll.value = Math.min(window.scrollY / window.innerHeight, 1.5);
      const m = ptsMat.uniforms.uMouse.value as THREE.Vector2;
      m.lerp(target, 0.08);
      camera.position.x += ((target.x < 5 ? target.x * 0.35 : 0) - camera.position.x) * 0.03;
      camera.position.y += ((target.y < 5 ? target.y * 0.25 : 0) - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    if (!reduced) loop();
    else {
      beamMat.uniforms.uTime.value = 1.2;
      ptsMat.uniforms.uTime.value = 8;
      renderer.render(scene, camera);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      geo.dispose();
      ptsMat.dispose();
      beamMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reduced]);

  return <div ref={host} className="hero-canvas" aria-hidden />;
}
