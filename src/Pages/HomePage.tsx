// import { RetroGrid } from "../components/magicui/retro-grid";
import Navbar from "@/components/ui/Navbar";
import FeatureSection from "@/HomepageComponents/FeaturesSection";
import Hero from "@/HomepageComponents/Hero";
import Footer from "@/HomepageComponents/Footer";
import { ScrollProgress } from "../components/magicui/scroll-progress"

// The page you see when first launching the website
const HomePage = () => {

  return (
    
    <>
 
     
   
      <ScrollProgress className="top-[64px]" />
      <Navbar />
      
      <Hero />
      
     

      <FeatureSection />

      <Footer />
    </>
  );
};

export default HomePage;
