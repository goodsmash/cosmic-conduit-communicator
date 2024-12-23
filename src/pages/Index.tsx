import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import StoryCard from "@/components/StoryCard";
import Timeline from "@/components/Timeline";
import ChapterSection from "@/components/ChapterSection";
import SpaceScene from "@/components/SpaceScene";

const chapters = [
  {
    title: "The Aethel",
    content: "Humanity's far-flung descendants return to prevent a catastrophe.",
    image: "/images/aethel.png"
  },
  {
    title: "The Probes",
    content: "Advanced temporal probes carry messages across time.",
    image: "/images/probes.png"
  },
  {
    title: "The Threat",
    content: "An asteroid approaches Earth, undetectable by current technology.",
    image: "/images/asteroid.png"
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-space-black text-white overflow-x-hidden">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-6">
        <SpaceScene />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-space-blue to-space-purple bg-clip-text text-transparent mb-6">
            Echoes of Tomorrow
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            A journey through time as humanity's descendants return to prevent our extinction
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="animate-float"
          >
            <div className="w-16 h-16 mx-auto border-t-2 border-r-2 border-space-blue transform rotate-45 opacity-75" />
          </motion.div>
        </motion.div>
      </section>

      {/* Chapters Grid */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">The Story Unfolds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chapters.map((chapter, index) => (
            <StoryCard
              key={chapter.title}
              title={chapter.title}
              content={chapter.content}
              image={chapter.image}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Chapter Sections */}
      <ChapterSection />

      {/* Timeline Section */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Timeline of Events</h2>
        <Timeline />
      </section>
    </div>
  );
};

export default Index;