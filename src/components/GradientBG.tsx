import { motion } from "framer-motion";

/**
 * Full-screen animated gradient blobs under the main content.
 * Respects prefers-reduced-motion automatically via framer-motion.
 */
export function GradientBG() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-30 overflow-hidden bg-[#0B0F19]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.22),transparent_55%)]" />
      <motion.div
        className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-accent-violet/35 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-accent-cyan/35 blur-3xl"
        animate={{ x: [0, -30, 30, 0], y: [0, 20, -25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-mint/28 blur-3xl"
        animate={{ x: [0, 15, -15, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
