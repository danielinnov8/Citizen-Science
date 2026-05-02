import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-light)] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="absolute w-[150vw] h-[150vh] flex flex-wrap gap-4 opacity-10 justify-center items-center"
        initial={{ rotate: -5, scale: 1.2 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 4, ease: "easeOut" }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-primary)] w-32 h-32 rounded-2xl" />
        ))}
      </motion.div>

      <div className="z-10 flex flex-col items-center">
        <motion.h1 
          className="text-[7vw] font-bold text-[var(--color-text-primary)] text-center leading-tight" 
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ y: 50, opacity: 0, rotateX: 30 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          We have a lab.
        </motion.h1>
        
        <motion.p
          className="text-[2vw] text-[var(--color-text-secondary)] mt-4 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Actually, we have all of them.
        </motion.p>
      </div>
    </motion.div>
  );
}