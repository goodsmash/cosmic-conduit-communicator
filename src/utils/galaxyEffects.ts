import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

// Custom shader for advanced effects
const GalaxyShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'uTime': { value: 0 },
    'uDustIntensity': { value: 0.5 },
    'uStarIntensity': { value: 1.0 },
    'uColorShift': { value: new THREE.Vector3(1.0, 1.0, 1.0) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uDustIntensity;
    uniform float uStarIntensity;
    uniform vec3 uColorShift;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    vec3 adjustColor(vec3 color, float intensity) {
      // Temperature-based color adjustment
      float temp = (color.r + color.g + color.b) / 3.0;
      vec3 cool = vec3(0.0, 0.0, temp);
      vec3 hot = vec3(temp, temp * 0.8, temp * 0.6);
      return mix(cool, hot, intensity);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Dynamic dust lanes
      float dust = rand(vUv + vec2(uTime * 0.1));
      if (dust < uDustIntensity) {
        color *= 0.7;
      }

      // Star brightness variation
      float starFlicker = 1.0 + 0.2 * sin(uTime * 10.0 + rand(vUv) * 6.28);
      color *= mix(1.0, starFlicker, uStarIntensity);

      // Color temperature adjustment
      color = adjustColor(color, uStarIntensity);
      
      // Apply color shift
      color *= uColorShift;

      gl_FragColor = vec4(color, texel.a);
    }
  `
};

export class GalaxyEffects {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private customPass: ShaderPass;
  private dustIntensity: number = 0.5;
  private starIntensity: number = 1.0;
  private colorShift: THREE.Vector3 = new THREE.Vector3(1.0, 1.0, 1.0);

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.composer = new EffectComposer(renderer);
    
    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Add bloom pass with optimized settings
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // Strength
      0.4, // Radius
      0.85 // Threshold
    );
    this.composer.addPass(this.bloomPass);

    // Add custom effects pass
    this.customPass = new ShaderPass(GalaxyShader);
    this.composer.addPass(this.customPass);

    // Performance optimization
    this.composer.renderToScreen = true;
  }

  public update(time: number) {
    if (this.customPass) {
      this.customPass.uniforms.uTime.value = time;
      this.customPass.uniforms.uDustIntensity.value = this.dustIntensity;
      this.customPass.uniforms.uStarIntensity.value = this.starIntensity;
      this.customPass.uniforms.uColorShift.value = this.colorShift;
    }
  }

  public setDustIntensity(intensity: number) {
    this.dustIntensity = THREE.MathUtils.clamp(intensity, 0, 1);
  }

  public setStarIntensity(intensity: number) {
    this.starIntensity = THREE.MathUtils.clamp(intensity, 0, 2);
  }

  public setColorShift(r: number, g: number, b: number) {
    this.colorShift.set(r, g, b);
  }

  public setBloomParameters(strength: number, radius: number, threshold: number) {
    this.bloomPass.strength = strength;
    this.bloomPass.radius = radius;
    this.bloomPass.threshold = threshold;
  }

  public resize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  public render() {
    this.composer.render();
  }
}
