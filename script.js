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

function addLimb(group, side, materials) {
  const x = side * 0.58;
  const shoulder = createJoint(0.14, materials.dark);
  shoulder.position.set(x, 1.45, 0);
  group.add(shoulder);

  const upperArm = createCapsule(0.075, 0.58, materials.shell);
  upperArm.position.set(x + side * 0.06, 1.12, 0.02);
  upperArm.rotation.z = side * 0.2;
  group.add(upperArm);

  const forearm = createCapsule(0.07, 0.52, materials.graphite);
  forearm.position.set(x + side * 0.1, 0.74, 0.02);
  forearm.rotation.z = side * 0.1;
  group.add(forearm);

  const hand = createJoint(0.095, materials.dark);
  hand.position.set(x + side * 0.12, 0.42, 0.04);
  group.add(hand);

  const hip = createJoint(0.16, materials.dark);
  hip.position.set(side * 0.28, 0.5, 0);
  group.add(hip);

  const thigh = createCapsule(0.1, 0.66, materials.shell);
  thigh.position.set(side * 0.25, 0.05, 0.02);
  thigh.rotation.z = -side * 0.06;
  group.add(thigh);

  const shin = createCapsule(0.088, 0.68, materials.graphite);
  shin.position.set(side * 0.28, -0.55, 0.02);
  shin.rotation.z = side * 0.08;
  group.add(shin);

  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.44), materials.dark);
  foot.position.set(side * 0.3, -1, 0.08);
  foot.rotation.y = side * 0.04;
  group.add(foot);
}

function createRobot() {
  const group = new THREE.Group();
  const materials = {
    shell: new THREE.MeshStandardMaterial({
      color: 0xe9eef0,
      roughness: 0.46,
      metalness: 0.16,
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

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.34), materials.shell);
  torso.position.y = 1.05;
  torso.scale.set(1, 1, 0.95);
  group.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.38), materials.graphite);
  chest.position.set(0, 1.22, 0.03);
  group.add(chest);

  const waist = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.28, 0.28), materials.dark);
  waist.position.y = 0.48;
  group.add(waist);

  const neck = createCapsule(0.09, 0.12, materials.dark);
  neck.position.y = 1.62;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.34), materials.shell);
  head.position.y = 1.88;
  group.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.08, 0.035), materials.accent);
  visor.position.set(0, 1.9, 0.19);
  group.add(visor);

  addLimb(group, -1, materials);
  addLimb(group, 1, materials);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(0.96, 1.08, 0.04, 72),
    new THREE.MeshStandardMaterial({ color: 0xd8e0e6, roughness: 0.78 })
  );
  platform.position.y = -1.1;
  group.add(platform);

  group.rotation.y = -0.45;
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
  camera.position.set(0, detail ? 0.22 : 0.12, detail ? 6.2 : 5.8);

  const robot = createRobot();
  robot.scale.setScalar(detail ? 1.22 : 1.02);
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
