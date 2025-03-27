// src/components/ProtectedRoute.tsx

import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  if (!isSignedIn) {
    navigate("/sign-in?redirect_url=" + encodeURI(window.location.href));
    return null;
  }
  
  return children;
};

export default ProtectedRoute;