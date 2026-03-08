import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/reviewboost-logo.jpg";

interface DashboardIntroProps {
  onComplete: () => void;
  userName?: string;
}

function Particle({ index }: { index: number }) {
  const angle = (index / 40) * Math.PI * 2 + Math.random() * 0.5;
  const distance = 200 + Math.random() * 400;
  const size = 3 + Math.random() * 5;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `hsl(${258 + Math.random() * 25}, ${65 + Math.random() * 20}%, ${50 + Math.random() * 25}%)`,
        boxShadow: `0 0 ${size * 3}px hsl(263 70% 58% / 0.7)`,
        left: "50%",
        top: "50%",
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: [1, 0.8, 0],
        scale: [1, 0.6, 0],
      }}
      transition={{
        duration: 0.8,
        delay: Math.random() * 0.2,
        ease: "easeOut",
      }}
    />
  );
}

export function DashboardIntro({ onComplete, userName }: DashboardIntroProps) {
  const [phase, setPhase] = useState<"welcome" | "explode" | "build" | "done">("welcome");

  const skip = useCallback(() => {
    setPhase("done");
    setTimeout(onComplete, 50);
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("explode"), 1500),
      setTimeout(() => setPhase("build"), 2300),
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const displayName = userName || "there";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background cursor-pointer overflow-hidden"
        onClick={skip}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Floating ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`ambient-${i}`}
              className="absolute w-1 h-1 rounded-full bg-primary/20"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        {/* Welcome + Logo phase */}
        {(phase === "welcome" || phase === "explode") && (
          <div className="relative flex flex-col items-center">
            {/* Glow */}
            <motion.div
              className="absolute -inset-16 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(263 70% 58% / 0.35) 0%, transparent 65%)",
              }}
              animate={
                phase === "welcome"
                  ? { scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }
                  : { scale: [1, 4], opacity: [0.7, 0] }
              }
              transition={{
                duration: phase === "welcome" ? 1.5 : 0.7,
                repeat: phase === "welcome" ? Infinity : 0,
              }}
            />

            {/* Logo */}
            <motion.img
              src={logoImg}
              alt="ReviewBoost"
              className="w-20 h-20 rounded-2xl relative z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={
                phase === "welcome"
                  ? { scale: 1, rotate: 0 }
                  : { scale: [1, 1.2, 0], rotate: [0, 360, 360], opacity: [1, 1, 0] }
              }
              transition={{
                duration: phase === "welcome" ? 0.6 : 0.7,
                ease: phase === "welcome" ? [0.34, 1.56, 0.64, 1] : "easeIn",
              }}
            />

            {/* Explosion particles */}
            {phase === "explode" && (
              <>
                {Array.from({ length: 40 }).map((_, i) => (
                  <Particle key={i} index={i} />
                ))}
              </>
            )}

            {/* Welcome text */}
            {phase === "welcome" && (
              <motion.div
                className="mt-8 text-center relative z-10"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Welcome back, {displayName} 👋
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Let's get you more reviews
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Build phase */}
        {phase === "build" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[
              { label: "Total Sent", from: { x: -700, y: 0 }, delay: 0 },
              { label: "Open Rate", from: { x: 0, y: -500 }, delay: 0.1 },
              { label: "Click Rate", from: { x: 700, y: 0 }, delay: 0.2 },
              { label: "Customers", from: { x: 0, y: 500 }, delay: 0.3 },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="absolute glass-card p-5 w-36"
                style={{ left: `${18 + i * 18}%`, top: "42%" }}
                initial={{ x: card.from.x, y: card.from.y, opacity: 0, scale: 0.4 }}
                animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 22, delay: card.delay }}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                  {card.label}
                </div>
                <div className="text-xl font-black text-foreground">—</div>
              </motion.div>
            ))}

            {/* Sidebar */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-16 bg-sidebar border-r border-sidebar-border"
              initial={{ x: -80 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Top bar */}
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
          className="absolute bottom-8 text-xs text-muted-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Click anywhere to skip
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
