import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { GalaxyEffects } from "@/utils/galaxyEffects";
import { GalaxyPhysics } from "@/utils/galaxyPhysics";
import { Select } from "@/components/ui/select";

const GalaxyMergerSimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mergerStage, setMergerStage] = useState(0);
  const [timeScale, setTimeScale] = useState(1);
  const [showTidalForces, setShowTidalForces] = useState(true);

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

    // Galaxy 1
    const galaxy1 = new THREE.Group();
    const galaxy1Core = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0xffaa00 })
    );
    galaxy1.add(galaxy1Core);

    // Galaxy 1 disk
    const galaxy1Disk = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xffaa00, size: 0.05 })
    );
    const galaxy1Particles = [];
    for (let i = 0; i < 10000; i++) {
      const r = THREE.MathUtils.randFloat(1, 5);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      galaxy1Particles.push(
        r * Math.cos(theta),
        THREE.MathUtils.randFloatSpread(0.5),
        r * Math.sin(theta)
      );
    }
    galaxy1Disk.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(galaxy1Particles, 3)
    );
    galaxy1.add(galaxy1Disk);
    galaxy1.position.set(-10, 0, 0);
    scene.add(galaxy1);

    // Galaxy 2
    const galaxy2 = new THREE.Group();
    const galaxy2Core = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x00aaff })
    );
    galaxy2.add(galaxy2Core);

    // Galaxy 2 disk
    const galaxy2Disk = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0x00aaff, size: 0.05 })
    );
    const galaxy2Particles = [];
    for (let i = 0; i < 8000; i++) {
      const r = THREE.MathUtils.randFloat(1, 4);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      galaxy2Particles.push(
        r * Math.cos(theta),
        THREE.MathUtils.randFloatSpread(0.5),
        r * Math.sin(theta)
      );
    }
    galaxy2Disk.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(galaxy2Particles, 3)
    );
    galaxy2.add(galaxy2Disk);
    galaxy2.position.set(10, 0, 0);
    scene.add(galaxy2);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Camera position
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Merger animation based on mergerStage
      const t = mergerStage / 100;
      galaxy1.position.x = THREE.MathUtils.lerp(-10, 0, t);
      galaxy2.position.x = THREE.MathUtils.lerp(10, 0, t);
      
      galaxy1.rotation.y += 0.001 * timeScale;
      galaxy2.rotation.y -= 0.001 * timeScale;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [mergerStage, timeScale]);

  return (
    <div className="relative w-full h-screen" ref={containerRef}>
      <Card className="absolute top-4 right-4 p-4 space-y-4 w-64">
        <h2 className="text-lg font-bold">Merger Controls</h2>
        
        <div className="space-y-2">
          <label className="text-sm">Merger Progress</label>
          <Slider
            value={[mergerStage]}
            onValueChange={([value]) => setMergerStage(value)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Time Scale</label>
          <Slider
            value={[timeScale]}
            onValueChange={([value]) => setTimeScale(value)}
            min={0}
            max={2}
            step={0.1}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Show Tidal Forces</label>
          <Switch
            checked={showTidalForces}
            onCheckedChange={setShowTidalForces}
          />
        </div>

        <Button
          onClick={() => {
            setMergerStage(0);
            setTimeScale(1);
          }}
        >
          Reset Simulation
        </Button>
      </Card>
    </div>
  );
};

export default GalaxyMergerSimulation;
