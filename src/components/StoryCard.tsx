import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StoryCardProps {
  title: string;
  content: string;
  image: string;
  index: number;
}

const StoryCard = ({ title, content, image, index }: StoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative p-6 rounded-lg backdrop-blur-md",
        "border border-space-blue/20 bg-space-black/40",
        "hover:bg-space-black/60 transition-all duration-300",
        "group cursor-pointer"
      )}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-space-blue/10 to-space-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="aspect-video rounded-lg overflow-hidden mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <h3 className="text-xl font-bold text-space-blue mb-2">{title}</h3>
      <p className="text-gray-300">{content}</p>
    </motion.div>
  );
};

export default StoryCard;