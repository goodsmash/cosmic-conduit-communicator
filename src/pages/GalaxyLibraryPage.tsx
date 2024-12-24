import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galaxyTypes, GalaxyType, getAllGalaxyTypes } from '../data/galaxyTypes';
import { GalaxyExplorer } from '../components/GalaxyExplorer/GalaxyExplorer';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineFunnel, 
  HiOutlineInformationCircle 
} from 'react-icons/hi2';

interface FilterState {
  type: string[];
  starFormation: number[];
  size: number[];
}

const GalaxyLibraryPage: React.FC = () => {
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    starFormation: [0, 1],
    size: [0, 100]
  });

  const filterGalaxies = () => {
    return galaxyTypes.filter(galaxy => {
      const matchesSearch = galaxy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          galaxy.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filters.type.length === 0 || filters.type.includes(galaxy.type);
      const matchesStarFormation = galaxy.parameters.starFormationRate >= filters.starFormation[0] &&
                                 galaxy.parameters.starFormationRate <= filters.starFormation[1];
      const matchesSize = galaxy.parameters.size >= filters.size[0] &&
                         galaxy.parameters.size <= filters.size[1];

      return matchesSearch && matchesType && matchesStarFormation && matchesSize;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-6">
        <h1 className="text-4xl font-bold mb-4">Galaxy Library</h1>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search galaxies..."
              className="w-full bg-gray-700 rounded-lg py-2 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiOutlineFunnel />
            Filters
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 bg-gray-800 p-6 space-y-6"
            >
              <div>
                <h3 className="font-bold mb-3">Galaxy Types</h3>
                {getAllGalaxyTypes().map(type => (
                  <label key={type} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          type: e.target.checked
                            ? [...prev.type, type]
                            : prev.type.filter(t => t !== type)
                        }));
                      }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>

              <div>
                <h3 className="font-bold mb-3">Star Formation Rate</h3>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.starFormation[1]}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      starFormation: [prev.starFormation[0], parseFloat(e.target.value)]
                    }));
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <h3 className="font-bold mb-3">Size</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.size[1]}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      size: [prev.size[0], parseInt(e.target.value)]
                    }));
                  }}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterGalaxies().map(galaxy => (
              <motion.div
                key={galaxy.id}
                layoutId={galaxy.id}
                onClick={() => setSelectedGalaxy(galaxy)}
                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                whileHover={{ y: -5 }}
              >
                <div className="h-48 relative">
                  <GalaxyExplorer galaxy={galaxy} interactive={false} />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{galaxy.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{galaxy.scientificName}</p>
                  <p className="text-gray-300 line-clamp-2">{galaxy.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Galaxy Detail Modal */}
        <AnimatePresence>
          {selectedGalaxy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-6 z-50"
              onClick={() => setSelectedGalaxy(null)}
            >
              <motion.div
                layoutId={selectedGalaxy.id}
                className="bg-gray-800 rounded-lg w-full max-w-4xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="h-96 relative">
                  <GalaxyExplorer galaxy={selectedGalaxy} interactive={true} />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedGalaxy.name}</h2>
                      <p className="text-gray-400">{selectedGalaxy.scientificName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedGalaxy(null)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-gray-300 mb-6">{selectedGalaxy.description}</p>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold mb-3">Characteristics</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {selectedGalaxy.characteristics.map((char, index) => (
                          <li key={index} className="text-gray-300">{char}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3">Parameters</h3>
                      <div className="space-y-2 text-gray-300">
                        <p>Size: {selectedGalaxy.parameters.size} kpc</p>
                        <p>Star Formation Rate: {selectedGalaxy.parameters.starFormationRate}</p>
                        <p>Dust Density: {selectedGalaxy.parameters.dustDensity}</p>
                        {selectedGalaxy.parameters.armCount > 0 && (
                          <p>Spiral Arms: {selectedGalaxy.parameters.armCount}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedGalaxy.realWorldExample && (
                    <div className="mt-6">
                      <h3 className="font-bold mb-2">Real World Example</h3>
                      <p className="text-gray-300">{selectedGalaxy.realWorldExample}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalaxyLibraryPage;
