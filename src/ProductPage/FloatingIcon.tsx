"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Position {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

interface FloatingIconProps {
  icon: React.ReactNode;
  position: Position;
  size: number;
  delay?: number;
  amplitude?: number;
  duration?: number;
  glowColor?: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({
  icon,
  position,
  size,
  delay = 0,
  amplitude = 15,
  duration = 5,
  glowColor = "rgba(255, 255, 255, 0.3)",
}) => {
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setRandomOffset({
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
    });
  }, []);

  // File is not actually used anywhere in the final build
  return (
    <motion.div
      className="absolute"
      style={{
        ...position,
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.2, duration: 0.5 }}
    >
      <motion.div
        animate={{
          y: [0, amplitude + randomOffset.y, 0],
          x: [0, randomOffset.x, 0],
          rotate: [0, randomOffset.x > 0 ? 5 : -5, 0],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay * 0.1,
        }}
        className="relative w-full h-full"
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-xl blur-xl opacity-70"
          style={{
            boxShadow: `0 0 20px 2px ${glowColor}`,
            transform: "scale(1.15)",
          }}
        >
          {icon}
        </div>

        {/* Main icon */}
        <div className="relative w-full h-full rounded-xl shadow-lg overflow-hidden z-10">
          {icon}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FloatingIcon;