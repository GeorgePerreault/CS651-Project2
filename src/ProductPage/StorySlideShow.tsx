"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// The actual meat of the story slide show
const StoryCarousel = ({ analysis, imageUrls, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const SLIDE_DURATION = 8000; // 8 seconds per slide

  // Build slides from the story and images
  const slides = [
    {
      title: "Introduction",
      text: analysis?.story?.introduction,
      image: imageUrls?.introduction,
    },
    {
      title: "Rising Action",
      text: analysis?.story?.rising_action,
      image: imageUrls?.rising_action,
    },
    {
      title: "Plot Twist",
      text: analysis?.story?.twist,
      image: imageUrls?.twist,
    },
    {
      title: "Climax",
      text: analysis?.story?.climax,
      image: imageUrls?.climax,
    },
    {
      title: "Resolution",
      text: analysis?.story?.resolution,
      image: imageUrls?.resolution,
    },
  ].filter((slide) => slide.text && slide.image);

  // Auto-advance slides when playing
  useEffect(() => {
    if (isPlaying) {
      setProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / SLIDE_DURATION) * 100;
        if (newProgress >= 100) {
          nextSlide();
          setProgress(0);
        } else {
          setProgress(newProgress);
        }
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSlide]);

  useEffect(() => {
    // Reset carousel state on mount
    setCurrentSlide(0);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Basic error check
  if (slides.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-gray-300">
        <p className="text-lg">No slides available</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  // Large block of text but essentially just the layout of the carousel
  return (
    <div className="min-h-screen mt-10 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl rounded-lg shadow-xl overflow-hidden">
        {/* Close Button */}
        <Button
          variant="outline"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
          <div
            className="h-1 bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col h-full">
          {/* Image Section */}
          <div className="w-full aspect-video flex items-center justify-center relative bg-black">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="object-cover w-full h-full transition-transform duration-700 ease-in-out hover:scale-105"
            />

            {/* Navigation Buttons for md+ */}
            <Button
              onClick={prevSlide}
              variant="ghost"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-white transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              onClick={nextSlide}
              variant="ghost"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          {/* Text Section (no explicit background color) */}
          <div className="w-full flex flex-col p-6 overflow-y-auto max-h-[500px]">
            <CardHeader className="pb-2">
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-lgfont-serif leading-relaxed">
                {slides[currentSlide].text}
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="transition-colors"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                    className="transition-colors"
                  >
                    {isPlaying ? (
                      <PauseCircle className="h-6 w-6" />
                    ) : (
                      <PlayCircle className="h-6 w-6" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="transition-colors"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-sm text-gray-400">
                  {currentSlide + 1} / {slides.length}
                </div>
              </div>
            </CardFooter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCarousel;
