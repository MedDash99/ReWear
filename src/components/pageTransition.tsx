// components/PageTransition.tsx (or a suitable path like lib/animations/PageTransition.js)
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait"> {/* 'wait' makes one page animate out before the new one animates in */}
      <motion.div
        key={pathname} // Important: A unique key tells AnimatePresence the child has changed
        initial={{ opacity: 0, y: 15 }} // Start slightly down and faded out
        animate={{ opacity: 1, y: 0 }}  // Animate to full opacity and original position
        exit={{ opacity: 0, y: -15 }} // Exit by fading out and moving slightly up
        transition={{ duration: 0.25, ease: "easeInOut" }} // Animation speed and style
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;