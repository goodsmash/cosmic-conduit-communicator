import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { popularTargets } from "@/data/popularTargets";
import { setupThreeScene, createStarField, createGlow, createAtmosphere } from "@/lib/three-utils";
import SimulationControls from "@/components/simulation/SimulationControls";
import CameraControls from "@/components/simulation/CameraControls";
import InfoPanel from "@/components/simulation/InfoPanel";

interface Planet {
  name: string;
  distance: number;
  radius: number;
  color: string;
  orbitSpeed: number;
  angle: number;
  description?: string;
  mass?: number;
  temperature?: number;
  atmosphere?: boolean;
  mesh?: THREE.Mesh;
}

const OrbitalSimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene: newScene, camera: newCamera, renderer: newRenderer, controls: newControls, cleanupFn } = 
      setupThreeScene(containerRef.current, [50, 30, 50], {
        ambientLight: true,
        directionalLight: true
      });

    const starField = createStarField(2000, 200);
    newScene.add(starField);

    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffdd00,
      emissive: 0xffdd00,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    const sunGlow = createGlow(6, 0xffdd00, 2);
    sun.add(sunGlow);
    newScene.add(sun);

    const initialPlanets: Planet[] = [
      {
        name: "Mercury",
        distance: 10,
        radius: 0.8,
        color: "#A0522D",
        orbitSpeed: 4.74,
        angle: Math.random() * Math.PI * 2,
        mass: 0.055,
        temperature: 440,
      },
      {
        name: "Venus",
        distance: 15,
        radius: 1.2,
        color: "#DEB887",
        orbitSpeed: 3.50,
        angle: Math.random() * Math.PI * 2,
        mass: 0.815,
        temperature: 737,
        atmosphere: true
      },
      {
        name: "Earth",
        distance: 20,
        radius: 1.3,
        color: "#4169E1",
        orbitSpeed: 2.98,
        angle: Math.random() * Math.PI * 2,
        mass: 1,
        temperature: 288,
        atmosphere: true
      },
      {
        name: "Mars",
        distance: 25,
        radius: 0.9,
        color: "#CD5C5C",
        orbitSpeed: 2.41,
        angle: Math.random() * Math.PI * 2,
        mass: 0.107,
        temperature: 210,
        atmosphere: true
      }
    ];

    initialPlanets.forEach(planet => {
      const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({ 
        color: planet.color,
        roughness: 0.7,
        metalness: 0.3
      });
      const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
      
      if (planet.atmosphere) {
        const atmosphere = createAtmosphere(planet.radius * 1.2, planet.color);
        planetMesh.add(atmosphere);
      }

      planetMesh.position.x = Math.cos(planet.angle) * planet.distance;
      planetMesh.position.z = Math.sin(planet.angle) * planet.distance;
      
      const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x666666,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = Math.PI / 2;
      newScene.add(orbitLine);
      
      newScene.add(planetMesh);
      planet.mesh = planetMesh;
    });

    setPlanets(initialPlanets);
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setControls(newControls);

    return cleanupFn;
  }, []);

  useEffect(() => {
    if (!scene || !camera || !renderer || !controls || isPaused) return;

    const animate = () => {
      planets.forEach(planet => {
        if (planet.mesh) {
          planet.angle += (planet.orbitSpeed * simulationSpeed) / 1000;
          planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
          planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
          planet.mesh.rotation.y += (planet.orbitSpeed * simulationSpeed) / 2000;
        }
      });

      controls.update();
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scene, camera, renderer, controls, planets, isPaused, simulationSpeed]);

  useEffect(() => {
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, renderer]);

  return (
    <div className="relative w-full h-screen" ref={containerRef}>
      <SimulationControls
        title="Orbital Mechanics"
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        isPaused={isPaused}
        onPauseToggle={() => setIsPaused(!isPaused)}
      >
        <div className="mt-4 space-y-2">
          {planets.map((planet) => (
            <button
              key={planet.name}
              onClick={() => setSelectedPlanet(planet)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedPlanet?.name === planet.name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {planet.name}
            </button>
          ))}
        </div>
      </SimulationControls>

      {selectedPlanet && (
        <InfoPanel
          title={selectedPlanet.name}
          onClose={() => setSelectedPlanet(null)}
          items={[
            { label: "Distance from Sun", value: `${selectedPlanet.distance.toFixed(1)} AU` },
            { label: "Radius", value: `${selectedPlanet.radius.toFixed(1)} Earth radii` },
            { label: "Mass", value: `${selectedPlanet.mass?.toFixed(3)} Earth masses` },
            { label: "Temperature", value: `${selectedPlanet.temperature}°K` },
            { label: "Atmosphere", value: selectedPlanet.atmosphere ? "Yes" : "No" }
          ]}
        />
      )}
    </div>
  );
};

export default OrbitalSimulation;
