import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { galaxyTypes } from "@/data/galaxyTypes";
import * as THREE from "three";
import { createGalaxyVisualization } from "@/utils/shaderUtils";
import {
  HiSparkles,
  HiGlobeAlt,
  HiBookOpen,
  HiMagnifyingGlass,
  HiBeaker,
  HiChartBar,
  HiUserGroup,
  HiAcademicCap
} from "react-icons/hi2";

const simulationCategories = [
  {
    title: "Orbital Mechanics",
    type: "orbital",
    difficulty: "beginner",
    duration: "15-30 minutes",
    description: "Explore the principles of orbital mechanics by manipulating satellite orbits around planets.",
    path: "/simulations/orbital",
    icon: HiGlobeAlt
  },
  {
    title: "Stellar Life Cycle",
    type: "stellar",
    difficulty: "intermediate",
    duration: "20-40 minutes",
    description: "Watch the evolution of stars from birth to their final stages, including supernovae and black holes.",
    path: "/simulations/stellar",
    icon: HiSparkles
  }
];

const galaxySimulations = [
  {
    title: "Active Galactic Nuclei (AGN)",
    type: "galactic",
    difficulty: "advanced",
    duration: "30-45 minutes",
    description: "Explore powerful galactic cores including Seyfert galaxies, quasars, and blazars.",
    path: "/simulations/galaxy/agn",
    icon: HiBeaker,
    features: ["Real-time ray tracing", "Interactive jet controls", "Spectral analysis"]
  },
  {
    title: "Galaxy Mergers & Interactions",
    type: "galactic",
    difficulty: "advanced",
    duration: "30-45 minutes",
    description: "Witness dramatic galaxy collisions, mergers, and gravitational interactions.",
    path: "/simulations/galaxy/merger",
    icon: HiChartBar,
    features: ["N-body simulation", "Tidal force visualization", "Time controls"]
  },
  {
    title: "Peculiar Galaxies",
    type: "galactic",
    difficulty: "advanced",
    duration: "30-45 minutes",
    description: "Study unique galaxy types like ring galaxies, chain galaxies, and jellyfish galaxies.",
    path: "/simulations/galaxy/peculiar",
    icon: HiAcademicCap,
    features: ["Custom shader effects", "Morphology analysis", "Interactive camera"]
  },
  {
    title: "Ultra-Diffuse Galaxies",
    type: "galactic",
    difficulty: "advanced",
    duration: "30-45 minutes",
    description: "Explore mysterious galaxies with extremely low surface brightness and high dark matter content.",
    path: "/simulations/galaxy/diffuse",
    icon: HiMagnifyingGlass,
    features: ["Dark matter visualization", "Surface brightness mapping", "3D rotation"]
  },
  {
    title: "Radio Galaxies & Jets",
    type: "galactic",
    difficulty: "advanced",
    duration: "30-45 minutes",
    description: "Visualize powerful radio jets and lobes in giant elliptical galaxies.",
    path: "/simulations/galaxy/radio",
    icon: HiUserGroup,
    features: ["Magnetic field lines", "Synchrotron emission", "Multi-wavelength view"]
  }
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizationRef = useRef<{ update: (time: number) => void; dispose: () => void; } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 30;

    // Create galaxy visualization
    const visualization = createGalaxyVisualization(scene);
    visualizationRef.current = visualization;

    // Animation loop
    let animationFrameId: number;
    const animate = (time: number) => {
      visualization.update(time * 0.001);
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate(0);

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      visualization.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full -z-10 opacity-50"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background/0 to-background -z-10" />
      
      <main className="container mx-auto px-4 py-16 relative">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Welcome to Cosmic Conduit
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your gateway to exploring the cosmos through interactive simulations,
            sharing astronomical observations, and connecting with fellow stargazers.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500" asChild>
              <Link to="/discover">Start Exploring</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/galaxy-library">View Library</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="p-6 space-y-4 bg-background/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <HiSparkles className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-semibold">Interactive Simulations</h2>
            </div>
            <p className="text-muted-foreground">
              Experience the cosmos through our cutting-edge simulations powered by
              real-time GLSL shaders and physics engines.
            </p>
          </Card>
          <Card className="p-6 space-y-4 bg-background/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <HiChartBar className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-semibold">Data Visualization</h2>
            </div>
            <p className="text-muted-foreground">
              Explore astronomical data through beautiful and informative
              visualizations using advanced rendering techniques.
            </p>
          </Card>
          <Card className="p-6 space-y-4 bg-background/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <HiUserGroup className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-semibold">Community</h2>
            </div>
            <p className="text-muted-foreground">
              Join a community of passionate astronomers, share observations,
              and collaborate on research projects.
            </p>
          </Card>
        </div>

        <section className="mt-24 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Featured Simulations</h2>
            <p className="text-muted-foreground mt-2">
              Explore our collection of interactive astronomical simulations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galaxySimulations.map((sim) => (
              <Card key={sim.title} className="p-6 space-y-4 bg-background/80 backdrop-blur">
                <div className="flex items-center gap-3">
                  <sim.icon className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">{sim.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{sim.description}</p>
                <div className="flex flex-wrap gap-2">
                  {sim.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge variant="outline">{sim.difficulty}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{sim.duration}</span>
                  </div>
                </div>
                <Link to={sim.path}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                    Launch Simulation
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-24 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Galaxy Library</h2>
            <p className="text-muted-foreground mt-2">
              Discover and study different types of galaxies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galaxyTypes.slice(0, 8).map((galaxy) => (
              <Card key={galaxy.id} className="p-4 space-y-2 bg-background/80 backdrop-blur">
                <h3 className="font-semibold">{galaxy.name}</h3>
                <p className="text-xs text-muted-foreground">{galaxy.scientificName}</p>
                <Link to={`/simulations/galaxy/${galaxy.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/galaxy-library">View All Galaxy Types</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
