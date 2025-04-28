import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import SignInPage from "./Pages/sign-in-page";
import AboutPage from "./Pages/About";
import ContactPage from "./Pages/Contact";
import { ThemeProvider } from "./components/ui/theme-provider";
import ProductPage from "./ProductPage/ProductPage";
import ProtectedRoute from "./ProductPage/ProtectedRoute";
import SignUpPage from "./Pages/sign-up-page";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import AnalysisResults from "./ProductPage/AnalysisResults";
import ArtworkHistoryPage from "./ProductPage/ArtWorkHistoryPage";
import StorySlideshowPage from "./ProductPage/SlideShowPage";
import PinsPage from "./ProductPage/PinsPage";
import ReactGA from "react-ga4";

ReactGA.initialize("G-YY6K33P76Q");
ReactGA.send("pageview");
function App() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      console.log("User ID:", user.id);
      console.log("User Name:", user.fullName || `${user.firstName} ${user.lastName}`);
    }
  }, [user]); // Runs whenever the user object changes

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          {/* Protected Routes */}
          <Route
            path="/product"
            element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/results" element={<AnalysisResults />} />
          <Route path="/history" element={
            <ProtectedRoute>
              <ArtworkHistoryPage />
            </ProtectedRoute>
            
            } />
             <Route path="/slideshow" element={<StorySlideshowPage />} />
             <Route path="/pins" element={<PinsPage />} />
            

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
