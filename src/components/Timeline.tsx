import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const timelineEvents = [
  {
    year: "2157",
    title: "First Contact",
    description: "The Aethel make first contact through their temporal probes, revealing themselves as humanity's distant descendants.",
    image: "/images/first-contact.png"
  },
  {
    year: "2158",
    title: "The Warning",
    description: "Through complex temporal communications, the Aethel warn humanity about an approaching asteroid invisible to current technology.",
    image: "/images/warning.png"
  },
  {
    year: "2159",
    title: "Global Unity",
    description: "Nations worldwide unite under the guidance of the Temporal Defense Initiative to prepare for the impending threat.",
    image: "/images/unity.png"
  },
  {
    year: "2160",
    title: "Technological Leap",
    description: "Using encrypted messages from the future, humanity begins developing advanced detection and defense systems.",
    image: "/images/tech.png"
  },
  {
    year: "2161",
    title: "The Harbinger Appears",
    description: "The asteroid, dubbed 'The Harbinger', is finally detected by Earth's new detection systems.",
    image: "/images/harbinger.png"
  }
];

const TimelineEvent = ({ event, index }: { event: typeof timelineEvents[0], index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative pl-12 pb-12"
    >
      <div className="absolute left-0 w-8 h-8 rounded-full bg-space-black border-2 border-space-blue flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-space-blue animate-pulse" />
      </div>
      
      <div className="bg-space-black/40 p-6 rounded-lg border border-space-blue/20 backdrop-blur-sm hover:bg-space-black/60 transition-all duration-300">
        <span className="text-space-blue font-mono text-xl">{event.year}</span>
        <h3 className="text-2xl font-bold text-white mt-2">{event.title}</h3>
        
        <div className="mt-4 aspect-video rounded-lg overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <p className="text-gray-300 mt-4 leading-relaxed">{event.description}</p>
      </div>
    </motion.div>
  );
};

const Timeline = () => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-space-blue/30" />
      {timelineEvents.map((event, index) => (
        <TimelineEvent key={event.year} event={event} index={index} />
      ))}
    </div>
  );
};

export default Timeline;