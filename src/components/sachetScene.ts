import * as THREE from 'three';

// Coordinates are in the original 505 x 1080 photograph. UVs select its exact
// pixels; no replacement artwork, color edits, or generated texture is used.
function pouchGeometry() {
  const columns = 48, rows = 96;
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let row = 0; row <= rows; row++) {
    const v = row / rows;
    for (let col = 0; col <= columns; col++) {
      const u = col / columns, edge = Math.abs(2 * u - 1);
      const left = 12 + 20 * v + 22 * Math.pow(v, 28);
      const right = 493 - 28 * v;
      const px = left + (right - left) * u;
      const top = 84 + 28 * Math.pow(edge, 18);
      const bottom = 1022 - 30 * edge * edge;
      const py = top + (bottom - top) * v;
      // Softly filled laminate tapers into thin side and bottom seals.
      const shoulder = THREE.MathUtils.smoothstep(v, .10, .26);
      const bottomSeal = 1 - THREE.MathUtils.smoothstep(v, .87, 1);
      const fold = Math.sin(u * Math.PI * 9 + v * 14) * .008 * Math.pow(edge, 3) * Math.sin(Math.PI * v);
      const zipper = Math.exp(-Math.pow((v - .125) / .009, 2)) * .013;
      const z = .009 + .26 * Math.pow(Math.sin(Math.PI * u), .72) * shoulder * bottomSeal + fold + zipper;
      positions.push((px - 252.5) / 250, (553 - py) / 250, z);
      uvs.push(px / 505, 1 - py / 1080);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col, b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const front = new THREE.BufferGeometry();
  front.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  front.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  front.setIndex(indices); front.computeVertexNormals();
  const back = front.clone();
  const backPositions = back.getAttribute('position');
  for (let i = 0; i < backPositions.count; i++) backPositions.setZ(i, -backPositions.getZ(i));
  const reversed = indices.slice();
  for (let i = 0; i < reversed.length; i += 3) [reversed[i], reversed[i + 2]] = [reversed[i + 2], reversed[i]];
  back.setIndex(reversed); back.computeVertexNormals();
  const perimeter: number[] = [];
  for (let c = 0; c <= columns; c++) perimeter.push(c);
  for (let r = 1; r <= rows; r++) perimeter.push(r * (columns + 1) + columns);
  for (let c = columns - 1; c >= 0; c--) perimeter.push(rows * (columns + 1) + c);
  for (let r = rows - 1; r > 0; r--) perimeter.push(r * (columns + 1));
  const sides: number[] = [];
  for (let i = 0; i < perimeter.length; i++) {
    const a = perimeter[i] * 3, b = perimeter[(i + 1) % perimeter.length] * 3;
    const fa = positions.slice(a, a + 3), fb = positions.slice(b, b + 3);
    const ba = [fa[0], fa[1], -fa[2]], bb = [fb[0], fb[1], -fb[2]];
    sides.push(...fa, ...fb, ...ba, ...fb, ...bb, ...ba);
  }
  const edge = new THREE.BufferGeometry();
  edge.setAttribute('position', new THREE.Float32BufferAttribute(sides, 3));
  edge.computeVertexNormals();
  return { front, back, edge };
}

export async function mountSachet(host: HTMLElement, asset: string, backAsset: string, onReady: () => void, onFailure: () => void, isPaused: () => boolean = () => false, wantsMotion: () => boolean = () => true) {
  const target = host.querySelector<HTMLElement>('.sachet-canvas')!;
  const interactionSurface = host.closest<HTMLElement>('.hero-product') ?? host;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch { onFailure(); return () => {}; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  let texture: THREE.Texture;
  let backTexture: THREE.Texture;
  try { texture = await new THREE.TextureLoader().loadAsync(asset); }
  catch { renderer.dispose(); onFailure(); return () => {}; }
  if (!host.isConnected) { texture.dispose(); renderer.dispose(); return () => {}; }
  try { backTexture = await new THREE.TextureLoader().loadAsync(backAsset); }
  catch { texture.dispose(); renderer.dispose(); onFailure(); return () => {}; }
  if (!host.isConnected) { texture.dispose(); backTexture.dispose(); renderer.dispose(); return () => {}; }
  backTexture.colorSpace = THREE.SRGBColorSpace;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 2.3, -2.3, .1, 30);
  camera.position.set(0, 0, 9);
  const packet = new THREE.Group();
  const geometry = pouchGeometry();
  const frontMaterial = new THREE.MeshPhysicalMaterial({ map: texture,
    roughness: .4, metalness: .08, clearcoat: .16, clearcoatRoughness: .42,
    // A small contribution from the photograph keeps its dark printed artwork faithful.
    emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: .2 });
  // Reverse horizontal UVs so the back artwork reads correctly after rotation.
  const rearUV = geometry.back.getAttribute('uv');
  for (let i = 0; i < rearUV.count; i++) rearUV.setX(i, 1 - rearUV.getX(i));
  const rearMaterial = new THREE.MeshPhysicalMaterial({ map: backTexture,
    roughness: .4, metalness: .08, clearcoat: .16,
    emissiveMap: backTexture, emissive: 0xffffff, emissiveIntensity: .2 });
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#141413', roughness: .44, side: THREE.DoubleSide });
  packet.add(new THREE.Mesh(geometry.front, frontMaterial), new THREE.Mesh(geometry.back, rearMaterial), new THREE.Mesh(geometry.edge, edgeMaterial));
  scene.add(packet);
  scene.add(new THREE.HemisphereLight(0xfff8ee, 0x494136, 1.6));
  const key = new THREE.DirectionalLight(0xfff6e7, 1.5); key.position.set(-3, 4, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, .55); fill.position.set(4, 1, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe0b2, 1.3); rim.position.set(2, 3, -3); scene.add(rim);
  const shine = new THREE.PointLight(0xfff7ea, 14, 20, 2); shine.position.set(-2, 1, 4); scene.add(shine);
  target.appendChild(renderer.domElement);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');
  const pointer = new THREE.Vector2(), smooth = new THREE.Vector2();
  const shadow = host.querySelector<HTMLElement>('.sachet-contact-shadow')!;
  let rotation = 0, turnTime = 0, autoRotation = 0, interactionDelay = 0, dragId: number | null = null, dragX = 0, lastScrollY = window.scrollY;
  let frame = 0, elapsed = 0, last = 0, visible = true, disposed = false, failed = false;
  const render = (now: number) => {
    frame = 0;
    if (disposed || failed || !visible || document.hidden) return;
    if (wantsMotion() && last && now - last < 1000 / 60) {
      frame = requestAnimationFrame(render);
      return;
    }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now;
    if (wantsMotion() && !isPaused()) elapsed += dt;
    interactionDelay = Math.max(0, interactionDelay - dt);
    if (wantsMotion() && !isPaused() && dragId === null && interactionDelay === 0) {
      turnTime += dt;
      // Hold the artwork, then ease through a complete turn.
      const progress = THREE.MathUtils.clamp((turnTime % 16 - 6) / 10, 0, 1);
      const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      autoRotation = (Math.floor(turnTime / 16) + eased) * Math.PI * 2;
    }
    const intensity = coarse.matches ? .4 : 1;
    if (!isPaused()) smooth.lerp(wantsMotion() ? pointer : new THREE.Vector2(), 1 - Math.exp(-dt * 4));
    const still = !wantsMotion();
    const idle = still ? 0 : elapsed;
    const enter = still ? 1 : 1 - Math.pow(1 - Math.min(elapsed / 1.2, 1), 3);
    packet.rotation.set(
      THREE.MathUtils.degToRad(still ? 2 : (2 * Math.cos(idle * .26) + smooth.y * 3) * intensity),
      rotation + (still ? 0 : autoRotation) + THREE.MathUtils.degToRad(-10 + smooth.x * 7 * intensity - (1 - enter) * 28),
      THREE.MathUtils.degToRad(still ? -4 : -4 + Math.sin(idle * .52) * 2));
    packet.position.y = (still ? 0 : Math.sin(idle * .9) * .09) - (1 - enter) * .24;
    const packetScale = .94 + .06 * enter;
    packet.scale.set(packetScale * 1.08, packetScale, packetScale);
    shine.position.x = -2 + smooth.x * 3;
    shine.position.y = 1 + smooth.y * 1.5;
    shadow.style.transform = `scaleX(${.7 + .25 * Math.abs(Math.cos(packet.rotation.y)) - packet.position.y * .5})`;
    shadow.style.opacity = String(.4 - packet.position.y * .7);
    renderer.render(scene, camera);
    if (wantsMotion()) frame = requestAnimationFrame(render);
  };
  const schedule = () => { if (!frame && !disposed && !failed && visible && !document.hidden) frame = requestAnimationFrame(render); };
  const resize = () => {
    const { width, height } = target.getBoundingClientRect();
    if (!width || !height) return;
    const vertical = Math.max(4.6, 2.5 * height / width);
    camera.top = vertical / 2; camera.bottom = -vertical / 2;
    camera.right = vertical * width / height / 2; camera.left = -camera.right;
    camera.updateProjectionMatrix(); renderer.setSize(width, height); schedule();
  };
  const move = (event: PointerEvent) => {
    if (!wantsMotion() || coarse.matches || event.pointerType === 'touch') return;
    const rect = interactionSurface.getBoundingClientRect();
    pointer.set(THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1),
      THREE.MathUtils.clamp(1 - (event.clientY - rect.top) / rect.height * 2, -1, 1));
  };
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || (event.target instanceof Element && event.target.closest('button'))) return;
    rotation += autoRotation; autoRotation = 0; turnTime = 0; interactionDelay = 5;
    dragId = event.pointerId; dragX = event.clientX;
    host.setPointerCapture(event.pointerId);
    host.focus({ preventScroll: true });
  };
  const drag = (event: PointerEvent) => {
    if (event.pointerId !== dragId) return;
    rotation += (event.clientX - dragX) / Math.max(host.clientWidth, 1) * Math.PI * 2;
    dragX = event.clientX; interactionDelay = 5; schedule();
  };
  const up = (event: PointerEvent) => {
    if (event.pointerId !== dragId) return;
    dragId = null;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  };
  const keydown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
    event.preventDefault();
    rotation += autoRotation; autoRotation = 0; turnTime = 0; interactionDelay = 5;
    rotation = event.key === 'Home' ? 0 : rotation + (event.key === 'ArrowRight' ? 1 : -1) * Math.PI / 6;
    schedule();
  };
  host.addEventListener('pointerdown', down);
  host.addEventListener('pointermove', drag);
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', up);
  host.addEventListener('lostpointercapture', up);
  host.addEventListener('keydown', keydown);
  const leave = () => pointer.set(0, 0);
  const scroll = () => {
    const scrollDelta = THREE.MathUtils.clamp(window.scrollY - lastScrollY, -120, 120);
    lastScrollY = window.scrollY;
    if (wantsMotion() && !isPaused() && dragId === null) rotation += scrollDelta * .002;
    schedule();
  };
  const visibility = () => { cancelAnimationFrame(frame); frame = 0; last = 0; schedule(); };
  const motionChange = () => { pointer.set(0, 0); smooth.set(0, 0); visibility(); };
  const contextLost = (event: Event) => { event.preventDefault(); failed = true; cancelAnimationFrame(frame); frame = 0; onFailure(); };
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visibility(); });
  const resizeObserver = new ResizeObserver(resize);
  observer.observe(host); resizeObserver.observe(target);
  interactionSurface.addEventListener('pointermove', move, { passive: true });
  interactionSurface.addEventListener('pointerleave', leave);
  window.addEventListener('scroll', scroll, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', motionChange);
  host.addEventListener('shams:motion', motionChange);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  resize();
  renderer.render(scene, camera);
  onReady();
  return () => {
    disposed = true; cancelAnimationFrame(frame);
    host.removeEventListener('pointerdown', down);
    host.removeEventListener('pointermove', drag);
    host.removeEventListener('pointerup', up);
    host.removeEventListener('pointercancel', up);
    host.removeEventListener('lostpointercapture', up);
    host.removeEventListener('keydown', keydown);
    observer.disconnect(); resizeObserver.disconnect();
    interactionSurface.removeEventListener('pointermove', move); interactionSurface.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', scroll);
    document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', motionChange);
    host.removeEventListener('shams:motion', motionChange);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    Object.values(geometry).forEach(item => item.dispose());
    texture.dispose(); backTexture.dispose(); edgeMaterial.dispose(); frontMaterial.dispose(); rearMaterial.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
}
