import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [replyText, setReplyText] = useState("");
  const fullReply = "That's a great idea! Dog DNA sequencing can tell you about breed mix, genetic health risks, and traits. I recommend starting with Biology.";
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current <= fullReply.length) {
        setReplyText(fullReply.slice(0, current));
        current++;
      } else {
        clearInterval(interval);
        setPhase(1);
      }
    }, 30);

    const timers = [
      setTimeout(() => setPhase(2), 4500),
    ];

    return () => {
      clearInterval(interval);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-light)]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[60vw] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-[var(--color-bg-muted)] overflow-hidden flex flex-col">
        <div className="h-12 border-b border-[var(--color-bg-muted)] flex items-center px-6 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="mx-auto text-sm font-medium text-[var(--color-text-muted)] font-display">Citizen Science</div>
        </div>
        
        <div className="p-12 flex flex-col gap-8 min-h-[40vh] relative">
          <div className="flex gap-4 opacity-50">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex-shrink-0 flex items-center justify-center font-bold text-[var(--color-text-secondary)]">U</div>
            <div className="bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] text-[1.5vw] py-4 px-6 rounded-2xl rounded-tl-sm w-fit max-w-[80%]">
              I want to sequence my dog's DNA
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex-shrink-0 flex items-center justify-center font-bold">CS</div>
            <div className="flex flex-col gap-4 w-full">
              <div className="text-[var(--color-text-primary)] text-[1.5vw] py-2 w-fit max-w-[90%] leading-relaxed">
                {replyText}
              </div>
              
              {phase >= 1 && (
                <div className="flex gap-4 mt-2">
                  <motion.div 
                    className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold px-4 py-2 rounded-full text-[1vw] border border-[var(--color-accent)]/20 w-fit flex items-center shadow-sm"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <span className="mr-2 opacity-70">MODULE</span> Biology
                  </motion.div>
                </div>
              )}

              {phase >= 1 && (
                <motion.div 
                  className="mt-4 bg-white border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-lg w-[20vw] flex flex-col gap-4 relative overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-primary)]" />
                  <div className="font-bold text-[1.2vw]">Embark Vet</div>
                  <div className="text-[1vw] text-[var(--color-text-secondary)]">Dog DNA test kit for breed identification and health.</div>
                  <div className="text-[0.9vw] font-semibold text-[var(--color-primary)] mt-2">Order Lab Kit →</div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}