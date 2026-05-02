import { motion } from 'framer-motion';

const modules = [
  "Biology", "Microbiology", "Plant Science", "Environmental Science", 
  "Water Quality", "Chemistry", "Physics", "Human Health", 
  "Agriculture", "Neuroscience", "Climate Science", "Astronomy", 
  "Materials Science", "Food Science"
];

export function Scene6() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-dark)]"
      initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="w-[90vw] h-[80vh] flex flex-wrap gap-4 justify-center items-center content-center">
        {modules.map((mod, i) => (
          <motion.div
            key={mod}
            className="px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white text-[2vw] font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: i * 0.1, 
              type: "spring",
              bounce: 0.4
            }}
          >
            {mod}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}