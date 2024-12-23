import { motion } from "framer-motion";

const timelineEvents = [
  {
    year: "2157",
    title: "First Contact",
    description: "The Aethel make first contact through their temporal probes.",
  },
  {
    year: "2158",
    title: "Asteroid Discovery",
    description: "The imminent asteroid threat is revealed to humanity.",
  },
  {
    year: "2159",
    title: "Collaboration Begins",
    description: "Humans and Aethel begin working together to save Earth.",
  },
];

const Timeline = () => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-space-blue/30" />
      {timelineEvents.map((event, index) => (
        <motion.div
          key={event.year}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
          className="relative pl-12 pb-8"
        >
          <div className="absolute left-0 w-8 h-8 rounded-full bg-space-black border-2 border-space-blue flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-space-blue animate-glow" />
          </div>
          <div className="bg-space-black/40 p-4 rounded-lg border border-space-blue/20 backdrop-blur-sm">
            <span className="text-space-blue font-mono">{event.year}</span>
            <h3 className="text-lg font-bold text-white mt-1">{event.title}</h3>
            <p className="text-gray-300 mt-2">{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Timeline;