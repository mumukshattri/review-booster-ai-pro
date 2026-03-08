import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/reviewboost-logo.jpg";

interface DashboardIntroProps {
  onComplete: () => void;
}

// Particle component
function Particle({ index, phase }: { index: number; phase: "gather" | "explode" }) {
  const angle = (index / 40) * Math.PI * 2;
  const radius = 8 + Math.random() * 4;
  const delay = Math.random() * 0.3;
  const size = 3 + Math.random() * 4;

  // Directions for stat cards: left, top, right, bottom
  const cardDirections = [
    { x: -600, y: 0 },
    { x: 0, y: -400 },
    { x: 600, y: 0 },
    { x: 0, y: 400 },
  ];
  const dir = cardDirections[index % 4];

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `hsl(${263 + Math.random() * 20}, ${70 + Math.random() * 15}%, ${55 + Math.random() * 20}%)`,
        boxShadow: `0 0 ${size * 2}px hsl(263 70% 58% / 0.6)`,
        left: "50%",
        top: "50%",
      }}
      initial={{
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        opacity: 0,
        scale: 0,
      }}
      animate={
        phase === "gather"
          ? {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
              opacity: [0, 1, 1],
              scale: [0, 1.2, 1],
            }
          : {
              x: dir.x * (0.3 + Math.random() * 0.7),
              y: dir.y * (0.3 + Math.random() * 0.7),
              opacity: [1, 0.8, 0],
              scale: [1, 0.5, 0],
            }
      }
      transition={{
        duration: phase === "gather" ? 0.8 : 0.8,
        delay: phase === "gather" ? delay : delay * 0.5,
        ease: phase === "gather" ? "easeOut" : "easeIn",
      }}
    />
  );
}

export function DashboardIntro({ onComplete }: DashboardIntroProps) {
  const [phase, setPhase] = useState<"logo" | "explode" | "build" | "done">("logo");

  const skip = useCallback(() => {
    setPhase("done");
    setTimeout(onComplete, 100);
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("explode"), 1200),
      setTimeout(() => setPhase("build"), 2200),
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background cursor-pointer"
        onClick={skip}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background particles floating */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`bg-${i}`}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Logo phase */}
        {(phase === "logo" || phase === "explode") && (
          <div className="relative">
            {/* Glow behind logo */}
            <motion.div
              className="absolute inset-0 -m-8 rounded-3xl"
              style={{
                background: "radial-gradient(circle, hsl(263 70% 58% / 0.4) 0%, transparent 70%)",
              }}
              animate={{
                scale: phase === "logo" ? [1, 1.2, 1] : [1, 3],
                opacity: phase === "logo" ? [0.4, 0.8, 0.4] : [0.8, 0],
              }}
              transition={{
                duration: phase === "logo" ? 1.5 : 0.6,
                repeat: phase === "logo" ? Infinity : 0,
              }}
            />

            {/* Logo */}
            <motion.img
              src={logoImg}
              alt="ReviewBoost"
              className="w-24 h-24 rounded-2xl relative z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={
                phase === "logo"
                  ? { scale: 1, rotate: 0 }
                  : { scale: [1, 1.3, 0], rotate: [0, 0, 180], opacity: [1, 1, 0] }
              }
              transition={{
                duration: phase === "logo" ? 0.8 : 0.6,
                ease: phase === "logo" ? [0.34, 1.56, 0.64, 1] : "easeIn",
              }}
            />

            {/* Explosion particles */}
            {phase === "explode" && (
              <>
                {Array.from({ length: 40 }).map((_, i) => (
                  <Particle key={i} index={i} phase="explode" />
                ))}
              </>
            )}

            {/* Gather particles around logo */}
            {phase === "logo" && (
              <>
                {Array.from({ length: 40 }).map((_, i) => (
                  <Particle key={i} index={i} phase="gather" />
                ))}
              </>
            )}
          </div>
        )}

        {/* Build phase - stat cards fly in */}
        {phase === "build" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Stat card placeholders flying in */}
            {[
              { label: "Total Sent", from: { x: -800, y: 0 }, delay: 0 },
              { label: "Open Rate", from: { x: 0, y: -600 }, delay: 0.1 },
              { label: "Click Rate", from: { x: 800, y: 0 }, delay: 0.2 },
              { label: "Customers", from: { x: 0, y: 600 }, delay: 0.3 },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="absolute glass-card p-6 w-40"
                style={{
                  left: `${20 + i * 17}%`,
                  top: "45%",
                }}
                initial={{ x: card.from.x, y: card.from.y, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: card.delay,
                }}
              >
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  {card.label}
                </div>
                <div className="text-2xl font-black text-foreground">—</div>
              </motion.div>
            ))}

            {/* Sidebar sliding in */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-16 bg-sidebar border-r border-sidebar-border"
              initial={{ x: -80 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Top bar dropping */}
            <motion.div
              className="absolute left-16 top-0 right-0 h-14 bg-background/60 border-b border-border/30 backdrop-blur-xl"
              initial={{ y: -60 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        )}

        {/* Skip hint */}
        <motion.p
          className="absolute bottom-8 text-xs text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Click anywhere to skip
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
