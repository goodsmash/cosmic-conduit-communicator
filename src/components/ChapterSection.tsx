import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const chapters = [
  {
    id: 1,
    title: "Echoes from Tomorrow",
    content: "In 2157, humanity's first encounter with the Aethel begins through mysterious temporal signals. Scientists worldwide struggle to decode messages that seem to defy the laws of physics, eventually realizing they're communicating with their own descendants.",
    image: "/images/future-selves.png",
    quote: "The future whispers to its past, a paradox of time and consciousness."
  },
  {
    id: 2,
    title: "The Temporal Messengers",
    content: "Advanced probes appear throughout the solar system, using complex patterns of light and electromagnetic radiation to convey warnings. Each probe carries fragments of a larger message, forcing humanity to collaborate globally to piece together the puzzle.",
    image: "/images/probes-detail.png",
    quote: "In the dance of light and shadow, our future selves reach across time."
  },
  {
    id: 3,
    title: "Dark Horizon",
    content: "The Harbinger, a massive asteroid composed of light-absorbing materials, approaches Earth on a collision course. Its unique composition makes it nearly invisible to conventional detection methods, representing an extinction-level threat.",
    image: "/images/asteroid-detail.png",
    quote: "Sometimes the greatest dangers are the ones we cannot see."
  }
];

const ChapterSection = () => {
  const [activeChapter, setActiveChapter] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChapterChange = (chapterId: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveChapter(chapterId);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 text-space-blue"
        >
          The Story Unfolds
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapter Navigation */}
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <motion.button
                key={chapter.id}
                onClick={() => handleChapterChange(chapter.id)}
                className={`w-full text-left p-6 rounded-lg transition-all duration-300 ${
                  activeChapter === chapter.id
                    ? "bg-space-blue/20 border-2 border-space-blue"
                    : "bg-space-black/40 border border-space-blue/20 hover:bg-space-black/60"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-space-blue">
                    Chapter {chapter.id}
                  </h3>
                  <ChevronRight 
                    className={`transform transition-transform ${
                      activeChapter === chapter.id ? "rotate-90" : ""
                    }`} 
                  />
                </div>
                <p className="text-gray-300 mt-2">{chapter.title}</p>
              </motion.button>
            ))}
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {chapters.map((chapter) => (
                chapter.id === activeChapter && (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-space-black/40 border border-space-blue/20 rounded-lg p-8"
                  >
                    <h3 className="text-3xl font-bold text-space-blue mb-6">
                      {chapter.title}
                    </h3>
                    
                    <div className="aspect-video rounded-lg overflow-hidden mb-8">
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <blockquote className="border-l-4 border-space-blue pl-4 mb-6 italic text-gray-300">
                      "{chapter.quote}"
                    </blockquote>
                    
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {chapter.content}
                    </p>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChapterSection;