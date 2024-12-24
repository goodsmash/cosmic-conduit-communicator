import { motion, useState } from "framer-motion";
import ParticleSystem from "@/components/ParticleSystem";
import NebulaEffect from "@/components/NebulaEffect";
import WormholeEffect from "@/components/WormholeEffect";
import TimeDistortionEffect from "@/components/TimeDistortionEffect";
import StoryCard from "@/components/StoryCard";
import Timeline from "@/components/Timeline";
import ChapterSection from "@/components/ChapterSection";

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
  const [showTimeEffect, setShowTimeEffect] = useState(false);

  return (
    <div className="min-h-screen bg-space-black text-white overflow-x-hidden">
      <ParticleSystem
        count={150}
        colors={['#4A90E2', '#50E3C2', '#F8E71C']}
        interactive={true}
        fadeOut={true}
      />
      
      <NebulaEffect
        color="#4A90E2"
        density={2.5}
        speed={0.5}
        bloomStrength={1.5}
        bloomRadius={0.75}
      />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto relative z-10 px-4"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-space-blue to-space-purple bg-clip-text text-transparent mb-4 sm:mb-6">
            Echoes of Tomorrow
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12">
            A journey through time as humanity's descendants return to prevent our extinction
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="animate-float"
            onClick={() => setShowTimeEffect(true)}
          >
            <div 
              className="w-12 sm:w-16 h-12 sm:h-16 mx-auto border-t-2 border-r-2 border-space-blue transform rotate-45 opacity-75 cursor-pointer hover:scale-110 transition-transform" 
              role="button"
              aria-label="Explore the story"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <WormholeEffect
          speed={0.8}
          radius={5}
          length={20}
          color1="#4A90E2"
          color2="#50E3C2"
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12">
              The Story
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <StoryCard
                    title={chapter.title}
                    content={chapter.content}
                    image={chapter.image}
                    imageAlt={`Illustration for ${chapter.title}`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-16 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12">
              Timeline
            </h2>
            <Timeline />
          </motion.div>
        </div>
      </section>

      {/* Chapter Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12">
              Begin Reading
            </h2>
            <ChapterSection />
          </motion.div>
        </div>
      </section>

      <TimeDistortionEffect
        trigger={showTimeEffect}
        intensity={1.5}
        duration={2}
        color="#4A90E2"
        onComplete={() => setShowTimeEffect(false)}
      />
    </div>
  );
};

export default Index;