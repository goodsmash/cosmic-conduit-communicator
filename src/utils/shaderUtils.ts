import * as THREE from 'three';
import galaxyShader from '../shaders/galaxyShader.glsl';
import starFieldShader from '../shaders/starFieldShader.glsl';
import nebulaShader from '../shaders/nebulaShader.glsl';

interface GalaxyShaderParams {
  color: THREE.Color;
  density: number;
  rotationSpeed: number;
  spiral: number;
}

interface StarFieldParams {
  density: number;
  twinkleSpeed: number;
  color1: THREE.Color;
  color2: THREE.Color;
}

interface NebulaParams {
  baseColor: THREE.Color;
  density: number;
  turbulence: number;
  scale: number;
}

export const createGalaxyShaderMaterial = (params: GalaxyShaderParams): THREE.ShaderMaterial => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: params.color },
      uDensity: { value: params.density },
      uRotationSpeed: { value: params.rotationSpeed },
      uSpiral: { value: params.spiral }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: galaxyShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
};

export const createStarFieldMaterial = (params: StarFieldParams): THREE.ShaderMaterial => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDensity: { value: params.density },
      uTwinkleSpeed: { value: params.twinkleSpeed },
      uColor1: { value: params.color1 },
      uColor2: { value: params.color2 }
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: starFieldShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
};

export const createNebulaMaterial = (params: NebulaParams): THREE.ShaderMaterial => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: params.baseColor },
      uDensity: { value: params.density },
      uTurbulence: { value: params.turbulence },
      uScale: { value: params.scale }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: nebulaShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
};

// Helper function to update shader uniforms
export const updateShaderTime = (material: THREE.ShaderMaterial, time: number) => {
  if (material.uniforms.uTime) {
    material.uniforms.uTime.value = time;
  }
};

// Create a composite galaxy visualization
export const createGalaxyVisualization = (scene: THREE.Scene): {
  update: (time: number) => void;
  dispose: () => void;
} => {
  // Create galaxy disk
  const galaxyGeometry = new THREE.PlaneGeometry(20, 20, 128, 128);
  const galaxyMaterial = createGalaxyShaderMaterial({
    color: new THREE.Color(0x4444ff),
    density: 1.0,
    rotationSpeed: 0.2,
    spiral: 2.0
  });
  const galaxyDisk = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
  
  // Create star field background
  const starFieldGeometry = new THREE.SphereGeometry(50, 64, 64);
  const starFieldMaterial = createStarFieldMaterial({
    density: 1.0,
    twinkleSpeed: 2.0,
    color1: new THREE.Color(0xffffff),
    color2: new THREE.Color(0xaaaaff)
  });
  const starField = new THREE.Mesh(starFieldGeometry, starFieldMaterial);
  
  // Create nebula
  const nebulaGeometry = new THREE.PlaneGeometry(30, 30, 64, 64);
  const nebulaMaterial = createNebulaMaterial({
    baseColor: new THREE.Color(0xff4444),
    density: 0.5,
    turbulence: 1.0,
    scale: 2.0
  });
  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  nebula.position.z = -5;
  
  // Add everything to the scene
  scene.add(galaxyDisk);
  scene.add(starField);
  scene.add(nebula);
  
  // Return update and cleanup functions
  return {
    update: (time: number) => {
      updateShaderTime(galaxyMaterial, time);
      updateShaderTime(starFieldMaterial, time);
      updateShaderTime(nebulaMaterial, time);
    },
    dispose: () => {
      scene.remove(galaxyDisk);
      scene.remove(starField);
      scene.remove(nebula);
      galaxyGeometry.dispose();
      galaxyMaterial.dispose();
      starFieldGeometry.dispose();
      starFieldMaterial.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
    }
  };
};
