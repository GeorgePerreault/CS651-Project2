"use client";

import Navbar from "./NavBar";
import { Search, Layers, PenTool, Zap, Sparkles, Feather, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import FloatingIcon from "./FloatingIcon"; // Updated component with motion

const CommunityPage = () => {
  const appIcons = [
    {
      element: (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <PenTool className="text-white w-6 h-6" />
        </div>
      ),
      position: { top: "12%", left: "20%" },
      size: 56,
      delay: 0,
    },
    {
      element: (
        <div className="w-full h-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
          <Layers className="text-white w-6 h-6" />
        </div>
      ),
      position: { top: "20%", left: "25%" },
      size: 48,
      delay: 1,
    },
    {
      element: (
        <div className="w-full h-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center">
          <Zap className="text-white w-6 h-6" />
        </div>
      ),
      position: { top: "12%", right: "25%" },
      size: 52,
      delay: 2,
    },
    {
      element: (
        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
          <Feather className="text-white w-6 h-6" />
        </div>
      ),
      position: { top: "20%", right: "20%" },
      size: 60,
      delay: 3,
    },
    {
      element: (
        <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center">
          <Sparkles className="text-white w-6 h-6" />
        </div>
      ),
      position: { bottom: "20%", left: "25%" },
      size: 50,
      delay: 4,
    },
    {
      element: (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center">
          <Camera className="text-white w-6 h-6" />
        </div>
      ),
      position: { bottom: "15%", right: "25%" },
      size: 54,
      delay: 5,
    },
  ];

  return (
    <>
      <Navbar />
      <div
        className="relative flex flex-col items-center justify-start pt-20 mt-[68px] p-20"
        style={{
          background: "radial-gradient(circle, rgba(0,55,176,1) 0%, rgba(10,11,40,1) 77%)",
        }}
      >
        {/* Render floating icons */}
        {appIcons.map((icon, index) => (
          <FloatingIcon
            key={index}
            icon={icon.element}
            position={icon.position}
            size={icon.size}
            delay={icon.delay}
            amplitude={Math.random() * 10 + 10} // Random amplitude between 10-20
            duration={Math.random() * 2 + 4}   // Random duration between 4-6 seconds
          />
          
        ))}

        {/* Heading & description */}
        <div className="text-center mb-8">
          <h3 className="scroll-m-20 text-3xl text-white font-semibold tracking-tight">
            Discover community-made{" "}
            <span className="text-gray-400">stories</span>,{" "}
            <span className="text-purple-400">artwork</span>, and more
          </h3>
          <p className="text-gray-400 text-lg">
            Find inspiration and share your creative journey with the VisionCloud community
          </p>
        </div>

        {/* Search bar with icon inside the input */}
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <Input
            type="text"
            placeholder="Search for resources like 'portrait photography'"
            className="rounded-full pl-10"
          />
        </div>
       
      </div>
      <div>

      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Featured Stories
        </h2>
      </div>
      
    </>
  );
};

export default CommunityPage;
