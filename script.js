import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const robotDialog = document.querySelector("#robot-dialog");
const openRobot = document.querySelector("[data-open-robot]");
const closeRobot = document.querySelector("[data-close-robot]");
let robotWasDragged = false;

openRobot?.addEventListener("click", (event) => {
  if (robotWasDragged) {
    event.preventDefault();
    robotWasDragged = false;
    return;
  }
  robotDialog?.showModal();
  window.dispatchEvent(new Event("resize"));
});

closeRobot?.addEventListener("click", () => {
  robotDialog?.close();
});

robotDialog?.addEventListener("click", (event) => {
  if (event.target === robotDialog) {
    robotDialog.close();
  }
});

function createCapsule(radius, depth, material) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(radius, depth, 16, 28), material);
}

function createJoint(radius, material) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), material);
}

function createEllipsoid(radius, scale, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 36, 24), material);
  mesh.scale.set(scale.x, scale.y, scale.z);
  return mesh;
}

function createBand(radius, tube, material) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 18, 56), material);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function addLimb(group, side, materials) {
  const shoulder = createEllipsoid(0.18, { x: 1.18, y: 1, z: 0.88 }, materials.shell);
  shoulder.position.set(side * 0.54, 1.35, 0.02);
  group.add(shoulder);

  const shoulderTrim = createBand(0.17, 0.018, materials.dark);
  shoulderTrim.position.set(side * 0.54, 1.31, 0.02);
  shoulderTrim.scale.set(1.08, 0.64, 1);
  group.add(shoulderTrim);

  const upperArm = createCapsule(0.112, 0.48, materials.shell);
  upperArm.position.set(side * 0.66, 0.94, 0.02);
  upperArm.rotation.z = side * 0.16;
  group.add(upperArm);

  const elbow = createBand(0.13, 0.026, materials.dark);
  elbow.position.set(side * 0.72, 0.58, 0.02);
  elbow.scale.set(0.8, 0.8, 1);
  group.add(elbow);

  const forearm = createCapsule(0.102, 0.44, materials.silver);
  forearm.position.set(side * 0.78, 0.24, 0.03);
  forearm.rotation.z = side * 0.11;
  group.add(forearm);

  const wrist = createBand(0.1, 0.022, materials.dark);
  wrist.position.set(side * 0.81, -0.05, 0.03);
  wrist.scale.set(0.78, 0.78, 1);
  group.add(wrist);

  const hand = createCapsule(0.078, 0.16, materials.dark);
  hand.position.set(side * 0.85, -0.24, 0.07);
  hand.rotation.z = side * 0.22;
  group.add(hand);

  const hip = createEllipsoid(0.15, { x: 1, y: 0.82, z: 0.85 }, materials.dark);
  hip.position.set(side * 0.24, -0.1, 0);
  group.add(hip);

  const thigh = createCapsule(0.16, 0.64, materials.silver);
  thigh.position.set(side * 0.29, -0.58, 0.03);
  thigh.rotation.z = -side * 0.05;
  group.add(thigh);

  const knee = createBand(0.14, 0.026, materials.dark);
  knee.position.set(side * 0.32, -1.03, 0.03);
  knee.scale.set(0.74, 0.74, 1);
  group.add(knee);

  const shin = createCapsule(0.13, 0.62, materials.shell);
  shin.position.set(side * 0.32, -1.44, 0.02);
  shin.rotation.z = side * 0.04;
  group.add(shin);

  const ankle = createJoint(0.075, materials.dark);
  ankle.position.set(side * 0.33, -1.82, 0.02);
  group.add(ankle);

  const foot = createEllipsoid(0.18, { x: 0.82, y: 0.34, z: 1.45 }, materials.dark);
  foot.position.set(side * 0.35, -1.98, 0.17);
  foot.rotation.y = side * 0.08;
  group.add(foot);
}

function createRobot() {
  const group = new THREE.Group();
  const materials = {
    shell: new THREE.MeshStandardMaterial({
      color: 0xf2f4f6,
      roughness: 0.34,
      metalness: 0.2,
    }),
    silver: new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      roughness: 0.3,
      metalness: 0.34,
    }),
    graphite: new THREE.MeshStandardMaterial({
      color: 0x252b31,
      roughness: 0.5,
      metalness: 0.22,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x111820,
      roughness: 0.4,
      metalness: 0.28,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: 0x0f7b6c,
      roughness: 0.36,
      metalness: 0.2,
    }),
  };

  const torso = createEllipsoid(0.54, { x: 1.04, y: 1.16, z: 0.48 }, materials.shell);
  torso.position.y = 0.9;
  group.add(torso);

  const frontPlate = createEllipsoid(0.36, { x: 1.25, y: 0.72, z: 0.14 }, materials.shell);
  frontPlate.position.set(0, 0.96, 0.31);
  group.add(frontPlate);

  const chestHighlight = createEllipsoid(0.18, { x: 1.35, y: 0.18, z: 0.18 }, materials.silver);
  chestHighlight.position.set(0, 1.22, 0.31);
  chestHighlight.rotation.x = -0.08;
  group.add(chestHighlight);

  const chestLogo = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.075, 3), materials.accent);
  chestLogo.position.set(0, 1.24, 0.39);
  chestLogo.rotation.z = Math.PI;
  chestLogo.rotation.x = Math.PI / 2;
  group.add(chestLogo);

  const sidePack = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.24), materials.graphite);
  sidePack.position.set(0.46, 0.78, 0.03);
  sidePack.rotation.z = -0.02;
  group.add(sidePack);

  const waistCore = createCapsule(0.18, 0.18, materials.dark);
  waistCore.position.y = 0.13;
  waistCore.rotation.z = Math.PI / 2;
  group.add(waistCore);

  const waistRing = createBand(0.25, 0.025, materials.silver);
  waistRing.position.y = 0.12;
  waistRing.scale.set(1, 0.62, 1);
  group.add(waistRing);

  const pelvis = createEllipsoid(0.34, { x: 1.02, y: 0.62, z: 0.7 }, materials.shell);
  pelvis.position.y = -0.22;
  group.add(pelvis);

  const neck = createCapsule(0.11, 0.28, materials.dark);
  neck.position.y = 1.62;
  neck.rotation.x = 0.04;
  group.add(neck);

  const headRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.06, 24, 72), materials.shell);
  headRing.position.set(0, 1.98, 0.03);
  headRing.scale.set(0.78, 1.18, 0.7);
  group.add(headRing);

  const facePlate = createEllipsoid(0.22, { x: 0.86, y: 0.44, z: 0.16 }, materials.dark);
  facePlate.position.set(0, 2, 0.18);
  group.add(facePlate);

  const visor = createCapsule(0.034, 0.26, materials.accent);
  visor.position.set(0, 2.05, 0.31);
  visor.rotation.z = Math.PI / 2;
  group.add(visor);

  const chinSensor = createJoint(0.035, materials.silver);
  chinSensor.position.set(0, 1.91, 0.31);
  group.add(chinSensor);

  addLimb(group, -1, materials);
  addLimb(group, 1, materials);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(0.96, 1.08, 0.04, 72),
    new THREE.MeshStandardMaterial({ color: 0xd8e0e6, roughness: 0.78 })
  );
  platform.position.y = -2.12;
  group.add(platform);

  group.rotation.y = 0.06;
  return group;
}

function mountRobot(canvas, { detail = false } = {}) {
  if (!canvas) return null;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, detail ? -0.02 : -0.06, detail ? 7.6 : 7.25);

  const robot = createRobot();
  robot.scale.setScalar(detail ? 1.08 : 0.94);
  scene.add(robot);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xaeb9bd, 2.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2.4, 3.2, 4.2);
  scene.add(keyLight);

  let isDragging = false;
  let lastX = 0;
  let velocity = 0.006;

  canvas.addEventListener("pointerdown", (event) => {
    isDragging = true;
    lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - lastX;
    lastX = event.clientX;
    if (Math.abs(delta) > 2) {
      robotWasDragged = true;
    }
    robot.rotation.y += delta * 0.01;
    velocity = delta * 0.0008;
  });

  canvas.addEventListener("pointerup", () => {
    isDragging = false;
  });

  function resize() {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    resize();
    if (!isDragging) {
      robot.rotation.y += velocity;
      velocity *= 0.985;
      if (Math.abs(velocity) < 0.003) velocity = 0.003;
    }
    robot.rotation.x = Math.sin(Date.now() * 0.0012) * 0.025;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  window.addEventListener("resize", resize);
  return { resize };
}

mountRobot(document.querySelector("#robot-canvas"));
mountRobot(document.querySelector("#robot-detail-canvas"), { detail: true });
