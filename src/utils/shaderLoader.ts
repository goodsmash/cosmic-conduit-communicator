import vertexShader from '../shaders/galaxy/vertex.glsl';
import fragmentShader from '../shaders/galaxy/fragment.glsl';
import * as THREE from 'three';

export interface ShaderUniforms {
  time: { value: number };
  size: { value: number };
  rotationSpeed: { value: number };
  spiralFactor: { value: number };
  brightness: { value: number };
  baseColor: { value: THREE.Color };
}

export function createGalaxyShaderMaterial(uniforms: Partial<ShaderUniforms> = {}): THREE.ShaderMaterial {
  const defaultUniforms: ShaderUniforms = {
    time: { value: 0 },
    size: { value: 2.0 },
    rotationSpeed: { value: 0.5 },
    spiralFactor: { value: 1.0 },
    brightness: { value: 1.0 },
    baseColor: { value: new THREE.Color(0xffffff) }
  };

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { ...defaultUniforms, ...uniforms },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

export function updateShaderUniforms(material: THREE.ShaderMaterial, uniforms: Partial<ShaderUniforms>) {
  Object.entries(uniforms).forEach(([key, value]) => {
    if (material.uniforms[key]) {
      material.uniforms[key].value = value.value;
    }
  });
}
