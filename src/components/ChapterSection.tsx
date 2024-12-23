import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronRight, BookOpen } from "lucide-react";

const chapters = [
  {
    id: 1,
    title: "Introduction to the Future Selves",
    content: "The story begins with humanity's first contact with the Aethel, our own future descendants. These advanced beings have mastered temporal communication and technology beyond our current understanding. Following a catastrophic event in their timeline, they made the crucial decision to reach back through time to prevent this disaster, carefully deploying Temporal Probes to send encoded messages to Earth while avoiding direct interference that could disrupt the timeline.",
    image: "/images/future-selves.png",
    quote: "The future whispers to its past, a paradox of time and consciousness.",
    sections: [
      "Introduction to the Aethel",
      "A Society of Technological Mastery",
      "The Catastrophe and Decision to Intervene",
      "Deploying the Temporal Probes"
    ]
  },
  {
    id: 2,
    title: "The Alien Probes",
    content: "Advanced probes appear throughout the solar system, using complex patterns of light and electromagnetic radiation to convey warnings. Each probe carries fragments of a larger message, forcing humanity to collaborate globally to piece together the puzzle. These probes represent the pinnacle of Aethel technology, designed to monitor and guide humanity while maintaining temporal stability.",
    image: "/images/probes-detail.png",
    quote: "In the dance of light and shadow, our future selves reach across time.",
    sections: [
      "Probes: Design and Capabilities",
      "Discovering the Asteroid Threat",
      "Advanced Aethel Technology"
    ]
  },
  {
    id: 3,
    title: "The Imminent Asteroid Threat",
    content: "The Harbinger, a massive asteroid composed of unique light-absorbing materials, approaches Earth on a collision course. Its unusual composition makes it nearly invisible to conventional detection methods, representing an extinction-level threat. The Aethel's warning provides crucial details about its trajectory and characteristics, leading to unprecedented collaboration between humans and their future selves.",
    image: "/images/asteroid-detail.png",
    quote: "Sometimes the greatest dangers are the ones we cannot see.",
    sections: [
      "Characteristics and Trajectory",
      "Recruiting Mother Ships",
      "Human Preparations and Collaboration"
    ]
  },
  {
    id: 4,
    title: "Ensuring Peaceful Communication",
    content: "As communication between humans and Aethel progresses, challenges arise. Misinterpretations and cultural differences threaten to disrupt the fragile peace. Strategies are developed to ensure harmony, including cultural exchange programs that foster mutual understanding and respect.",
    image: "/images/peaceful-communication.png",
    quote: "In understanding, we find peace.",
    sections: [
      "Communication Challenges",
      "Strategies for Harmony",
      "Cultural Exchange Programs"
    ]
  },
  {
    id: 5,
    title: "Preparing for the Encounter",
    content: "With the encounter approaching, both scientific and governmental responses intensify. The Aethel adapt their plans for better interaction with humans, while efforts to inform and prepare the public about the upcoming encounter are ramped up.",
    image: "/images/preparing-encounter.png",
    quote: "Preparation is the key to success.",
    sections: [
      "Scientific and Governmental Responses",
      "Aethel Adaptation Plans",
      "Public Awareness Efforts"
    ]
  },
  {
    id: 6,
    title: "The First Encounter",
    content: "The moment arrives for the first meeting between humans and Aethel. Overcoming communication barriers and building trust are paramount. Emotional responses from both sides highlight the significance of this historic event.",
    image: "/images/first-encounter.png",
    quote: "Trust is built in the silence between words.",
    sections: [
      "The Initial Meeting",
      "Overcoming Barriers and Building Trust",
      "Emotional Responses and Perspectives"
    ]
  },
  {
    id: 7,
    title: "The Role of the Probes",
    content: "As the encounter unfolds, the probes continue their operations to support communication and monitoring. Collaborative efforts are made to prevent the asteroid impact, ensuring the safety of both humans and Aethel.",
    image: "/images/role-of-probes.png",
    quote: "Guidance from the past shapes our future.",
    sections: [
      "Operations and Support",
      "Preventing the Asteroid Impact",
      "Ongoing Surveillance and Analysis"
    ]
  },
  {
    id: 8,
    title: "Recruitment of Mother Ships",
    content: "Plans for recruiting mother ships for planetary takeovers are detailed. Strategies to handle resistance and conflicts during expansion are discussed, navigating cultural differences and technological integration.",
    image: "/images/recruitment-mother-ships.png",
    quote: "Unity in diversity is our strength.",
    sections: [
      "Expansion Plans",
      "Handling Resistance and Conflicts",
      "Cultural and Technological Integration"
    ]
  },
  {
    id: 9,
    title: "Future of Both Races",
    content: "Post-encounter, both societies evolve and change. Key takeaways from the experience shape future collaboration plans, ensuring a brighter future for both humans and Aethel.",
    image: "/images/future-of-races.png",
    quote: "Together, we can forge a new destiny.",
    sections: [
      "Post-Encounter Evolution",
      "Lessons Learned",
      "Future Collaboration Plans"
    ]
  },
  {
    id: 10,
    title: "Conclusion",
    content: "The events of the encounter leave a lasting impact. A summary of the significance of these events sets the stage for potential sequels or further exploration, highlighting the long-term impact and lessons for future generations.",
    image: "/images/conclusion.png",
    quote: "Every ending is a new beginning.",
    sections: [
      "Summary and Significance",
      "Epilogue and Future Exploration",
      "Long-Term Impact and Lessons"
    ]
  }
];

const ChapterSection = () => {
  const [activeChapter, setActiveChapter] = useState(1);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const handleChapterChange = (chapterId: number) => {
    setActiveChapter(chapterId);
    setExpandedSections([]);
  };

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => 
      prev.includes(sectionIndex) 
        ? prev.filter(i => i !== sectionIndex)
        : [...prev, sectionIndex]
    );
  };

  return (
    <section className="relative py-24 overflow-hidden bg-space-black/95">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 text-space-blue"
        >
          Echoes of Tomorrow
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
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-space-blue" />
                    <h3 className="text-xl font-bold text-space-blue">
                      Chapter {chapter.id}
                    </h3>
                  </div>
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
                    
                    <p className="text-gray-300 leading-relaxed text-lg mb-8">
                      {chapter.content}
                    </p>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-space-blue mb-4">
                        Chapter Sections
                      </h4>
                      {chapter.sections.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={false}
                          animate={{ 
                            backgroundColor: expandedSections.includes(index) 
                              ? "rgba(74, 144, 226, 0.1)" 
                              : "rgba(10, 14, 23, 0.4)"
                          }}
                          className="border border-space-blue/20 rounded-lg p-4 cursor-pointer"
                          onClick={() => toggleSection(index)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">{section}</span>
                            <ChevronRight 
                              className={`transform transition-transform ${
                                expandedSections.includes(index) ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
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
