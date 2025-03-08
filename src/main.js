import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import './style.css';

// Сцена и камера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

// Рендерер
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('webgl'),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 10, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

let bannerMaterial;
const loader = new GLTFLoader();
loader.load('/models/presto.glb', (gltf) => {
  const model = gltf.scene;

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  model.position.sub(center);
  scene.add(model);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
  cameraZ *= 2.2;

  camera.position.set(0, 0, cameraZ);
  controls.maxDistance = cameraZ * 10;
  controls.target.set(0, 0, 0);
  controls.update();

  model.traverse((node) => {
    if (node.isMesh) {
      bannerMaterial = node.material;
      bannerMaterial.color = new THREE.Color('#ffffff');

      const defaultTexture = textureLoader.load('/default.jpg', () => {
        defaultTexture.flipY = false;
        bannerMaterial.map = defaultTexture;
        bannerMaterial.color.set('#ffffff');
        bannerMaterial.needsUpdate = true;

        // Инициализация настроек по умолчанию
        textureScale = 3;
        offsetX = 1;
        offsetY = 0;
        updateTextureTransform();
      });
    }
  });
});

const textureLoader = new THREE.TextureLoader();
let textureScale = 1;
let offsetX = 0;
let offsetY = 0;

function updateTextureTransform() {
  if (bannerMaterial && bannerMaterial.map) {
    bannerMaterial.map.repeat.set(textureScale, textureScale);
    bannerMaterial.map.offset.set(offsetX, offsetY);
    bannerMaterial.map.wrapS = THREE.RepeatWrapping;
    bannerMaterial.map.wrapT = THREE.RepeatWrapping;
    bannerMaterial.map.needsUpdate = true;
  }
}

document.getElementById('bannerColor').addEventListener('input', (event) => {
  const color = event.target.value;
  if (bannerMaterial) {
    bannerMaterial.color.set(color);
    bannerMaterial.needsUpdate = true;
  }
});

document.getElementById('bannerTexture').addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      textureLoader.load(e.target.result, (texture) => {
        texture.flipY = false;
        bannerMaterial.map = texture;
        bannerMaterial.color.set('#ffffff');
        textureScale = 1;
        offsetX = 0;
        offsetY = 0;
        updateTextureTransform();
      });
    }

    reader.readAsDataURL(file);
}});

document.getElementById('textureScale').addEventListener('input', (e) => {
  textureScale = parseFloat(e.target.value);
  console.log(textureScale);
  updateTextureTransform();
});

document.getElementById('textureOffsetX').addEventListener('input', (event) => {
  offsetX = parseFloat(event.target.value);
  updateTextureTransform();
});

document.getElementById('textureOffsetY').addEventListener('input', (event) => {
  offsetY = parseFloat(event.target.value);
  updateTextureTransform();
});

// Позиция камеры
camera.position.set(0, 1, 3);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enableZoom = true;
controls.enablePan = true;

// Анимация
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
animate();

// Обработка ресайза окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});