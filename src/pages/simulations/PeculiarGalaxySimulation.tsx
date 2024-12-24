import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const peculiarTypes = [
  { id: "ring", name: "Ring Galaxy" },
  { id: "chain", name: "Chain Galaxy" },
  { id: "jellyfish", name: "Jellyfish Galaxy" },
  { id: "tadpole", name: "Tadpole Galaxy" },
  { id: "cartwheel", name: "Cartwheel Galaxy" }
];

const PeculiarGalaxySimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState("ring");
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [showGasStreams, setShowGasStreams] = useState(true);

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

    // Create galaxy based on selected type
    const galaxy = new THREE.Group();
    
    switch (selectedType) {
      case "ring":
        // Ring galaxy
        const ringGeometry = new THREE.TorusGeometry(5, 0.5, 16, 100);
        const ringMaterial = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.1 });
        const ring = new THREE.Points(ringGeometry, ringMaterial);
        galaxy.add(ring);

        // Central bulge
        const bulgeGeometry = new THREE.SphereGeometry(1, 32, 32);
        const bulgeMaterial = new THREE.MeshPhongMaterial({ color: 0xffaa00 });
        const bulge = new THREE.Mesh(bulgeGeometry, bulgeMaterial);
        galaxy.add(bulge);
        break;

      case "jellyfish":
        // Jellyfish galaxy body
        const bodyGeometry = new THREE.SphereGeometry(2, 32, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        galaxy.add(body);

        // Trailing gas streams
        if (showGasStreams) {
          const streamCount = 20;
          for (let i = 0; i < streamCount; i++) {
            const streamGeometry = new THREE.CylinderGeometry(0.1, 0.05, 10, 8);
            const streamMaterial = new THREE.MeshPhongMaterial({
              color: 0x00ffff,
              transparent: true,
              opacity: 0.5
            });
            const stream = new THREE.Mesh(streamGeometry, streamMaterial);
            stream.position.y = -5;
            stream.rotation.x = Math.PI / 2;
            stream.rotation.z = (i / streamCount) * Math.PI * 2;
            galaxy.add(stream);
          }
        }
        break;

      // Add other galaxy types here
    }

    scene.add(galaxy);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Camera position
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      galaxy.rotation.y += 0.001 * rotationSpeed;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [selectedType, rotationSpeed, showGasStreams]);

  return (
    <div className="relative w-full h-screen" ref={containerRef}>
      <Card className="absolute top-4 right-4 p-4 space-y-4 w-64">
        <h2 className="text-lg font-bold">Peculiar Galaxy Controls</h2>
        
        <div className="space-y-2">
          <label className="text-sm">Galaxy Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {peculiarTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <label className="text-sm">Show Gas Streams</label>
          <Switch
            checked={showGasStreams}
            onCheckedChange={setShowGasStreams}
          />
        </div>

        <Button
          onClick={() => {
            setRotationSpeed(1);
            setShowGasStreams(true);
          }}
        >
          Reset View
        </Button>
      </Card>
    </div>
  );
};

export default PeculiarGalaxySimulation;
