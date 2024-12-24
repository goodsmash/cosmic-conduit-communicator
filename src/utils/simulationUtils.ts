import * as THREE from 'three';

// Create a star with corona effect
export const createStar = (
  radius: number,
  color: string | number = 0xffff00,
  coronaSize: number = 1.2
): THREE.Group => {
  const group = new THREE.Group();

  // Core
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.5
  });
  const core = new THREE.Mesh(geometry, material);
  group.add(core);

  // Corona
  const coronaGeometry = new THREE.SphereGeometry(radius * coronaSize, 32, 32);
  const coronaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float time;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(color, intensity * 0.5);
      }
    `,
    transparent: true,
    side: THREE.BackSide
  });
  const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
  group.add(corona);

  return group;
};

// Create a planet with atmosphere
export const createPlanet = (
  radius: number,
  color: string | number,
  hasAtmosphere: boolean = true,
  atmosphereColor: string | number = 0x88ff88
): THREE.Group => {
  const group = new THREE.Group();

  // Planet core
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color });
  const planet = new THREE.Mesh(geometry, material);
  group.add(planet);

  if (hasAtmosphere) {
    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.1, 32, 32);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    group.add(atmosphere);
  }

  return group;
};

// Create a particle system for stars in a galaxy
export const createGalaxyStars = (
  count: number,
  radius: number,
  height: number,
  spiral: number = 2
): THREE.Points => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.random() * radius;
    const theta = Math.random() * Math.PI * 2 + spiral * Math.pow(r / radius, 0.5);
    const y = (Math.random() - 0.5) * height * Math.exp(-r / (radius * 0.5));

    positions[i3] = r * Math.cos(theta);
    positions[i3 + 1] = y;
    positions[i3 + 2] = r * Math.sin(theta);

    // Color based on distance from center
    const distanceRatio = r / radius;
    color.setHSL(0.6, 0.8, 0.3 + Math.random() * 0.2);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  return new THREE.Points(geometry, material);
};

// Create a particle trail
export const createTrail = (
  length: number,
  color: string | number = 0xffffff
): THREE.Line => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(length * 3);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color,
    opacity: 0.5,
    transparent: true
  });

  return new THREE.Line(geometry, material);
};

// Update particle trail
export const updateTrail = (
  trail: THREE.Line,
  positions: THREE.Vector3[]
): void => {
  const positionAttribute = trail.geometry.getAttribute('position');
  const array = positionAttribute.array as Float32Array;

  for (let i = 0; i < positions.length; i++) {
    const i3 = i * 3;
    array[i3] = positions[i].x;
    array[i3 + 1] = positions[i].y;
    array[i3 + 2] = positions[i].z;
  }

  positionAttribute.needsUpdate = true;
};

// Calculate orbital parameters
export const calculateOrbitalParameters = (
  mass1: number,
  mass2: number,
  distance: number,
  eccentricity: number = 0
): { period: number; velocity: number } => {
  const G = 6.67430e-11; // Gravitational constant
  const reducedMass = (mass1 * mass2) / (mass1 + mass2);
  const totalMass = mass1 + mass2;
  
  const period = 2 * Math.PI * Math.sqrt(Math.pow(distance, 3) / (G * totalMass));
  const velocity = Math.sqrt(G * totalMass * (2 / distance - 1 / (distance * (1 + eccentricity))));

  return { period, velocity };
};
