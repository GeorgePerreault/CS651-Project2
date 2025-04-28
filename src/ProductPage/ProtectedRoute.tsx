// src/components/ProtectedRoute.tsx

import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

// If user is signed in we allow them to access anything wrapped inside the node,
// otherwise we redirect them to a sign in page
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