import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{l as t,u as n}from"./motion-D5tSbMKL.js";import{_ as r,a as i,b as a,c as o,d as s,f as c,g as l,h as u,i as d,l as f,m as p,n as m,o as h,p as g,r as _,s as v,t as y,u as ee,v as b,y as x}from"./three-B8Z-5DhD.js";var S=e(n(),1),C=t(),te=Math.PI*2,w=(e,t)=>e+Math.random()*(t-e),T=(e,t)=>1-Math.exp(-e*t),E=`
varying vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`,ne=`
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
}`,re=`
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
}`,ie=`
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
}`,ae=`
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
}`,oe=`
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
}`,D=`
precision highp float;
varying float vSide; varying float vA;
void main(){
  float e = 1.0 - smoothstep(0.25, 1.0, abs(vSide));
  gl_FragColor = vec4(vec3(0.86, 0.71, 0.43) * e * vA * 0.62, 1.0);
}`,se=`
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
}`,ce=`
precision highp float;
varying float vA;
void main(){
  vec2 q = gl_PointCoord - 0.5; float r2 = dot(q, q);
  if(r2 > 0.25) discard;
  gl_FragColor = vec4(vec3(0.95, 0.86, 0.68) * exp(-r2 * 14.0) * vA * 0.55, 1.0);
}`,O=[{name:`Orion`,stars:[[5.919,7.407,.5],[5.418,6.35,1.6],[5.679,-1.943,1.8],[5.603,-1.202,1.7],[5.533,-.299,2.2],[5.796,-9.67,2.1],[5.242,-8.202,.1],[5.585,9.934,3.4]],lines:[[7,0],[7,1],[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6]]},{name:`Cassiopeia`,stars:[[.153,59.15,2.3],[.675,56.537,2.2],[.945,60.717,2.4],[1.43,60.235,2.7],[1.907,63.67,3.4]],lines:[[0,1],[1,2],[2,3],[3,4]]},{name:`Leo`,stars:[[10.14,11.967,1.4],[10.122,16.763,3.5],[10.333,19.842,2],[10.278,23.417,3.4],[9.879,26.007,3.9],[9.764,23.774,3],[11.235,20.524,2.6],[11.818,14.572,2.1],[11.237,15.43,3.3]],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[6,7],[7,8],[8,0],[6,8]]},{name:`Ursa Major`,stars:[[11.062,61.751,1.8],[11.031,56.382,2.4],[11.897,53.695,2.4],[12.257,57.033,3.3],[12.9,55.96,1.8],[13.399,54.925,2.2],[13.792,49.313,1.9]],lines:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]]},{name:`Cygnus`,stars:[[20.69,45.28,1.3],[20.37,40.257,2.2],[20.77,33.97,2.5],[19.75,45.131,2.9],[19.512,27.96,3.1],[21.216,30.227,3.2]],lines:[[0,1],[1,4],[1,2],[2,5],[1,3]]}],k=[[-2,.3,0],[-40,-.34,12],[-78,.32,-8],[-116,-.3,6],[-154,.28,-10]],A=44,le=[[.02,[.62,.7,1]],[.12,[.68,.76,1]],[.32,[.8,.85,1]],[.54,[.97,.97,1]],[.74,[1,.95,.85]],[.93,[1,.83,.62]],[1.01,[1,.72,.48]]],j=()=>{let e=Math.random();return le.find(([t])=>e<t)[1]};function M(e){let t=w(-1,1),n=w(0,te),r=Math.sqrt(1-t*t);return e.set(r*Math.cos(n),r*Math.sin(n),t)}function ue(e,t,n){let r=O.reduce((e,t)=>e+t.stars.length,0),i=e+t+r,a=new Float32Array(i*3),o=new Float32Array(i),s=new Float32Array(i),c=new Float32Array(i*3),l=new b,u=new b(1,0,0).cross(n).normalize(),d=n.clone().cross(u).normalize(),f=0,p=(e,t,n,r)=>{a[f*3]=e.x*t,a[f*3+1]=e.y*t,a[f*3+2]=e.z*t,o[f]=n,s[f]=Math.random(),c.set(r,f*3),f++},h=[],g=[],v=[],y=[],ee=[];O.forEach((e,t)=>{let[n,r,i]=k[t],a=n*Math.PI/180,o=new b(r,Math.sin(a),-Math.cos(a)).normalize(),s=new b(0,Math.cos(a),Math.sin(a)),c=new b().crossVectors(s,o).normalize().negate(),l=s.clone().sub(o.clone().multiplyScalar(s.dot(o))).normalize(),u=c.clone().sub(o.clone().multiplyScalar(c.dot(o))).normalize(),d=i*Math.PI/180,f=e.stars.reduce((e,t)=>e+t[0],0)/e.stars.length*15*(Math.PI/180),m=e.stars.reduce((e,t)=>e+t[1],0)/e.stars.length*(Math.PI/180),_=e.stars.map(([e,t,n])=>{let r=e*15*(Math.PI/180),i=Math.PI/180*t,a=Math.sin(m)*Math.sin(i)+Math.cos(m)*Math.cos(i)*Math.cos(r-f),s=Math.cos(i)*Math.sin(r-f)/a,c=(Math.cos(m)*Math.sin(i)-Math.sin(m)*Math.cos(i)*Math.cos(r-f))/a,h=-s*1.05,g=c*1.05,_=h*Math.cos(d)-g*Math.sin(d),v=h*Math.sin(d)+g*Math.cos(d),y=o.clone().addScaledVector(u,_).addScaledVector(l,v).normalize();return p(y,A,Math.min(.999,.968+(3.6-n)*.0085),[1,.93,.8]),y.multiplyScalar(A)});e.lines.forEach(([n,r],i)=>{h.push(_[n].x,_[n].y,_[n].z),g.push(_[r].x,_[r].y,_[r].z),v.push(t),y.push(i/e.lines.length),ee.push(1/e.lines.length)})});for(let t=0;t<e;t++){M(l);let e=Math.random()**7.5*.995;p(l,w(7,90),e,j())}for(let e=0;e<t;e++){let e=w(0,te),t=(Math.random()+Math.random()+Math.random()-1.5)*.17;l.copy(u).multiplyScalar(Math.cos(e)).addScaledVector(d,Math.sin(e)).addScaledVector(n,t).normalize(),p(l,w(30,90),Math.random()**4*.55,j())}let x=new _;x.setAttribute(`position`,new m(a,3)),x.setAttribute(`aMag`,new m(o,1)),x.setAttribute(`aSeed`,new m(s,1)),x.setAttribute(`aColor`,new m(c,3));let S=v.length,C=new Float32Array(S*4*3),T=new Float32Array(S*4*3),E=new Float32Array(S*4),ne=new Float32Array(S*4),re=new Float32Array(S*4),ie=new Float32Array(S*4),ae=new Float32Array(S*4),oe=[];for(let e=0;e<S;e++){for(let t=0;t<4;t++){let n=e*4+t;C.set(h.slice(e*3,e*3+3),n*3),T.set(g.slice(e*3,e*3+3),n*3),E[n]=t<2?0:1,ne[n]=t%2==0?-1:1,re[n]=y[e],ie[n]=ee[e],ae[n]=v[e]}let t=e*4;oe.push(t,t+1,t+2,t+2,t+1,t+3)}let D=new _;return D.setAttribute(`position`,new m(C,3)),D.setAttribute(`aB`,new m(T,3)),D.setAttribute(`aEnd`,new m(E,1)),D.setAttribute(`aSide`,new m(ne,1)),D.setAttribute(`aK`,new m(re,1)),D.setAttribute(`aKn`,new m(ie,1)),D.setAttribute(`aId`,new m(ae,1)),D.setIndex(oe),{stars:x,lines:D,starCount:i}}function de(){let e=(0,S.useRef)(null);return(0,S.useEffect)(()=>{let t=e.current;if(!t)return;let n=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,S;try{S=new y({antialias:!1,alpha:!1,powerPreference:`high-performance`})}catch{return}let C=navigator,te=window.matchMedia(`(pointer: coarse)`).matches,O=Math.min(window.innerWidth,window.innerHeight)<700||te||(C.hardwareConcurrency??8)<=4||(C.deviceMemory??8)<=4||!!C.connection?.saveData,k=Math.min(window.devicePixelRatio||1,O?1.5:2),A=O?.36:.5;S.setPixelRatio(k),S.setClearColor(329483,1),t.appendChild(S.domElement);let le=new b(.62,.78,.12).normalize(),j=ue(O?4200:8200,O?2600:6e3,le),M=new a(4,4,{type:i,depthBuffer:!1,magFilter:h,minFilter:h}),de=new u,fe=new ee(-1,1,1,-1,0,1),pe=new c(2,2),N=new l({vertexShader:E,fragmentShader:ne,uniforms:{uRes:{value:new r(1,1)},uTime:{value:0},uInvRot:{value:new v},uTan:{value:Math.tan(30*Math.PI/180)},uBandN:{value:le}},depthTest:!1,depthWrite:!1}),me=new f(pe,N);me.frustumCulled=!1,de.add(me);let P=new u,F=new s(60,1,.1,200),I=new l({vertexShader:E,fragmentShader:re,uniforms:{uNeb:{value:M.texture},uRes:{value:new r(1,1)},uTime:{value:0},uMouse:{value:new r(.4,.2)},uMouseOn:{value:0},uGlow:{value:1},uM0:{value:new x},uM1:{value:new x},uP:{value:new r(-1,-1)},uL:{value:new r(.3,.3)}},depthTest:!1,depthWrite:!1}),he=new f(pe,I);he.frustumCulled=!1,he.renderOrder=-10,P.add(he);let ge={blending:5,blendSrc:201,blendDst:201,blendEquation:100,transparent:!0,depthTest:!1,depthWrite:!1},L=new d;P.add(L);let R=new l({vertexShader:ie,fragmentShader:ae,uniforms:{uTime:{value:0},uPx:{value:k}},...ge}),_e=new g(j.stars,R);_e.frustumCulled=!1,L.add(_e);let z=new l({vertexShader:oe,fragmentShader:D,uniforms:{uDraw:{value:[0,0,0,0,0]},uAlpha:{value:[0,0,0,0,0]},uRes:{value:new r(1,1)},uWidth:{value:1.1*k}},...ge}),ve=new f(j.lines,z);ve.frustumCulled=!1,L.add(ve);let B=O?260:560,V=new Float32Array(B*3),ye=new Float32Array(B);for(let e=0;e<B;e++)V[e*3]=w(-9,9),V[e*3+1]=w(-6,6),V[e*3+2]=w(0,16),ye[e]=Math.random();let H=new _;H.setAttribute(`position`,new m(V,3)),H.setAttribute(`aSeed`,new m(ye,1));let U=new l({vertexShader:se,fragmentShader:ce,uniforms:{uTravel:{value:0},uPx:{value:k},uTime:{value:0}},...ge}),be=new g(H,U);be.frustumCulled=!1,P.add(be);let W=1,G=1,xe=window.innerHeight,Se=()=>{W=t.clientWidth||window.innerWidth,G=t.clientHeight||window.innerHeight,S.setPixelRatio(k),S.setSize(W,G,!1);let e=W/G,r=e<1?72:60;F.fov=r,F.aspect=e,F.updateProjectionMatrix();let i=Math.tan(r/2*Math.PI/180);N.uniforms.uTan.value=i,M.setSize(Math.max(2,Math.round(W*A)),Math.max(2,Math.round(G*A))),N.uniforms.uRes.value.set(W,G),I.uniforms.uRes.value.set(W*k,G*k),z.uniforms.uRes.value.set(W*k*.5,G*k*.5),z.uniforms.uWidth.value=1.25*k,R.uniforms.uPx.value=k,U.uniforms.uPx.value=k,xe=document.getElementById(`top`)?.offsetHeight??window.innerHeight,n&&$(performance.now(),!0)},Ce=new ResizeObserver(Se);Ce.observe(t);let we=new r(.35,.15),Te=0,Ee=e=>{e.pointerType===`mouse`&&(we.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1)),Te=1)},De=()=>Te=0;window.addEventListener(`pointermove`,Ee,{passive:!0}),document.documentElement.addEventListener(`pointerleave`,De);let K=document.documentElement.dataset.theme===`light`,Oe=new MutationObserver(()=>{K=document.documentElement.dataset.theme===`light`,K||(t.style.clipPath=``),t.style.visibility=``,n&&$(performance.now(),!0)});Oe.observe(document.documentElement,{attributes:!0,attributeFilter:[`data-theme`]});let ke=performance.now(),Ae=ke,q=window.scrollY,je=q,Me=0,Ne=0,J=new r(.35,.15),Y=0,X=new r,Pe=new p,Fe=new p,Ie=new p,Le=new b(1,0,0),Re=new b(0,1,0),ze=new b(0,0,1),Be=new o,Ve=N.uniforms.uInvRot.value,Z=[{t0:-1,dur:1,v:I.uniforms.uM0.value,len:.3},{t0:-1,dur:1,v:I.uniforms.uM1.value,len:.3}],He=2.2,Ue=e=>{let t=Z.find(t=>e-t.t0>t.dur);if(!t)return;let n=W/G,r=Math.random()<.5,i=(r?w(200,235):w(-55,-20))*Math.PI/180,a=r?w(-.1,.95)*n:w(-.95,.1)*n;t.v.set(a,w(.2,.95),i,w(.55,1.1)),t.len=w(.22,.42),t.t0=e,t.dur=w(.75,1.35)},We=0,Ge=0,Ke=0,qe=2.6,Je=e=>{We++,We===1?(k=Math.min(k,1),A=Math.min(A,.36)):We===2?(A=.26,j.stars.setDrawRange(0,Math.floor(j.starCount*.6))):(j.stars.setDrawRange(0,Math.floor(j.starCount*.4)),H.setDrawRange(0,Math.floor(B*.5))),Se(),qe=e+1.2},Ye=!1,Q=0,$=(e,r=!1)=>{let i=(e-Ae)/1e3;Ae=e;let a=Math.min(i,.05),o=(e-ke)/1e3;if(K){let e=xe-window.scrollY;if(e<=0){t.style.visibility=`hidden`;return}t.style.visibility=``,t.style.clipPath=`inset(0 0 ${Math.max(0,G-e)}px 0)`}!r&&o>qe&&i<.25&&(Ge+=i,Ke++,Ke>=90&&(Ge/Ke>.024&&We<3&&Je(o),Ge=0,Ke=0));let s=window.scrollY;q+=(s-q)*(r?1:T(a,7));let c=a>0?(s-je)/a:0;je=s,Me+=(Math.min(Math.abs(c)/G,4)-Me)*T(a,3),Ne+=a*(.32+Me*2.2),J.lerp(we,r?1:T(a,3.2)),Y+=(Te-Y)*T(a,1.6),X.x+=(J.x*.55*Y-X.x)*T(a,1.4),X.y+=(J.y*.32*Y-X.y)*T(a,1.4),F.position.set(X.x,X.y,0);let l=n?0:o,u=q/G*.23;Pe.setFromAxisAngle(Le,u),Fe.setFromAxisAngle(Re,.16*Math.sin(l*.019)+X.x*.02),Ie.setFromAxisAngle(ze,.06*Math.sin(l*.013+1)-.04),L.quaternion.copy(Ie).multiply(Fe).multiply(Pe),Be.makeRotationFromQuaternion(L.quaternion),Ve.setFromMatrix4(Be).transpose(),N.uniforms.uTime.value=l+40,I.uniforms.uTime.value=l+40,R.uniforms.uTime.value=l+10,U.uniforms.uTime.value=l,U.uniforms.uTravel.value=Ne,I.uniforms.uMouse.value.copy(J),I.uniforms.uMouseOn.value=Y;let d=z.uniforms.uDraw.value,f=z.uniforms.uAlpha.value;for(let e=0;e<5;e++){if(n){d[e]=1,f[e]=1;continue}let t=((o+1.5-e*4.3)/22%1+1)%1,r=Math.min(1,t/.24);d[e]=1-(1-r)**3,f[e]=Math.min(1,t/.03)*(1-Math.min(1,Math.max(0,(t-.8)/.15)))}if(!n){o>He&&(Ue(o),He=o+w(2.5,6));let e=I.uniforms.uP.value,t=I.uniforms.uL.value;e.set((o-Z[0].t0)/Z[0].dur,(o-Z[1].t0)/Z[1].dur),Z[0].t0<0&&(e.x=-1),Z[1].t0<0&&(e.y=-1),t.set(Z[0].len,Z[1].len)}S.setRenderTarget(M),S.render(de,fe),S.setRenderTarget(null),S.render(P,F),Ye||(Ye=!0,t.classList.add(`on`),document.documentElement.classList.add(`cosmos-on`))},Xe=e=>{Q=requestAnimationFrame(Xe),$(e)},Ze=()=>{cancelAnimationFrame(Q),!document.hidden&&!n&&(Ae=performance.now(),Q=requestAnimationFrame(Xe))};return document.addEventListener(`visibilitychange`,Ze),Se(),n?($(performance.now(),!0),window.addEventListener(`scroll`,()=>K&&$(performance.now(),!0),{passive:!0})):Q=requestAnimationFrame(Xe),()=>{cancelAnimationFrame(Q),Ce.disconnect(),Oe.disconnect(),document.removeEventListener(`visibilitychange`,Ze),window.removeEventListener(`pointermove`,Ee),document.documentElement.removeEventListener(`pointerleave`,De),document.documentElement.classList.remove(`cosmos-on`),j.stars.dispose(),j.lines.dispose(),H.dispose(),pe.dispose(),[N,I,R,z,U].forEach(e=>e.dispose()),M.dispose(),S.dispose(),S.domElement.remove()}},[]),(0,C.jsx)(`div`,{ref:e,className:`cosmos`,"aria-hidden":!0})}export{de as default};