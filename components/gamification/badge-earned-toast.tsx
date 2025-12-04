"use client";

import { Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BadgeEarnedToastProps {
  badge: {
    name: string;
    description: string;
    icon?: string;
  };
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Animated toast notification for newly earned badges
 * Shows with military-style animation and auto-dismisses after 5 seconds
 */
export function BadgeEarnedToast({
  badge,
  isVisible,
  onClose,
}: BadgeEarnedToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 300,
          }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
        >
          <div className="bg-gunmetal-light border-2 border-radar-green rounded-sm shadow-2xl overflow-hidden">
            {/* Animated Border Glow */}
            <motion.div
              className="absolute inset-0 border-2 border-radar-green rounded-sm"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Content */}
            <div className="relative p-4">
              <div className="flex items-start gap-3">
                {/* Badge Icon */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    damping: 10,
                    stiffness: 200,
                  }}
                  className="flex-shrink-0 bg-radar-green/20 rounded-full p-2 border border-radar-green"
                >
                  <Award className="h-6 w-6 text-radar-green" />
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-radar-green mb-1">
                      BADGE EARNED
                    </p>
                    <h3 className="text-base font-black uppercase tracking-tight text-white mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-xs text-steel/80">{badge.description}</p>
                  </motion.div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-steel/60 hover:text-white transition-colors"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <motion.div
                className="mt-3 h-1 bg-gunmetal rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="h-full bg-radar-green"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: 5,
                    ease: "linear",
                  }}
                  onAnimationComplete={onClose}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to show badge notifications
 * Returns a function to display a badge notification
 */
export function useBadgeNotification() {
  const [currentBadge, setCurrentBadge] = React.useState<{
    name: string;
    description: string;
    icon?: string;
  } | null>(null);

  const showBadge = React.useCallback(
    (badge: { name: string; description: string; icon?: string }) => {
      setCurrentBadge(badge);
    },
    []
  );

  const hideBadge = React.useCallback(() => {
    setCurrentBadge(null);
  }, []);

  return {
    currentBadge,
    showBadge,
    hideBadge,
  };
}

// Add React import for the hook
import * as React from "react";
