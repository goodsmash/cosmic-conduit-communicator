import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GalaxyType } from '../../data/galaxyTypes';

interface GalaxyExplorerProps {
  galaxy: GalaxyType;
  interactive?: boolean;
}

export const GalaxyExplorer: React.FC<GalaxyExplorerProps> = ({ galaxy, interactive = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Camera position
    camera.position.z = interactive ? 100 : 150;

    // Create galaxy core
    const createGalaxyCore = () => {
      const geometry = new THREE.SphereGeometry(galaxy.parameters.size * 0.2, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(galaxy.color.core) },
        },
        vertexShader: `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          varying vec3 vPosition;
          
          void main() {
            float intensity = 1.0 - length(vPosition) / ${galaxy.parameters.size.toFixed(1)};
            vec3 finalColor = color * intensity;
            gl_FragColor = vec4(finalColor, intensity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      return new THREE.Mesh(geometry, material);
    };

    // Create spiral arms
    const createSpiralArms = () => {
      const particleCount = galaxy.parameters.particleCount;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      const armCount = galaxy.parameters.armCount;
      const spiralTightness = galaxy.parameters.spiralTightness;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * galaxy.parameters.size;
        const arm = Math.floor(Math.random() * armCount);
        const angle = (arm / armCount) * Math.PI * 2 + (radius * spiralTightness);
        const spread = (Math.random() - 0.5) * (radius / galaxy.parameters.size) * 20;

        positions[i3] = Math.cos(angle) * radius + Math.cos(angle + Math.PI/2) * spread;
        positions[i3 + 1] = Math.sin(angle) * radius + Math.sin(angle + Math.PI/2) * spread;
        positions[i3 + 2] = (Math.random() - 0.5) * (radius * 0.1);

        // Color gradient based on radius
        const colorBase = new THREE.Color(galaxy.color.arms);
        const dustColor = new THREE.Color(galaxy.color.dust);
        const mixRatio = Math.sin((angle + radius * 0.1) * 2) * 0.5 + 0.5;
        const color = colorBase.clone().lerp(dustColor, mixRatio);

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            float r = length(gl_PointCoord - vec2(0.5));
            if (r > 0.5) discard;
            float intensity = 1.0 - (r * 2.0);
            gl_FragColor = vec4(vColor, intensity);
          }
        `,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geometry, material);
    };

    // Add components to scene
    const core = createGalaxyCore();
    const arms = createSpiralArms();
    scene.add(core);
    scene.add(arms);

    // Interactive controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };

    if (interactive) {
      containerRef.current.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      containerRef.current.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
          };

          rotationVelocity = {
            x: deltaMove.y * 0.001,
            y: deltaMove.x * 0.001
          };

          previousMousePosition = { x: e.clientX, y: e.clientY };
        }
      });

      containerRef.current.addEventListener('mouseup', () => {
        isDragging = false;
      });

      containerRef.current.addEventListener('wheel', (e) => {
        camera.position.z = Math.max(50, Math.min(200, camera.position.z + e.deltaY * 0.1));
      });
    }

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.001;

      if (interactive) {
        if (!isDragging) {
          rotationVelocity.x *= 0.95;
          rotationVelocity.y *= 0.95;
        }

        scene.rotation.x += rotationVelocity.x;
        scene.rotation.y += rotationVelocity.y;
      } else {
        scene.rotation.y = time * galaxy.parameters.rotationSpeed;
      }

      core.material.uniforms.time.value = time;
      arms.material.uniforms.time.value = time;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [galaxy, interactive]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default GalaxyExplorer;
