import * as THREE from "three";
import URDFLoader from "https://cdn.jsdelivr.net/npm/urdf-loader@0.12.6/src/URDFLoader.js";

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

const urdfPath = "assets/unitree-g1/g1_29dof_rev_1_0.urdf";

function makeMaterial(name, color, metalness, roughness) {
  return new THREE.MeshStandardMaterial({
    name,
    color,
    metalness,
    roughness,
    envMapIntensity: 0.72,
  });
}

const g1Materials = {
  shell: makeMaterial("unitree pearl shell", 0xd7dbe1, 0.52, 0.28),
  dark: makeMaterial("unitree black rubber", 0x05070a, 0.18, 0.44),
  visor: makeMaterial("unitree blue visor", 0x00a7ff, 0.25, 0.18),
};

function colorizeOfficialModel(robot) {
  robot.traverse((part) => {
    if (!part.isMesh) return;

    part.castShadow = true;
    part.receiveShadow = true;

    const name = part.name.toLowerCase();
    const parentName = part.parent?.name?.toLowerCase() || "";
    const combined = `${name} ${parentName}`;

    if (combined.includes("head")) {
      part.material = g1Materials.dark;
      return;
    }

    if (
      combined.includes("hand") ||
      combined.includes("rubber") ||
      combined.includes("ankle_roll") ||
      combined.includes("pelvis") ||
      combined.includes("logo")
    ) {
      part.material = g1Materials.dark;
      return;
    }

    part.material = g1Materials.shell;
  });
}

function prepareRobot(robot, detail) {
  colorizeOfficialModel(robot);

  robot.rotation.x = -Math.PI / 2;
  robot.rotation.z = detail ? -0.02 : 0.02;

  robot.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(robot);
  const size = box.getSize(new THREE.Vector3());
  const targetSpan = detail ? 3.2 : 2.7;
  const scale = targetSpan / Math.max(size.x, size.y, size.z, 0.001);
  robot.scale.setScalar(scale);

  robot.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(robot);
  const center = scaledBox.getCenter(new THREE.Vector3());
  robot.position.sub(center);
  robot.position.y -= detail ? 0.1 : 0.04;

  return robot;
}

function createLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8d98a0, 2.8));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(3.5, 4.5, 5.5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9fd6ff, 1.4);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);
}

function createStage(scene) {
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.52, 0.04, 96),
    new THREE.MeshStandardMaterial({ color: 0xf2f7f8, roughness: 0.76 })
  );
  platform.position.y = -1.84;
  platform.receiveShadow = true;
  scene.add(platform);
}

function mountRobot(canvas, { detail = false } = {}) {
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  createLights(scene);
  createStage(scene);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, detail ? 0.3 : 0.18, detail ? 8.4 : 7.5);

  const root = new THREE.Group();
  root.rotation.y = -Math.PI / 2;
  scene.add(root);

  let loadedRobot = null;
  let finalized = false;
  const manager = new THREE.LoadingManager();
  const finalizeRobot = () => {
    if (!loadedRobot || finalized) return;
    finalized = true;
    prepareRobot(loadedRobot, detail);
  };
  manager.onLoad = finalizeRobot;

  const loader = new URDFLoader(manager);
  loader.load(
    urdfPath,
    (robot) => {
      loadedRobot = robot;
      robot.rotation.x = -Math.PI / 2;
      robot.rotation.z = detail ? -0.02 : 0.02;
      root.add(robot);
      window.setTimeout(finalizeRobot, 250);
    },
    undefined,
    (error) => {
      console.error("Unable to load Unitree G1 URDF", error);
    }
  );

  let isDragging = false;
  let lastX = 0;
  let velocity = 0.0012;

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
    root.rotation.y += delta * 0.01;
    velocity = delta * 0.00065;
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
      root.rotation.y += velocity;
      velocity *= 0.985;
      if (Math.abs(velocity) < 0.0008) velocity = 0.0008;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  window.addEventListener("resize", resize);
}

mountRobot(document.querySelector("#robot-canvas"));
mountRobot(document.querySelector("#robot-detail-canvas"), { detail: true });
