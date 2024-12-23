import { motion } from "framer-motion";
import Timeline from "@/components/Timeline";

const TimelinePage = () => {
  return (
    <div className="min-h-screen bg-space-black text-white pt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <h1 className="text-5xl font-bold mb-6">Timeline of Events</h1>
          <p className="text-xl text-gray-300">
            Follow the chronological progression of humanity's encounter with their future selves and the impending arrival of the Harbinger.
          </p>
        </motion.div>
        
        <Timeline />
      </div>
    </div>
  );
};

export default TimelinePage;