import { Button } from "@/components/ui/button";
import HeroImg from "../assets/hero1.png";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const Hero = () => {
  const [tilt, setTilt] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setTilt(false);
      } else {
        setTilt(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center text-center">
      {/* Hero Text */}
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <h1 className="text-balance text-5xl font-semibold leading-none mt-5 tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
          Leverage the power of Google SaaS Computer Vision to analyze photos
        </h1>

        <p className="text-lg text-gray-400 mt-4">
          Analyze and store photos securely with Google Cloud and advanced AI.
        </p>
        <Link to="/sign-up">
        <Button className="mt-6 px-5 py-5 rounded-sm relative bg-black text-white text-sm hover:shadow-2xl hover:shadow-white/[0.1] transition duration-200 border border-slate-600">
          <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl  bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
          <span className="relative z-20">Get Started for Free →</span>
        
         
               {/* <Button variant="default">Get Started</Button>  */}
      
           
        </Button>
        </Link>
      </div>

      {/* Image Section */}

      <div className="image-container relative w-full flex justify-center">
        {/* Upper black shadow with same width as the image */}
        <div className="absolute top-[-3rem] w-[95%] max-w-6xl h-[50%] bg-black opacity-50 blur-2xl rounded-lg z-0"></div>

        <img
          src={HeroImg}
          className={`image w-[100%] mb-3 max-w-6xl m-[-3rem] rounded-lg shadow-xl relative z-10 ${
            tilt ? "image-tilt" : "image-straight"
          }`}
        />

        {/* bottom shadow */}
        <div className="absolute bottom-[-4rem] w-full h-[60%] bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black rounded-lg z-10 blur-lg"></div>
      </div>
    </section>
  );
};

export default Hero;
