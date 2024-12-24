import * as THREE from 'three';
import {
  galaxyVertexShader,
  galaxyFragmentShader,
  starFieldVertexShader,
  starFieldFragmentShader,
  nebulaVertexShader,
  nebulaFragmentShader,
  dustLanesVertexShader,
  dustLanesFragmentShader,
  jetVertexShader,
  jetFragmentShader
} from '@/shaders/galaxy';

export interface ShaderParams {
  size?: number;
  rotationSpeed?: number;
  spiral?: number;
  density?: number;
  brightness?: number;
  color?: THREE.Color;
  dustDensity?: number;
  temperature?: number;
  jetPower?: number;
  jetLength?: number;
}

export class ShaderManager {
  private materials: Map<string, THREE.ShaderMaterial>;
  private uniforms: Map<string, { [key: string]: THREE.IUniform }>;

  constructor() {
    this.materials = new Map();
    this.uniforms = new Map();
    this.initializeShaders();
  }

  private initializeShaders() {
    // Galaxy shader
    const galaxyUniforms = {
      uTime: { value: 0 },
      uSize: { value: 1.0 },
      uRotationSpeed: { value: 0.5 },
      uSpiral: { value: 1.0 },
      uBaseColor: { value: new THREE.Color(0x44aaff) },
      uDensity: { value: 1.0 },
      uBrightness: { value: 1.0 }
    };
    this.uniforms.set('galaxy', galaxyUniforms);
    this.materials.set('galaxy', new THREE.ShaderMaterial({
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      uniforms: galaxyUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));

    // Star field shader
    const starFieldUniforms = {
      uTime: { value: 0 },
      uDensity: { value: 1.0 },
      uColor1: { value: new THREE.Color(0xffffff) },
      uColor2: { value: new THREE.Color(0xaaaaff) },
      uTwinkleSpeed: { value: 2.0 }
    };
    this.uniforms.set('starField', starFieldUniforms);
    this.materials.set('starField', new THREE.ShaderMaterial({
      vertexShader: starFieldVertexShader,
      fragmentShader: starFieldFragmentShader,
      uniforms: starFieldUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));

    // Nebula shader
    const nebulaUniforms = {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(0xff4488) },
      uDensity: { value: 0.8 },
      uTurbulence: { value: 1.0 },
      uScale: { value: 1.0 }
    };
    this.uniforms.set('nebula', nebulaUniforms);
    this.materials.set('nebula', new THREE.ShaderMaterial({
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      uniforms: nebulaUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));

    // Dust lanes shader
    const dustLanesUniforms = {
      uTime: { value: 0 },
      uDustDensity: { value: 0.5 },
      uColor: { value: new THREE.Color(0x332211) }
    };
    this.uniforms.set('dustLanes', dustLanesUniforms);
    this.materials.set('dustLanes', new THREE.ShaderMaterial({
      vertexShader: dustLanesVertexShader,
      fragmentShader: dustLanesFragmentShader,
      uniforms: dustLanesUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.MultiplyBlending
    }));

    // Jets shader
    const jetUniforms = {
      uTime: { value: 0 },
      uPower: { value: 1.0 },
      uLength: { value: 1.0 },
      uColor: { value: new THREE.Color(0x88ffff) }
    };
    this.uniforms.set('jets', jetUniforms);
    this.materials.set('jets', new THREE.ShaderMaterial({
      vertexShader: jetVertexShader,
      fragmentShader: jetFragmentShader,
      uniforms: jetUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
  }

  public getMaterial(type: string): THREE.ShaderMaterial | undefined {
    return this.materials.get(type);
  }

  public updateUniforms(type: string, params: ShaderParams) {
    const uniforms = this.uniforms.get(type);
    if (!uniforms) return;

    if (params.size !== undefined) uniforms.uSize.value = params.size;
    if (params.rotationSpeed !== undefined) uniforms.uRotationSpeed.value = params.rotationSpeed;
    if (params.spiral !== undefined) uniforms.uSpiral.value = params.spiral;
    if (params.density !== undefined) uniforms.uDensity.value = params.density;
    if (params.brightness !== undefined) uniforms.uBrightness.value = params.brightness;
    if (params.color !== undefined) uniforms.uBaseColor.value = params.color;
    if (params.dustDensity !== undefined) uniforms.uDustDensity.value = params.dustDensity;
    if (params.temperature !== undefined) uniforms.uTemperature.value = params.temperature;
    if (params.jetPower !== undefined) uniforms.uPower.value = params.jetPower;
    if (params.jetLength !== undefined) uniforms.uLength.value = params.jetLength;
  }

  public updateTime(time: number) {
    this.uniforms.forEach(uniforms => {
      if (uniforms.uTime) uniforms.uTime.value = time;
    });
  }

  public dispose() {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
    this.uniforms.clear();
  }
}
