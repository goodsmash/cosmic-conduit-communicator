import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

interface NebulaEffectProps {
  color?: string;
  density?: number;
  speed?: number;
  bloomStrength?: number;
  bloomRadius?: number;
}

const NebulaEffect: React.FC<NebulaEffectProps> = ({
  color = '#4A90E2',
  density = 2.5,
  speed = 0.5,
  bloomStrength = 1.5,
  bloomRadius = 0.75,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Nebula setup
    const nebulaGeometry = new THREE.IcosahedronGeometry(10, 4);
    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        density: { value: density },
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
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float density;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float n = mix(
            mix(
              mix(dot(random3(i), f - vec3(0,0,0)),
                  dot(random3(i + vec3(1,0,0)), f - vec3(1,0,0)),
                  f.x),
              mix(dot(random3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                  dot(random3(i + vec3(1,1,0)), f - vec3(1,1,0)),
                  f.x),
              f.y),
            mix(
              mix(dot(random3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                  dot(random3(i + vec3(1,0,1)), f - vec3(1,0,1)),
                  f.x),
              mix(dot(random3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                  dot(random3(i + vec3(1,1,1)), f - vec3(1,1,1)),
                  f.x),
              f.y),
            f.z
          );
          
          return n * 0.5 + 0.5;
        }
        
        void main() {
          vec3 pos = vPosition * density;
          float n = noise(pos + time);
          
          vec3 finalColor = mix(color, vec3(1.0), n * 0.5);
          gl_FragColor = vec4(finalColor, n * 0.5);
        }
      `,
      transparent: true,
    });

    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomStrength,
      bloomRadius,
      0.75
    );
    composer.addPass(bloomPass);

    camera.position.z = 20;

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += speed * 0.01;
      
      nebula.rotation.x += speed * 0.001;
      nebula.rotation.y += speed * 0.002;
      
      nebulaMaterial.uniforms.time.value = time;
      
      composer.render();
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [color, density, speed, bloomStrength, bloomRadius]);

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0 }} />;
};

export default NebulaEffect;
