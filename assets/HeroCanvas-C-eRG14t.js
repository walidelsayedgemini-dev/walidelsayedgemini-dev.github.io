import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{l as t,u as n}from"./motion-D5tSbMKL.js";import{a as r,c as i,d as a,i as o,l as s,n as c,o as l,r as u,s as d,t as f,u as p}from"./three-GNSnMZzP.js";import{t as m}from"./index-BKl00qKe.js";var h=e(n(),1),g=t(),_=`
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
  vec3 amber = vec3(0.83, 0.69, 0.42);
  vec3 col = amber * (beam * fall * 0.34 + core * 1.1);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}`,v=`
varying vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`,y=`
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
  gl_PointSize = (1.4 + aSeed * 2.8 + f * 3.0) * uPx * (7.5 / -mv.z);
  vMix = smoothstep(0.5, 4.8, aR) ;
  vA = 0.5 + 0.5 * aSeed + f;
}`,b=`
precision highp float;
varying float vMix; varying float vA;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q);
  if(r > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, r);
  vec3 amber = vec3(0.83, 0.69, 0.42);
  vec3 cyan = vec3(0.93, 0.89, 0.80);
  vec3 rose = vec3(0.90, 0.78, 0.55);
  vec3 violet = vec3(0.70, 0.74, 0.82);
  vec3 col = mix(amber, rose, smoothstep(0.0, 0.34, vMix));
  col = mix(col, violet, smoothstep(0.30, 0.64, vMix));
  col = mix(col, cyan, smoothstep(0.60, 1.0, vMix));
  gl_FragColor = vec4(col, soft * vA);
}`;function x(){let e=(0,h.useRef)(null),t=m();return(0,h.useEffect)(()=>{let n=e.current;if(!n)return;let m;try{m=new f({antialias:!1,alpha:!0,powerPreference:`high-performance`})}catch{return}let h=navigator,g=window.innerWidth<800||(h.hardwareConcurrency??8)<=4||(h.deviceMemory??8)<=4||!!h.connection?.saveData,x=Math.min(window.devicePixelRatio||1,g?1.25:1.75);m.setPixelRatio(x),m.setClearColor(0,0),n.appendChild(m.domElement);let S=new s,C=new l(55,1,.1,100);C.position.set(0,0,6.2);let w=new p({vertexShader:v,fragmentShader:_,uniforms:{uTime:{value:0},uRes:{value:new a(1,1)}},depthTest:!1,depthWrite:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201,blendSrcAlpha:201,blendDstAlpha:201,transparent:!0}),T=new r(new d(2,2),w);T.frustumCulled=!1,T.renderOrder=-1,S.add(T);let E=g?3200:7500,D=new Float32Array(E*3),O=new Float32Array(E),k=new Float32Array(E);for(let e=0;e<E;e++){let t=Math.random()**.65*5.2,n=e%4/4*Math.PI*2,r=t*.9,i=(Math.random()-.5)*(.25+t*.22),a=n+r+i;D[e*3]=Math.cos(a)*t,D[e*3+1]=(Math.random()-.5)*.35*(1-t/6),D[e*3+2]=Math.sin(a)*t,O[e]=Math.random(),k[e]=t}let A=new u;A.setAttribute(`position`,new c(D,3)),A.setAttribute(`aSeed`,new c(O,1)),A.setAttribute(`aR`,new c(k,1));let j=new p({vertexShader:y,fragmentShader:b,uniforms:{uTime:{value:0},uMouse:{value:new a(9,9)},uPx:{value:x},uAspect:{value:1},uScroll:{value:0}},transparent:!0,depthWrite:!1,blending:2}),M=new i(A,j);M.position.set(.9,-.2,0),S.add(M);let N=()=>{let e=n.clientWidth||1,r=n.clientHeight||1;m.setSize(e,r,!1),C.aspect=e/r,C.updateProjectionMatrix(),w.uniforms.uRes.value.set(e,r),j.uniforms.uAspect.value=e/r,t&&m.render(S,C)};N();let P=new ResizeObserver(N);P.observe(n);let F=new a(9,9),I=e=>{let t=n.getBoundingClientRect();F.set((e.clientX-t.left)/t.width*2-1,-((e.clientY-t.top)/t.height*2-1))},L=()=>F.set(9,9);window.addEventListener(`pointermove`,I,{passive:!0}),document.addEventListener(`pointerleave`,L);let R=!0,z=new IntersectionObserver(([e])=>R=e.isIntersecting,{threshold:0});z.observe(n);let B=new o,V=0,H=0,U=0,W=0,G=performance.now(),K=!1,q=()=>{H++,H===1?(m.setPixelRatio(1),j.uniforms.uPx.value=1,N()):H===2?A.setDrawRange(0,Math.floor(E*.45)):H===3&&A.setDrawRange(0,Math.floor(E*.25))},J=()=>{if(V=requestAnimationFrame(J),!R||document.hidden){G=performance.now();return}let e=performance.now(),t=e-G;if(G=e,t<250&&(W+=t,U++,U===45&&(W/U>29&&H<3&&q(),W=0,U=0)),H>=3&&(K=!K,K))return;let n=B.getElapsedTime();w.uniforms.uTime.value=n,j.uniforms.uTime.value=n,j.uniforms.uScroll.value=Math.min(window.scrollY/window.innerHeight,1.5),j.uniforms.uMouse.value.lerp(F,.08),C.position.x+=((F.x<5?F.x*.35:0)-C.position.x)*.03,C.position.y+=((F.y<5?F.y*.25:0)-C.position.y)*.03,C.lookAt(0,0,0),m.render(S,C)};return t?(w.uniforms.uTime.value=1.2,j.uniforms.uTime.value=8,m.render(S,C)):J(),()=>{cancelAnimationFrame(V),P.disconnect(),z.disconnect(),window.removeEventListener(`pointermove`,I),document.removeEventListener(`pointerleave`,L),A.dispose(),j.dispose(),w.dispose(),m.dispose(),m.domElement.remove()}},[t]),(0,g.jsx)(`div`,{ref:e,className:`hero-canvas`,"aria-hidden":!0})}export{x as default};