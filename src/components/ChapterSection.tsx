import { motion } from "framer-motion";
import { useState } from "react";

const chapters = [
  {
    id: 1,
    title: "Introduction to the Future Selves",
    content: "The Aethel, humanity's far-flung descendants, discover a way to communicate across time. Their advanced society has mastered spacetime manipulation but carries the burden of a catastrophic event in their past - our present.",
    image: "/images/future-selves.png"
  },
  {
    id: 2,
    title: "The Alien Probes",
    content: "Advanced temporal probes are deployed throughout the solar system, using complex patterns of light and electromagnetic radiation to convey warnings without directly interfering with the timeline.",
    image: "/images/probes-detail.png"
  },
  {
    id: 3,
    title: "The Imminent Asteroid Threat",
    content: "The Harbinger, a massive asteroid composed of light-absorbing materials, approaches Earth on a collision course that could trigger devastating global conflict.",
    image: "/images/asteroid-detail.png"
  }
];

const ChapterSection = () => {
  const [activeChapter, setActiveChapter] = useState(1);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Chapters</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapter Navigation */}
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <motion.button
                key={chapter.id}
                onClick={() => setActiveChapter(chapter.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                  activeChapter === chapter.id
                    ? "bg-space-blue/20 border border-space-blue"
                    : "bg-space-black/40 border border-space-blue/20 hover:bg-space-black/60"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-xl font-bold text-space-blue mb-2">
                  Chapter {chapter.id}
                </h3>
                <p className="text-gray-300">{chapter.title}</p>
              </motion.button>
            ))}
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-2">
            {chapters.map((chapter) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: activeChapter === chapter.id ? 1 : 0,
                  x: activeChapter === chapter.id ? 0 : 20,
                }}
                className={`${
                  activeChapter === chapter.id ? "block" : "hidden"
                } bg-space-black/40 border border-space-blue/20 rounded-lg p-6`}
              >
                <h3 className="text-2xl font-bold text-space-blue mb-4">
                  {chapter.title}
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden mb-6">
                  <img
                    src={chapter.image}
                    alt={chapter.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-300 leading-relaxed">{chapter.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChapterSection;