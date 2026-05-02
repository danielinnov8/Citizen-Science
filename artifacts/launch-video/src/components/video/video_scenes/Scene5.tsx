import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const cycles = [
  { prompt: "Test my drinking water", module: "Water Quality", lab: "Tap Score", color: "var(--color-primary)" },
  { prompt: "How does light affect plant growth?", module: "Plant Science", lab: "At-Home Lab", color: "var(--color-secondary)" },
  { prompt: "Measure local air pollution", module: "Env Science", lab: "PurpleAir", color: "var(--color-accent)" },
];

export function Scene5() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle(c => (c + 1) % cycles.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-light)]"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-[60vw] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-[var(--color-bg-muted)] overflow-hidden flex flex-col">
        <div className="p-12 flex flex-col gap-8 items-center justify-center min-h-[50vh]">
          
          <motion.div 
            key={`prompt-${cycle}`}
            className="text-[2.5vw] font-bold text-center w-full"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            "{cycles[cycle].prompt}"
          </motion.div>

          <div className="flex gap-6 mt-8">
            <motion.div 
              key={`module-${cycle}`}
              className="px-6 py-3 rounded-full text-[1.2vw] font-semibold border flex items-center shadow-sm bg-white"
              style={{ borderColor: cycles[cycle].color, color: cycles[cycle].color }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              MODULE · {cycles[cycle].module}
            </motion.div>
            
            <motion.div 
              key={`lab-${cycle}`}
              className="px-6 py-3 rounded-xl text-[1.2vw] font-bold text-white shadow-md flex items-center"
              style={{ backgroundColor: cycles[cycle].color }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Lab: {cycles[cycle].lab}
            </motion.div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}