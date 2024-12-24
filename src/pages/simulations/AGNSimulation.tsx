import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { GalaxyEffects } from "@/utils/galaxyEffects";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const AGNSimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [jetIntensity, setJetIntensity] = useState(1);
  const [accretionRate, setAccretionRate] = useState(0.5);
  const [showCorona, setShowCorona] = useState(true);

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

    // Black hole
    const blackHoleGeometry = new THREE.SphereGeometry(1, 32, 32);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);

    // Accretion disk
    const diskGeometry = new THREE.RingGeometry(1.5, 5, 64);
    const diskMaterial = new THREE.MeshPhongMaterial({
      color: 0xff4500,
      side: THREE.DoubleSide,
      emissive: 0xff4500,
      emissiveIntensity: 0.5
    });
    const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    accretionDisk.rotation.x = Math.PI / 2;
    scene.add(accretionDisk);

    // Jets
    const jetGeometry = new THREE.CylinderGeometry(0.2, 0.5, 10, 32);
    const jetMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.7
    });
    const northJet = new THREE.Mesh(jetGeometry, jetMaterial);
    const southJet = new THREE.Mesh(jetGeometry, jetMaterial);
    northJet.position.y = 5;
    southJet.position.y = -5;
    scene.add(northJet);
    scene.add(southJet);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // Camera position
    camera.position.z = 15;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      accretionDisk.rotation.z += 0.005;
      composer.render();
    };
    animate();

    // Cleanup
    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen" ref={containerRef}>
      <Card className="absolute top-4 right-4 p-4 space-y-4 w-64">
        <h2 className="text-lg font-bold">AGN Controls</h2>
        
        <div className="space-y-2">
          <label className="text-sm">Jet Intensity</label>
          <Slider
            value={[jetIntensity]}
            onValueChange={([value]) => setJetIntensity(value)}
            min={0}
            max={2}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Accretion Rate</label>
          <Slider
            value={[accretionRate]}
            onValueChange={([value]) => setAccretionRate(value)}
            min={0}
            max={1}
            step={0.1}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Show Corona</label>
          <Switch
            checked={showCorona}
            onCheckedChange={setShowCorona}
          />
        </div>

        <Button
          onClick={() => {
            // Reset camera position
          }}
        >
          Reset View
        </Button>
      </Card>
    </div>
  );
};

export default AGNSimulation;
