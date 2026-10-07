import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Procedural crockery: no external models, HDR downloads or per-frame allocations. */
export async function mountChai(host: HTMLElement, paused: () => boolean, ready: () => void, failed: () => void) {
  const mount = host.querySelector('.chai-canvas')!;
  const mobile = matchMedia('(max-width: 760px)').matches;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 40);
  camera.position.set(0, 3.55, 7.8); camera.lookAt(0, 1.1, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture; room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0x665545, .6));
  const key = new THREE.DirectionalLight(0xfff4df, 2.3); key.position.set(-3, 5, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xe5e9f3, .6); fill.position.set(4, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffd6a3, 1.2); rim.position.set(2, 4, -3); scene.add(rim);
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf1eee8, roughness: .22, metalness: 0, clearcoat: .35, clearcoatRoughness: .2, envMapIntensity: .5 });
  const teaMaterial = new THREE.MeshPhysicalMaterial({ color: 0x8f512a, roughness: .18, metalness: 0, clearcoat: .7, clearcoatRoughness: .12, envMapIntensity: .7 });
  const lathe = (profile: number[][], material: THREE.Material) => new THREE.Mesh(new THREE.LatheGeometry(profile.map(([x,y]) => new THREE.Vector2(x,y)), mobile ? 64 : 96), material);
  const saucer = lathe([[0,.04],[.65,.04],[.8,.045],[1.2,.07],[1.55,.14],[1.75,.23],[1.8,.25],[1.82,.28],[1.8,.31],[1.75,.32],[1.53,.25],[1.18,.17],[.77,.13],[.64,.14],[0,.14]], ceramic);
  scene.add(saucer);
  const cup = new THREE.Group(); scene.add(cup);
  // A single closed cross-section models the foot, rounded bowl, rim thickness and inner wall.
  const bowl = lathe([[0,.15],[.47,.15],[.5,.18],[.51,.23],[.56,.26],[.65,.31],[.77,.44],[.88,.63],[.97,.88],[1.02,1.14],[1.04,1.4],[1.045,1.5],[1.038,1.535],[1.015,1.55],[.985,1.535],[.975,1.5],[.974,1.4],[.95,1.14],[.9,.9],[.82,.67],[.71,.49],[.57,.37],[.4,.33],[0,.33]], ceramic);
  cup.add(bowl);
  const handleCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(.97,1.3,0),new THREE.Vector3(1.43,1.35,0),new THREE.Vector3(1.57,1.09,0),new THREE.Vector3(1.43,.68,0),new THREE.Vector3(.82,.58,0)]);
  cup.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 48, .095, 12, false),ceramic));
  const teaGeometry = new THREE.CircleGeometry(.967, mobile ? 64 : 96, 0, Math.PI * 2);
  teaGeometry.rotateX(-Math.PI/2);
  const tea = new THREE.Mesh(teaGeometry, teaMaterial); tea.position.y = 1.405; cup.add(tea);
  const positions = teaGeometry.attributes.position;
  const original = Float32Array.from(positions.array);
  const rippleMat = new THREE.MeshPhysicalMaterial({color:0xc89968, roughness:.2, transparent:true, opacity:0, depthWrite:false});
  const ripples = [0,1].map(() => {const m=new THREE.Mesh(new THREE.TorusGeometry(1,.006,6,80),rippleMat.clone());m.rotation.x=-Math.PI/2;m.position.y=1.411;cup.add(m);return m;});
  const drop = new THREE.Mesh(new THREE.SphereGeometry(.055,16,20),teaMaterial);drop.scale.set(.85,1.7,.85);cup.add(drop);
  const splash = new THREE.Mesh(new THREE.SphereGeometry(.06,16,12),teaMaterial);cup.add(splash);
  // Authentic logo artwork, proportion-preserving pigment print on a curved ceramic surface.
  let logo: THREE.Texture;
  try { logo = await new THREE.TextureLoader().loadAsync('/assets/shams/brand/cup-print.png'); }
  catch { renderer.dispose(); environment.dispose(); renderer.domElement.remove(); throw new Error('Cup logo unavailable'); }
  logo.colorSpace = THREE.SRGBColorSpace;
  const decalGeometry = new THREE.PlaneGeometry(.68,.816,32,16);
  const dp=decalGeometry.attributes.position;
  for(let i=0;i<dp.count;i++) {const x=dp.getX(i),y=dp.getY(i)+.89;const profile=[[.44,.77],[.63,.88],[.88,.97],[1.14,1.02],[1.4,1.04]];const upper=profile.findIndex(p=>p[0]>=y);const a=profile[Math.max(0,upper-1)],b=profile[Math.max(1,upper)];const radius=a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]);dp.setXYZ(i,x,y,Math.sqrt(radius*radius-x*x)+.009);}
  decalGeometry.computeVertexNormals();
  cup.add(new THREE.Mesh(decalGeometry,new THREE.MeshBasicMaterial({map:logo,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,toneMapped:false})));
  // Soft contact shadows are static translucent radial textures, not expensive shadow maps.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d')!;const gradient=ctx.createRadialGradient(64,64,2,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.48)');gradient.addColorStop(.5,'rgba(0,0,0,.24)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
  const floorShadow=new THREE.Mesh(new THREE.PlaneGeometry(4.6,3.6),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));floorShadow.rotation.x=-Math.PI/2;floorShadow.position.y=.01;scene.add(floorShadow);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.7),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity:.4,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.151;scene.add(contact);
  const steamMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{phase:{value:0},offset:{value:0}},vertexShader:`varying vec2 vUv; uniform float phase; uniform float offset;
    void main(){vUv=uv;vec3 p=position;p.x+=sin(uv.y*7.0+phase+offset)*.065*uv.y;p.z+=sin(uv.y*5.0+phase+offset)*.05;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv;uniform float phase;uniform float offset;
    void main(){float center=.5+sin(vUv.y*9.0-phase+offset)*.13;float w=.07+vUv.y*.09;float ribbon=exp(-pow((vUv.x-center)/w,2.0));float fade=sin(vUv.y*3.14159);float drift=.65+.35*sin(phase+vUv.y*8.0+offset);gl_FragColor=vec4(.94,.9,.84,ribbon*fade*drift*.15);}`});
  const steam=[-.35,0,.32].map((x,i)=>{const material=steamMaterial.clone();material.uniforms.offset.value=i*2;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.45,1.5,12,28),material);mesh.position.set(x,2.16,-.12+i*.12);cup.add(mesh);return mesh;});
  steamMaterial.dispose();
  let time=3.5, last=0, frame=0, disposed=false, visible=true, lost=false, px=0,py=0,rx=0,ry=0;
  const pointer=(event:PointerEvent)=>{if(event.pointerType!=='mouse'||mobile||paused())return;const r=host.getBoundingClientRect();px=((event.clientX-r.left)/r.width-.5)*.09;py=((event.clientY-r.top)/r.height-.5)*.045;};
  const leave=()=>{px=0;py=0;};
  const resize=()=>{const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(r.height,1);camera.position.z=camera.aspect<.9?9.2:7.8;camera.updateProjectionMatrix();};
  function draw(now:number) {
    frame=0;if(disposed||lost)return;
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!paused())time+=dt;
    const t=time%5.5; const impact=1.5;const age=t-impact;
    const lift=t<impact?.19*(.5+.5*Math.cos(Math.PI*t/impact)):t>4.4?.19*(.5-.5*Math.cos(Math.PI*(t-4.4)/1.1)):0;
    rx+=(px-rx)*(1-Math.exp(-dt*5));ry+=(py-ry)*(1-Math.exp(-dt*5));
    cup.position.y=lift;cup.rotation.y=rx+.055*Math.sin(t/5.5*Math.PI*2);cup.rotation.z=ry+(age>0?.016*Math.sin(age*9)*Math.exp(-age*3):0);
    drop.visible=t>.5&&t<impact;drop.position.set(0,1.46+2.3*(1-Math.pow(Math.max(0,(t-.5)),2)),0);
    splash.visible=age>0&&age<.32;splash.position.set(0,1.43+Math.sin(Math.max(0,age)/.32*Math.PI)*.16,0);splash.scale.set(.8,1.4,.8);
    const amplitude=age>0?.013*Math.exp(-age*3):0;
    for(let i=0;i<positions.count;i++){const x=original[i*3],z=original[i*3+2];const r=Math.sqrt(x*x+z*z);positions.setY(i,amplitude*Math.sin(r*25-age*12)*(1-r));}
    positions.needsUpdate=true;if(amplitude>.0001)teaGeometry.computeVertexNormals();
    ripples.forEach((m,i)=>{const a=age-i*.17;const show=a>0&&a<.9;const r=Math.min(.92,.06+Math.max(0,a)*.9);m.scale.setScalar(r);(m.material as THREE.MeshPhysicalMaterial).opacity=show?.24*Math.pow(1-a/.9,2):0;});
    steam.forEach(m=>{(m.material as THREE.ShaderMaterial).uniforms.phase.value=time/5.5*Math.PI*2;});
    key.intensity=2.3+.15*Math.sin(time/5.5*Math.PI*2);contact.material.opacity=.4-lift*.8;
    renderer.render(scene,camera);
    host.dataset.chaiTime=t.toFixed(2);
    if(visible&&!document.hidden&&!paused())frame=requestAnimationFrame(draw);
  }
  const wake=()=>{last=0;if(!frame&&!disposed&&!lost&&visible&&!document.hidden)frame=requestAnimationFrame(draw);};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else wake();});observer.observe(host);
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
  const onLost=(event:Event)=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;failed();};
  const onRestored=()=>{lost=false;resize();wake();ready();};
  const resizer=new ResizeObserver(()=>{resize();wake();});resizer.observe(host);
  host.addEventListener('pointermove',pointer);host.addEventListener('pointerleave',leave);host.addEventListener('chai:motion',wake);
  document.addEventListener('visibilitychange',onVisibility);renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);
  resize();draw(0);ready();
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);host.removeEventListener('chai:motion',wake);document.removeEventListener('visibilitychange',onVisibility);renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(m=>m.dispose());}});logo.dispose();shadowTexture.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();};
}
