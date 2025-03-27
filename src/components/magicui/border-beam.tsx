"use client";

import { cn } from "@/lib/utils";
import { motion, MotionStyle, Transition } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  initialOffset?: number;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",    
  transition,
  style,
  reverse = false,
  initialOffset = 0,
}: BorderBeamProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid SSR mismatch for theme detection
  useEffect(() => setMounted(true), []);

  const darkModeColorFrom = "#f59e0b";  // Brighter for dark backgrounds
  const darkModeColorTo = "#8b5cf6";    // More vibrant for dark mode

  if (!mounted) return null;

  return (
    <div className="blur-sm pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn(
          "absolute aspect-square",
          "bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": theme === "dark" ? darkModeColorFrom : colorFrom,
            "--color-to": theme === "dark" ? darkModeColorTo : colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
}
