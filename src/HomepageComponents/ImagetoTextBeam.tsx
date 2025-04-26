"use client"

import type React from "react"
import { forwardRef, useRef } from "react"
import one from "../assets/1.jpg"
import { cn } from "@/lib/utils"
// import { AnimatedBeam } from "../components/magicui/animated-beam"

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          className,
        )}
      >
        {children}
      </div>
    )
  },
)

Circle.displayName = "Circle"

export default function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageBottomRef = useRef<HTMLDivElement>(null) // Reference for the bottom of the image
  const textRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative flex w-full max-w-[500px] items-center justify-center overflow-hidden p-10 min-h-[500px]"
      ref={containerRef}
    >
      <div className="flex size-full flex-col items-center justify-between gap-20">
        {/* Image container */}
        <div
          ref={imageRef}
          className="z-10 h-80 w-[100px] overflow-hidden rounded-lg shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] relative"
        >
          <img src={one} alt="User" className="h-80 w-100 object-cover" />
          {/* Invisible div at the bottom of the image to serve as beam starting point */}
          <div ref={imageBottomRef} className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1"></div>
        </div>

        {/* Text div */}
        <div
          ref={textRef}
          className="z-10 rounded-lg bg-black text-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] border-2 mt-8"
        >
          <p className="text-sm font-medium">Hello there!</p>
        </div>
      </div>

      
    </div>
  )
}


