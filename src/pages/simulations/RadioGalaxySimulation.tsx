import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const RadioGalaxySimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [jetPower, setJetPower] = useState(1);
  const [lobeSize, setLobeSize] = useState(1);
  const [showMagneticField, setShowMagneticField] = useState(true);

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

    // Host galaxy
    const galaxyGeometry = new THREE.SphereGeometry(2, 32, 32);
    const galaxyMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.2
    });
    const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    scene.add(galaxy);

    // Radio jets
    const createJet = (direction: number) => {
      const jetGroup = new THREE.Group();

      // Inner jet
      const jetGeometry = new THREE.CylinderGeometry(0.2, 0.4, 10, 32);
      const jetMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: jetPower,
        transparent: true,
        opacity: 0.7
      });
      const jet = new THREE.Mesh(jetGeometry, jetMaterial);
      jet.position.y = direction * 5;
      jetGroup.add(jet);

      // Radio lobe
      const lobeGeometry = new THREE.SphereGeometry(2 * lobeSize, 32, 32);
      const lobeMaterial = new THREE.MeshPhongMaterial({
        color: 0x0088ff,
        emissive: 0x0088ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.3
      });
      const lobe = new THREE.Mesh(lobeGeometry, lobeMaterial);
      lobe.position.y = direction * 10;
      jetGroup.add(lobe);

      return jetGroup;
    };

    const northJet = createJet(1);
    const southJet = createJet(-1);
    scene.add(northJet);
    scene.add(southJet);

    // Magnetic field lines
    if (showMagneticField) {
      const fieldLines = new THREE.Group();
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, -15, 0),
        new THREE.Vector3(10, -5, 0),
        new THREE.Vector3(10, 5, 0),
        new THREE.Vector3(0, 15, 0)
      );

      const points = curve.getPoints(50);
      const fieldGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const fieldMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3
      });

      // Create multiple field lines around the jets
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const fieldLine = new THREE.Line(fieldGeometry, fieldMaterial);
        fieldLine.rotation.z = angle;
        fieldLines.add(fieldLine);
      }

      scene.add(fieldLines);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Camera position
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [jetPower, lobeSize, showMagneticField]);

  return (
    <div className="relative w-full h-screen" ref={containerRef}>
      <Card className="absolute top-4 right-4 p-4 space-y-4 w-64">
        <h2 className="text-lg font-bold">Radio Galaxy Controls</h2>
        
        <div className="space-y-2">
          <label className="text-sm">Jet Power</label>
          <Slider
            value={[jetPower]}
            onValueChange={([value]) => setJetPower(value)}
            min={0}
            max={2}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Lobe Size</label>
          <Slider
            value={[lobeSize]}
            onValueChange={([value]) => setLobeSize(value)}
            min={0.5}
            max={2}
            step={0.1}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Show Magnetic Field</label>
          <Switch
            checked={showMagneticField}
            onCheckedChange={setShowMagneticField}
          />
        </div>

        <Button
          onClick={() => {
            setJetPower(1);
            setLobeSize(1);
            setShowMagneticField(true);
          }}
        >
          Reset View
        </Button>
      </Card>
    </div>
  );
};

export default RadioGalaxySimulation;
