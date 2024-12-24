import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

const EventHorizon: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Camera position
    camera.position.z = 2;

    // Create background starfield
    const starfieldGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;

      starPositions[i3] = radius * Math.sin(theta) * Math.cos(phi);
      starPositions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      starPositions[i3 + 2] = radius * Math.cos(theta);

      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.5, 0.8);
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;
    }

    starfieldGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starfieldGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starfieldMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const starfield = new THREE.Points(starfieldGeometry, starfieldMaterial);
    scene.add(starfield);

    // Create black hole
    const blackHoleGeometry = new THREE.CircleGeometry(1, 64);
    const blackHoleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        cameraPosition: { value: camera.position },
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
        uniform vec2 resolution;
        uniform vec3 cameraPosition;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        const float PI = 3.14159265359;
        const float SCHWARZSCHILD_RADIUS = 1.0;
        const float ACCRETION_DISK_RADIUS = 3.0;
        const vec3 DISK_COLOR = vec3(1.0, 0.6, 0.2);
        
        float sdCircle(vec2 p, float r) {
          return length(p) - r;
        }
        
        vec2 rotateUV(vec2 uv, float rotation) {
          float mid = 0.5;
          return vec2(
            cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
            cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
          );
        }
        
        float gravitationalLensing(vec2 uv) {
          float dist = length(uv - vec2(0.5));
          float schwarzschildRadius = SCHWARZSCHILD_RADIUS / 2.0;
          float deflection = schwarzschildRadius / (dist * dist);
          return deflection;
        }
        
        vec3 accretionDiskColor(vec2 uv) {
          float dist = length(uv - vec2(0.5));
          if (dist < SCHWARZSCHILD_RADIUS || dist > ACCRETION_DISK_RADIUS) return vec3(0.0);
          
          float temp = 1.0 - (dist - SCHWARZSCHILD_RADIUS) / (ACCRETION_DISK_RADIUS - SCHWARZSCHILD_RADIUS);
          temp = pow(temp, 0.5);
          
          vec3 color = mix(vec3(1.0, 0.3, 0.1), vec3(1.0, 0.8, 0.3), temp);
          float brightness = exp(-dist * 0.5) * (1.0 + 0.5 * sin(time * 2.0 + dist * 20.0));
          
          return color * brightness;
        }
        
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution;
          vec2 centeredUv = uv - vec2(0.5);
          
          // Gravitational lensing
          float lensing = gravitationalLensing(uv);
          vec2 distortedUv = centeredUv * (1.0 + lensing * 2.0) + vec2(0.5);
          
          // Rotate accretion disk
          vec2 rotatedUv = rotateUV(distortedUv, time * 0.2);
          
          // Event horizon
          float circle = sdCircle(centeredUv, SCHWARZSCHILD_RADIUS / 2.0);
          vec3 color = vec3(0.0);
          
          if (circle > 0.0) {
            // Accretion disk
            color = accretionDiskColor(rotatedUv);
            
            // Add blue-shifted and red-shifted regions
            float doppler = sin(atan(centeredUv.y, centeredUv.x) + time * 0.5);
            color = mix(color, color * vec3(0.7, 0.85, 1.0), max(0.0, doppler));
            color = mix(color, color * vec3(1.0, 0.8, 0.7), max(0.0, -doppler));
            
            // Add gravitational lensing glow
            float glowIntensity = smoothstep(0.0, 0.1, lensing) * 0.5;
            color += vec3(1.0, 0.8, 0.5) * glowIntensity;
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = {
      uniforms: {
        tDiffuse: { value: null },
        bloomStrength: { value: 1.5 },
        bloomRadius: { value: 0.4 },
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
        uniform float bloomStrength;
        uniform float bloomRadius;
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec3 bloom = vec3(0.0);
          float total = 0.0;
          
          for(float i = -bloomRadius; i <= bloomRadius; i += 0.5) {
            for(float j = -bloomRadius; j <= bloomRadius; j += 0.5) {
              vec2 offset = vec2(i, j) / 100.0;
              vec4 sample = texture2D(tDiffuse, vUv + offset);
              float weight = 1.0 - length(offset) / bloomRadius;
              if(weight > 0.0) {
                bloom += sample.rgb * weight;
                total += weight;
              }
            }
          }
          
          bloom /= total;
          gl_FragColor = vec4(color.rgb + bloom * bloomStrength, color.a);
        }
      `,
    };

    const bloomEffect = new ShaderPass(bloomPass);
    composer.addPass(bloomEffect);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = performance.now() * 0.001;
      blackHole.material.uniforms.time.value = time;
      
      starfield.rotation.y = time * 0.05;
      
      composer.render();
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);

      blackHole.material.uniforms.resolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-screen" />;
};

export default EventHorizon;
