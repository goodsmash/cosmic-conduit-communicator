import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const PlanetarySimulation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize simulation here
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-blue-400">Planetary System Formation</h1>
        <Button variant="outline" onClick={() => navigate('/simulations')}>
          Back to Simulations
        </Button>
      </div>
      <div className="bg-black/50 backdrop-blur-sm border border-blue-400/30 rounded-lg p-8">
        <p className="text-lg text-gray-300 mb-4">
          Welcome to the Planetary System Formation Simulator! Create your own solar system and
          watch as planets form from a protoplanetary disk.
        </p>
        {/* Add simulation content here */}
      </div>
    </div>
  );
};

export default PlanetarySimulation;
