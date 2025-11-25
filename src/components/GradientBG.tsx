// src/components/GradientBG.tsx
import { motion } from "framer-motion";

/**
 * App background:
 * - No video
 * - Dark navy base + subtle purple / cyan blobs
 * - Keeps foreground cards and text crisp and readable
 */
export function GradientBG() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-30 overflow-hidden bg-[#020617]"
    >
      {/* Static gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.25),transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.22),transparent_60%)]" />

      {/* Subtle animated blobs */}
      <motion.div
        className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-accent-violet/32 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-accent-cyan/30 blur-3xl"
        animate={{ x: [0, -30, 30, 0], y: [0, 20, -25, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-mint/26 blur-3xl"
        animate={{ x: [0, 15, -15, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
