import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene3() {
  const [typedText, setTypedText] = useState("");
  const fullText = "I want to sequence my dog's DNA";

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current <= fullText.length) {
        setTypedText(fullText.slice(0, current));
        current++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-light)]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-[60vw] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-[var(--color-bg-muted)] overflow-hidden flex flex-col">
        <div className="h-12 border-b border-[var(--color-bg-muted)] flex items-center px-6 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="mx-auto text-sm font-medium text-[var(--color-text-muted)] font-display">Citizen Science</div>
        </div>
        
        <div className="p-12 flex flex-col gap-8 min-h-[40vh]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">U</div>
            <div className="bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] text-[1.5vw] py-4 px-6 rounded-2xl rounded-tl-sm w-fit max-w-[80%] shadow-sm">
              {typedText}
              <motion.span 
                animate={{ opacity: [1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-[3px] h-[1em] bg-[var(--color-primary)] ml-1 align-middle"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-[var(--color-bg-muted)] bg-gray-50 flex gap-4">
          <div className="flex-1 bg-white border border-[var(--color-bg-muted)] rounded-full h-14" />
          <div className="w-14 h-14 bg-[var(--color-primary)] rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}