import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { GalaxyEffects } from "@/utils/galaxyEffects";

const UltraDiffuseGalaxySimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [starDensity, setStarDensity] = useState(0.2);
  const [darkMatterHalo, setDarkMatterHalo] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Galaxy particles
    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.7,
      vertexColors: true
    });

    // Create galaxy particles
    const positions = [];
    const colors = [];
    const particleCount = 50000;

    for (let i = 0; i < particleCount; i++) {
      // Random angle
      const theta = Math.random() * Math.PI * 2;
      
      // Random radius with ultra-diffuse distribution
      const r = Math.pow(Math.random(), 2) * 20; // Larger, more diffuse radius
      
      // Position
      const x = r * Math.cos(theta);
      const y = (Math.random() - 0.5) * 2; // Thin disk
      const z = r * Math.sin(theta);
      
      positions.push(x, y, z);

      // Color based on distance from center
      const color = new THREE.Color();
      color.setHSL(0.6, 0.8, 0.3 + Math.random() * 0.2);
      colors.push(color.r, color.g, color.b);
    }

    galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxy);

    // Dark matter halo visualization
    const haloGeometry = new THREE.SphereGeometry(25, 32, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x000066,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    scene.add(halo);
    halo.visible = darkMatterHalo;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Camera position
    camera.position.set(30, 20, 30);
    camera.lookAt(0, 0, 0);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      galaxy.rotation.y += 0.0001 * rotationSpeed;
      if (darkMatterHalo) {
        halo.rotation.y += 0.0001 * rotationSpeed;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [darkMatterHalo, rotationSpeed]);

  return (
    <div className="relative w-full h-screen" ref={containerRef}>
      <Card className="absolute top-4 right-4 p-4 space-y-4 w-64">
        <h2 className="text-lg font-bold">Ultra-Diffuse Galaxy Controls</h2>
        
        <div className="space-y-2">
          <label className="text-sm">Star Density</label>
          <Slider
            value={[starDensity]}
            onValueChange={([value]) => setStarDensity(value)}
            min={0.1}
            max={1}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Rotation Speed</label>
          <Slider
            value={[rotationSpeed]}
            onValueChange={([value]) => setRotationSpeed(value)}
            min={0}
            max={2}
            step={0.1}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Show Dark Matter Halo</label>
          <Switch
            checked={darkMatterHalo}
            onCheckedChange={setDarkMatterHalo}
          />
        </div>

        <Button
          onClick={() => {
            setStarDensity(0.2);
            setRotationSpeed(0.5);
            setDarkMatterHalo(true);
          }}
        >
          Reset View
        </Button>
      </Card>
    </div>
  );
};

export default UltraDiffuseGalaxySimulation;
