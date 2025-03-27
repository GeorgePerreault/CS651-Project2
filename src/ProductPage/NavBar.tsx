import { ModeToggle } from "../components/ui/mode-toggle"
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { History } from 'lucide-react';
const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="bg-transparent bg-opacity-30 backdrop-blur-md fixed top-0 left-0 right-0 border-b flex items-center justify-between px-6 h-16 w-full z-50">
      <div className="flex items-center gap-2 ml-auto">
      <Link to="/" className="font-bold text-xl">
        VisionCloud
      </Link>
      {user && (
        <Link to="/history" className="flex items-center gap-2">
          <History className="h-5 w-5" />
          History
        </Link>
      )}
        <ModeToggle />
       
        <UserButton /> <span className="text-lg">{user?.firstName}</span>
      </div>
    </nav>
  );
};

export default Navbar;
