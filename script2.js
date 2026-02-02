// Импортируем Three.js и OrbitControls как модуль
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

// Сцена и камера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 400;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Контроль мышью
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

// Свет
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(300, 300, 300);
scene.add(light);

// Видимая полупрозрачная сфера
const sphereGeometry = new THREE.SphereGeometry(150, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x5555ff, wireframe: true, transparent: true, opacity: 0.3 });
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);

// Создание иконок
function createIcon(url, link, position) {
    const texture = new THREE.TextureLoader().load(url);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(60, 60, 1);
    sprite.position.copy(position);
    sprite.userData = { link: link };
    scene.add(sprite);
}

// Иконки и их расположение
const radius = 150;
const icons = [
    { url: 'https://cdn-icons-png.flaticon.com/512/733/733547.png', link: 'https://facebook.com' },
    { url: 'https://cdn-icons-png.flaticon.com/512/733/733579.png', link: 'https://twitter.com' },
    { url: 'https://cdn-icons-png.flaticon.com/512/733/733558.png', link: 'https://instagram.com' },
    { url: 'https://cdn-icons-png.flaticon.com/512/733/733553.png', link: 'https://github.com' },
    { url: 'https://cdn-icons-png.flaticon.com/512/733/733561.png', link: 'https://linkedin.com' }
];

icons.forEach((icon, i) => {
    const phi = Math.acos(-1 + (2 * i) / icons.length);
    const theta = Math.sqrt(icons.length * Math.PI) * phi;

    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    createIcon(icon.url, icon.link, new THREE.Vector3(x, y, z));
});

// Клик по иконке
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.link) {
            window.open(obj.userData.link, '_blank');
        }
    }
}
window.addEventListener('click', onClick);

// Анимация
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Адаптивность
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
