import { RetroGrid } from "../components/magicui/retro-grid";
import Navbar from "@/components/ui/Navbar";
import FeatureSection from "@/HomepageComponents/FeaturesSection";
import Hero from "@/HomepageComponents/Hero";
import Footer from "@/HomepageComponents/Footer";
import { ScrollProgress } from "../components/magicui/scroll-progress"
import { WarpBackground } from "../components/magicui/warp-background";
const HomePage = () => {
   
  return (
    <>
      {/* <RetroGrid /> */}
     
      <ScrollProgress className="top-[64px]" />
      <Navbar />
      <WarpBackground> 
      <Hero />
      </WarpBackground> 

      <FeatureSection />

      <Footer />
    </>
  );
};

export default HomePage;
