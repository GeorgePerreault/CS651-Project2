import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { OrbitingCircles } from "../components/magicui/orbiting-circles";
import { SparklesText } from "../components/magicui/sparkles-text";
import { Spotlight } from "../components/ui/spotlight-new";
import one from "../assets/1.png"
import two from "../assets/2.jpg"
import four from "../assets/4.jpg"
import five from "../assets/5.jpg"
import { motion } from "framer-motion";


import feather from "../assets/feather.png";
import pinterst from "../assets/pinterest.png";
import google from "../assets/google.png";
import firebase from "../assets/firebase.png";
import gemini from "../assets/gemini.png";

const Hero = () => {
  const Icons = {
    feather: () => (
      <img src={feather} alt="Feather" className="w-12 h-12 object-contain" />
    ),
    pinterst: () => (
      <img src={pinterst} alt="Pinterest" className="w-12 h-12 object-contain" />
    ),
    google: () => (
      <img src={google} alt="Google" className="w-12 h-12 object-contain" />
    ),
    firebase: () => (
      <img src={firebase} alt="Firebase" className="w-12 h-12 object-contain" />
    ),
    gemini: () => (
      <img src={gemini} alt="Gemini" className="w-12 h-12 object-contain" />
    ),
  };

  return (
    <>
      <section className="relative w-full min-h-[150vh] flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Orbiting Circles Background */}
        <Spotlight />

        <div
          className="absolute flex items-center justify-center overflow-visible"
          style={{
            top: "40%",
            left: "50%",
            width: "1200px",
            height: "1200px",
            transform: "translate(-50%, -35%)",
          }}
        >
          {/* Outer ring */}
          <OrbitingCircles className="h-full" iconSize={50} radius={580} speed={2}>
            <Icons.feather />
            <Icons.pinterst />
            <Icons.google />
            <Icons.firebase />
            <Icons.gemini />
          </OrbitingCircles>

          {/* Inner ring */}
          <OrbitingCircles className="h-full" iconSize={40} radius={400} reverse speed={3}>
            <Icons.google />
            <Icons.firebase />
            <Icons.feather />
            <Icons.pinterst />
          </OrbitingCircles>
        </div>

        <div className="absolute bottom-[-4rem] w-full h-[60%] bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black rounded-lg z-10 blur-lg"></div>

        {/* Hero Text */}
        <div className="relative z-10 flex flex-col justify-center items-center px-4 translate-y-4">
          <h1 className="relative text-balance scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-7xl">
            {/* Glowing "F" */}
            <span className="relative inline-block">
              <span className="absolute inset-0 -z-10 text-white/50 filter blur-lg" aria-hidden="true">
                F
              </span>
              F
            </span>
            rom Snapshot t
            {/* Glowing "o" */}
            <span className="relative inline-block">
              <span className="absolute inset-0 -z-10 text-white/50 filter blur-md" aria-hidden="true">
                o
              </span>
              o
            </span>
            <SparklesText text="Epic Tale" />
          </h1>

          <p className="text-lg text-gray-400 mt-4 max-w-2xl">
            Turn a single moment into an unforgettable story with generated images and engaging narration.
          </p>

          <Link to="/sign-up">
            <Button className="mt-6 px-5 py-5 rounded-sm relative bg-black text-white text-sm hover:shadow-2xl hover:shadow-white/[0.1] transition duration-200 border border-slate-600">
              <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
              <span className="relative z-20">Get Started for Free →</span>
            </Button>
          </Link>
        </div>

        <div className="relative z-20 w-full flex items-end justify-center px-8 translate-y-40 gap-16">
          {/* First image with arrow SVG coming out */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <motion.img
                src={one}
                alt="Image one"
                className="w-80 h-[33rem] rounded-3xl object-cover"
                initial={{ rotate: -6 }}
                whileHover={{
                  scale: 1.05,
                  filter: "brightness(1.1)",
                  boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
         

          <motion.img
            src={two}
            alt="Image two"
            className="w-66 h-[33rem] rounded-3xl object-cover"
            initial={{ rotate: 6 }}
            whileHover={{
              scale: 1.05,
              filter: "brightness(1.1)",
              boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)",
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src={four}
            alt="Image four"
            className="w-66 h-[33rem] rounded-3xl object-cover"
            initial={{ rotate: 6 }}
            whileHover={{
              scale: 1.05,
              filter: "brightness(1.1)",
              boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)",
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src={five}
            alt="Image five"
            className="w-80 h-[33rem] rounded-3xl object-cover"
            initial={{ rotate: -6 }}
            whileHover={{
              scale: 1.05,
              filter: "brightness(1.1)",
              boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)",
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </section>
    </>
  );
};

export default Hero;
