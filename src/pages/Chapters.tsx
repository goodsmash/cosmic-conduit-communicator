import { motion } from "framer-motion";
import ChapterSection from "@/components/ChapterSection";

const Chapters = () => {
  return (
    <div className="min-h-screen bg-space-black text-white pt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <h1 className="text-5xl font-bold mb-6">Story Chapters</h1>
          <p className="text-xl text-gray-300">
            Explore the complete narrative of humanity's encounter with the Aethel and their desperate attempt to prevent catastrophe.
          </p>
        </motion.div>
        
        <ChapterSection />
      </div>
    </div>
  );
};

export default Chapters;