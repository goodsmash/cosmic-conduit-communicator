import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface ThreeSetupResult {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  cleanupFn: () => void;
}

export const setupThreeScene = (
  container: HTMLDivElement,
  cameraPosition: [number, number, number] = [20, 10, 20],
  options: {
    ambientLight?: boolean;
    directionalLight?: boolean;
    background?: THREE.Color | THREE.Texture | THREE.CubeTexture;
  } = {}
): ThreeSetupResult => {
  // Scene
  const scene = new THREE.Scene();
  if (options.background) {
    scene.background = options.background;
  }

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(...cameraPosition);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lights
  if (options.ambientLight) {
    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);
  }

  if (options.directionalLight) {
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(5, 5, 5);
    scene.add(directional);
  }

  // Handle window resize
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", handleResize);

  // Cleanup function
  const cleanupFn = () => {
    window.removeEventListener("resize", handleResize);
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    cleanupFn,
  };
};

export const createStarField = (
  count: number = 1000,
  radius: number = 100
): THREE.Points => {
  const vertices = [];
  const colors = [];
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = Math.cbrt(Math.random()) * radius; // Cube root for more uniform distribution

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    vertices.push(x, y, z);

    // Random star color (mostly white with hints of blue and yellow)
    const temperature = Math.random();
    if (temperature > 0.9) {
      color.setHSL(0.6, 0.9, 0.9); // Blue-ish
    } else if (temperature < 0.1) {
      color.setHSL(0.15, 0.9, 0.9); // Yellow-ish
    } else {
      color.setHSL(0, 0, 0.9); // White-ish
    }

    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
};

export const createGlow = (
  radius: number,
  color: string | number,
  intensity: number = 1
): THREE.Sprite => {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load("/textures/glow.png"),
    color: color,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.5 * intensity,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(radius * 2.5, radius * 2.5, 1);
  return sprite;
};

export const createAtmosphere = (
  radius: number,
  color: string | number
): THREE.Mesh => {
  const geometry = new THREE.SphereGeometry(radius * 1.1, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  });
  return new THREE.Mesh(geometry, material);
};
