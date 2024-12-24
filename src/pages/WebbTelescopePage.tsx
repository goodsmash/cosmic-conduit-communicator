import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { webbTelescopeService } from '../services/webbTelescope';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineInformationCircle, 
  HiOutlineArrowDownTray, 
  HiOutlineArrowPath 
} from 'react-icons/hi2';

interface JWSTObservation {
  id: string;
  observation_id: string;
  program: number;
  details: {
    mission: string;
    instruments: { instrument: string; }[];
    suffix: string;
    description: string;
  };
  file_type: string;
  thumbnail: string;
  location: string;
}

const WebbTelescopePage: React.FC = () => {
  const [programs, setPrograms] = useState<number[]>([]);
  const [observations, setObservations] = useState<JWSTObservation[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<JWSTObservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchProgramObservations(selectedProgram);
    }
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const programList = await webbTelescopeService.fetchPrograms();
      setPrograms(programList);
      if (programList.length > 0) {
        setSelectedProgram(programList[0]);
      }
    } catch (err) {
      setError('Failed to fetch JWST programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramObservations = async (programId: number) => {
    try {
      setLoading(true);
      const data = await webbTelescopeService.fetchProgramObservations(programId);
      setObservations(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch observations for program ${programId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-6">
        <h1 className="text-4xl font-bold mb-4">James Webb Space Telescope Explorer</h1>
        <div className="flex gap-4">
          <select
            className="bg-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedProgram || ''}
            onChange={(e) => setSelectedProgram(Number(e.target.value))}
          >
            {programs.map((program) => (
              <option key={program} value={program}>
                Program {program}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {observations.map((observation) => (
            <motion.div
              key={observation.id}
              layoutId={observation.id}
              onClick={() => setSelectedObservation(observation)}
              className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              whileHover={{ y: -5 }}
            >
              <div className="relative aspect-video">
                <img
                  src={observation.location}
                  alt={observation.observation_id}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-xl font-bold">{observation.observation_id}</h3>
                  <p className="text-sm text-gray-300">
                    {observation.details.instruments.map(i => i.instrument).join(', ')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center mt-8">
            <HiOutlineArrowPath className="animate-spin text-4xl text-blue-500" />
          </div>
        )}

        {/* Observation Detail Modal */}
        <AnimatePresence>
          {selectedObservation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-6 z-50"
              onClick={() => setSelectedObservation(null)}
            >
              <motion.div
                layoutId={selectedObservation.id}
                className="bg-gray-800 rounded-lg w-full max-w-4xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative aspect-video">
                  <img
                    src={selectedObservation.location}
                    alt={selectedObservation.observation_id}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => window.open(selectedObservation.location, '_blank')}
                    className="absolute top-4 right-4 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <HiOutlineArrowDownTray />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Observation {selectedObservation.observation_id}</h2>
                      <p className="text-gray-400">Program {selectedObservation.program}</p>
                    </div>
                    <button
                      onClick={() => setSelectedObservation(null)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold mb-3">Instrument Details</h3>
                      <div className="space-y-2 text-gray-300">
                        <p>Mission: {selectedObservation.details.mission}</p>
                        <p>Instruments: {selectedObservation.details.instruments.map(i => i.instrument).join(', ')}</p>
                        <p>Suffix: {selectedObservation.details.suffix}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3">Description</h3>
                      <p className="text-gray-300">{selectedObservation.details.description}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Download Options</h3>
                    <div className="flex gap-4">
                      <a
                        href={selectedObservation.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                      >
                        <HiOutlineArrowDownTray /> Download JPG
                      </a>
                      <a
                        href={selectedObservation.location.replace('.jpg', '.fits')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                      >
                        <HiOutlineArrowDownTray /> Download FITS
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WebbTelescopePage;
