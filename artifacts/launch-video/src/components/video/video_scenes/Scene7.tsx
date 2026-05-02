import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-light)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="flex flex-col items-center z-10 text-center">
        <motion.h2 
          className="text-[3vw] text-[var(--color-text-secondary)] font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Any citizen can be a scientist.
        </motion.h2>

        <motion.div
          className="mt-8 text-[7vw] font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <span className="text-gradient bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
            Citizen Science.
          </span>
        </motion.div>

        {phase >= 2 && (
          <motion.div 
            className="mt-12 w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-2xl flex items-center justify-center"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          >
            <div className="w-12 h-12 bg-white rounded-full mix-blend-overlay" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}