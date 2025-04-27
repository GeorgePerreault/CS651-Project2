"use client";

import { ModeToggle } from "../components/ui/mode-toggle";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Upload, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="bg-transparent bg-opacity-30 backdrop-blur-md fixed top-0 left-0 right-0 border-b flex items-center justify-between px-8 py-3 w-full z-50 shadow-sm">
      {/* Left side: StoryForge */}
      <div className="flex items-center">
        <Link to="/" className="font-bold text-2xl">
        StoryForge
        </Link>
      </div>
      
      {/* Right side: Other buttons and user info */}
      <div className="flex items-center gap-4">
        {user && (
          <Link to="/history" className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Clock className="h-5 w-5" />
              My Stories
            </Button>
          </Link>
        )}
       
        <Link to="/product" className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Upload className="h-5 w-5" />
            Upload
          </Button>
        </Link>
        <ModeToggle />
        <div className="h-10 bg-border w-px" />
        <UserButton />
        <span className="text-lg">{user?.firstName}</span>
      </div>
    </nav>
  );
};

export default Navbar;
