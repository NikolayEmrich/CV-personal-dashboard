import * as THREE from "./moduls.js/three.module.min.js";
console.log("Модуль THREE загружен:", THREE);

// ---------------- СЦЕНА ----------------
const scene = new THREE.Scene();

// Камера
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.z = 4;

// Рендер
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ---------------- ГРУППА ----------------
const group = new THREE.Group();
scene.add(group);

// Повернуть шар под углом
group.rotation.x = 0.35; // наклон вверх
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

//  -------- Добавление инонок по экватору !!!  -------- 

function addIcon(url, angle, link) {
  loader.load(url, texture => {

    // Это фиксит бледные иконки при работе с Three.js
    texture.colorSpace = THREE.SRGBColorSpace;

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,     // насыщенный цвет
        depthTest: false,    // чтобы не “разбавлялись” шаром
        depthWrite: false,   // важное дополнение для прозрачных объектов
        transparent: true,
        opacity: 1
      })
    );
    sprite.renderOrder = 1;

    const r = 1.7;
    sprite.position.set(
      Math.cos(angle) * r,
      0,
      Math.sin(angle) * r
    );

    sprite.scale.set(0.55, 0.55, 1);
    sprite.userData = { link, baseScale: 0.55 };
    sprite.renderOrder = 1;  // обязательно после шара

    group.add(sprite);
    icons.push(sprite);
  });
}

// Добавляем четыре иконки по эквартору
addIcon("https://cdn-icons-png.flaticon.com/512/25/25231.png", 0, "https://github.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/174/174857.png", Math.PI/2, "https://linkedin.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/281/281764.png", Math.PI, "https://www.google.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/1384/1384060.png", 3*Math.PI/2, "https://www.youtube.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/2111/2111463.png", Math.PI/4, "https://www.facebook.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/733/733635.png", 3*Math.PI/4, "https://www.twitter.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/2111/2111425.png", 5*Math.PI/4, "https://www.instagram.com/");
addIcon("https://cdn-icons-png.flaticon.com/512/732/732200.png", 7*Math.PI/4, "https://www.reddit.com/");

// -------- Добавление инонок по СФЕРЕ ДЛЯ ТЕЛЕФОНА!!!  -------- 

/*const iconsData = [
  { url: "https://cdn-icons-png.flaticon.com/512/25/25231.png", link: "https://github.com/" },
  { url: "https://cdn-icons-png.flaticon.com/512/174/174857.png", link: "https://linkedin.com/" },
  { url: "https://cdn-icons-png.flaticon.com/512/281/281764.png", link: "https://www.google.com/" },
  { url: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png", link: "https://www.youtube.com/" },
  { url: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png", link: "https://www.facebook.com/" },
  { url: "https://cdn-icons-png.flaticon.com/512/733/733635.png", link: "https://www.twitter.com/" },
  { url: "https://cdn-icons-png.flaticon.com/512/2111/2111425.png", link: "https://www.instagram.com/" },
  { url: "https://cdn-icons-png.flaticon.com/512/732/732200.png", link: "https://www.reddit.com/" }
];

const r = 1.2;
const N = iconsData.length;

for (let i = 0; i < N; i++) {
  const phi = Math.acos(1 - 2*(i + 0.5)/N);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);

  addIconAtPosition(iconsData[i].url, x, y, z, iconsData[i].link);
}

function addIconAtPosition(url, x, y, z, link) {
  loader.load(url, texture => {
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
    sprite.position.set(x, y, z);
    sprite.scale.set(0.1, 0.1, 1);
    sprite.userData = { link, baseScale: 0.1 };
    sprite.renderOrder = 1;
    group.add(sprite);
    icons.push(sprite);
  });
}*/

// ---------------- RAYCASTER ----------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;

window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Обычный клик (убрали, так как нам нужен клик без вращения)
/*window.addEventListener("click", () => {
  if (hovered) window.open(hovered.userData.link, "_blank");
});*/

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

  const hoverScale = 0.7;
  const normalScale = 0.5;

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
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
