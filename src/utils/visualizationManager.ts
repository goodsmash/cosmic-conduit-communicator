import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { createGalaxyShaderMaterial, updateShaderUniforms, type ShaderUniforms } from './shaderLoader';
import { GalaxyPhysics, type GalaxyPhysicsParams } from './galaxyPhysics';

export interface VisualizationParams {
  particleCount?: number;
  size?: number;
  physics?: GalaxyPhysicsParams;
  shaders?: Partial<ShaderUniforms>;
  postprocessing?: {
    bloom?: boolean;
    bloomStrength?: number;
    bloomRadius?: number;
    bloomThreshold?: number;
  };
}

export class VisualizationManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private galaxyPhysics: GalaxyPhysics | null;
  private galaxyMaterial: THREE.ShaderMaterial;
  private galaxyPoints: THREE.Points;
  private animationId: number | null;
  private time: number;

  constructor(container: HTMLElement, params: VisualizationParams = {}) {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Initialize post-processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    if (params.postprocessing?.bloom) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        params.postprocessing.bloomStrength || 1.5,
        params.postprocessing.bloomRadius || 0.4,
        params.postprocessing.bloomThreshold || 0.85
      );
      this.composer.addPass(bloomPass);
    }

    // Create galaxy geometry
    const geometry = this.createGalaxyGeometry(params);
    this.galaxyMaterial = createGalaxyShaderMaterial(params.shaders);
    this.galaxyPoints = new THREE.Points(geometry, this.galaxyMaterial);
    this.scene.add(this.galaxyPoints);

    // Initialize physics if params provided
    this.galaxyPhysics = params.physics ? new GalaxyPhysics(this.galaxyPoints, params.physics) : null;

    // Set up camera
    this.camera.position.set(0, 30, 50);
    this.camera.lookAt(0, 0, 0);

    // Initialize animation properties
    this.animationId = null;
    this.time = 0;

    // Set up window resize handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  private createGalaxyGeometry(params: VisualizationParams): THREE.BufferGeometry {
    const particleCount = params.particleCount || 100000;
    const size = params.size || 10;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const randomness = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * size;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * size * 0.1;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * radius;

      // Color gradient from center to edge
      const distanceFromCenter = radius / size;
      colors[i3] = 1.0 - distanceFromCenter * 0.5;     // R
      colors[i3 + 1] = 0.8 - distanceFromCenter * 0.3; // G
      colors[i3 + 2] = 0.6 - distanceFromCenter * 0.2; // B

      scales[i] = Math.random() * 2 + 1;
      
      randomness[i3] = (Math.random() - 0.5) * 0.5;
      randomness[i3 + 1] = (Math.random() - 0.5) * 0.5;
      randomness[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));

    return geometry;
  }

  private handleResize() {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  public startAnimation() {
    const animate = () => {
      this.time += 0.016; // Approximately 60 FPS
      
      // Update shader uniforms
      updateShaderUniforms(this.galaxyMaterial, {
        time: { value: this.time }
      });

      // Update physics if enabled
      if (this.galaxyPhysics) {
        this.galaxyPhysics.update(0.016);
      }

      this.composer.render();
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  public stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public updateParams(params: VisualizationParams) {
    // Update shader uniforms
    if (params.shaders) {
      updateShaderUniforms(this.galaxyMaterial, params.shaders);
    }

    // Update bloom parameters
    if (params.postprocessing?.bloom) {
      const bloomPass = this.composer.passes.find(pass => pass instanceof UnrealBloomPass);
      if (bloomPass instanceof UnrealBloomPass) {
        if (params.postprocessing.bloomStrength !== undefined) {
          bloomPass.strength = params.postprocessing.bloomStrength;
        }
        if (params.postprocessing.bloomRadius !== undefined) {
          bloomPass.radius = params.postprocessing.bloomRadius;
        }
        if (params.postprocessing.bloomThreshold !== undefined) {
          bloomPass.threshold = params.postprocessing.bloomThreshold;
        }
      }
    }

    // Update physics parameters
    if (params.physics && this.galaxyPhysics) {
      this.galaxyPhysics.updateParams(params.physics);
    }
  }

  public dispose() {
    this.stopAnimation();
    
    if (this.galaxyPoints) {
      this.galaxyPoints.geometry.dispose();
      (this.galaxyPoints.material as THREE.Material).dispose();
      this.scene.remove(this.galaxyPoints);
    }

    this.renderer.dispose();
    window.removeEventListener('resize', this.handleResize);
  }
}
