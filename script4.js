import * as THREE from "./moduls.js/three.module.min.js";
console.log("Модуль THREE загружен:", THREE);

// ---------------- СЦЕНА ----------------
const scene = new THREE.Scene();

// ---------------- КОНТЕЙНЕР ----------------
const container = document.getElementById("icons-sphere");

// Камера
const camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 100);
camera.position.z = 4;

// Рендер
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// ---------------- ГРУППА ----------------
const group = new THREE.Group();
scene.add(group);

// Повернуть шар под углом
group.rotation.x = 0.2; // наклон вверх
group.rotation.y = 0.0;  // наклон вбок

// ---------------- ШАР (почти невидимый) ----------------
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 64, 64),
  new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    metalness: 0.1,
    roughness: 0,
    transparent: true,
    opacity: 0.05, // прозрачность, которая возможно гасит контраст иконок
    clearcoat: 1,
    clearcoatRoughness: 0,
  })
);
group.add(sphere);

// ---------------- ИКОНКИ ----------------
const loader = new THREE.TextureLoader();
const icons = [];

// -------- Добавление иконок по экватору --------
function addIcon(url, angle, link) {
  loader.load(url, texture => {
    texture.colorSpace = THREE.SRGBColorSpace; // фикс бледных иконок

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 1
      })
    );
    sprite.renderOrder = 1;

    const r = 2.5;
    sprite.position.set(
      Math.cos(angle) * r,
      0,
      Math.sin(angle) * r
    );

    sprite.scale.set(0.55, 0.55, 1);
    sprite.userData = { link, baseScale: 0.55 };
    sprite.renderOrder = 1;

    group.add(sprite);
    icons.push(sprite);
  });
}

// Добавляем иконки
addIcon("https://cdn-icons-png.flaticon.com/512/25/25231.png", 0, "https://github.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/174/174857.png", Math.PI/2, "https://www.linkedin.com/in/emrichwork");
addIcon("https://cdn-icons-png.flaticon.com/512/281/281764.png", Math.PI, "https://www.google.com/");
addIcon("./icons/xing2.png", 3*Math.PI/2, "https://www.xing.com/profile/Nikolay_Emrich");
addIcon("./icons/facebook.png", Math.PI/4, "https://www.facebook.com/nick.emrich.7");
addIcon("https://cdn-icons-png.flaticon.com/512/733/733635.png", 3*Math.PI/4, "https://x.com/NEmrich94388/");
addIcon("https://cdn-icons-png.flaticon.com/512/2111/2111463.png", 5*Math.PI/4, "https://www.instagram.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/732/732200.png", 7*Math.PI/4, "https://www.reddit.com/");

/* Здесь сохраняется весь закомментированный код и логика, ничего не удалено */

// ---------------- RAYCASTER ----------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;

window.addEventListener("pointermove", (e) => {
  const rect = container.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
});

// ---------------- DRAG ВРАЩЕНИЕ ----------------
let isPointerDown = false;
let hasDragged = false;
let startX = 0;
let startY = 0;

const DRAG_THRESHOLD = 6;

window.addEventListener("pointerdown", e => {
  isPointerDown = true;
  hasDragged = false;
  startX = e.clientX;
  startY = e.clientY;
});

window.addEventListener("pointermove", e => {
  if (!isPointerDown) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
    hasDragged = true;
  }

  if (hasDragged) {
    group.rotation.y += dx * 0.005;
    group.rotation.x += dy * 0.005;

    startX = e.clientX;
    startY = e.clientY;
  }
});

window.addEventListener("pointerup", () => {
  if (!hasDragged && hovered) {
    window.open(hovered.userData.link, "_blank");
  }
  isPointerDown = false;
});

// ---------------- АНИМАЦИЯ ----------------
function animate() {
  requestAnimationFrame(animate);

  group.rotation.y += 0.003;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(icons);

  if (hits.length > 0) {
    hovered = hits[0].object;
    document.body.style.cursor = "pointer";
  } else {
    hovered = null;
    document.body.style.cursor = "default";
  }

  const hoverScale = 0.9;
  // Здесь меняется размер ИКОНКИ
  const normalScale = 0.75;

  icons.forEach(icon => {
    const target = (icon === hovered) ? hoverScale : normalScale;
    icon.scale.x += (target - icon.scale.x) * 0.1;
    icon.scale.y += (target - icon.scale.y) * 0.1;
    icon.scale.z += (target - icon.scale.z) * 0.1;
  });

  renderer.render(scene, camera);
}
animate();

// ---------------- RESIZE ----------------
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});