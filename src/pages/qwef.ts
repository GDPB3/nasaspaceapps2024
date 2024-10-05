import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function viewer() {
  // Constants
  const NUMBER_STARS = 10000;
  const STAR_SIZE = 0.3;

  const canvas = document.querySelector("canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3;
  scene.add(camera);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  ambientLight.position.set(0, 0, 0);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 2);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // stars
  const starsGeometry = new THREE.BufferGeometry(); // Geometry for the stars
  const starsCount = NUMBER_STARS; // number of particles to be created

  const vertices = new Float32Array(starsCount); // Float32Array is an array of 32-bit floats. This is used to represent an array of vertices. (we have 3 values for each vertex - coordinates x, y, z)

  // Loop through all the vertices and set their random position
  for (let i = 0; i < starsCount; i++) {
    vertices[i] = (Math.random() - 0.5) * 100; // -0.5 to get the range from -0.5 to 0.5 than * 100 to get a range from -50 to 50
  }

  starsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3) // 3 values for each vertex (x, y, z)
  );

  // Texture
  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load("/textures/star.png"); // Add a texture to the particles

  // Material
  const starsMaterial = new THREE.PointsMaterial({
    map: starTexture, // Texture
    size: STAR_SIZE, // Size of the particles
    sizeAttenuation: true, // size of the particle will be smaller as it gets further away from the camera, and if it's closer to the camera, it will be bigger
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // to avoid picelation on high resolution screenss
  renderer.setAnimationLoop(animate);

  function animate() {
    controls.update();
    stars.rotation.y += 0.0001; // Rotate the stars
    renderer.render(scene, camera);
  }
}
