import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function AnimatedBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax: blobs move slower than scroll (desktop only)
  const blob1Y = useTransform(scrollY, [0, 1000], [0, -120]);
  const blob2Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const blob3Y = useTransform(scrollY, [0, 1000], [0, -60]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isMobile) {
    return (
      <div className="animated-bg">
        <div className="animated-bg-extra" />
      </div>
    );
  }

  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      <motion.div
        style={{ y: blob1Y }}
        className="absolute w-[600px] h-[600px] rounded-full top-[-200px] right-[-100px] opacity-[0.15] will-change-transform"
        aria-hidden
      >
        <div className="w-full h-full rounded-full bg-primary blur-[120px] animate-[float-blob_20s_ease-in-out_infinite]" />
      </motion.div>
      <motion.div
        style={{ y: blob2Y }}
        className="absolute w-[500px] h-[500px] rounded-full bottom-[-200px] left-[-100px] opacity-[0.15] will-change-transform"
        aria-hidden
      >
        <div className="w-full h-full rounded-full bg-[hsl(220_70%_50%)] blur-[120px] animate-[float-blob_20s_ease-in-out_infinite_-10s]" />
      </motion.div>
      <motion.div
        style={{ y: blob3Y }}
        className="absolute w-[400px] h-[400px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.1] will-change-transform"
        aria-hidden
      >
        <div className="w-full h-full rounded-full bg-[hsl(271_81%_66%)] blur-[120px] animate-[float-blob_25s_ease-in-out_infinite_reverse]" />
      </motion.div>
    </div>
  );
}
