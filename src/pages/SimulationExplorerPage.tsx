import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  HiOutlineRocketLaunch,
  HiOutlineStar,
  HiOutlineGlobeAlt,
  HiOutlineSparkles,
  HiOutlineCube,
  HiOutlineArrowsPointingOut,
  HiOutlineSquare3Stack3D,
  HiOutlineBeaker,
  HiOutlineSignal
} from "react-icons/hi2";

const SimulationExplorerPage = () => {
  const simulations = [
    {
      category: "Basic Simulations",
      items: [
        {
          href: "/simulations/orbital",
          label: "Orbital Mechanics",
          description: "Explore planetary orbits and gravitational interactions",
          icon: HiOutlineRocketLaunch
        },
        {
          href: "/simulations/stellar",
          label: "Stellar Life Cycle",
          description: "Witness the birth, life, and death of stars",
          icon: HiOutlineStar
        }
      ]
    },
    {
      category: "Galaxy Simulations",
      items: [
        {
          href: "/simulations/galaxy",
          label: "Galaxy Formation",
          description: "Study the formation and evolution of galaxies",
          icon: HiOutlineCube
        },
        {
          href: "/simulations/agn",
          label: "Active Galactic Nuclei",
          description: "Explore the powerful cores of active galaxies",
          icon: HiOutlineArrowsPointingOut
        },
        {
          href: "/simulations/merger",
          label: "Galaxy Mergers",
          description: "Witness the collision and merger of galaxies",
          icon: HiOutlineSquare3Stack3D
        },
        {
          href: "/simulations/peculiar",
          label: "Peculiar Galaxies",
          description: "Study unusual and irregular galaxies",
          icon: HiOutlineBeaker
        },
        {
          href: "/simulations/ultra-diffuse",
          label: "Ultra-Diffuse Galaxies",
          description: "Explore low surface brightness galaxies",
          icon: HiOutlineGlobeAlt
        },
        {
          href: "/simulations/radio",
          label: "Radio Galaxies",
          description: "Study galaxies with strong radio emission",
          icon: HiOutlineSignal
        },
        {
          href: "/simulations/real-galaxy",
          label: "Real Galaxy Simulation",
          description: "Explore accurate representations of real galaxies based on MAST data, including M87, Andromeda, Sombrero, and Whirlpool galaxies.",
          icon: HiOutlineGlobeAlt
        }
      ]
    }
  ];

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-4xl font-bold">Astronomical Simulations</h1>
      <p className="text-lg text-muted-foreground">
        Explore the cosmos through interactive simulations. Each simulation provides
        a unique perspective on different astronomical phenomena.
      </p>

      <div className="space-y-8">
        {simulations.map((category) => (
          <div key={category.category} className="space-y-4">
            <h2 className="text-2xl font-semibold">{category.category}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((sim) => (
                <Link key={sim.href} to={sim.href}>
                  <Card className="p-6 space-y-4 hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-4">
                      <sim.icon className="w-8 h-8" />
                      <div>
                        <h3 className="text-lg font-medium">{sim.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sim.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationExplorerPage;
